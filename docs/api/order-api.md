# Order API Documentation

## Overview

The Order Service handles order creation, processing, tracking, and management. It manages the complete order lifecycle from checkout to delivery and returns.

## Base URL

```
http://localhost:3004/api/orders
```

## Authentication

All endpoints require a valid JWT token:

```
Authorization: Bearer <jwt_token>
```

---

## Endpoints

### 1. Get All Orders

Retrieve user's orders with filtering and pagination.

**Endpoint**: `GET /`

**Query Parameters**:
```
page=1              (default: 1)
limit=20            (default: 20)
status=pending      (pending, confirmed, processing, shipped, delivered, cancelled)
sort=newest         (newest, oldest)
date_from=2024-01-01
date_to=2024-04-20
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "order_001",
      "order_number": "ORD-2024-001234",
      "user_id": "user_123",
      "status": "shipped",
      "payment_status": "completed",
      "items": [
        {
          "product_id": "prod_001",
          "product_name": "iPhone 15 Pro",
          "quantity": 1,
          "unit_price": 899.99,
          "subtotal": 899.99
        }
      ],
      "pricing": {
        "subtotal": 899.99,
        "tax": 72.00,
        "shipping_cost": 10.00,
        "discount_amount": 0,
        "total": 981.99
      },
      "shipping": {
        "method": "standard",
        "tracking_number": "1Z999AA1012345678",
        "carrier": "UPS",
        "estimated_delivery": "2024-04-25T00:00:00Z",
        "shipped_at": "2024-04-20T10:00:00Z"
      },
      "created_at": "2024-04-20T08:00:00Z",
      "updated_at": "2024-04-20T15:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

**Status Codes**:
- `200` OK
- `401` Unauthorized

---

### 2. Get Order Details

Retrieve detailed information about a specific order.

**Endpoint**: `GET /:orderId`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "order_001",
    "order_number": "ORD-2024-001234",
    "user_id": "user_123",
    "status": "shipped",
    "payment": {
      "status": "completed",
      "method": "credit_card",
      "transaction_id": "txn_123456",
      "paid_at": "2024-04-20T08:15:00Z",
      "amount": 981.99
    },
    "items": [
      {
        "id": "item_001",
        "product_id": "prod_001",
        "product_name": "iPhone 15 Pro",
        "sku": "PROD-001",
        "quantity": 1,
        "unit_price": 899.99,
        "subtotal": 899.99,
        "variant": {
          "color": "Black",
          "storage": "256GB"
        }
      }
    ],
    "pricing": {
      "subtotal": 899.99,
      "tax": 72.00,
      "shipping_cost": 10.00,
      "discount_code": "SAVE10",
      "discount_amount": 0,
      "total": 981.99
    },
    "shipping": {
      "method": "standard",
      "address": {
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "postal_code": "10001",
        "country": "US"
      },
      "carrier": "UPS",
      "tracking_number": "1Z999AA1012345678",
      "estimated_delivery": "2024-04-25T00:00:00Z",
      "shipped_at": "2024-04-20T10:00:00Z",
      "delivered_at": null
    },
    "billing": {
      "address": {
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "postal_code": "10001",
        "country": "US"
      },
      "same_as_shipping": true
    },
    "timeline": [
      {
        "status": "confirmed",
        "timestamp": "2024-04-20T08:30:00Z",
        "message": "Order confirmed"
      },
      {
        "status": "processing",
        "timestamp": "2024-04-20T09:00:00Z",
        "message": "Order processing"
      },
      {
        "status": "shipped",
        "timestamp": "2024-04-20T10:00:00Z",
        "message": "Order shipped with UPS"
      }
    ],
    "notes": "Handle with care",
    "created_at": "2024-04-20T08:00:00Z",
    "updated_at": "2024-04-20T15:30:00Z"
  }
}
```

**Status Codes**:
- `200` OK
- `401` Unauthorized
- `404` Not Found

---

### 3. Create Order (Checkout)

Create a new order from cart items.

**Endpoint**: `POST /`

