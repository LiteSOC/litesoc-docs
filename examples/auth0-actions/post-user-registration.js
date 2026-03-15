/**
 * LiteSOC Auth0 Action - Post User Registration
 * 
 * This Action sends signup events to LiteSOC for security monitoring.
 * 
 * Setup:
 * 1. Go to Auth0 Dashboard → Actions → Library → Build Custom
 * 2. Create a new Action with trigger "Post User Registration"
 * 3. Paste this code and add the secret: LITESOC_API_KEY
 * 4. Deploy and add to your Post User Registration flow
 * 
 * @see https://litesoc.io/docs/integrations/auth0
 */

/**
 * Handler that will be called during the execution of a PostUserRegistration flow.
 *
 * @param {Event} event - Details about the newly registered user.
 * @param {PostUserRegistrationAPI} api - Interface to interact with the registration flow.
 */
exports.onExecutePostUserRegistration = async (event, api) => {
  const LITESOC_API_URL = "https://api.litesoc.io/collect";
  
  // Get API key from secrets
  const apiKey = event.secrets.LITESOC_API_KEY;
  
  if (!apiKey) {
    console.error("[LiteSOC] Missing LITESOC_API_KEY secret");
    return;
  }

  try {
    const user = event.user;
    const request = event.request;
    
    // Build LiteSOC payload
    const payload = {
      event: "auth.login_success",
      actor: {
        id: user.user_id,
        email: user.email || undefined,
      },
      // IP address at root level for /collect endpoint (enables behavioral AI)
      user_ip: request?.ip || request?.geoip?.ip || null,
      metadata: {
        source: "auth0-action",
        name: user.name || user.nickname || undefined,
        user_agent: request?.user_agent || "unknown",
        auth0_connection: event.connection?.name || "unknown",
        auth0_tenant: event.tenant?.id || "unknown",
        email_verified: user.email_verified || false,
        // Auth0's geo data (LiteSOC Worker will also enrich with our own)
        auth0_geo: request?.geoip ? {
          country_code: request.geoip.countryCode,
          city: request.geoip.cityName,
          latitude: request.geoip.latitude,
          longitude: request.geoip.longitude,
        } : null,
      },
    };

    // Send to LiteSOC
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch(LITESOC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error("[LiteSOC] API error:", response.status, await response.text());
    } else {
      console.log("[LiteSOC] Signup event sent:", user.user_id);
    }
  } catch (error) {
    console.error("[LiteSOC] Error sending event:", error.message);
  }
};
