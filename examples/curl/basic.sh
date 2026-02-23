#!/bin/bash
# LiteSOC cURL Examples

# Set your API key
API_KEY="YOUR_API_KEY_HERE"
ENDPOINT="https://www.litesoc.io/api/v1/collect"

# ============================================
# Basic: Login Success
# ============================================
curl -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "event": "login.success",
    "user_id": "user_123",
    "email": "user@example.com",
    "ip_address": "203.0.113.42"
  }'

echo ""

# ============================================
# Login Failure
# ============================================
curl -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "event": "login.failure",
    "email": "user@example.com",
    "ip_address": "203.0.113.42",
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
    "event": "user.signup",
    "user_id": "user_456",
    "email": "newuser@example.com",
    "ip_address": "198.51.100.23"
  }'

echo ""

# ============================================
# Password Reset Request
# ============================================
curl -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "event": "password.reset_requested",
    "email": "user@example.com",
    "ip_address": "203.0.113.42"
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
    "user_id": "user_123",
    "ip_address": "192.0.2.1",
    "metadata": {
      "reason": "multiple_failed_logins",
      "severity": "high",
      "failed_attempts": 10
    }
  }'

echo ""
echo "✅ Examples complete!"
