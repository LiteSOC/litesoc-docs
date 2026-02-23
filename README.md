# LiteSOC Documentation & Examples

Official documentation, code examples, and testing tools for [LiteSOC](https://www.litesoc.io) - the lightweight security operations center for modern applications.

## 📚 Contents

- [**Examples**](./examples/) - Code samples for various languages and frameworks
- [**Testing Tools**](./testing/) - Tools to test your LiteSOC integration

## 🚀 Quick Start

### 1. Get Your API Key

Sign up at [litesoc.io](https://lwww.itesoc.io) and get your API key from the dashboard.

### 2. Send Your First Event

```bash
curl -X POST https://www.litesoc.io/api/v1/collect \
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

## 📁 Examples

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

- [LiteSOC Website](https://lwww.itesoc.io)
- [Dashboard](https://www.litesoc.io/dashboard)
- [API Documentation](https://www.litesoc.io/docs/api)
- [Status Page](https://status.litesoc.io)
- [Support](mailto:support@litesoc.io)
