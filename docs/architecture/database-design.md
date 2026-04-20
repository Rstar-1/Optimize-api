# Database Design - E-Commerce Platform

## Overview

The e-commerce platform uses **MongoDB** as the primary database with a **database-per-service** pattern. This ensures data isolation and independent scalability of each microservice.

## MongoDB Setup

### Connection Details
- **Host**: mongodb://admin:admin@123@mongodb:27017/
- **Admin Username**: admin
- **Admin Password**: admin@123
- **Version**: MongoDB 7.0
- **Replication**: Enabled (for high availability)

### Database Architecture

Each microservice has its own database:
- **auth-db**: Authentication & User Management
- **product-db**: Products & Inventory
- **cart-db**: Shopping Carts
- **order-db**: Orders & Transactions

---

## Database Schemas

### 1. Auth Database (auth-db)

#### Users Collection

```javascript
{
  _id: ObjectId,
  email: String (unique, indexed),
  password_hash: String,
  name: String,
  role: String, // 'customer', 'admin', 'seller'
  phone: String,
  avatar_url: String,
  created_at: Date,
  updated_at: Date,
  deleted_at: Date,
  status: String, // 'active', 'inactive', 'suspended'
  preferences: {
    newsletter: Boolean,
    notifications: Boolean,
    language: String
  }
}
```

**Indexes**:
```javascript
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ role: 1 })
db.users.createIndex({ created_at: -1 })
db.users.createIndex({ status: 1 })
```

#### Sessions Collection

```javascript
{
  _id: String, // Session ID
  user_id: ObjectId (indexed),
  token: String,
  ip_address: String,
  user_agent: String,
  created_at: Date,
  expires_at: Date,
  last_activity: Date,
  is_valid: Boolean
}
```

**Indexes**:
```javascript
db.sessions.createIndex({ user_id: 1 })
db.sessions.createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 })
db.sessions.createIndex({ token: 1 })
```

#### Tokens Collection

```javascript
{
  _id: ObjectId,
  user_id: ObjectId (indexed),
  type: String, // 'reset_password', 'email_verification'
  token: String (unique),
  expires_at: Date,
  used_at: Date,
  is_used: Boolean
}
```

**Indexes**:
```javascript
db.tokens.createIndex({ user_id: 1 })
db.tokens.createIndex({ token: 1 }, { unique: true })
db.tokens.createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 })
```

---

### 2. Product Database (product-db)

#### Products Collection

```javascript
{
  _id: ObjectId,
  sku: String (unique, indexed),
  name: String (indexed),
  description: String,
  category: String (indexed),
  subcategory: String (indexed),
  price: {
    original: Number,
    current: Number,
    currency: String
  },
  images: [
    {
      url: String,
      alt_text: String,
      is_primary: Boolean,
      order: Number
    }
  ],
  specifications: {
    color: String,
    size: String,
    material: String,
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: String
    },
    weight: {
      value: Number,
      unit: String
    }
  },
  inventory: {
    quantity: Number (indexed),
    reserved: Number,
    available: Number,
    low_stock_threshold: Number,
    reorder_level: Number
  },
  ratings: {
    average: Number (indexed),
    count: Number,
    distribution: {
      5: Number,
      4: Number,
      3: Number,
      2: Number,
      1: Number
    }
  },
  reviews: [
    {
      _id: ObjectId,
      user_id: ObjectId,
      rating: Number,
      title: String,
      comment: String,
      verified_purchase: Boolean,
      helpful_count: Number,
      created_at: Date
    }
  ],
  seller_id: ObjectId,
  is_active: Boolean,
  created_at: Date (indexed),
  updated_at: Date,
  deleted_at: Date
}
```

**Indexes**:
```javascript
db.products.createIndex({ sku: 1 }, { unique: true })
db.products.createIndex({ name: 1 })
db.products.createIndex({ category: 1, subcategory: 1 })
db.products.createIndex({ "inventory.quantity": 1 })
db.products.createIndex({ "ratings.average": -1 })
db.products.createIndex({ created_at: -1 })
db.products.createIndex({ is_active: 1 })
db.products.createIndex({ seller_id: 1 })
```

#### Categories Collection

```javascript
{
  _id: ObjectId,
  name: String (unique, indexed),
  slug: String (unique),
  description: String,
  image_url: String,
  parent_id: ObjectId, // For subcategories
  is_active: Boolean,
  display_order: Number,
  created_at: Date,
  updated_at: Date
}
```

