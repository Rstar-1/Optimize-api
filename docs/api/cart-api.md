# Cart API Documentation

## Overview

The Cart Service manages user shopping carts, wishlists, and checkout preparation. It handles adding/removing items, applying coupons, and preparing carts for checkout.

## Base URL

```
http://localhost:3003/api/cart
```

## Authentication

All endpoints require a valid JWT token:

```
Authorization: Bearer <jwt_token>
```

---

## Endpoints

### 1. Get Cart

Retrieve the current user's shopping cart.

**Endpoint**: `GET /`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "cart_001",
    "user_id": "user_123",
    "items": [
      {
        "id": "item_001",
        "product_id": "prod_001",
        "name": "iPhone 15 Pro",
        "sku": "PROD-001",
        "price": 899.99,
        "quantity": 1,
        "subtotal": 899.99,
        "variant": {
          "color": "Black",
          "storage": "256GB"
        },
        "added_at": "2024-04-20T10:00:00Z",
        "image_url": "https://cdn.example.com/images/iphone.jpg"
      }
    ],
    "coupon": {
      "code": "SAVE10",
      "discount_amount": 90.00,
      "discount_percent": 10
    },
    "summary": {
      "subtotal": 899.99,
      "tax": 72.00,
      "shipping_cost": 10.00,
      "discount_amount": 90.00,
      "total": 891.99,
      "item_count": 1
    },
    "created_at": "2024-04-15T08:00:00Z",
    "updated_at": "2024-04-20T15:30:00Z"
  }
}
```

**Status Codes**:
- `200` OK
- `401` Unauthorized

---

### 2. Add Item to Cart

Add a product to the shopping cart.

**Endpoint**: `POST /items`

**Request Body**:
```json
{
  "product_id": "prod_001",
  "quantity": 1,
  "variant": {
    "color": "Black",
    "storage": "256GB"
  }
}
```

**Validation**:
- Product must exist and be in stock
- Quantity must be > 0 and <= available inventory
- Variant must be valid for the product

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Item added to cart",
  "data": {
    "id": "cart_001",
    "items": [
      {
        "id": "item_001",
        "product_id": "prod_001",
        "name": "iPhone 15 Pro",
        "quantity": 1,
        "subtotal": 899.99
      }
    ],
    "summary": {
      "item_count": 1,
      "total": 899.99
    }
  }
}
```

**Status Codes**:
- `201` Created
- `400` Bad Request
- `401` Unauthorized
- `404` Product not found
- `409` Insufficient inventory

---

### 3. Update Cart Item

Update quantity or variant of a cart item.

**Endpoint**: `PUT /items/:itemId`

**Request Body**:
```json
{
  "quantity": 2,
  "variant": {
    "color": "Black",
    "storage": "512GB"
  }
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Cart item updated",
  "data": {
    "id": "item_001",
    "quantity": 2,
    "subtotal": 1799.98,
    "cart_total": 1799.98
  }
}
```

**Status Codes**:
- `200` OK
- `400` Bad Request
- `401` Unauthorized
- `404` Item not found

---

### 4. Remove Item from Cart

Remove a product from the shopping cart.

**Endpoint**: `DELETE /items/:itemId`

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Item removed from cart",
  "data": {
    "id": "cart_001",
    "item_count": 0,
    "total": 0
  }
}
```

**Status Codes**:
- `200` OK
- `401` Unauthorized
- `404` Item not found

---

### 5. Clear Cart

Remove all items from the shopping cart.

**Endpoint**: `DELETE /`

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Cart cleared",
  "data": {
    "id": "cart_001",
    "items": [],
    "summary": {
      "item_count": 0,
      "total": 0
    }
  }
}
```

**Status Codes**:
- `200` OK
- `401` Unauthorized

---

### 6. Apply Coupon

Apply a discount coupon to the cart.

**Endpoint**: `POST /coupon`

**Request Body**:
```json
{
  "code": "SAVE10"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Coupon applied successfully",
  "data": {
    "coupon": {
      "code": "SAVE10",
      "description": "10% off on all items",
      "discount_type": "percentage",
      "discount_value": 10,
      "discount_amount": 90.00,
      "min_order_value": 100.00,
      "expires_at": "2024-12-31T23:59:59Z"
    },
    "summary": {
      "subtotal": 899.99,
      "discount_amount": 90.00,
      "total": 809.99
    }
  }
}
```

**Error Responses**:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_COUPON",
    "message": "Coupon code is invalid or expired"
  }
}
```

**Status Codes**:
- `200` OK
- `400` Invalid coupon
- `401` Unauthorized

---

### 7. Remove Coupon

Remove applied coupon from cart.

**Endpoint**: `DELETE /coupon`

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Coupon removed",
  "data": {
    "summary": {
      "subtotal": 899.99,
      "discount_amount": 0,
      "total": 899.99
    }
  }
}
```

