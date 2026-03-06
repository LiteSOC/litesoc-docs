/**
 * LiteSOC Auth0 Action - Post Login
 * 
 * This Action sends login events to LiteSOC for security monitoring,
 * enabling Impossible Travel Detection, Behavioral Anomalies, and VPN/Tor detection.
 * 
 * Setup:
 * 1. Go to Auth0 Dashboard → Actions → Library → Build Custom
 * 2. Create a new Action with trigger "Login / Post Login"
 * 3. Paste this code and add the secret: LITESOC_API_KEY
 * 4. Deploy and add to your Login flow
 * 
 * @see https://litesoc.io/docs/integrations/auth0
 */

/**
 * Handler that will be called during the execution of a PostLogin flow.
 *
 * @param {Event} event - Details about the user and the context in which they are logging in.
 * @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
 */
exports.onExecutePostLogin = async (event, api) => {
  const LITESOC_API_URL = "https://api.litesoc.io/collect";
  
  // Get API key from secrets
  const apiKey = event.secrets.LITESOC_API_KEY;
  
  if (!apiKey) {
    console.error("[LiteSOC] Missing LITESOC_API_KEY secret");
    return; // Don't block login
  }

  try {
    // Determine event type based on login context
    const isFirstLogin = event.stats.logins_count === 1;
    const eventName = isFirstLogin ? "auth.signup_success" : "auth.login_success";
    
    // Extract user info
    const user = event.user;
    const request = event.request;
    
    // Build LiteSOC payload
    const payload = {
      event: eventName,
      actor: {
        id: user.user_id,
        email: user.email || undefined,
      },
      // IP address at root level for /collect endpoint (enables behavioral AI)
      user_ip: request.ip || request.geoip?.ip || null,
      metadata: {
        source: "auth0-action",
        name: user.name || user.nickname || undefined,
        user_agent: request.user_agent || "unknown",
        auth0_connection: event.connection?.name || "unknown",
        auth0_client_id: event.client?.client_id || "unknown",
        auth0_client_name: event.client?.name || "unknown",
        auth0_tenant: event.tenant?.id || "unknown",
        logins_count: event.stats?.logins_count || 1,
        // MFA context
        mfa_enrolled: user.multifactor?.length > 0,
        // Risk signals from Auth0
        risk_assessment: event.authentication?.riskAssessment || null,
        // Auth0's geo data (LiteSOC Worker will also enrich with our own)
        auth0_geo: request.geoip ? {
          country_code: request.geoip.countryCode,
          city: request.geoip.cityName,
          latitude: request.geoip.latitude,
          longitude: request.geoip.longitude,
        } : null,
      },
    };

    // Send to LiteSOC (non-blocking with timeout)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
    
    const response = await fetch(LITESOC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
        "User-Agent": "LiteSOC-Auth0-Action/1.0",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error("[LiteSOC] API error:", response.status, await response.text());
    } else {
      console.log("[LiteSOC] Event sent:", eventName, user.user_id);
    }
  } catch (error) {
    // Log error but don't block login
    console.error("[LiteSOC] Error sending event:", error.message);
  }
  
  // Always allow login to proceed
};
