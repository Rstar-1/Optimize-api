# Kafka Topics Guide

## Overview

Kafka topics organize event streams by business domain and function. This guide covers topic configuration, management, and best practices.

---

## Topic Structure

### Topic Naming Convention

```
<domain>.<entity>.<action>
```

Examples:
- `user.account.created`
- `order.payment.processed`
- `product.inventory.updated`

---

## Topic Definitions

### User Domain

```yaml
topics:
  user.created:
    partitions: 3
    replication_factor: 2
    retention_ms: 604800000  # 7 days
    min_insync_replicas: 2

  user.updated:
    partitions: 3
    replication_factor: 2
    retention_ms: 604800000

  user.deleted:
    partitions: 1
    replication_factor: 2
    retention_ms: 2592000000  # 30 days (compliance)
```

### Product Domain

```yaml
topics:
  product.created:
    partitions: 5
    replication_factor: 2
    retention_ms: 604800000

  product.updated:
    partitions: 5
    replication_factor: 2
    retention_ms: 604800000

  product.deleted:
    partitions: 1
    replication_factor: 2
    retention_ms: 2592000000
```

### Order Domain

```yaml
topics:
  order.created:
    partitions: 10
    replication_factor: 2
    retention_ms: 2592000000  # 30 days
    min_insync_replicas: 2
    compression_type: snappy

  order.status_changed:
    partitions: 10
    replication_factor: 2
    retention_ms: 2592000000

  order.cancelled:
    partitions: 5
    replication_factor: 2
    retention_ms: 2592000000
```

### Inventory Domain

```yaml
topics:
  inventory.updated:
    partitions: 10
    replication_factor: 2
    retention_ms: 604800000
    compression_type: snappy

  inventory.reserved:
    partitions: 10
    replication_factor: 2
    retention_ms: 604800000

  inventory.released:
    partitions: 5
    replication_factor: 2
    retention_ms: 604800000
```

### Payment Domain

```yaml
topics:
  payment.processed:
    partitions: 5
    replication_factor: 2
    retention_ms: 2592000000  # PCI compliance
    min_insync_replicas: 2

  payment.failed:
    partitions: 5
    replication_factor: 2
    retention_ms: 2592000000
```

### Error Domain

```yaml
topics:
  error.dlq:
    partitions: 1
    replication_factor: 2
    retention_ms: 2592000000  # 30 days retention for debugging
```

---

## Topic Management

### Create Topics

Using `kafka-topics` CLI:

```bash
# Create single topic
kafka-topics --create \
  --topic order.created \
  --partitions 10 \
  --replication-factor 2 \
  --bootstrap-server kafka:9092 \
  --config min.insync.replicas=2

# Create multiple topics from script
#!/bin/bash
TOPICS=("user.created" "product.updated" "order.created" "payment.processed")

for topic in "${TOPICS[@]}"; do
  kafka-topics --create \
    --topic "$topic" \
    --partitions 3 \
    --replication-factor 2 \
    --bootstrap-server kafka:9092
done
```

### List Topics

```bash
kafka-topics --list --bootstrap-server kafka:9092
```

### Describe Topic

```bash
kafka-topics --describe \
  --topic order.created \
  --bootstrap-server kafka:9092
```

### Alter Topic

```bash
# Increase partitions
kafka-topics --alter \
  --topic order.created \
  --partitions 15 \
  --bootstrap-server kafka:9092

# Update configuration
kafka-configs --alter \
  --entity-type topic \
  --entity-name order.created \
  --add-config retention.ms=1209600000 \
  --bootstrap-server kafka:9092
```

### Delete Topic

```bash
kafka-topics --delete \
  --topic order.created \
  --bootstrap-server kafka:9092
```

---

## Partitioning Strategy

### Partition Count Calculation

```
Partitions = max(throughput/1MB per second, consumer count)
```

Example:
- Expected throughput: 1000 messages/sec
- Message size: ~1KB = 1MB/1000 messages
- Throughput: 1MB/sec
- Consumer instances: 5
- Recommended partitions: max(1, 5) = 5

### Partition Key Selection

#### By User ID
For user-specific events - ensures ordering per user

```javascript
const partitionKey = event.user_id;
```

#### By Product ID
For product events - maintains product history

```javascript
const partitionKey = event.product_id;
```

#### By Order ID
For order events - preserves order sequence

```javascript
const partitionKey = event.order_id;
```

