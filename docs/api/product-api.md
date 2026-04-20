# Product API Documentation

## Overview

The Product Service manages the product catalog, including product information, categories, inventory, and reviews. It provides endpoints for browsing, searching, and managing products.

## Base URL

```
http://localhost:3002/api/products
```

---

## Endpoints

### 1. Get All Products

Retrieve a paginated list of products with filtering and sorting options.

**Endpoint**: `GET /`

**Query Parameters**:
```
page=1                    (default: 1)
limit=20                  (default: 20, max: 100)
category=electronics      (optional)
subcategory=phones        (optional)
search=iphone             (optional)
sort=price_asc            (price_asc, price_desc, rating, newest)
min_price=100             (optional)
max_price=1000            (optional)
in_stock=true             (default: true)
rating_min=4              (optional, 0-5)
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "sku": "PROD-001",
      "name": "iPhone 15 Pro",
      "description": "Latest flagship smartphone",
      "category": "electronics",
      "subcategory": "phones",
      "price": {
        "original": 999.99,
        "current": 899.99,
        "currency": "USD",
        "discount_percent": 10
      },
      "images": [
        {
          "url": "https://cdn.example.com/images/iphone-1.jpg",
          "alt_text": "iPhone 15 Pro front view",
          "is_primary": true
        }
      ],
      "inventory": {
        "quantity": 150,
        "available": 150,
        "status": "in_stock"
      },
      "ratings": {
        "average": 4.5,
        "count": 328,
        "distribution": {
          "5": 200,
          "4": 100,
          "3": 20,
          "2": 5,
          "1": 3
        }
      },
      "seller_id": "seller_123",
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-04-20T15:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 250,
    "pages": 13,
    "has_next": true,
    "has_prev": false
  }
}
```

**Status Codes**:
- `200` OK
- `400` Bad Request

---

### 2. Get Product by ID

Retrieve detailed information about a specific product.

**Endpoint**: `GET /:productId`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "sku": "PROD-001",
    "name": "iPhone 15 Pro",
    "description": "Latest flagship smartphone with A17 Pro chip",
    "category": "electronics",
    "subcategory": "phones",
    "price": {
      "original": 999.99,
      "current": 899.99,
      "currency": "USD",
      "discount_percent": 10
    },
    "images": [
      {
        "url": "https://cdn.example.com/images/iphone-1.jpg",
        "alt_text": "iPhone 15 Pro front view",
        "is_primary": true,
        "order": 1
      },
      {
        "url": "https://cdn.example.com/images/iphone-2.jpg",
        "alt_text": "iPhone 15 Pro side view",
        "is_primary": false,
        "order": 2
      }
    ],
    "specifications": {
      "color": "Black",
      "size": "6.1 inch",
      "material": "Titanium",
      "dimensions": {
        "length": 147.6,
        "width": 70.6,
        "height": 8.25,
        "unit": "mm"
      },
      "weight": {
        "value": 187,
        "unit": "grams"
      }
    },
    "inventory": {
      "quantity": 150,
      "reserved": 25,
      "available": 125,
      "low_stock_threshold": 50,
      "status": "in_stock"
    },
    "ratings": {
      "average": 4.5,
      "count": 328
    },
    "reviews": [
      {
        "id": "review_001",
        "user_id": "user_123",
        "rating": 5,
        "title": "Excellent phone!",
        "comment": "Best iPhone ever",
        "verified_purchase": true,
        "helpful_count": 45,
        "created_at": "2024-04-15T10:00:00Z"
      }
    ],
    "seller_id": "seller_123",
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-04-20T15:30:00Z"
  }
}
```

**Status Codes**:
- `200` OK
- `404` Not Found

---

### 3. Search Products

Advanced search with full-text search capability.

**Endpoint**: `GET /search`

**Query Parameters**:
```
q=iphone          (search query, required)
page=1
limit=20
sort=relevance
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "iPhone 15 Pro",
      "price": { "current": 899.99 },
      "rating": 4.5,
      "match_score": 0.98
    }
  ],
  "pagination": {
    "page": 1,
    "total": 45,
    "pages": 3
  }
}
```

**Status Codes**:
- `200` OK
- `400` Bad Request

---

### 4. Get Categories

Retrieve all product categories.

**Endpoint**: `GET /categories`

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "cat_001",
      "name": "Electronics",
      "slug": "electronics",
      "image_url": "https://cdn.example.com/categories/electronics.jpg",
      "subcategories": [
        {
          "id": "subcat_001",
          "name": "Phones",
          "slug": "phones",
          "product_count": 150
        },
        {
          "id": "subcat_002",
          "name": "Laptops",
          "slug": "laptops",
          "product_count": 80
        }
      ],
      "product_count": 230
    },
    {
      "id": "cat_002",
      "name": "Clothing",
      "slug": "clothing",
      "product_count": 500
    }
  ]
}
```

**Status Codes**:
- `200` OK

---

### 5. Get Related Products

Get products related to a specific product.

**Endpoint**: `GET /:productId/related`

