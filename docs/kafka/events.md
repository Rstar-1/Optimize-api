# Kafka Events Documentation

## Overview

Kafka provides event streaming for asynchronous communication between microservices. This document details all events, their schemas, and usage patterns.

---

## Event Topics

### user.* - User Events

#### user.created
Published when a new user registers.

```json
{
  "event_type": "user.created",
  "user_id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "customer",
  "created_at": "2024-04-20T10:00:00Z",
  "metadata": {
    "source": "auth-service",
    "timestamp": "2024-04-20T10:00:00Z",
    "trace_id": "trace_123456"
  }
}
```

**Consumers**: All services for cache updates

#### user.updated
Published when user profile is updated.

```json
{
  "event_type": "user.updated",
  "user_id": "507f1f77bcf86cd799439011",
  "changes": {
    "name": "John Smith",
    "email": "newmail@example.com"
  },
  "updated_at": "2024-04-20T15:30:00Z"
}
```

#### user.deleted
Published when a user account is deleted.

```json
{
  "event_type": "user.deleted",
  "user_id": "507f1f77bcf86cd799439011",
  "deleted_at": "2024-04-20T16:00:00Z",
  "reason": "user_request"
}
```

---

### product.* - Product Events

#### product.created
Published when a new product is added.

```json
{
  "event_type": "product.created",
  "product_id": "prod_001",
  "sku": "PROD-001",
  "name": "iPhone 15 Pro",
  "category": "electronics",
  "price": 899.99,
  "seller_id": "seller_123",
  "created_at": "2024-04-20T10:00:00Z"
}
```

#### product.updated
Published when product details change.

```json
{
  "event_type": "product.updated",
  "product_id": "prod_001",
  "changes": {
    "price": 799.99,
    "name": "iPhone 15 Pro Max"
  },
  "updated_at": "2024-04-20T15:30:00Z"
}
```

#### product.deleted
Published when a product is removed.

```json
{
  "event_type": "product.deleted",
  "product_id": "prod_001",
  "sku": "PROD-001",
  "deleted_at": "2024-04-20T16:00:00Z"
}
```

---

### inventory.* - Inventory Events

#### inventory.updated
Published when product stock changes.

```json
{
  "event_type": "inventory.updated",
  "product_id": "prod_001",
  "quantity_before": 100,
  "quantity_after": 95,
  "quantity_changed": -5,
  "action": "order_reserved",
  "reference_id": "order_001",
  "timestamp": "2024-04-20T10:30:00Z"
}
```

#### inventory.reserved
Published when inventory is reserved for an order.

```json
{
  "event_type": "inventory.reserved",
  "product_id": "prod_001",
  "order_id": "order_001",
  "quantity": 2,
  "reserved_at": "2024-04-20T10:30:00Z"
}
```

#### inventory.released
Published when reserved inventory is released.

```json
{
  "event_type": "inventory.released",
  "product_id": "prod_001",
  "order_id": "order_001",
  "quantity": 2,
  "reason": "order_cancelled",
  "released_at": "2024-04-20T11:00:00Z"
}
```

---

### cart.* - Cart Events

#### cart.created
Published when a cart is created.

```json
{
  "event_type": "cart.created",
  "cart_id": "cart_001",
  "user_id": "user_123",
  "created_at": "2024-04-20T10:00:00Z"
}
```

#### cart.updated
Published when cart items change.

```json
{
  "event_type": "cart.updated",
  "cart_id": "cart_001",
  "user_id": "user_123",
  "item_count": 2,
  "total": 1799.98,
  "items": [
    {
      "product_id": "prod_001",
      "quantity": 2,
      "price": 899.99
    }
  ],
  "updated_at": "2024-04-20T15:30:00Z"
}
```

#### cart.cleared
Published when cart is emptied.

```json
{
  "event_type": "cart.cleared",
  "cart_id": "cart_001",
  "user_id": "user_123",
  "cleared_at": "2024-04-20T16:00:00Z",
  "reason": "checkout"
}
```

---

### order.* - Order Events

