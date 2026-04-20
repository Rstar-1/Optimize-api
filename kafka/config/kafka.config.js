/**
 * Kafka Configuration
 * Centralized configuration for all Kafka operations
 */

module.exports = {
  // Kafka Connection
  brokers: process.env.KAFKA_BROKERS?.split(',') || ['kafka:9092'],
  clientId: process.env.KAFKA_CLIENT_ID || 'ecommerce-app',

  // Producer Configuration
  producer: {
    allowAutoTopicCreation: false,
    transactionTimeout: 30000,
    idempotent: true,
    maxInFlightRequests: 5,
    compression: 1, // Gzip
    timeout: 30000,
    retries: 3
  },

  // Consumer Configuration
  consumer: {
    sessionTimeout: 30000,
    heartbeatInterval: 3000,
    rebalanceTimeout: 60000,
    allowAutoTopicCreation: false,
    maxBytesPerPartition: 1024 * 1024, // 1MB
    maxWaitTimeInMs: 500,
    fetchSize: 1024 * 1024 // 1MB
  },

  // Admin Configuration
  admin: {
    connectionTimeout: 10000,
    requestTimeout: 25000
  },

  // Retry Configuration
  retry: {
    initialRetryTime: 100,
    retries: 8,
    multiplier: 2,
    randomizationFactor: 0.2,
    maxRetryTime: 30000
  },

  // SSL/SASL Configuration
  ssl: process.env.KAFKA_SSL === 'true' ? {} : undefined,
  sasl: process.env.KAFKA_SASL_MECHANISM ? {
    mechanism: process.env.KAFKA_SASL_MECHANISM,
    username: process.env.KAFKA_SASL_USERNAME,
    password: process.env.KAFKA_SASL_PASSWORD
  } : undefined,

  // Consumer Group IDs
  consumerGroups: {
    AUTH: 'auth-service-group',
    ORDER: 'order-service-group',
    PRODUCT: 'product-service-group',
    PAYMENT: 'payment-service-group',
    NOTIFICATION: 'notification-service-group',
    ANALYTICS: 'analytics-service-group'
  },

  // Topic Prefixes
  topicPrefixes: {
    USER: 'user',
    PRODUCT: 'product',
    ORDER: 'order',
    PAYMENT: 'payment',
    INVENTORY: 'inventory',
    CART: 'cart',
    NOTIFICATION: 'notification'
  },

  // Default Partition Count and Replication
  defaults: {
    partitions: 3,
    replicationFactor: 2,
    minInSyncReplicas: 2
  }
};