**Query Parameters**:
```
limit=5    (default: 5, max: 20)
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439012",
      "name": "iPhone 15",
      "price": { "current": 799.99 },
      "rating": 4.3
    }
  ]
}
```

**Status Codes**:
- `200` OK
- `404` Not Found

---

### 6. Get Product Reviews

Retrieve reviews for a product.

**Endpoint**: `GET /:productId/reviews`

**Query Parameters**:
```
page=1
limit=10
sort=helpful (helpful, newest, rating_desc, rating_asc)
rating=5     (filter by rating)
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "review_001",
      "user_id": "user_123",
      "username": "john_d",
      "rating": 5,
      "title": "Excellent phone!",
      "comment": "Best iPhone ever, highly recommended",
      "verified_purchase": true,
      "helpful_count": 45,
      "unhelpful_count": 2,
      "created_at": "2024-04-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "total": 328,
    "pages": 33
  }
}
```

**Status Codes**:
- `200` OK
- `404` Not Found

---

### 7. Add Product Review

Submit a review for a purchased product (requires authentication).

**Endpoint**: `POST /:productId/reviews`

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Request Body**:
```json
{
  "rating": 5,
  "title": "Excellent phone!",
  "comment": "Best iPhone ever, highly recommended"
}
```

**Validation**:
- Rating: 1-5
- Title: 5-100 characters
- Comment: 10-1000 characters
- User must have purchased the product

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Review added successfully",
  "data": {
    "id": "review_002",
    "product_id": "507f1f77bcf86cd799439011",
    "user_id": "user_123",
    "rating": 5,
    "title": "Excellent phone!",
    "comment": "Best iPhone ever, highly recommended",
    "verified_purchase": true,
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

### 8. Get Trending Products

Retrieve trending/bestselling products.

**Endpoint**: `GET /trending`

**Query Parameters**:
```
limit=10           (default: 10)
period=week        (day, week, month)
category=all       (optional)
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "iPhone 15 Pro",
      "price": { "current": 899.99 },
      "rating": 4.5,
      "sales_count": 1500
    }
  ]
}
```

**Status Codes**:
- `200` OK

---

### 9. Check Inventory

Check stock availability for a product.

**Endpoint**: `GET /:productId/inventory`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "product_id": "507f1f77bcf86cd799439011",
    "sku": "PROD-001",
    "quantity": 150,
    "reserved": 25,
    "available": 125,
    "low_stock_threshold": 50,
    "status": "in_stock",
    "estimated_restock": "2024-05-01T00:00:00Z"
  }
}
```

**Status Codes**:
- `200` OK
- `404` Not Found

---

### 10. Get Product Recommendations

Get personalized product recommendations (requires authentication).

**Endpoint**: `GET /recommendations`

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Query Parameters**:
```
limit=5    (default: 5)
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "iPhone 15 Pro",
      "price": { "current": 899.99 },
      "reason": "Similar to products you viewed"
    }
  ]
}
```

**Status Codes**:
- `200` OK
- `401` Unauthorized

---

## Admin Endpoints

### 1. Create Product

Create a new product (admin only).

**Endpoint**: `POST /`

**Headers**:
```
Authorization: Bearer <jwt_token>
X-Admin-Token: <admin_token>
```

**Request Body**:
```json
{
  "sku": "PROD-NEW",
  "name": "New Product",
  "description": "Product description",
  "category": "electronics",
  "subcategory": "phones",
  "price": {
    "original": 999.99,
    "current": 899.99
  },
  "images": [...],
  "specifications": {...},
  "inventory": {
    "quantity": 100,
    "low_stock_threshold": 20
  }
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": { ... }
}
```

**Status Codes**:
- `201` Created
- `400` Bad Request
- `401` Unauthorized
- `403` Forbidden

---

### 2. Update Product

Update product information (admin only).

**Endpoint**: `PUT /:productId`

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": { ... }
}
```

**Status Codes**:
- `200` OK
- `400` Bad Request
- `401` Unauthorized
- `403` Forbidden
- `404` Not Found

---

### 3. Delete Product

Delete a product (admin only).

**Endpoint**: `DELETE /:productId`

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

**Status Codes**:
- `200` OK
- `401` Unauthorized
- `403` Forbidden
- `404` Not Found

---

## Response Format

All responses follow this format:

```json
{
  "success": boolean,
  "message": "string (optional)",
  "data": {},
  "error": {
    "code": "string",
    "message": "string",
    "details": []
  },
  "pagination": {}
}
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_QUERY` | 400 | Invalid query parameters |
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `UNAUTHORIZED` | 401 | Invalid or missing token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Product not found |
| `CONFLICT` | 409 | SKU already exists |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Rate Limiting

- **General API**: 100 requests per minute
- **Search**: 50 requests per minute
- **Admin operations**: 20 requests per minute

---

## Related Documentation

- [Database Design](../architecture/database-design.md)
- [Microservices Flow](../architecture/microservices-flow.md)
- [Cart API](./cart-api.md)
- [Order API](./order-api.md)