#### order.created
Published when an order is placed.

```json
{
  "event_type": "order.created",
  "order_id": "order_001",
  "order_number": "ORD-2024-001234",
  "user_id": "user_123",
  "items": [
    {
      "product_id": "prod_001",
      "quantity": 1,
      "price": 899.99
    }
  ],
  "total": 981.99,
  "created_at": "2024-04-20T10:00:00Z"
}
```

**Consumers**: Product Service (reserve inventory), Notification Service

#### order.confirmed
Published when payment is confirmed.

```json
{
  "event_type": "order.confirmed",
  "order_id": "order_001",
  "payment_status": "completed",
  "confirmed_at": "2024-04-20T10:15:00Z"
}
```

#### order.processing
Published when order enters processing.

```json
{
  "event_type": "order.processing",
  "order_id": "order_001",
  "estimated_ship_date": "2024-04-22T00:00:00Z",
  "started_at": "2024-04-20T10:30:00Z"
}
```

#### order.shipped
Published when order is dispatched.

```json
{
  "event_type": "order.shipped",
  "order_id": "order_001",
  "tracking_number": "1Z999AA1012345678",
  "carrier": "UPS",
  "estimated_delivery": "2024-04-25T00:00:00Z",
  "shipped_at": "2024-04-20T15:00:00Z"
}
```

#### order.delivered
Published when order is delivered.

```json
{
  "event_type": "order.delivered",
  "order_id": "order_001",
  "delivered_at": "2024-04-25T14:30:00Z"
}
```

#### order.cancelled
Published when order is cancelled.

```json
{
  "event_type": "order.cancelled",
  "order_id": "order_001",
  "reason": "user_request",
  "refund_initiated": true,
  "cancelled_at": "2024-04-20T16:00:00Z"
}
```

**Consumers**: Product Service (release inventory), Notification Service

#### order.status_changed
Published for all order status transitions.

```json
{
  "event_type": "order.status_changed",
  "order_id": "order_001",
  "previous_status": "confirmed",
  "new_status": "processing",
  "changed_at": "2024-04-20T10:30:00Z"
}
```

---

### payment.* - Payment Events

#### payment.processed
Published when payment succeeds.

```json
{
  "event_type": "payment.processed",
  "order_id": "order_001",
  "payment_id": "pay_123456",
  "amount": 981.99,
  "currency": "USD",
  "method": "credit_card",
  "transaction_id": "txn_123456",
  "processed_at": "2024-04-20T10:15:00Z"
}
```

#### payment.failed
Published when payment fails.

```json
{
  "event_type": "payment.failed",
  "order_id": "order_001",
  "reason": "insufficient_funds",
  "failed_at": "2024-04-20T10:15:00Z",
  "retry_count": 1
}
```

#### refund.processed
Published when refund completes.

```json
{
  "event_type": "refund.processed",
  "order_id": "order_001",
  "amount": 981.99,
  "refund_id": "ref_123456",
  "processed_at": "2024-04-20T16:30:00Z"
}
```

---

### notification.* - Notification Events

#### notification.send
Published to trigger notifications.

```json
{
  "event_type": "notification.send",
  "user_id": "user_123",
  "type": "order_confirmation",
  "channel": "email",
  "template": "order_confirmation",
  "data": {
    "order_id": "order_001",
    "customer_name": "John Doe"
  },
  "created_at": "2024-04-20T10:00:00Z"
}
```

---

## Producer Implementation

### Publishing Events

```javascript
const kafka = require('kafka-node');
const Producer = kafka.Producer;
const client = new kafka.KafkaClient({ kafkaHost: 'kafka:9092' });
const producer = new Producer(client);

async function publishEvent(topic, eventData) {
  return new Promise((resolve, reject) => {
    const payload = [{
      topic: topic,
      messages: JSON.stringify(eventData),
      partition: 0
    }];

    producer.send(payload, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

// Usage
await publishEvent('order.created', {
  event_type: 'order.created',
  order_id: 'order_001',
  user_id: 'user_123',
  items: [...],
  total: 981.99,
  created_at: new Date()
});
```

