# JWT Authentication Guide

## Overview

JSON Web Tokens (JWT) provide a stateless, secure method for authentication in the e-commerce platform. This guide covers JWT implementation, token lifecycle, and best practices.

---

## JWT Basics

### Token Structure

A JWT consists of three parts separated by dots (`.`):

```
header.payload.signature
```

#### Header
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

#### Payload
```json
{
  "user_id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "role": "customer",
  "iat": 1713607200,
  "exp": 1713610800,
  "iss": "ecommerce-auth-service",
  "aud": "ecommerce-gateway"
}
```

#### Signature
```
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  secret_key
)
```

---

## Token Types

### Access Token
- **Purpose**: API request authentication
- **Expiration**: 1 hour
- **Scope**: Full access to user resources
- **Usage**: Every API request in Authorization header

```json
{
  "type": "access",
  "user_id": "507f1f77bcf86cd799439011",
  "permissions": ["read:products", "write:cart", "read:orders"],
  "exp": 1713610800
}
```

### Refresh Token
- **Purpose**: Obtain new access token
- **Expiration**: 7 days
- **Scope**: Refresh access only
- **Usage**: Only sent to refresh endpoint

```json
{
  "type": "refresh",
  "user_id": "507f1f77bcf86cd799439011",
  "exp": 1714212000
}
```

### Reset Token
- **Purpose**: Password reset
- **Expiration**: 24 hours
- **Scope**: Single use only
- **Usage**: Email link only

```json
{
  "type": "reset",
  "user_id": "507f1f77bcf86cd799439011",
  "action": "reset_password",
  "exp": 1713693600
}
```

### Verification Token
- **Purpose**: Email verification
- **Expiration**: 48 hours
- **Scope**: Single use
- **Usage**: Email link only

```json
{
  "type": "verification",
  "user_id": "507f1f77bcf86cd799439011",
  "action": "verify_email",
  "exp": 1713780000
}
```

---

## Token Generation

### Implementation

```javascript
const jwt = require('jsonwebtoken');

// Generate access token
function generateAccessToken(user) {
  return jwt.sign(
    {
      user_id: user._id,
      email: user.email,
      role: user.role,
      permissions: user.permissions
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '1h',
      issuer: 'ecommerce-auth-service',
      audience: 'ecommerce-gateway'
    }
  );
}

// Generate refresh token
function generateRefreshToken(user) {
  return jwt.sign(
    {
      user_id: user._id,
      type: 'refresh'
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: '7d',
      issuer: 'ecommerce-auth-service'
    }
  );
}

// Generate reset token
function generateResetToken(user) {
  return jwt.sign(
    {
      user_id: user._id,
      action: 'reset_password'
    },
    process.env.RESET_TOKEN_SECRET,
    {
      expiresIn: '24h',
      issuer: 'ecommerce-auth-service',
      jti: generateRandomId() // Unique ID for single use
    }
  );
}
```

---

## Token Verification

### Middleware Implementation

```javascript
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'MISSING_TOKEN',
        message: 'Access token required'
      }
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired token'
        }
      });
    }

    req.user = user;
    next();
  });
};

// Usage
app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});
```

---

## Token Refresh Flow

### Client-Side Implementation

```javascript
// Store tokens
localStorage.setItem('accessToken', response.token);
localStorage.setItem('refreshToken', response.refreshToken);

// API call with automatic token refresh
async function apiCall(url, options = {}) {
  let token = localStorage.getItem('accessToken');

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
  });

  // If 401, try to refresh token
  if (response.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      token = localStorage.getItem('accessToken');
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${token}`
        }
      });
    }
  }

  return response;
}

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refreshToken');

  const response = await fetch('/api/auth/refresh-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });

  if (response.ok) {
    const data = await response.json();
    localStorage.setItem('accessToken', data.token);
    return true;
  }

  // Refresh failed, logout user
  logout();
  return false;
}
```

### Server-Side Refresh Endpoint

```javascript
app.post('/api/auth/refresh-token', (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      error: { message: 'Refresh token required' }
    });
  }

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid refresh token' }
      });
    }

    // Check if token is in whitelist (not revoked)
    if (!isTokenWhitelisted(refreshToken)) {
      return res.status(401).json({
        success: false,
        error: { message: 'Token has been revoked' }
      });
    }

    const newAccessToken = generateAccessToken(user);
    res.json({
      success: true,
      token: newAccessToken,
      expiresIn: 3600
    });
  });
});
```

---

## Token Revocation

### Blacklist Strategy

```javascript
// Redis-based token blacklist
const redis = require('redis');
const client = redis.createClient();