**Request Body**:
```json
{
  "cart_id": "cart_001",
  "shipping_method": "standard",
  "shipping_address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postal_code": "10001",
    "country": "US"
  },
  "billing_address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postal_code": "10001",
    "country": "US"
  },
  "billing_same_as_shipping": true,
  "notes": "Handle with care"
}
```

**Validation**:
- Cart must have items
- All items must be in stock
- Valid shipping address required
- Valid billing address if different from shipping

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": "order_001",
    "order_number": "ORD-2024-001234",
    "status": "pending",
    "total": 981.99,
    "payment_url": "https://checkout.stripe.com/pay/...",
    "created_at": "2024-04-20T08:00:00Z"
  }
}
```

**Status Codes**:
- `201` Created
- `400` Bad Request
- `401` Unauthorized
- `409` Items out of stock

---

### 4. Cancel Order

Cancel an order (only if status allows).

**Endpoint**: `POST /:orderId/cancel`

**Request Body**:
```json
{
  "reason": "Changed my mind",
  "notes": "Optional additional details"
}
```

**Cancellable Statuses**: pending, confirmed, processing

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "data": {
    "id": "order_001",
    "status": "cancelled",
    "refund_status": "initiated",
    "refund_amount": 981.99,
    "updated_at": "2024-04-20T16:00:00Z"
  }
}
```

**Error Response** (409 Conflict):
```json
{
  "success": false,
  "error": {
    "code": "CANNOT_CANCEL",
    "message": "Cannot cancel order with status 'shipped'"
  }
}
```

**Status Codes**:
- `200` OK
- `401` Unauthorized
- `404` Not Found
- `409` Cannot cancel (status not allowed)

---

### 5. Track Order

Get real-time tracking information.

**Endpoint**: `GET /:orderId/track`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "order_number": "ORD-2024-001234",
    "status": "in_transit",
    "carrier": "UPS",
    "tracking_number": "1Z999AA1012345678",
    "tracking_url": "https://tracking.ups.com/track?tracknum=1Z999AA1012345678",
    "events": [
      {
        "timestamp": "2024-04-20T10:00:00Z",
        "status": "picked_up",
        "location": "New York, NY",
        "message": "Package picked up"
      },
      {
        "timestamp": "2024-04-21T08:30:00Z",
        "status": "in_transit",
        "location": "Newark, NJ",
        "message": "In transit to destination"
      }
    ],
    "estimated_delivery": "2024-04-25T00:00:00Z"
  }
}
```

**Status Codes**:
- `200` OK
- `401` Unauthorized
- `404` Not Found

---

### 6. Get Order Status

Get current order status.

**Endpoint**: `GET /:orderId/status`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "order_number": "ORD-2024-001234",
    "status": "shipped",
    "payment_status": "completed",
    "shipping_status": "in_transit",
    "can_cancel": false,
    "can_return": false,
    "timeline": [
      {
        "status": "pending",
        "timestamp": "2024-04-20T08:00:00Z"
      },
      {
        "status": "confirmed",
        "timestamp": "2024-04-20T08:30:00Z"
      },
      {
        "status": "processing",
        "timestamp": "2024-04-20T09:00:00Z"
      },
      {
        "status": "shipped",
        "timestamp": "2024-04-20T10:00:00Z"
      }
    ]
  }
}
```

**Status Codes**:
- `200` OK
- `401` Unauthorized
- `404` Not Found

---

## Returns Endpoints

### 1. Initiate Return

Create a return request for order items.

**Endpoint**: `POST /:orderId/returns`

**Request Body**:
```json
{
  "items": [
    {
      "order_item_id": "item_001",
      "quantity": 1,
      "reason": "defective",
      "condition": "unopened",
      "notes": "Screen has dead pixels"
    }
  ],
  "return_reason": "Product defective"
}
```