---

## Consumer Implementation

### Consuming Events

```javascript
const Consumer = kafka.Consumer;
const consumer = new Consumer(client, [
  { topic: 'order.created', partition: 0 },
  { topic: 'order.cancelled', partition: 0 },
  { topic: 'payment.processed', partition: 0 }
], {
  autoCommit: true,
  groupId: 'product-service-group'
});

consumer.on('message', async (message) => {
  try {
    const event = JSON.parse(message.value);

    switch (event.event_type) {
      case 'order.created':
        await handleOrderCreated(event);
        break;
      case 'order.cancelled':
        await handleOrderCancelled(event);
        break;
      case 'payment.processed':
        await handlePaymentProcessed(event);
        break;
    }
  } catch (error) {
    console.error('Error processing message:', error);
    // Send to dead letter queue
    await publishEvent('error.dlq', {
      original_message: message,
      error: error.message,
      timestamp: new Date()
    });
  }
});

consumer.on('error', (err) => {
  console.error('Consumer error:', err);
});
```

---

## Event Handler Examples

### Product Service - Handle Order Created

```javascript
async function handleOrderCreated(event) {
  const { order_id, items } = event;

  try {
    // Reserve inventory for each item
    for (const item of items) {
      await Product.updateOne(
        { _id: item.product_id },
        { $inc: { 'inventory.reserved': item.quantity } }
      );

      // Publish inventory reserved event
      await publishEvent('inventory.reserved', {
        event_type: 'inventory.reserved',
        product_id: item.product_id,
        order_id: order_id,
        quantity: item.quantity,
        reserved_at: new Date()
      });
    }

    console.log(`Inventory reserved for order ${order_id}`);
  } catch (error) {
    console.error('Failed to reserve inventory:', error);
    throw error;
  }
}
```

### Cart Service - Handle Order Created

```javascript
async function handleOrderCreated(event) {
  const { user_id } = event;

  try {
    // Clear user's cart after checkout
    await Cart.updateOne(
      { user_id },
      {
        items: [],
        total: 0,
        updated_at: new Date()
      }
    );

    // Publish cart cleared event
    await publishEvent('cart.cleared', {
      event_type: 'cart.cleared',
      user_id: user_id,
      reason: 'checkout',
      cleared_at: new Date()
    });

    console.log(`Cart cleared for user ${user_id}`);
  } catch (error) {
    console.error('Failed to clear cart:', error);
    throw error;
  }
}
```

---

## Dead Letter Queue

### DLQ Pattern

```javascript
const DLQ_TOPIC = 'error.dlq';

async function processDLQMessage(message) {
  const error = JSON.parse(message.value);

  console.error('DLQ Message:', {
    original_topic: error.original_topic,
    error_message: error.error,
    timestamp: error.timestamp
  });

  // Alert operations team
  await notifyOpsTeam(error);

  // Log for analysis
  await AuditLog.create({
    type: 'dlq_message',
    data: error,
    created_at: new Date()
  });
}
```

---

## Monitoring

### Metrics to Track

```javascript
// Consumer lag
const consumerGroup = 'product-service-group';
const lag = await getConsumerLag(consumerGroup, 'order.created');
console.log(`Consumer lag for order.created: ${lag} messages`);

// Throughput
const messagesProcessed = await getMessagesProcessed('order.created');
console.log(`Messages processed: ${messagesProcessed}/sec`);

// Error rate
const errorRate = await getErrorRate('order.created');
console.log(`Error rate: ${errorRate}%`);
```

---

## Best Practices

1. **Idempotent Processing**: Handle duplicate events
2. **Event Versioning**: Support schema changes
3. **Error Handling**: Use DLQ for failed messages
4. **Monitoring**: Track lag and error rates
5. **Documentation**: Keep event schemas documented
6. **Testing**: Mock Kafka in tests

---

## References

- [Kafka Documentation](https://kafka.apache.org/documentation/)
- [Event Streaming Patterns](https://www.confluent.io/design/patterns/)
