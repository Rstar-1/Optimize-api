# Microservices Flow - E-Commerce Platform

## Overview

This document details the interactions and data flows between microservices in the e-commerce platform. It covers common business scenarios and their corresponding service interactions.

## Service Interaction Diagram

```
┌───────────┐
│  Client   │
└─────┬─────┘
      │ REST
      ▼
┌──────────────────┐
│   API Gateway    │
└─┬──┬──┬──┬───────┘
  │  │  │  │
  ▼  ▼  ▼  ▼
┌────┐┌────┐┌────┐┌────┐
│Auth││Prod││Cart││Ord ││
│Srv ││Srv ││Srv ││Srv │
└──┬─┘└──┬─┘└──┬─┘└──┬─┘
   │     │     │     │
   └─────┼─────┼─────┘
         │     │
         ▼     ▼
    ┌─────────────┐
    │Kafka Topics │
    ├─────────────┤
    │• user.*     │
    │• product.*  │
    │• order.*    │
    │• inventory.*│
    └─────────────┘
```

## Key Business Flows

### 1. User Authentication & Registration

#### Flow Diagram
```
Client → API Gateway → Auth Service
                        ├─ Validate Input
                        ├─ Hash Password
                        ├─ Store in MongoDB
                        ├─ Publish "user.created" event
                        └─ Return JWT Token
                             │
                             ▼ (event)
                        Other Services
                        (Update their state)
```

#### Sequence
1. Client sends `POST /api/auth/register` with credentials
2. API Gateway routes to Auth Service
3. Auth Service validates input
4. Auth Service hashes password using bcrypt
5. Auth Service stores user in MongoDB
6. Auth Service publishes `user.created` event to Kafka
7. Auth Service generates JWT token
8. Returns token to client
9. Other services consume `user.created` event and update caches

#### API Request
```json
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "secure_password",
  "name": "John Doe"
}
```

#### Response
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

---

### 2. User Login

#### Flow Diagram
```
Client → API Gateway → Auth Service
                        ├─ Verify Credentials
                        ├─ Generate JWT
                        ├─ Store Session in Redis
                        └─ Return Token
```

#### Sequence
1. Client sends `POST /api/auth/login` with email and password
2. API Gateway routes to Auth Service
3. Auth Service retrieves user from MongoDB
4. Auth Service compares passwords
5. Auth Service generates JWT token with user claims
6. Auth Service stores session in Redis (with TTL)
7. Returns token to client

#### Response
```json
{
  "success": true,
  "token": "jwt_token_here",
  "expiresIn": 3600,
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "role": "customer"
  }
}
```

---

### 3. Product Browsing & Search

#### Flow Diagram
```
Client → API Gateway → Product Service
                        ├─ Check Redis Cache
                        ├─ If miss → Query MongoDB
                        ├─ Cache result in Redis
                        └─ Return to Client
```

#### Sequence
1. Client sends `GET /api/products?category=electronics&page=1`
2. API Gateway routes to Product Service
3. Product Service checks Redis cache
4. If cache hit, return cached data
5. If cache miss:
   - Query MongoDB for products
   - Apply filters and pagination
   - Store result in Redis (TTL: 1 hour)
6. Return products to client

#### Response
```json
{
  "success": true,
  "data": [
    {
      "id": "prod_id",
      "name": "Product Name",
      "price": 99.99,
      "category": "electronics",
      "inventory": 50
    }
  ],
  "pagination": {
    "page": 1,
    "total": 100,
    "pages": 10
  }
}
```

---

### 4. Add to Cart

#### Flow Diagram
```
Client → API Gateway → Cart Service
                        ├─ Verify User (JWT)
                        ├─ Call Product Service
                        │  (verify product exists)
                        ├─ Update MongoDB Cart
                        ├─ Update Redis Cache
                        ├─ Publish "cart.updated" event
                        └─ Return Updated Cart
```

