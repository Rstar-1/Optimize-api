/**
 * Kafka Topics Definition
 * Define all topics for product-related events
 */

const kafkaConfig = require('../config/kafka.config');

const productTopics = {
  // Product Events
  PRODUCT_CREATED: `${kafkaConfig.topicPrefixes.PRODUCT}.created`,
  PRODUCT_UPDATED: `${kafkaConfig.topicPrefixes.PRODUCT}.updated`,
  PRODUCT_DELETED: `${kafkaConfig.topicPrefixes.PRODUCT}.deleted`,

  // Inventory Events
  INVENTORY_UPDATED: `${kafkaConfig.topicPrefixes.INVENTORY}.updated`,
  INVENTORY_RESERVED: `${kafkaConfig.topicPrefixes.INVENTORY}.reserved`,
  INVENTORY_RELEASED: `${kafkaConfig.topicPrefixes.INVENTORY}.released`
};

const productTopicConfigs = [
  {
    name: productTopics.PRODUCT_CREATED,
    numPartitions: 5,
    replicationFactor: 2,
    configEntries: [
      { name: 'retention.ms', value: '604800000' }, // 7 days
      { name: 'min.insync.replicas', value: '2' }
    ]
  },
  {
    name: productTopics.PRODUCT_UPDATED,
    numPartitions: 5,
    replicationFactor: 2,
    configEntries: [
      { name: 'retention.ms', value: '604800000' },
      { name: 'min.insync.replicas', value: '2' }
    ]
  },
  {
    name: productTopics.PRODUCT_DELETED,
    numPartitions: 1,
    replicationFactor: 2,
    configEntries: [
      { name: 'retention.ms', value: '2592000000' }, // 30 days (compliance)
      { name: 'min.insync.replicas', value: '2' }
    ]
  },
  {
    name: productTopics.INVENTORY_UPDATED,
    numPartitions: 10,
    replicationFactor: 2,
    configEntries: [
      { name: 'retention.ms', value: '604800000' },
      { name: 'compression.type', value: 'snappy' }
    ]
  },
  {
    name: productTopics.INVENTORY_RESERVED,
    numPartitions: 10,
    replicationFactor: 2,
    configEntries: [
      { name: 'retention.ms', value: '604800000' }
    ]
  },
  {
    name: productTopics.INVENTORY_RELEASED,
    numPartitions: 5,
    replicationFactor: 2,
    configEntries: [
      { name: 'retention.ms', value: '604800000' }
    ]
  }
];

module.exports = {
  productTopics,
  productTopicConfigs
};