async function revokeToken(token) {
  const decoded = jwt.decode(token);
  const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);

  if (expiresIn > 0) {
    await client.setex(`blacklist:${token}`, expiresIn, '1');
  }
}

async function isTokenRevoked(token) {
  const result = await client.get(`blacklist:${token}`);
  return result === '1';
}

// Logout implementation
app.post('/api/auth/logout', authenticateToken, async (req, res) => {
  const token = req.headers['authorization'].split(' ')[1];
  await revokeToken(token);

  res.json({
    success: true,
    message: 'Logout successful'
  });
});
```

---

## Secret Key Management

### Environment Configuration

```bash
# .env
JWT_SECRET=your_super_secret_key_minimum_32_characters_long
REFRESH_TOKEN_SECRET=your_refresh_token_secret_minimum_32_characters
RESET_TOKEN_SECRET=your_reset_token_secret_minimum_32_characters

# Production - use strong random keys
JWT_SECRET=$(openssl rand -base64 32)
```

### Key Rotation

```javascript
// Support multiple keys for rotation
const JWT_SECRETS = {
  current: process.env.JWT_SECRET_CURRENT,
  previous: process.env.JWT_SECRET_PREVIOUS
};

function verifyTokenWithRotation(token) {
  try {
    return jwt.verify(token, JWT_SECRETS.current);
  } catch (err) {
    // Try previous key for backward compatibility
    try {
      return jwt.verify(token, JWT_SECRETS.previous);
    } catch (err2) {
      throw err;
    }
  }
}
```

---

## CORS Configuration

### Express Setup

```javascript
const cors = require('cors');

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // 24 hours
}));
```

---

## Security Best Practices

### 1. Use HTTPS Only

```javascript
// Enforce HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

### 2. HttpOnly Cookies

```javascript
// Store refresh token in HttpOnly cookie
res.cookie('refreshToken', refreshToken, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
});
```

### 3. Token Size

Keep tokens minimal:
```json
{
  "sub": "user_id",
  "role": "customer",
  "exp": 1713610800
}
```

### 4. Never Trust Client

```javascript
// Always verify on server
function validateToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Additional validation
    if (decoded.aud !== 'ecommerce-gateway') {
      throw new Error('Invalid audience');
    }
    return decoded;
  } catch (err) {
    return null;
  }
}
```

### 5. Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, try again later',
  standardHeaders: true
});

app.post('/api/auth/login', loginLimiter, (req, res) => {
  // Login logic
});
```

---

## Testing

### Unit Tests

```javascript
describe('JWT Authentication', () => {
  it('should generate valid access token', () => {
    const user = { _id: '123', email: 'test@example.com', role: 'customer' };
    const token = generateAccessToken(user);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.user_id).toBe(user._id);
    expect(decoded.exp).toBeDefined();
  });

  it('should reject expired tokens', () => {
    const expiredToken = jwt.sign(
      { user_id: '123' },
      process.env.JWT_SECRET,
      { expiresIn: '-1h' }
    );

    expect(() => {
      jwt.verify(expiredToken, process.env.JWT_SECRET);
    }).toThrow();
  });

  it('should reject invalid signature', () => {
    const token = jwt.sign(
      { user_id: '123' },
      'wrong_secret',
      { expiresIn: '1h' }
    );

    expect(() => {
      jwt.verify(token, process.env.JWT_SECRET);
    }).toThrow();
  });
});
```

---

## Troubleshooting

### Common Issues

#### Token Expired
```
Error: jwt expired
Solution: Use refresh token to get new access token
```

#### Invalid Signature
```
Error: invalid signature
Solution: Ensure JWT_SECRET is correct
```

#### Missing Claims
```
Error: Missing required claim
Solution: Include all required claims when generating token
```

---

## References

- [JWT.io](https://jwt.io/)
- [RFC 7519 - JWT](https://tools.ietf.org/html/rfc7519)
- [OWASP JWT Security](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