**Indexes**:
```javascript
db.categories.createIndex({ name: 1 }, { unique: true })
db.categories.createIndex({ slug: 1 }, { unique: true })
db.categories.createIndex({ parent_id: 1 })
db.categories.createIndex({ display_order: 1 })
```

#### Inventory Logs Collection

```javascript
{
  _id: ObjectId,
  product_id: ObjectId (indexed),
  action: String, // 'purchased', 'restocked', 'returned', 'adjustment'
  quantity_before: Number,
  quantity_after: Number,
  quantity_changed: Number,
  reference_id: String, // order_id, return_id, etc.
  notes: String,
  created_at: Date
}
```

**Indexes**:
```javascript
db.inventory_logs.createIndex({ product_id: 1 })
db.inventory_logs.createIndex({ action: 1 })
db.inventory_logs.createIndex({ created_at: -1 })
db.inventory_logs.createIndex({ reference_id: 1 })
```

---

### 3. Cart Database (cart-db)

#### Carts Collection

```javascript
{
  _id: ObjectId,
  user_id: ObjectId (indexed, unique per user),
  items: [
    {
      _id: ObjectId,
      product_id: ObjectId (indexed),
      quantity: Number,
      unit_price: Number,
      subtotal: Number,
      variant: {
        color: String,
        size: String,
        other: Object
      },
      added_at: Date,
      added_from_wishlist: Boolean
    }
  ],
  coupon_code: String,
  discount_amount: Number,
  subtotal: Number,
  tax: Number,
  shipping_cost: Number,
  total: Number,
  session_id: String,
  expires_at: Date, // TTL for abandoned carts
  created_at: Date,
  updated_at: Date,
  abandoned_at: Date
}
```

**Indexes**:
```javascript
db.carts.createIndex({ user_id: 1 }, { unique: true })
db.carts.createIndex({ "items.product_id": 1 })
db.carts.createIndex({ session_id: 1 })
db.carts.createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 })
db.carts.createIndex({ updated_at: -1 })
```

#### Wishlists Collection

```javascript
{
  _id: ObjectId,
  user_id: ObjectId (indexed, unique per user),
  items: [
    {
      product_id: ObjectId,
      added_at: Date,
      notes: String
    }
  ],
  created_at: Date,
  updated_at: Date
}
```

**Indexes**:
```javascript
db.wishlists.createIndex({ user_id: 1 }, { unique: true })
db.wishlists.createIndex({ "items.product_id": 1 })
```

---

### 4. Order Database (order-db)

#### Orders Collection

```javascript
{
  _id: ObjectId,
  order_number: String (unique, indexed), // e.g., ORD-2024-001234
  user_id: ObjectId (indexed),
  items: [
    {
      _id: ObjectId,
      product_id: ObjectId,
      product_name: String,
      sku: String,
      quantity: Number,
      unit_price: Number,
      subtotal: Number,
      variant: Object
    }
  ],
  status: String (indexed), // 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'
  payment: {
    status: String, // 'pending', 'completed', 'failed', 'refunded'
    method: String, // 'credit_card', 'paypal', 'bank_transfer'
    transaction_id: String,
    paid_at: Date,
    amount: Number
  },
  shipping: {
    method: String, // 'standard', 'express', 'overnight'
    address: {
      street: String,
      city: String,
      state: String,
      postal_code: String,
      country: String
    },
    carrier: String,
    tracking_number: String,
    estimated_delivery: Date,
    shipped_at: Date,
    delivered_at: Date
  },
  billing: {
    address: {
      street: String,
      city: String,
      state: String,
      postal_code: String,
      country: String
    },
    same_as_shipping: Boolean
  },
  pricing: {
    subtotal: Number,
    tax: Number,
    shipping_cost: Number,
    discount_amount: Number,
    discount_code: String,
    total: Number
  },
  notes: String,
  created_at: Date (indexed),
  updated_at: Date,
  deleted_at: Date
}
```

**Indexes**:
```javascript
db.orders.createIndex({ order_number: 1 }, { unique: true })
db.orders.createIndex({ user_id: 1 })
db.orders.createIndex({ status: 1 })
db.orders.createIndex({ "payment.status": 1 })
db.orders.createIndex({ created_at: -1 })
db.orders.createIndex({ "payment.transaction_id": 1 })
```

#### Returns Collection

```javascript
{
  _id: ObjectId,
  return_number: String (unique, indexed),
  order_id: ObjectId (indexed),
  user_id: ObjectId,
  items: [
    {
      order_item_id: ObjectId,
      product_id: ObjectId,
      quantity: Number,
      reason: String,
      condition: String // 'unused', 'defective', 'damaged', 'different_from_description'
    }
  ],
  status: String, // 'initiated', 'approved', 'received', 'processed', 'rejected'
  refund_amount: Number,
  refund_status: String,
  notes: String,
  created_at: Date,
  updated_at: Date
}
```

