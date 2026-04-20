/**
 * Kafka Topics Definition
 * Define all topics for order-related events
 */

const kafkaConfig = require('../config/kafka.config');

const orderTopics = {
  // Order Events
  ORDER_CREATED: `${kafkaConfig.topicPrefixes.ORDER}.created`,
  ORDER_CONFIRMED: `${kafkaConfig.topicPrefixes.ORDER}.confirmed`,
  ORDER_PROCESSING: `${kafkaConfig.topicPrefixes.ORDER}.processing`,
  ORDER_SHIPPED: `${kafkaConfig.topicPrefixes.ORDER}.shipped`,
  ORDER_DELIVERED: `${kafkaConfig.topicPrefixes.ORDER}.delivered`,
  ORDER_CANCELLED: `${kafkaConfig.topicPrefixes.ORDER}.cancelled`,
  ORDER_STATUS_CHANGED: `${kafkaConfig.topicPrefixes.ORDER}.status_changed`
};

const orderTopicConfigs = [
  {
    name: orderTopics.ORDER_CREATED,
    numPartitions: 10,
    replicationFactor: 2,
    configEntries: [
      { name: 'retention.ms', value: '2592000000' }, // 30 days
      { name: 'min.insync.replicas', value: '2' },
      { name: 'compression.type', value: 'snappy' }
    ]
  },
  {
    name: orderTopics.ORDER_CONFIRMED,
    numPartitions: 10,
    replicationFactor: 2,
    configEntries: [
      { name: 'retention.ms', value: '2592000000' },
      { name: 'min.insync.replicas', value: '2' }
    ]
  },
  {
    name: orderTopics.ORDER_PROCESSING,
    numPartitions: 10,
    replicationFactor: 2,
    configEntries: [
      { name: 'retention.ms', value: '2592000000' },
      { name: 'min.insync.replicas', value: '2' }
    ]
  },
  {
    name: orderTopics.ORDER_SHIPPED,
    numPartitions: 5,
    replicationFactor: 2,
    configEntries: [
      { name: 'retention.ms', value: '2592000000' }
    ]
  },
  {
    name: orderTopics.ORDER_DELIVERED,
    numPartitions: 5,
    replicationFactor: 2,
    configEntries: [
      { name: 'retention.ms', value: '2592000000' }
    ]
  },
  {
    name: orderTopics.ORDER_CANCELLED,
    numPartitions: 5,
    replicationFactor: 2,
    configEntries: [
      { name: 'retention.ms', value: '2592000000' }
    ]
  },
  {
    name: orderTopics.ORDER_STATUS_CHANGED,
    numPartitions: 10,
    replicationFactor: 2,
    configEntries: [
      { name: 'retention.ms', value: '2592000000' }
    ]
  }
];

module.exports = {
  orderTopics,
  orderTopicConfigs
};