#### Sequence
1. Client sends `POST /api/cart/items` with product_id and quantity
2. API Gateway validates JWT token
3. API Gateway routes to Cart Service
4. Cart Service verifies product exists (calls Product Service synchronously)
5. Cart Service retrieves user's cart from MongoDB
6. Cart Service adds/updates item in cart
7. Cart Service stores updated cart in MongoDB
8. Cart Service updates Redis cache
9. Cart Service publishes `cart.updated` event
10. Returns updated cart to client

#### Request
```json
POST /api/cart/items
{
  "product_id": "prod_id",
  "quantity": 2,
  "variant": "color: red, size: M"
}
```

#### Response
```json
{
  "success": true,
  "cart": {
    "id": "cart_id",
    "user_id": "user_id",
    "items": [
      {
        "product_id": "prod_id",
        "name": "Product Name",
        "price": 99.99,
        "quantity": 2,
        "subtotal": 199.98
      }
    ],
    "total": 199.98,
    "updated_at": "2024-04-20T10:30:00Z"
  }
}
```

---

### 5. Checkout & Order Creation

#### Flow Diagram
```
Client → API Gateway → Cart Service
                        ├─ Get Cart Items
                        └─ Publish "checkout.initiated" event
                             │
                             ▼
                        Order Service
                        ├─ Call Product Service
                        │  (reserve inventory)
                        ├─ Create Order in MongoDB
                        ├─ Publish "order.created" event
                        └─ Publish "inventory.reserved" event
                             │
                             ├─→ Product Service (update inventory)
                             ├─→ Cart Service (clear cart)
                             └─→ Notification Service (send confirmation)
```

#### Sequence
1. Client sends `POST /api/orders/checkout` with cart_id and shipping info
2. API Gateway validates JWT
3. API Gateway routes to Order Service
4. Order Service retrieves cart from Cart Service
5. Order Service verifies inventory with Product Service
6. Order Service creates order in MongoDB
7. Order Service publishes `order.created` event
8. Order Service publishes `inventory.reserved` event
9. Product Service consumes event and updates inventory
10. Cart Service consumes event and clears user's cart
11. Notification Service sends order confirmation email
12. Returns order confirmation to client

#### Request
```json
POST /api/orders/checkout
{
  "cart_id": "cart_id",
  "shipping_address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip": "10001"
  },
  "payment_method": "credit_card"
}
```

#### Response
```json
{
  "success": true,
  "order": {
    "id": "order_id",
    "user_id": "user_id",
    "items": [...],
    "total": 199.98,
    "status": "pending",
    "created_at": "2024-04-20T10:35:00Z"
  }
}
```

---

### 6. Order Status Updates

#### Flow Diagram
```
Admin System → Order Service
                ├─ Update Order Status
                ├─ Store in MongoDB
                ├─ Publish "order.status_changed" event
                └─ Return Confirmation
                     │
                     ▼
                Event Bus (Kafka)
                     │
                ┌────┴────┬─────────┐
                ▼         ▼         ▼
            Notification Service
            (send email update)
            
            Cart Service
            (update caches)
            
            Analytics Service
            (track metrics)
```

#### Sequence
1. Admin updates order status (e.g., shipped)
2. Order Service updates order document in MongoDB
3. Order Service publishes `order.status_changed` event
4. Multiple services consume event:
   - Notification Service sends email to customer
   - Analytics Service tracks order metrics
   - Cache is invalidated for fresh data
5. Client polls or receives webhook for status update

#### Event Example
```json
{
  "event_type": "order.status_changed",
  "order_id": "order_id",
  "previous_status": "pending",
  "new_status": "shipped",
  "timestamp": "2024-04-20T11:00:00Z",
  "metadata": {
    "tracking_number": "1Z999AA1012345678"
  }
}
```

---

### 7. Inventory Management

#### Flow Diagram
```
Product Service → MongoDB (Products Collection)
                  ├─ Check current inventory
                  ├─ Update quantity on order
                  ├─ Publish "inventory.updated" event
                  └─ Update Redis cache
                       │
                       ▼
                  Kafka Topic
                  "inventory.changed"
                       │
                       ├─→ Cart Service (verify availability)
                       └─→ Analytics Service (track stock levels)
```