**Status Codes**:
- `200` OK
- `401` Unauthorized

---

### 8. Update Shipping

Set or update shipping method and address.

**Endpoint**: `PUT /shipping`

**Request Body**:
```json
{
  "method": "standard",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postal_code": "10001",
    "country": "US"
  }
}
```

**Shipping Methods**:
- `standard`: 5-7 business days, $10
- `express`: 2-3 business days, $25
- `overnight`: Next business day, $50

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Shipping updated",
  "data": {
    "shipping": {
      "method": "standard",
      "cost": 10.00,
      "address": { ... }
    },
    "summary": {
      "subtotal": 899.99,
      "shipping_cost": 10.00,
      "tax": 72.79,
      "total": 982.78
    }
  }
}
```

**Status Codes**:
- `200` OK
- `400` Bad Request
- `401` Unauthorized

---

### 9. Estimate Tax

Calculate estimated tax for cart.

**Endpoint**: `POST /estimate-tax`

**Request Body**:
```json
{
  "shipping_address": {
    "state": "NY",
    "postal_code": "10001",
    "country": "US"
  }
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "subtotal": 899.99,
    "tax_rate": 8.875,
    "tax_amount": 72.79,
    "total": 972.78
  }
}
```

**Status Codes**:
- `200` OK
- `400` Bad Request
- `401` Unauthorized

---

### 10. Validate Cart

Validate cart items availability before checkout.

**Endpoint**: `POST /validate`

**Response** (200 OK):
```json
{
  "success": true,
  "is_valid": true,
  "message": "Cart is ready for checkout",
  "data": {
    "issues": [],
    "valid_items": 1,
    "invalid_items": 0
  }
}
```

**Invalid Cart Response** (200 OK with issues):
```json
{
  "success": true,
  "is_valid": false,
  "data": {
    "issues": [
      {
        "type": "out_of_stock",
        "item_id": "item_002",
        "product_name": "Product X",
        "message": "Product out of stock"
      },
      {
        "type": "price_changed",
        "item_id": "item_003",
        "product_name": "Product Y",
        "old_price": 99.99,
        "new_price": 109.99,
        "message": "Price has changed"
      }
    ]
  }
}
```

**Status Codes**:
- `200` OK
- `401` Unauthorized

---

## Wishlist Endpoints

### 1. Get Wishlist

Retrieve user's wishlist.

**Endpoint**: `GET /wishlist`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "wishlist_001",
    "user_id": "user_123",
    "items": [
      {
        "product_id": "prod_001",
        "name": "iPhone 15 Pro",
        "price": 899.99,
        "image_url": "https://cdn.example.com/images/iphone.jpg",
        "rating": 4.5,
        "added_at": "2024-04-15T10:00:00Z"
      }
    ],
    "item_count": 1,
    "created_at": "2024-04-15T08:00:00Z",
    "updated_at": "2024-04-20T15:30:00Z"
  }
}
```

**Status Codes**:
- `200` OK
- `401` Unauthorized

---

### 2. Add to Wishlist

Add a product to wishlist.

**Endpoint**: `POST /wishlist`

**Request Body**:
```json
{
  "product_id": "prod_001"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Product added to wishlist",
  "data": {
    "product_id": "prod_001",
    "added_at": "2024-04-20T16:00:00Z"
  }
}
```

**Status Codes**:
- `201` Created
- `400` Bad Request
- `401` Unauthorized
- `409` Already in wishlist

---

### 3. Remove from Wishlist

Remove a product from wishlist.

**Endpoint**: `DELETE /wishlist/:productId`

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Product removed from wishlist"
}
```

**Status Codes**:
- `200` OK
- `401` Unauthorized
- `404` Not found

---

### 4. Move to Cart

Move wishlist item to cart.

**Endpoint**: `POST /wishlist/:productId/move-to-cart`

**Request Body**:
```json
{
  "quantity": 1
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Item moved to cart",
  "data": {
    "cart_id": "cart_001",
    "item_id": "item_001"
  }
}
```

**Status Codes**:
- `200` OK
- `400` Bad Request
- `401` Unauthorized
- `404` Not found

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `UNAUTHORIZED` | 401 | Invalid or missing token |
| `NOT_FOUND` | 404 | Cart, item, or product not found |
| `CONFLICT` | 409 | Insufficient inventory or duplicate |
| `INVALID_COUPON` | 400 | Coupon invalid or expired |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Rate Limiting

- **General API**: 50 requests per minute
- **Validate Cart**: 10 requests per minute

---

## Related Documentation

- [Product API](./product-api.md)
- [Order API](./order-api.md)
- [Auth API](./auth-api.md)
