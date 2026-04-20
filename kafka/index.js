/**
 * Kafka Module Index
 * Central entry point for all Kafka operations
 */

// Config
const kafkaConfig = require('./config/kafka.config');

// Kafka Client
const { getKafkaClient, KafkaClient } = require('./utils/kafkaClient');

// Serializer
const KafkaSerializer = require('./utils/serializer');

// Topics
const { authTopics, authTopicConfigs } = require('./topics/auth.topics');
const { orderTopics, orderTopicConfigs } = require('./topics/order.topics');
const { productTopics, productTopicConfigs } = require('./topics/product.topics');
const { paymentTopics, paymentTopicConfigs } = require('./topics/payment.topics');

// Events
const UserEvents = require('./events/user.events');
const OrderEvents = require('./events/order.events');
const PaymentEvents = require('./events/payment.events');

// Producers
const AuthProducer = require('./producers/auth.producer');
const OrderProducer = require('./producers/order.producer');
const ProductProducer = require('./producers/product.producer');

// Consumers
const authConsumer = require('./consumers/auth.consumer');
const orderConsumer = require('./consumers/order.consumer');
const paymentConsumer = require('./consumers/payment.consumer');
const notificationConsumer = require('./consumers/notification.consumer');

/**
 * Initialize Kafka module
 */
async function initializeKafka() {
  try {
    const kafkaClient = getKafkaClient();
    await kafkaClient.initialize();
    console.log('Kafka module initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Kafka module:', error);
    throw error;
  }
}

/**
 * Create topics
 */
async function createTopics() {
  try {
    const kafkaClient = getKafkaClient();
    const admin = kafkaClient.getAdmin();

    const allTopics = [
      ...authTopicConfigs,
      ...orderTopicConfigs,
      ...productTopicConfigs,
      ...paymentTopicConfigs
    ];

    await admin.createTopics({
      topics: allTopics,
      validateOnly: false,
      timeout: 30000
    });

    console.log('Topics created successfully');
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('Topics already exist');
    } else {
      console.error('Failed to create topics:', error);
      throw error;
    }
  }
}

/**
 * Disconnect Kafka
 */
async function disconnectKafka() {
  try {
    const kafkaClient = getKafkaClient();
    await kafkaClient.disconnect();
    console.log('Kafka disconnected successfully');
  } catch (error) {
    console.error('Error disconnecting Kafka:', error);
  }
}

module.exports = {
  // Initialization
  initializeKafka,
  createTopics,
  disconnectKafka,

  // Config
  kafkaConfig,

  // Client
  getKafkaClient,
  KafkaClient,

  // Serializer
  KafkaSerializer,

  // Topics
  authTopics,
  orderTopics,
  productTopics,
  paymentTopics,

  // Events
  UserEvents,
  OrderEvents,
  PaymentEvents,

  // Producers
  AuthProducer,
  OrderProducer,
  ProductProducer,

  // Consumers
  authConsumer,
  orderConsumer,
  paymentConsumer,
  notificationConsumer
};
