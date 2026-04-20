/**
 * Kafka Topics Definition
 * Define all topics for user-related events
 */

const kafkaConfig = require('../config/kafka.config');

const authTopics = {
  // User Events
  USER_CREATED: `${kafkaConfig.topicPrefixes.USER}.created`,
  USER_UPDATED: `${kafkaConfig.topicPrefixes.USER}.updated`,
  USER_DELETED: `${kafkaConfig.topicPrefixes.USER}.deleted`,
  USER_LOGGED_IN: `${kafkaConfig.topicPrefixes.USER}.logged_in`,
  USER_LOGGED_OUT: `${kafkaConfig.topicPrefixes.USER}.logged_out`,
  PASSWORD_RESET: `${kafkaConfig.topicPrefixes.USER}.password_reset`,
  EMAIL_VERIFIED: `${kafkaConfig.topicPrefixes.USER}.email_verified`
};

const authTopicConfigs = [
  {
    name: authTopics.USER_CREATED,
    numPartitions: 3,
    replicationFactor: 2,
    configEntries: [
      { name: 'retention.ms', value: '604800000' }, // 7 days
      { name: 'min.insync.replicas', value: '2' }
    ]
  },
  {
    name: authTopics.USER_UPDATED,
    numPartitions: 3,
    replicationFactor: 2,
    configEntries: [
      { name: 'retention.ms', value: '604800000' },
      { name: 'min.insync.replicas', value: '2' }
    ]
  },
  {
    name: authTopics.USER_DELETED,
    numPartitions: 1,
    replicationFactor: 2,
    configEntries: [
      { name: 'retention.ms', value: '2592000000' }, // 30 days (compliance)
      { name: 'min.insync.replicas', value: '2' }
    ]
  },
  {
    name: authTopics.USER_LOGGED_IN,
    numPartitions: 5,
    replicationFactor: 2,
    configEntries: [
      { name: 'retention.ms', value: '86400000' }, // 1 day
      { name: 'compression.type', value: 'snappy' }
    ]
  },
  {
    name: authTopics.PASSWORD_RESET,
    numPartitions: 1,
    replicationFactor: 2,
    configEntries: [
      { name: 'retention.ms', value: '2592000000' }, // 30 days (compliance)
      { name: 'min.insync.replicas', value: '2' }
    ]
  }
];

module.exports = {
  authTopics,
  authTopicConfigs
};
