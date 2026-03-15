#!/bin/bash
# LiteSOC cURL Examples

# Set your API key
API_KEY="YOUR_API_KEY_HERE"
ENDPOINT="https://api.litesoc.io/collect"

# ============================================
# Basic: Login Success
# ============================================
curl -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "event": "auth.login_success",
    "actor": {
      "id": "user_123",
      "email": "user@example.com"
    },
    "user_ip": "203.0.113.42"
    "metadata": {
      "status": "success"
    }
  }'

echo ""

# ============================================
# Login Failure
# ============================================
curl -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "event": "auth.login_failed",
    "actor": {
      "id": "user_123",
      "email": "test@example.com"
    },
    "user_ip": "203.0.113.42",
    "metadata": {
      "reason": "invalid_password",
      "attempts": 3
    }
  }'

echo ""

# ============================================
# User Signup
# ============================================
curl -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "event": "auth.login_success",
    "actor": {
      "id": "user_456",
      "email": "newuser@example.com"
    },
    "user_ip": "198.51.100.23"
    "metadata": {
      "status": "success"
    }
  }'

echo ""

# ============================================
# Password Reset Request
# ============================================
curl -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "event": "auth.password_reset",
    "actor": {
      "id": "user_123",
      "email": "test@example.com"
    },
    "user_ip": "203.0.113.42",
    "metadata": {
      "status": "success"
    }
  }'

echo ""

# ============================================
# Suspicious Activity
# ============================================
curl -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "event": "security.suspicious_activity",
    "actor": {
      "id": "user_123",
      "email": "test@example.com"
    },
    "user_ip": "192.0.2.1",
    "metadata": {
      "reason": "multiple_failed_logins",
      "severity": "high",
      "failed_attempts": 10
    }
  }'

echo ""
echo "✅ Examples complete!"