**Indexes**:
```javascript
db.returns.createIndex({ return_number: 1 }, { unique: true })
db.returns.createIndex({ order_id: 1 })
db.returns.createIndex({ user_id: 1 })
db.returns.createIndex({ status: 1 })
```

---

## Caching Strategy with Redis

### Cache Keys Structure

```
users:{user_id} → User profile data (TTL: 1 hour)
products:{product_id} → Product details (TTL: 1 hour)
products:category:{category} → Category products (TTL: 1 hour)
carts:{user_id} → User cart (TTL: 24 hours)
wishlist:{user_id} → User wishlist (TTL: 24 hours)
orders:{order_id} → Order details (TTL: 2 hours)
inventory:{product_id} → Product inventory (TTL: 30 minutes)
sessions:{session_id} → User session (TTL: 7 days)
search_results:{query_hash} → Search results (TTL: 30 minutes)
```

### Cache Invalidation Events

Events that trigger cache invalidation:

| Event | Cache Keys Invalidated |
|-------|------------------------|
| `user.updated` | `users:{user_id}` |
| `product.updated` | `products:{product_id}`, `products:category:{category}` |
| `inventory.updated` | `inventory:{product_id}` |
| `cart.updated` | `carts:{user_id}` |
| `order.created` | Cache not used (fresh data) |

---

## Data Relationships & Integrity

### Cross-Service References

| Source | Reference | Strategy |
|--------|-----------|----------|
| Cart.product_id | Product Service | Foreign key reference |
| Order.user_id | Auth Service | Foreign key reference |
| Order.product_id | Product Service | Foreign key reference |

### Consistency Approach

1. **Eventual Consistency**: Services use events to sync data
2. **Local Transactions**: Each service owns its data
3. **Compensation**: Failed operations are compensated
4. **Sagas**: Complex transactions use saga pattern

---

## Backup and Recovery

### Backup Strategy

```
Full Backup: Weekly (entire databases)
Incremental: Daily (changes only)
Oplog Backup: Continuous (for point-in-time recovery)
Retention: 30 days
```

### Recovery Procedures

```
Point-in-time recovery: Using oplog
Database restore: From full backup + incremental
Collection restore: Selective restoration
```

---

## Data Retention Policies

### Active Data
- Users: Keep indefinitely (unless deleted)
- Products: Keep indefinitely (unless delisted)
- Orders: Keep for 7 years (regulatory)
- Carts: Keep for 1 year

### Archive Data
- Old orders: Archive after 1 year to separate DB
- Deleted users: Anonymize after 90 days, archive after 1 year
- Logs: Keep for 90 days (in separate logging system)

---

## Performance Tuning

### Query Optimization

```javascript
// ❌ Bad: No index
db.products.find({ category: 'electronics' })

// ✅ Good: Indexed query
db.products.find({ category: 'electronics' }).limit(20)

// ❌ Bad: Missing index on sort
db.products.find().sort({ created_at: -1 })

// ✅ Good: Indexed sort
db.products.find().sort({ created_at: -1 }).limit(20)
```

### Connection Pooling
- Pool Size: 50-100 connections
- Connection Timeout: 30 seconds
- Idle Timeout: 10 minutes

---

## Monitoring

### Key Metrics

```
- Query response time (p50, p95, p99)
- Connection pool usage
- Replication lag
- Disk I/O utilization
- Memory usage
- Index usage statistics
```

### Alerts

```
- Replication lag > 5 seconds
- Query time > 1000ms
- Connection pool > 80% utilization
- Disk usage > 80%
```

---

## Migration Strategy

### Schema Evolution

1. **Backward Compatibility**: New code handles old data
2. **Gradual Migration**: Migrate data as records update
3. **Validation**: Verify data after migration
4. **Rollback Plan**: Keep old schema until stable

### Adding New Fields

```javascript
// 1. Code supports both old and new format
// 2. Add new field in code
db.products.updateMany(
  { new_field: { $exists: false } },
  { $set: { new_field: default_value } }
)
// 3. Remove conditional logic after full migration
```

---

## References

- [MongoDB Documentation](https://docs.mongodb.com/)
- [MongoDB Best Practices](https://docs.mongodb.com/manual/administration/data-model/)
- [Database Sharding](https://docs.mongodb.com/manual/sharding/)
