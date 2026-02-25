/**
 * LiteSOC Node.js Integration Example
 * 
 * Install: npm install node-fetch (for Node.js < 18)
 * Node.js 18+ has built-in fetch
 */

const LITESOC_API_KEY = process.env.LITESOC_API_KEY || 'YOUR_API_KEY_HERE';
const LITESOC_ENDPOINT = 'https://api.litesoc.io/collect';

/**
 * Send a security event to LiteSOC
 * @param {string} event - Event type (e.g., 'login.success', 'login.failure')
 * @param {object} data - Event data
 * @param {string} [ipAddress] - Client IP address (important for geo-enrichment)
 */
async function sendEvent(event, data = {}, ipAddress = null) {
  try {
    const payload = {
      event,
      ...data,
    };

    // Include IP address if provided (for server-side tracking)
    if (ipAddress) {
      payload.ip_address = ipAddress;
    }

    const response = await fetch(LITESOC_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': LITESOC_API_KEY
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Event sent successfully:', result);
      return result;
    } else {
      console.error('❌ Failed to send event:', result);
      throw new Error(result.error || 'Failed to send event');
    }
  } catch (error) {
    console.error('❌ Error sending event:', error);
    throw error;
  }
}

// ============================================
// Example Usage
// ============================================

// Track successful login
async function trackLoginSuccess(userId, email, ipAddress) {
  return sendEvent('login.success', {
    user_id: userId,
    email: email,
    metadata: {
      source: 'nodejs-app'
    }
  }, ipAddress);
}

// Track failed login
async function trackLoginFailure(email, reason, ipAddress) {
  return sendEvent('login.failure', {
    email: email,
    metadata: {
      reason: reason
    }
  }, ipAddress);
}

// Track user signup
async function trackSignup(userId, email, ipAddress) {
  return sendEvent('user.signup', {
    user_id: userId,
    email: email
  }, ipAddress);
}

// Track password reset request
async function trackPasswordReset(email, ipAddress) {
  return sendEvent('password.reset_requested', {
    email: email
  }, ipAddress);
}

// Track suspicious activity
async function trackSuspiciousActivity(userId, reason, ipAddress) {
  return sendEvent('security.suspicious_activity', {
    user_id: userId,
    metadata: {
      reason: reason,
      severity: 'high'
    }
  }, ipAddress);
}

// ============================================
// Express.js Middleware Example
// ============================================

/**
 * Express middleware to get client IP
 */
function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() 
    || req.headers['x-real-ip'] 
    || req.connection?.remoteAddress 
    || req.ip;
}

/**
 * Express middleware example
 * 
 * Usage:
 * app.post('/login', async (req, res) => {
 *   const { email, password } = req.body;
 *   const ipAddress = getClientIP(req);
 *   
 *   const user = await authenticateUser(email, password);
 *   
 *   if (user) {
 *     await trackLoginSuccess(user.id, email, ipAddress);
 *     res.json({ success: true });
 *   } else {
 *     await trackLoginFailure(email, 'invalid_credentials', ipAddress);
 *     res.status(401).json({ error: 'Invalid credentials' });
 *   }
 * });
 */

// Demo
(async () => {
  console.log('🔐 LiteSOC Node.js Example');
  console.log('Set LITESOC_API_KEY environment variable or replace YOUR_API_KEY_HERE');
  
  // Uncomment to test:
  // await trackLoginSuccess('user_123', 'user@example.com', '203.0.113.42');
})();

module.exports = {
  sendEvent,
  trackLoginSuccess,
  trackLoginFailure,
  trackSignup,
  trackPasswordReset,
  trackSuspiciousActivity,
  getClientIP
};
