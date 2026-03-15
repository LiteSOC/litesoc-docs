#!/bin/bash
# Auth0 & Supabase Integration Test Script
# Run this to verify your integrations are working

set -e

echo "🧪 LiteSOC Integration Test Suite"
echo "=================================="
echo ""

# Check if API key is set
if [ -z "$LITESOC_API_KEY" ]; then
  echo "❌ LITESOC_API_KEY not set"
  echo "   Run: export LITESOC_API_KEY=lsoc_live_your_key"
  exit 1
fi

API_URL="${LITESOC_API_URL:-https://api.litesoc.io}"

# For local testing, add x-subdomain header to bypass domain check
IS_LOCAL=false
if [[ "$API_URL" == *"localhost"* ]]; then
  IS_LOCAL=true
  # Remove /api/v1 prefix for local testing with x-subdomain header
  API_URL="${API_URL%/api/v1}"
  echo "🔧 Local mode: Adding x-subdomain:api header"
  echo "   Adjusted URL: $API_URL"
fi

echo "📍 Testing against: $API_URL"
echo "🔑 API Key: ${LITESOC_API_KEY:0:15}***"
echo ""

# Test 1: Basic event ingestion
echo "1️⃣  Testing basic event ingestion..."
if [ "$IS_LOCAL" = true ]; then
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/collect" \
    -H "Content-Type: application/json" \
    -H "X-API-Key: $LITESOC_API_KEY" \
    -d '{
      "event": "auth.login_success",
      "actor": {
        "id": "test-user-123",
        "email": "test@example.com"
      },
      "user_ip": "203.0.113.50",
      "metadata": {
        "test": true,
        "source": "integration-test"
      }
    }')
else
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/collect" \
    -H "Content-Type: application/json" \
    -H "X-API-Key: $LITESOC_API_KEY" \
    -d '{
      "event": "auth.login_success",
      "actor": {
        "id": "test-user-123",
        "email": "test@example.com"
      },
      "user_ip": "203.0.113.50",
      "metadata": {
        "test": true,
        "source": "integration-test"
      }
    }')
fi

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$ d')

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
  echo "   ✅ Basic ingestion works (HTTP $HTTP_CODE)"
else
  echo "   ❌ Failed (HTTP $HTTP_CODE)"
  echo "   Response: $BODY"
fi
echo ""

# Test 2: Auth0 Log Stream webhook format
echo "2️⃣  Testing Auth0 Log Stream webhook format..."
if [ "$IS_LOCAL" = true ]; then
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/webhooks/auth0?api_key=$LITESOC_API_KEY" \
    -H "Content-Type: application/json" \
    -d '[{
      "log_id": "test-log-123",
      "data": {
        "date": "2026-03-06T10:00:00.000Z",
        "type": "s",
        "description": "Successful login",
        "connection": "Username-Password-Authentication",
        "client_id": "test-client",
        "client_name": "Test App",
        "ip": "198.51.100.25",
        "user_agent": "Mozilla/5.0 Test",
        "user_id": "auth0|test123",
        "user_name": "test@example.com"
      }
    }]')
else
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/webhooks/auth0?api_key=$LITESOC_API_KEY" \
    -H "Content-Type: application/json" \
    -d '[{
      "log_id": "test-log-123",
      "data": {
        "date": "2026-03-06T10:00:00.000Z",
        "type": "s",
        "description": "Successful login",
        "connection": "Username-Password-Authentication",
        "client_id": "test-client",
        "client_name": "Test App",
        "ip": "198.51.100.25",
        "user_agent": "Mozilla/5.0 Test",
        "user_id": "auth0|test123",
        "user_name": "test@example.com"
      }
    }]')
fi

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$ d')

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
  echo "   ✅ Auth0 webhook works (HTTP $HTTP_CODE)"
else
  echo "   ❌ Failed (HTTP $HTTP_CODE)"
  echo "   Response: $BODY"
fi
echo ""

# Test 3: Supabase webhook format
echo "3️⃣  Testing Supabase webhook format..."
if [ "$IS_LOCAL" = true ]; then
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/webhooks/supabase?api_key=$LITESOC_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "type": "INSERT",
      "table": "users",
      "schema": "auth",
      "record": {
        "id": "test-uuid-123",
        "email": "supabase-test@example.com",
        "created_at": "2026-03-06T10:00:00.000Z",
        "email_confirmed_at": null
      },
      "old_record": null
    }')
else
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/webhooks/supabase?api_key=$LITESOC_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "type": "INSERT",
      "table": "users",
      "schema": "auth",
      "record": {
        "id": "test-uuid-123",
        "email": "supabase-test@example.com",
        "created_at": "2026-03-06T10:00:00.000Z",
        "email_confirmed_at": null
      },
      "old_record": null
    }')
fi

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$ d')

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
  echo "   ✅ Supabase webhook works (HTTP $HTTP_CODE)"
else
  echo "   ❌ Failed (HTTP $HTTP_CODE)"
  echo "   Response: $BODY"
fi
echo ""

# Test 4: Event with full forensic data
echo "4️⃣  Testing event with full forensic data..."
if [ "$IS_LOCAL" = true ]; then
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/collect" \
    -H "Content-Type: application/json" \
    -H "X-API-Key: $LITESOC_API_KEY" \
    -d '{
      "event": "auth.login_success",
      "actor": {
        "id": "forensic-test-user",
        "email": "forensic@example.com",
      },
      "user_ip": "185.220.101.1",
      "metadata": {
        "test": true,
        "source": "forensic-test",
        "mfa_used": true
      }
    }')
else
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/collect" \
    -H "Content-Type: application/json" \
    -H "X-API-Key: $LITESOC_API_KEY" \
    -d '{
      "event": "auth.login_success",
      "actor": {
        "id": "forensic-test-user",
        "email": "forensic@example.com"
      },
      "user_ip": "185.220.101.1",
      "metadata": {
        "test": true,
        "source": "forensic-test",
        "mfa_used": true
      }
    }')
fi

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$ d')

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
  echo "   ✅ Forensic event works (HTTP $HTTP_CODE)"
  echo "   💡 Check dashboard for network intelligence enrichment"
else
  echo "   ❌ Failed (HTTP $HTTP_CODE)"
  echo "   Response: $BODY"
fi
echo ""

echo "=================================="
echo "🏁 Test suite complete!"
echo ""
echo "📊 Next steps:"
echo "   1. Check your LiteSOC dashboard for test events"
echo "   2. Verify events appear in the timeline"
echo "   3. Check if forensic data (geo, network intel) is enriched"
echo ""
echo "💡 Rate Limits & Quotas:"
echo "   All endpoints enforce plan-based limits:"
echo "   - Free:   60 req/min,   5,000 events/month"
echo "   - Pro:    300 req/min,  50,000 events/month"
echo "   - Growth: 600 req/min,  500,000 events/month"
echo ""
echo "   Check response headers for your current usage:"
echo "   - X-RateLimit-Remaining: requests left in window"
echo "   - X-LiteSOC-Quota-Used: events used this month"
echo ""