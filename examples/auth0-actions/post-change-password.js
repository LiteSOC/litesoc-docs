/**
 * LiteSOC Auth0 Action - Post Change Password
 * 
 * This Action sends password change events to LiteSOC for security monitoring.
 * 
 * Setup:
 * 1. Go to Auth0 Dashboard → Actions → Library → Build Custom
 * 2. Create a new Action with trigger "Post Change Password"
 * 3. Paste this code and add the secret: LITESOC_API_KEY
 * 4. Deploy and add to your Post Change Password flow
 * 
 * @see https://litesoc.io/docs/integrations/auth0
 */

/**
 * Handler that will be called during the execution of a PostChangePassword flow.
 *
 * @param {Event} event - Details about the password change.
 * @param {PostChangePasswordAPI} api - Interface to interact with the flow.
 */
exports.onExecutePostChangePassword = async (event, api) => {
  const LITESOC_API_URL = "https://api.litesoc.io/collect";
  
  const apiKey = event.secrets.LITESOC_API_KEY;
  
  if (!apiKey) {
    console.error("[LiteSOC] Missing LITESOC_API_KEY secret");
    return;
  }

  try {
    const user = event.user;
    const request = event.request;
    
    const payload = {
      event: "auth.password_reset",
      actor: {
        id: user.user_id,
        email: user.email || undefined,
      },
      // IP address at root level for /collect endpoint
      user_ip: request?.ip || null,
      metadata: {
        source: "auth0-action",
        user_agent: request?.user_agent || "unknown",
        auth0_connection: event.connection?.name || "unknown",
        auth0_tenant: event.tenant?.id || "unknown",
      },
    };

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
      console.error("[LiteSOC] API error:", response.status);
    } else {
      console.log("[LiteSOC] Password change event sent:", user.user_id);
    }
  } catch (error) {
    console.error("[LiteSOC] Error:", error.message);
  }
};
