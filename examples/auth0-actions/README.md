# LiteSOC Auth0 Actions

Ready-to-use Auth0 Actions for integrating LiteSOC security monitoring into your Auth0 authentication pipeline.

## Available Actions

| Action | Auth0 Trigger | LiteSOC Event | Description |
|--------|---------------|---------------|-------------|
| `post-login.js` | Post Login | `auth.login_success` | Tracks successful logins with full forensic data |
| `post-user-registration.js` | Post User Registration | `auth.login_success` | Tracks new user registrations |
| `post-change-password.js` | Post Change Password | `auth.password_reset` | Tracks password changes |
| `send-phone-message.js` | Send Phone Message | `auth.mfa_enabled` | Tracks MFA SMS/Voice OTP events |

## Features

All actions capture:
- ✅ **User ID & Email** - For actor identification
- ✅ **IP Address** - For impossible travel & geo anomaly detection
- ✅ **User Agent** - For device fingerprinting
- ✅ **GeoIP Data** - Country, city, coordinates (from Auth0)
- ✅ **Connection Type** - Database, Social, Enterprise SSO
- ✅ **Risk Assessment** - Auth0's built-in risk signals

## Quick Start

### 1. Get Your LiteSOC API Key

1. Log in to [LiteSOC Dashboard](https://litesoc.io/dashboard)
2. Go to **Settings** → **API Keys**
3. Copy your Live API key (`lsoc_live_xxx`)

### 2. Create the Action in Auth0

1. Go to **Auth0 Dashboard** → **Actions** → **Library**
2. Click **Build Custom**
3. Name: `LiteSOC Post Login` (or appropriate name)
4. Trigger: Select the appropriate trigger (e.g., "Login / Post Login")
5. Runtime: Node 18 (recommended)

### 3. Add the Code

Copy the contents of the appropriate `.js` file into the Action editor.

### 4. Add the Secret

1. In the Action editor, click **Secrets** (left sidebar)
2. Add a new secret:
   - **Key**: `LITESOC_API_KEY`
   - **Value**: Your LiteSOC API key (`lsoc_live_xxx`)

### 5. Deploy and Add to Flow

1. Click **Deploy**
2. Go to **Actions** → **Flows** → Select the flow (e.g., "Login")
3. Drag your action into the flow
4. Click **Apply**

## Event Mapping

| Auth0 Event | LiteSOC Event | Severity |
|-------------|---------------|----------|
| First login (logins_count = 1) | `auth.login_success` | info |
| Subsequent logins | `auth.login_success` | info |
| New user registration | `auth.login_success` | info |
| Password changed | `auth.password_reset` | medium |
| MFA OTP sent | `auth.mfa_enabled` | info |

## Payload Example

```json
{
  "event": "auth.login_success",
  "actor": {
    "id": "auth0|507f1f77bcf86cd799439011",
    "email": "user@example.com",
  },
  "user_ip": "203.0.113.42",
  "metadata": {
    "source": "auth0-action",
    "auth0_connection": "Username-Password-Authentication",
    "auth0_client_name": "My App",
    "logins_count": 5,
    "mfa_enrolled": true,
  }
}
```

## Tracking Failed Logins

Auth0 Post Login Actions only fire on **successful** logins. To track failed login attempts for brute force detection, use Auth0 Log Streams:

1. Go to **Auth0 Dashboard** → **Monitoring** → **Streams**
2. Create a new **Custom Webhook** stream
3. Set the webhook URL to: `https://api.litesoc.io/webhooks/auth0?api_key=YOUR_API_KEY`
4. Select event types: `f` (Failed Login), `fu` (Failed Login - Invalid Email/Username)

See the [Auth0 Log Streams documentation](https://auth0.com/docs/customize/log-streams) for more details.

## Troubleshooting

### Events not appearing in LiteSOC

1. Check the Action logs in Auth0 Dashboard
2. Verify your API key is correct
3. Ensure the Action is deployed and added to the flow

### Action timing out

The actions use a 3-second timeout. If your network is slow:
1. Increase the timeout in the Action code
2. Or use fire-and-forget pattern (remove `await`)

### IP showing as "unknown"

Some Auth0 connections may not provide IP addresses. Check:
1. Your Auth0 plan includes IP data
2. The connection type supports IP forwarding

## Support

- 📖 [LiteSOC Documentation](https://litesoc.io/docs)
- 📖 [Auth0 Actions Documentation](https://auth0.com/docs/customize/actions)
- 💬 [Discord Community](https://discord.gg/litesoc)
- 📧 [Email Support](mailto:support@litesoc.io)
