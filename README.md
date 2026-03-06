# LiteSOC Documentation & Examples

Official documentation, code examples, and testing tools for [LiteSOC](https://www.litesoc.io) - the lightweight security operations center for modern applications.

## 📚 Contents

- [**Examples**](./examples/) - Code samples for various languages and frameworks
- [**Testing Tools**](./testing/) - Tools to test your LiteSOC integration

## 🚀 Quick Start

### 1. Get Your API Key

Sign up at [litesoc.io](https://www.litesoc.io) and get your API key from the dashboard.

### 2. Send Your First Event

```bash
curl -X POST https://api.litesoc.io/collect \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d '{
    "event": "login.success",
    "user_id": "user_123",
    "email": "user@example.com"
  }'
```

### 3. View Events

Go to your [LiteSOC Dashboard](https://www.litesoc.io/dashboard) to see your security events.

## 📖 Documentation

| Topic | Description |
|-------|-------------|
| [API Reference](https://www.litesoc.io/docs/api) | Complete API documentation |
| [Setup Guide](https://www.litesoc.io/dashboard/setup) | Step-by-step integration guide |
| [CORS Configuration](#cors-configuration) | Browser-side request setup |

## 🔒 CORS Configuration

If you're making API calls from the browser (client-side JavaScript), you need to configure **Authorized Origins** in your LiteSOC dashboard.

### Setup Steps

1. Go to **Dashboard → Settings → General**
2. Find the **Authorized Origins** section
3. Add your domain (e.g., `https://app.yourdomain.com`)
4. For Pro/Enterprise: Use wildcards like `https://*.yourdomain.com`

### Testing CORS

Use our [CORS Test Tool](./testing/test-cors.html) to verify your configuration.

### Plan Limits

| Plan | Origins | Wildcards |
|------|---------|-----------|
| Free | 1 | ❌ |
| Pro | 5 | ✅ |
| Enterprise | Unlimited | ✅ |

## 🔗 Webhook Integrations

LiteSOC supports receiving events from third-party webhook providers like Supabase and Auth0. **All webhook events get the same enrichment and behavioral AI detection as the `/collect` endpoint.**

### Supported Webhooks

| Provider | Endpoint | Auth Method |
|----------|----------|-------------|
| Supabase | `https://api.litesoc.io/webhooks/supabase` | Query param (`?api_key=`) |
| Auth0 | `https://api.litesoc.io/webhooks/auth0` | Header (`Authorization: Bearer`) |

### Full Feature Parity

Webhook events are processed through our Worker pipeline with **full enrichment**:

| Feature | Free | Pro | Enterprise |
|---------|------|-----|------------|
| GeoIP Enrichment | ✅ | ✅ | ✅ |
| Network Intelligence (VPN/Tor/Proxy) | ✅ | ✅ | ✅ |
| Brute Force Detection | ✅ | ✅ | ✅ |
| Impossible Travel Detection | ❌ | ✅ | ✅ |
| Geo-Anomaly Detection | ❌ | ✅ | ✅ |
| Custom Threat Models | ❌ | ❌ | ✅ |
| Email/Slack/Discord Alerts | ❌ | ✅ | ✅ |
| Webhook Notifications | ❌ | ✅ | ✅ |

### Rate Limiting & Quotas

All webhook endpoints enforce rate limits and monthly quotas based on your plan tier. The limits are **per organization** and apply to batch event submissions.

#### Rate Limits by Plan

| Plan | Requests/Minute | Events/Request |
|------|-----------------|----------------|
| Free | 60 | Counted per event |
| Pro | 300 | Counted per event |
| Growth | 600 | Counted per event |
| Enterprise | 1200 | Counted per event |

#### Monthly Event Quotas

| Plan | Monthly Events |
|------|----------------|
| Free | 5,000 |
| Pro | 50,000 |
| Growth | 500,000 |
| Enterprise | Unlimited |

### Response Headers

Webhook responses include headers to help monitor your usage:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 42
X-LiteSOC-Quota-Limit: 1000
X-LiteSOC-Quota-Used: 358
X-LiteSOC-Plan: free
```

### Error Responses

| Status | Reason |
|--------|--------|
| 401 | Invalid or missing API key |
| 429 | Rate limit or quota exceeded (check `Retry-After` header) |
| 400 | Invalid JSON or payload schema |
| 500 | Server error (contact support) |

### Supabase Integration

Configure a Database Webhook in Supabase to send `auth.users` table changes:

```
URL: https://api.litesoc.io/webhooks/supabase?api_key=YOUR_API_KEY
Method: POST
Table: auth.users
Events: INSERT, UPDATE, DELETE
```

### Auth0 Integration

Configure a Log Stream in Auth0 to forward authentication events:

```
URL: https://api.litesoc.io/webhooks/auth0
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

## �📁 Examples

### JavaScript/TypeScript
- [Browser (Vanilla JS)](./examples/javascript/browser.html)
- [Node.js](./examples/javascript/nodejs.js)
- [Next.js](./examples/javascript/nextjs.ts)

### Python
- [Basic](./examples/python/basic.py)
- [Django](./examples/python/django.py)
- [FastAPI](./examples/python/fastapi.py)

### Other Languages
- [cURL](./examples/curl/basic.sh)
- [PHP](./examples/php/basic.php)
- [Ruby](./examples/ruby/basic.rb)
- [Go](./examples/go/basic.go)

## 🧪 Testing Tools

| Tool | Description |
|------|-------------|
| [test-cors.html](./testing/test-cors.html) | Test CORS configuration from different origins |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

## 🔗 Links

- [LiteSOC Website](https://www.litesoc.io)
- [Dashboard](https://www.litesoc.io/dashboard)
- [API Documentation](https://www.litesoc.io/docs/api)
- [Status Page](https://status.litesoc.io)
- [Support](mailto:support@litesoc.io)