#### Sequence
1. Product inventory is updated (restocking, sales, returns)
2. Product Service updates MongoDB
3. Product Service publishes `inventory.updated` event
4. Redis cache is invalidated
5. Other services consume event and update their caches
6. Product availability status is updated

#### Event Example
```json
{
  "event_type": "inventory.updated",
  "product_id": "prod_id",
  "previous_quantity": 50,
  "new_quantity": 48,
  "action": "order_reserved",
  "order_id": "order_id",
  "timestamp": "2024-04-20T10:40:00Z"
}
```

---

## Event Topics in Kafka

| Topic | Producer | Consumers | Purpose |
|-------|----------|-----------|---------|
| `user.created` | Auth Service | Product, Cart, Order Services | New user registration |
| `user.deleted` | Auth Service | All Services | User account deletion |
| `product.created` | Product Service | Cart, Search Services | New product added |
| `product.updated` | Product Service | Cart, Cache | Product info changed |
| `inventory.reserved` | Order Service | Product, Notification Services | Stock reserved |
| `inventory.released` | Order Service | Product Service | Inventory returned (cancellation) |
| `cart.updated` | Cart Service | Analytics Service | Cart modification |
| `cart.cleared` | Cart Service | Analytics Service | Cart emptied |
| `order.created` | Order Service | Product, Notification, Analytics Services | New order placed |
| `order.cancelled` | Order Service | Product, Notification Services | Order cancelled |
| `order.status_changed` | Order Service | Notification, Analytics Services | Order status update |
| `payment.processed` | Payment Service | Order, Notification Services | Payment completed |
| `payment.failed` | Payment Service | Order, Notification Services | Payment failed |

---

## Failure Scenarios & Recovery

### Scenario 1: Payment Failed
```
Order Service publishes "payment.failed"
    ├─ Order Service reverts order status to "pending"
    ├─ Product Service releases reserved inventory
    ├─ Notification Service sends error notification
    └─ Cart Service keeps cart items available
```

### Scenario 2: Service Timeout
```
Cart Service calls Product Service (timeout)
    ├─ Cart Service retries up to 3 times
    ├─ Adds exponential backoff
    ├─ Falls back to cached product data
    ├─ Returns partial response or error
    └─ Logs incident for monitoring
```

### Scenario 3: Order Processing Failure
```
Order Service publishes "order.created"
    ├─ Product Service fails to consume event
    ├─ Message stays in Kafka queue
    ├─ Dead letter queue captures failed message
    ├─ Alert sent to operations team
    └─ Manual retry or recovery process
```

---

## Distributed Transactions

The system uses **Eventual Consistency** pattern:

1. Services perform local transactions immediately
2. Events are published to Kafka
3. Other services consume events asynchronously
4. Compensation logic handles failures
5. System converges to consistent state eventually

Example: Order Creation
```
1. Order Service: Create order (COMMITTED)
2. Publish "order.created" event
3. Product Service: Update inventory (COMMITTED)
4. Cart Service: Clear cart (COMMITTED)
5. System is now eventually consistent
```

---

## Performance Optimizations

### Caching Strategy
- **Redis Cache**: Frequently accessed data (1 hour TTL)
- **In-Memory Cache**: Service-level caching
- **Cache Invalidation**: Event-based cache busting

### Database Indexes
- User email and ID in Auth DB
- Product ID and category in Product DB
- Order ID and user_id in Order DB
- Cart user_id in Cart DB

### Batch Operations
- Bulk product imports
- Batch inventory updates
- Bulk order processing

---

## Monitoring Key Flows

### Metrics to Track
- Request latency per service
- Cache hit/miss rates
- Kafka message throughput
- Service error rates
- Database query performance

### Distributed Tracing
- Correlation IDs for request tracking
- Trace headers propagated across services
- Visualization in monitoring dashboard

---

## References

- [Microservices Communication Patterns](https://microservices.io/)
- [Kafka Event Streaming](https://kafka.apache.org/)
- [Distributed Transactions](https://microservices.io/patterns/data/saga.html)
