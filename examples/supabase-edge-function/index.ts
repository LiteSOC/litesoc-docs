/**
 * LiteSOC Auth Hook - Supabase Edge Function
 * 
 * This Edge Function captures full forensic data on login events and sends
 * it to LiteSOC for security monitoring, impossible travel detection, and
 * behavioral anomaly analysis.
 * 
 * Setup:
 * 1. Deploy this function to your Supabase project
 * 2. Set the LITESOC_API_KEY secret: supabase secrets set LITESOC_API_KEY=lsoc_live_xxx
 * 3. Configure Auth Hook in Supabase Dashboard → Authentication → Hooks
 *    - Hook Type: Send a custom access token (auth.send_custom_message) 
 *    - OR use Database Webhooks for post-login triggers
 * 
 * @see https://litesoc.io/docs/integrations/supabase
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// LiteSOC API endpoint
const LITESOC_API_URL = "https://api.litesoc.io/collect";

/**
 * Extract the real client IP from request headers.
 * Handles various proxy/CDN configurations.
 */
function extractClientIP(headers: Headers): string {
  // Priority order for IP extraction
  const ipHeaders = [
    "cf-connecting-ip",     // Cloudflare
    "x-real-ip",            // Nginx proxy
    "x-forwarded-for",      // Standard proxy header (may contain multiple IPs)
    "x-client-ip",          // Some load balancers
    "true-client-ip",       // Akamai
  ];

  for (const header of ipHeaders) {
    const value = headers.get(header);
    if (value) {
      // x-forwarded-for can contain multiple IPs: "client, proxy1, proxy2"
      // The first one is the original client IP
      const ip = value.split(",")[0].trim();
      if (ip && isValidIP(ip)) {
        return ip;
      }
    }
  }

  return "unknown";
}

/**
 * Basic IP validation (IPv4 and IPv6)
 */
function isValidIP(ip: string): boolean {
  // IPv4 pattern
  const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  // IPv6 pattern (simplified)
  const ipv6Pattern = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;
  
  return ipv4Pattern.test(ip) || ipv6Pattern.test(ip);
}

/**
 * Extract User-Agent from headers
 */
function extractUserAgent(headers: Headers): string {
  return headers.get("user-agent") || "unknown";
}

/**
 * Main handler for the Auth Hook
 */
serve(async (req: Request) => {
  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Get the LiteSOC API key from environment
    const apiKey = Deno.env.get("LITESOC_API_KEY");
    
    if (!apiKey) {
      console.error("[LiteSOC] Missing LITESOC_API_KEY environment variable");
      // Don't block auth flow - return success but log error
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse the incoming Auth Hook payload
    const payload = await req.json();
    
    // Supabase Auth Hook payload structure for post_session_create
    // {
    //   "user": { "id": "uuid", "email": "user@example.com", ... },
    //   "session": { ... },
    //   "event_type": "post_session_create"
    // }
    
    const user = payload.user;
    const eventType = payload.event_type || "post_session_create";
    
    if (!user?.id) {
      console.warn("[LiteSOC] No user ID in payload, skipping");
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Extract forensic data from request headers
    const clientIP = extractClientIP(req.headers);
    const userAgent = extractUserAgent(req.headers);

    // Map Supabase event types to LiteSOC event names
    const eventNameMap: Record<string, string> = {
      "post_session_create": "auth.login_success",
      "post_signup": "auth.login_success",
      "post_password_recovery": "auth.password_reset",
    };

    const eventName = eventNameMap[eventType] || "auth.login_success";

    // Build the LiteSOC event payload
    const litesocPayload = {
      event: eventName,
      actor: {
        id: user.id,
        email: user.email || undefined,
        name: user.user_metadata?.full_name || user.user_metadata?.name || undefined,
      },
      context: {
        ip_address: clientIP,
        user_agent: userAgent,
      },
      metadata: {
        source: "supabase_edge_function",
        supabase_event_type: eventType,
        // Include additional user metadata if available
        ...(user.app_metadata && { app_metadata: user.app_metadata }),
        ...(user.created_at && { user_created_at: user.created_at }),
      },
    };

    // Send to LiteSOC API (non-blocking)
    const litesocResponse = await fetch(LITESOC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
        "User-Agent": "LiteSOC-Supabase-EdgeFunction/1.0",
      },
      body: JSON.stringify(litesocPayload),
    });

    if (!litesocResponse.ok) {
      const errorText = await litesocResponse.text();
      console.error("[LiteSOC] API error:", litesocResponse.status, errorText);
    } else {
      console.log("[LiteSOC] Event sent successfully:", eventName, user.id);
    }

    // Always return success to not block the auth flow
    // Supabase expects a specific response format for Auth Hooks
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[LiteSOC] Edge Function error:", error);
    
    // Don't block auth flow on errors
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
});
