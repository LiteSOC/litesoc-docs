# LiteSOC Supabase Edge Function

This Edge Function captures full forensic data (IP address, User-Agent, geolocation context) on authentication events and sends it to LiteSOC for advanced security monitoring.

## Why Use This?

The standard Supabase integration via Database Webhooks only captures basic user data. This Edge Function enables:

- ✅ **Impossible Travel Detection** - Requires IP address for geolocation
- ✅ **Behavioral Anomaly Detection** - Requires IP + User-Agent for device fingerprinting
- ✅ **Brute Force Detection** - Track failed logins with client context
- ✅ **VPN/Tor/Proxy Detection** - Network intelligence on every login

## Prerequisites

1. A Supabase project with Edge Functions enabled
2. A LiteSOC account with an API key (`lsoc_live_xxx`)
3. Supabase CLI installed locally

## Deployment

### 1. Create the Edge Function

```bash
# Navigate to your Supabase project
cd your-supabase-project

# Create the function directory
supabase functions new litesoc-auth-hook

# Copy the index.ts file to the function directory
cp path/to/index.ts supabase/functions/litesoc-auth-hook/index.ts
```

### 2. Set the API Key Secret

```bash
supabase secrets set LITESOC_API_KEY=lsoc_live_your_api_key_here
```

### 3. Deploy the Function

```bash
supabase functions deploy litesoc-auth-hook
```

### 4. Configure the Auth Hook

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Hooks**
3. Click **Add Hook**
4. Configure:
   - **Hook Type**: `post_session_create`
   - **Endpoint URL**: Your Edge Function URL (shown after deployment)
   - **HTTP Headers**: Leave empty (secrets are handled via environment)

## Events Captured

| Supabase Event | LiteSOC Event | Description |
|----------------|---------------|-------------|
| `post_session_create` | `auth.login_success` | User successfully logged in |
| `post_signup` | `auth.signup_success` | New user registered |
| `post_password_recovery` | `auth.password_reset` | Password reset requested |

## Payload Example

```json
{
  "event_name": "auth.login_success",
  "actor": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "context": {
    "ip_address": "203.0.113.42",
    "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)..."
  },
  "metadata": {
    "source": "supabase_edge_function",
    "supabase_event_type": "post_session_create"
  }
}
```

## IP Extraction

The function extracts the real client IP from various proxy headers:

1. `cf-connecting-ip` (Cloudflare)
2. `x-real-ip` (Nginx)
3. `x-forwarded-for` (Standard proxy)
4. `x-client-ip` (Load balancers)
5. `true-client-ip` (Akamai)

## Error Handling

The function is designed to **never block authentication**:

- Missing API key → Logs error, returns success
- LiteSOC API failure → Logs error, returns success
- Invalid payload → Logs warning, returns success

This ensures your users can always log in, even if LiteSOC is temporarily unavailable.

## Troubleshooting

### Function not triggering

1. Check the Auth Hook is enabled in Supabase Dashboard
2. Verify the function is deployed: `supabase functions list`
3. Check function logs: `supabase functions logs litesoc-auth-hook`

### Events not appearing in LiteSOC

1. Verify your API key is correct
2. Check the function logs for API errors
3. Ensure your LiteSOC plan has remaining quota

### IP showing as "unknown"

Your Supabase project may not be behind a proxy that sets IP headers. Consider:

1. Using Cloudflare in front of your auth endpoints
2. Configuring your load balancer to set `x-forwarded-for`

## Local Testing

```bash
# Start local Supabase
supabase start

# Serve the function locally
supabase functions serve litesoc-auth-hook --env-file .env.local

# Test with curl
curl -X POST http://localhost:54321/functions/v1/litesoc-auth-hook \
  -H "Content-Type: application/json" \
  -d '{
    "user": {"id": "test-uuid", "email": "test@example.com"},
    "event_type": "post_session_create"
  }'
```

## Support

- 📖 [LiteSOC Documentation](https://litesoc.io/docs)
- 💬 [Discord Community](https://discord.gg/litesoc)
- 📧 [Email Support](mailto:support@litesoc.io)