**Reasons**: damaged, defective, wrong_item, different_description, not_as_expected, changed_mind

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Return request created",
  "data": {
    "id": "return_001",
    "return_number": "RET-2024-001234",
    "order_id": "order_001",
    "status": "initiated",
    "items_count": 1,
    "refund_amount": 899.99,
    "shipping_label": "https://...",
    "created_at": "2024-04-20T16:00:00Z"
  }
}
```

**Status Codes**:
- `201` Created
- `400` Bad Request
- `401` Unauthorized
- `404` Not Found

---

### 2. Get Return Details

Retrieve return request details.

**Endpoint**: `GET /:orderId/returns/:returnId`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "return_001",
    "return_number": "RET-2024-001234",
    "order_id": "order_001",
    "status": "approved",
    "items": [
      {
        "order_item_id": "item_001",
        "product_name": "iPhone 15 Pro",
        "quantity": 1,
        "reason": "defective",
        "unit_price": 899.99
      }
    ],
    "refund_amount": 899.99,
    "refund_status": "processing",
    "shipping_label": "https://...",
    "carrier": "UPS",
    "tracking_number": "1Z999AA1098765432",
    "timeline": [
      {
        "status": "initiated",
        "timestamp": "2024-04-20T16:00:00Z"
      },
      {
        "status": "approved",
        "timestamp": "2024-04-20T17:00:00Z"
      }
    ],
    "created_at": "2024-04-20T16:00:00Z",
    "updated_at": "2024-04-20T17:00:00Z"
  }
}
```

**Status Codes**:
- `200` OK
- `401` Unauthorized
- `404` Not Found

---

### 3. Cancel Return

Cancel a return request.

**Endpoint**: `POST /:orderId/returns/:returnId/cancel`

**Request Body**:
```json
{
  "reason": "Changed my mind"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Return cancelled",
  "data": {
    "id": "return_001",
    "status": "cancelled"
  }
}
```

**Status Codes**:
- `200` OK
- `401` Unauthorized
- `404` Not Found

---

## Admin Endpoints

### 1. Update Order Status

Update order status (admin only).

**Endpoint**: `PATCH /:orderId/status`

**Headers**:
```
Authorization: Bearer <jwt_token>
X-Admin-Token: <admin_token>
```

**Request Body**:
```json
{
  "status": "shipped",
  "tracking_number": "1Z999AA1012345678",
  "carrier": "UPS",
  "notes": "Shipped via UPS"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Order status updated",
  "data": {
    "id": "order_001",
    "status": "shipped",
    "updated_at": "2024-04-20T18:00:00Z"
  }
}
```

**Status Codes**:
- `200` OK
- `400` Bad Request
- `401` Unauthorized
- `403` Forbidden

---

### 2. Process Refund

Process refund for cancelled/returned order (admin only).

**Endpoint**: `POST /:orderId/refund`

**Request Body**:
```json
{
  "amount": 981.99,
  "reason": "Order cancelled",
  "notes": "Refunding full amount"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Refund processed",
  "data": {
    "id": "order_001",
    "refund_amount": 981.99,
    "refund_status": "completed",
    "refund_date": "2024-04-20T18:30:00Z"
  }
}
```

**Status Codes**:
- `200` OK
- `400` Bad Request
- `401` Unauthorized
- `403` Forbidden

---

## Order Statuses

| Status | Description |
|--------|-------------|
| `pending` | Order created, awaiting payment |
| `confirmed` | Payment received, order confirmed |
| `processing` | Order being prepared for shipment |
| `shipped` | Order dispatched |
| `delivered` | Order received by customer |
| `cancelled` | Order cancelled |
| `returned` | Order returned by customer |

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `UNAUTHORIZED` | 401 | Invalid or missing token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Order not found |
| `CANNOT_CANCEL` | 409 | Order cannot be cancelled |
| `OUT_OF_STOCK` | 409 | Items out of stock |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Rate Limiting

- **General API**: 30 requests per minute
- **Checkout**: 5 requests per minute

---

## Related Documentation

- [Cart API](./cart-api.md)
- [Product API](./product-api.md)
- [Auth API](./auth-api.md)
- [Microservices Flow](../architecture/microservices-flow.md)