#### By Time
For high-volume topics - load balancing

```javascript
const partitionKey = Math.floor(Date.now() / 1000).toString();
```

---

## Topic Configuration

### Retention Policy

```yaml
# Short retention (real-time processing)
topics:
  order.status_changed:
    retention_ms: 86400000  # 1 day

# Long retention (compliance)
topics:
  payment.processed:
    retention_ms: 7776000000  # 90 days

# Infinite retention
topics:
  audit.log:
    retention_ms: -1
```

### Compression

```yaml
# No compression
compression_type: uncompressed

# Snappy (good balance)
compression_type: snappy

# LZ4 (faster)
compression_type: lz4

# GZIP (better ratio)
compression_type: gzip
```

### Cleanup Policy

```yaml
# Delete old messages
cleanup_policy: delete

# Compact (keep latest per key)
cleanup_policy: compact

# Both
cleanup_policy: delete,compact
```

---

## Consumer Groups

### Create Consumer Group

```bash
# Consumers join automatically, but can pre-create
kafka-consumer-groups --create \
  --bootstrap-server kafka:9092 \
  --group product-service-group \
  --topic order.created \
  --topic inventory.updated
```

### List Consumer Groups

```bash
kafka-consumer-groups --list --bootstrap-server kafka:9092
```

### Describe Consumer Group

```bash
kafka-consumer-groups --describe \
  --group product-service-group \
  --bootstrap-server kafka:9092
```

### Monitor Consumer Lag

```bash
# Current lag
kafka-consumer-groups --describe \
  --group product-service-group \
  --bootstrap-server kafka:9092

# Continuous monitoring
watch -n 5 'kafka-consumer-groups --describe \
  --group product-service-group \
  --bootstrap-server kafka:9092'
```

---

## Performance Tuning

### Producer Configuration

```javascript
const producerConfig = {
  'acks': 'all',  // Wait for all replicas
  'retries': 3,
  'max.in.flight.requests.per.connection': 5,
  'compression.type': 'snappy',
  'batch.size': 16384,
  'linger.ms': 10
};
```

### Consumer Configuration

```javascript
const consumerConfig = {
  'group.id': 'product-service-group',
  'auto.offset.reset': 'earliest',
  'enable.auto.commit': false,  // Manual commit
  'max.poll.records': 500,
  'fetch.min.bytes': 1024,
  'fetch.max.wait.ms': 500
};
```

---

## Schema Registry

### Define Schema

```json
{
  "type": "record",
  "name": "OrderCreated",
  "namespace": "com.ecommerce.events",
  "fields": [
    {
      "name": "order_id",
      "type": "string"
    },
    {
      "name": "user_id",
      "type": "string"
    },
    {
      "name": "total",
      "type": "double"
    },
    {
      "name": "created_at",
      "type": {
        "type": "long",
        "logicalType": "timestamp-millis"
      }
    }
  ]
}
```

### Register Schema

```bash
curl -X POST \
  http://schema-registry:8081/subjects/order.created-value/versions \
  -H "Content-Type: application/vnd.schemaregistry.v1+json" \
  -d @order-created-schema.json
```

---

## Disaster Recovery

### Backup Strategy

```bash
# Backup topic data
kafka-mirror-maker \
  --consumer.config source-cluster.properties \
  --producer.config backup-cluster.properties \
  --whitelist "order.*,payment.*"
```

### Topic Recovery

```bash
# If topic is corrupted
1. Delete topic
2. Recreate with same configuration
3. Restore from backup
```

---

## Monitoring

### Kafka Exporter Metrics

```yaml
# Prometheus scrape config
- job_name: 'kafka'
  static_configs:
    - targets: ['kafka-exporter:9308']
```

### Key Metrics

```
kafka_topic_partitions            # Partition count
kafka_topic_replicas              # Replication factor
kafka_consumer_lag                # Messages behind
kafka_topic_messages_total        # Message count
kafka_broker_io_in_bytes_total    # Incoming traffic
kafka_broker_io_out_bytes_total   # Outgoing traffic
```

---

## References

- [Kafka Topic Configuration](https://kafka.apache.org/documentation/#topicconfigs)
- [Kafka Best Practices](https://kafka.apache.org/documentation/#bestpractices)
- [Confluent Partitioning](https://www.confluent.io/blog/how-to-choose-the-number-of-topics-partitions-in-a-kafka-cluster/)
