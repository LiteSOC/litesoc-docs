/**
 * LiteSOC Auth0 Action - Send Phone Message (MFA)
 * 
 * This Action tracks MFA events (SMS/Voice OTP sent) for security monitoring.
 * Note: This is primarily for tracking MFA usage, not for sending the actual message.
 * 
 * Setup:
 * 1. Go to Auth0 Dashboard → Actions → Library → Build Custom
 * 2. Create a new Action with trigger "Send Phone Message"
 * 3. Paste this code and add the secret: LITESOC_API_KEY
 * 4. Deploy and add to your Send Phone Message flow
 * 
 * @see https://litesoc.io/docs/integrations/auth0
 */

/**
 * Handler that will be called during the execution of a SendPhoneMessage flow.
 *
 * @param {Event} event - Details about the phone message being sent.
 * @param {SendPhoneMessageAPI} api - Interface to send the message.
 */
exports.onExecuteSendPhoneMessage = async (event, api) => {
  const LITESOC_API_URL = "https://api.litesoc.io/collect";
  
  const apiKey = event.secrets.LITESOC_API_KEY;
  
  if (!apiKey) {
    console.error("[LiteSOC] Missing LITESOC_API_KEY secret");
    // Continue with default behavior - don't block MFA
    return;
  }

  try {
    const payload = {
      event: "auth.mfa_enabled",
      actor: {
        id: event.user?.user_id || "unknown",
        email: event.user?.email || undefined,
      },
      // IP address at root level for /collect endpoint
      user_ip: event.request?.ip || null,
      metadata: {
        source: "auth0-action",
        user_agent: event.request?.user_agent || "unknown",
        mfa_type: event.message_options?.action === "enrollment" ? "enrollment" : "verification",
        channel: event.message_options?.channel || "sms", // sms or voice
        auth0_tenant: event.tenant?.id || "unknown",
      },
    };

    // Fire and forget - don't block MFA flow
    fetch(LITESOC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
        "User-Agent": "LiteSOC-Auth0-Action/1.0",
      },
      body: JSON.stringify(payload),
    }).catch(err => console.error("[LiteSOC] Error:", err.message));
    
    console.log("[LiteSOC] MFA challenge event tracked");
  } catch (error) {
    console.error("[LiteSOC] Error:", error.message);
  }
  
  // Important: This action should NOT interfere with the actual SMS sending
  // The default Auth0 provider or your custom provider handles the actual sending
};
