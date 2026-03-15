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
    user_ip: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Send a security event to LiteSOC.
    
    Args:
        event: Event type (e.g., 'auth.login_success', 'auth.login_failed')
        user_id: User identifier
        email: User email address
        user_ip: Client IP address (important for geo-enrichment)
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
    if user_ip:
        payload['user_ip'] = user_ip
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

def track_login_success(actor_id: str, actor_email: str, user_ip: Optional[str] = None):
    """Track a successful login."""
    return send_event(
        event='auth.login_success',
        actor={
            'id': actor_id,
            'email': actor_email
        },
        user_ip=user_ip,
        metadata={'source': 'python-app', 'environment': 'production'}
    )


def track_login_failure(actor_id: str, actor_email: str, reason: str, user_ip: Optional[str] = None):
    """Track a failed login attempt."""
    return send_event(
        event='auth.login_failed',
        actor={
            'id': actor_id,
            'email': actor_email
        },
        user_ip=user_ip,
        metadata={'reason': reason}
    )


def track_signup(actor_id: str, actor_email: str, user_ip: Optional[str] = None):
    """Track a new user signup."""
    return send_event(
        event='auth.login_success',
        actor={
            'id': actor_id,
            'email': actor_email
        },
        user_ip=user_ip,
        metadata={'source': 'python-app', 'environment': 'production'}
    )


def track_password_reset(actor_id: str, actor_email: str, user_ip: Optional[str] = None):
    """Track a password reset request."""
    return send_event(
        event='auth.password_reset',
        actor={
            'id': actor_id,
            'email': actor_email
        },
        user_ip=user_ip,
        metadata={'source': 'python-app', 'environment': 'production'}
    )


def track_suspicious_activity(actor_id: str, actor_email: str, reason: str, user_ip: Optional[str] = None):
    """Track suspicious activity."""
    return send_event(
        event='security.suspicious_activity',
        actor={
            'id': actor_id,
            'email': actor_email
        },
        user_ip=user_ip,
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
    user_ip = get_client_ip()
    
    user = authenticate_user(email, password)
    
    if user:
        track_login_success(user.id, email, user_ip)
        return {'success': True}
    else:
        track_login_failure(email, 'invalid_credentials', user_ip)
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
