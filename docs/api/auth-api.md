# Auth API Documentation

## Overview

The Auth Service provides user authentication, authorization, and account management functionality. It handles user registration, login, JWT token management, and user profile operations.

## Base URL

```
http://localhost:3001/api/auth
```

## Authentication

All endpoints except registration and login require a valid JWT token in the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

---

## Endpoints

### 1. Register User

Create a new user account.

**Endpoint**: `POST /register`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "John Doe",
  "phone": "+1234567890"
}
```

**Validation Rules**:
- Email must be unique and valid
- Password min 8 chars, must include uppercase, lowercase, number, special char
- Name required, min 2 chars
- Phone optional, valid format

**Response** (201 Created):
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "customer"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email already exists",
    "details": ["Email already registered"]
  }
}
```

**Status Codes**:
- `201` Created
- `400` Bad Request
- `409` Conflict (email exists)

---

### 2. Login

Authenticate user with email and password.

**Endpoint**: `POST /login`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "customer"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600,
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses**:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}
```

**Status Codes**:
- `200` OK
- `401` Unauthorized
- `429` Too Many Attempts

---

### 3. Refresh Token

Get a new access token using refresh token.

**Endpoint**: `POST /refresh-token`

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

**Status Codes**:
- `200` OK
- `401` Unauthorized (invalid refresh token)

---

### 4. Logout

Invalidate current session and tokens.

**Endpoint**: `POST /logout`

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Status Codes**:
- `200` OK
- `401` Unauthorized

---

### 5. Get Current User

Retrieve authenticated user profile.

**Endpoint**: `GET /me`

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+1234567890",
    "role": "customer",
    "status": "active",
    "preferences": {
      "newsletter": true,
      "notifications": true,
      "language": "en"
    },
    "created_at": "2024-04-15T10:00:00Z",
    "updated_at": "2024-04-20T15:30:00Z"
  }
}
```

**Status Codes**:
- `200` OK
- `401` Unauthorized

---

### 6. Update Profile

Update user profile information.

**Endpoint**: `PUT /me`

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Request Body**:
```json
{
  "name": "John Smith",
  "phone": "+9876543210",
  "preferences": {
    "newsletter": false,
    "notifications": true,
    "language": "es"
  }
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Smith",
    "phone": "+9876543210",
    "role": "customer",
    "preferences": {
      "newsletter": false,
      "notifications": true,
      "language": "es"
    },
    "updated_at": "2024-04-20T16:00:00Z"
  }
}
```

**Status Codes**:
- `200` OK
- `400` Bad Request
- `401` Unauthorized

---

### 7. Change Password

Change user password (requires current password).

**Endpoint**: `POST /change-password`

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Request Body**:
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword456!",
  "confirmPassword": "NewPassword456!"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Error Responses**:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_PASSWORD",
    "message": "Current password is incorrect"
  }
}
```

**Status Codes**:
- `200` OK
- `400` Bad Request
- `401` Unauthorized

---

### 8. Forgot Password

Initiate password reset process.

**Endpoint**: `POST /forgot-password`

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Password reset link sent to email"
}
```

**Note**: Response is same whether email exists or not (security best practice)

**Status Codes**:
- `200` OK
- `429` Too Many Requests

---

### 9. Reset Password

Reset password using reset token from email.

**Endpoint**: `POST /reset-password`

**Request Body**:
```json
{
  "token": "reset_token_from_email",
  "newPassword": "NewPassword456!",
  "confirmPassword": "NewPassword456!"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Password reset successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses**:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Reset token is invalid or expired"
  }
}
```

**Status Codes**:
- `200` OK
- `400` Bad Request
- `401` Unauthorized

---

### 10. Verify Email

Verify email using verification token.

**Endpoint**: `POST /verify-email`

**Request Body**:
```json
{
  "token": "email_verification_token"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

**Status Codes**:
- `200` OK
- `400` Bad Request
- `401` Unauthorized

---

### 11. Get Sessions

List all active sessions for current user.

**Endpoint**: `GET /sessions`

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "session_id": "sess_123456",
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0...",
      "device": "Chrome on Windows",
      "created_at": "2024-04-20T15:00:00Z",
      "last_activity": "2024-04-20T16:00:00Z",
      "is_current": true
    },
    {
      "session_id": "sess_123457",
      "ip_address": "192.168.1.2",
      "user_agent": "Safari on iPhone...",
      "device": "Safari on iOS",
      "created_at": "2024-04-19T10:00:00Z",
      "last_activity": "2024-04-19T18:00:00Z",
      "is_current": false
    }
  ]
}
```

**Status Codes**:
- `200` OK
- `401` Unauthorized

---

### 12. Logout All Sessions

Invalidate all active sessions.

**Endpoint**: `POST /logout-all`

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "All sessions terminated"
}
```

**Status Codes**:
- `200` OK
- `401` Unauthorized

---

## JWT Token Structure

### Payload Claims

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

### Token Expiration

- **Access Token**: 1 hour
- **Refresh Token**: 7 days
- **Reset Token**: 24 hours
- **Verification Token**: 48 hours

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `UNAUTHORIZED` | 401 | Invalid credentials or token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | User not found |
| `CONFLICT` | 409 | Email already exists |
| `TOO_MANY_REQUESTS` | 429 | Rate limit exceeded |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Rate Limiting

- **Login attempts**: 5 per minute per IP
- **Password reset**: 3 per hour per email
- **General API**: 100 requests per minute per token

---

## Security Headers

All responses include:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

---

## Examples

### Complete Login Flow

```bash
# 1. Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "name": "John Doe"
  }'

# 2. Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'

# 3. Get current user
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer <jwt_token>"

# 4. Logout
curl -X POST http://localhost:3001/api/auth/logout \
  -H "Authorization: Bearer <jwt_token>"
```

---

## Related Services

- [Gateway API](../deployment/docker-guide.md)
- [Product Service](./product-api.md)
- [Order Service](./order-api.md)
