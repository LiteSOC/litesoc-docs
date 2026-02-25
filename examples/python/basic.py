"""
LiteSOC Python Integration Example

Install: pip install requests
"""

import os
import requests
from typing import Optional, Dict, Any

LITESOC_API_KEY = os.environ.get('LITESOC_API_KEY', 'YOUR_API_KEY_HERE')
LITESOC_ENDPOINT = 'https://api.litesoc.io/collect'


def send_event(
    event: str,
    user_id: Optional[str] = None,
    email: Optional[str] = None,
    ip_address: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Send a security event to LiteSOC.
    
    Args:
        event: Event type (e.g., 'login.success', 'login.failure')
        user_id: User identifier
        email: User email address
        ip_address: Client IP address (important for geo-enrichment)
        metadata: Additional event metadata
    
    Returns:
        API response as dictionary
    """
    payload = {
        'event': event,
    }
    
    if user_id:
        payload['user_id'] = user_id
    if email:
        payload['email'] = email
    if ip_address:
        payload['ip_address'] = ip_address
    if metadata:
        payload['metadata'] = metadata
    
    headers = {
        'Content-Type': 'application/json',
        'X-API-Key': LITESOC_API_KEY
    }
    
    response = requests.post(LITESOC_ENDPOINT, json=payload, headers=headers)
    result = response.json()
    
    if response.ok:
        print(f'✅ Event sent successfully: {result}')
        return result
    else:
        print(f'❌ Failed to send event: {result}')
        raise Exception(result.get('error', 'Failed to send event'))


# ============================================
# Example Functions
# ============================================

def track_login_success(user_id: str, email: str, ip_address: Optional[str] = None):
    """Track a successful login."""
    return send_event(
        event='login.success',
        user_id=user_id,
        email=email,
        ip_address=ip_address
    )


def track_login_failure(email: str, reason: str, ip_address: Optional[str] = None):
    """Track a failed login attempt."""
    return send_event(
        event='login.failure',
        email=email,
        ip_address=ip_address,
        metadata={'reason': reason}
    )


def track_signup(user_id: str, email: str, ip_address: Optional[str] = None):
    """Track a new user signup."""
    return send_event(
        event='user.signup',
        user_id=user_id,
        email=email,
        ip_address=ip_address
    )


def track_password_reset(email: str, ip_address: Optional[str] = None):
    """Track a password reset request."""
    return send_event(
        event='password.reset_requested',
        email=email,
        ip_address=ip_address
    )


def track_suspicious_activity(user_id: str, reason: str, ip_address: Optional[str] = None):
    """Track suspicious activity."""
    return send_event(
        event='security.suspicious_activity',
        user_id=user_id,
        ip_address=ip_address,
        metadata={
            'reason': reason,
            'severity': 'high'
        }
    )


# ============================================
# Flask Example
# ============================================
"""
from flask import Flask, request

app = Flask(__name__)

def get_client_ip():
    if request.headers.get('X-Forwarded-For'):
        return request.headers.get('X-Forwarded-For').split(',')[0].strip()
    return request.remote_addr

@app.route('/login', methods=['POST'])
def login():
    email = request.json.get('email')
    password = request.json.get('password')
    ip_address = get_client_ip()
    
    user = authenticate_user(email, password)
    
    if user:
        track_login_success(user.id, email, ip_address)
        return {'success': True}
    else:
        track_login_failure(email, 'invalid_credentials', ip_address)
        return {'error': 'Invalid credentials'}, 401
"""


# ============================================
# Demo
# ============================================
if __name__ == '__main__':
    print('🔐 LiteSOC Python Example')
    print('Set LITESOC_API_KEY environment variable or replace YOUR_API_KEY_HERE')
    
    # Uncomment to test:
    # track_login_success('user_123', 'user@example.com', '203.0.113.42')
