/**
 * Kafka Topics Definition
 * Define all topics for payment-related events
 */

const kafkaConfig = require('../config/kafka.config');

const paymentTopics = {
  // Payment Events
  PAYMENT_PROCESSED: `${kafkaConfig.topicPrefixes.PAYMENT}.processed`,
  PAYMENT_FAILED: `${kafkaConfig.topicPrefixes.PAYMENT}.failed`,
  PAYMENT_PENDING: `${kafkaConfig.topicPrefixes.PAYMENT}.pending`,
  REFUND_INITIATED: `${kafkaConfig.topicPrefixes.PAYMENT}.refund_initiated`,
  REFUND_PROCESSED: `${kafkaConfig.topicPrefixes.PAYMENT}.refund_processed`,
  REFUND_FAILED: `${kafkaConfig.topicPrefixes.PAYMENT}.refund_failed`
};

const paymentTopicConfigs = [
  {
    name: paymentTopics.PAYMENT_PROCESSED,
    numPartitions: 5,
    replicationFactor: 2,
    configEntries: [
      { name: 'retention.ms', value: '2592000000' }, // 30 days (PCI compliance)
      { name: 'min.insync.replicas', value: '2' },
      { name: 'compression.type', value: 'snappy' }
    ]
  },
  {
    name: paymentTopics.PAYMENT_FAILED,
    numPartitions: 5,
    replicationFactor: 2,
    configEntries: [
      { name: 'retention.ms', value: '2592000000' },
      { name: 'min.insync.replicas', value: '2' }
    ]
  },
  {
    name: paymentTopics.PAYMENT_PENDING,
    numPartitions: 3,
    replicationFactor: 2,
    configEntries: [
      { name: 'retention.ms', value: '86400000' } // 1 day
    ]
  },
  {
    name: paymentTopics.REFUND_INITIATED,
    numPartitions: 3,
    replicationFactor: 2,
    configEntries: [
      { name: 'retention.ms', value: '2592000000' }
    ]
  },
  {
    name: paymentTopics.REFUND_PROCESSED,
    numPartitions: 3,
    replicationFactor: 2,
    configEntries: [
      { name: 'retention.ms', value: '2592000000' }
    ]
  },
  {
    name: paymentTopics.REFUND_FAILED,
    numPartitions: 3,
    replicationFactor: 2,
    configEntries: [
      { name: 'retention.ms', value: '2592000000' }
    ]
  }
];

module.exports = {
  paymentTopics,
  paymentTopicConfigs
};
