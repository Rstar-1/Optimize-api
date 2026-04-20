/**
 * Auth Service Consumer
 * Consumes user-related events from Kafka
 */

const { getKafkaClient } = require('../utils/kafkaClient');
const KafkaSerializer = require('../utils/serializer');
const kafkaConfig = require('../config/kafka.config');
const logger = require('../../shared/utils/logger');

class AuthConsumer {
  constructor() {
    this.consumer = null;
  }

  /**
   * Initialize consumer
   */
  async initialize() {
    try {
      const kafkaClient = getKafkaClient();
      this.consumer = kafkaClient.getConsumer(kafkaConfig.consumerGroups.AUTH);

      await this.consumer.connect();
      logger.info('Auth consumer connected');
    } catch (error) {
      logger.error('Failed to initialize auth consumer:', error);
      throw error;
    }
  }

  /**
   * Subscribe to topics and handle messages
   */
  async startConsuming(topics, handlers) {
    try {
      if (!this.consumer) {
        await this.initialize();
      }

      await this.consumer.subscribe({ topics });

      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          try {
            const event = KafkaSerializer.deserialize(message.value);

            logger.info(`Auth event received: ${event.event_type}`, {
              topic,
              partition,
              offset: message.offset
            });

            // Route to handler
            const handler = handlers[event.event_type];
            if (handler) {
              await handler(event.data, event.metadata);
            } else {
              logger.warn(`No handler for event type: ${event.event_type}`);
            }
          } catch (error) {
            logger.error('Error processing auth message:', error);
            // Send to DLQ
            await this.sendToDLQ(message, error);
          }
        }
      });

      logger.info('Auth consumer started consuming messages');
    } catch (error) {
      logger.error('Failed to start consuming auth messages:', error);
      throw error;
    }
  }

  /**
   * Send failed message to Dead Letter Queue
   */
  async sendToDLQ(message, error) {
    try {
      const kafkaClient = getKafkaClient();
      const producer = kafkaClient.getProducer();

      await producer.send({
        topic: 'error.dlq',
        messages: [{
          key: message.key,
          value: KafkaSerializer.serialize({
            original_message: message.value.toString('utf-8'),
            error: error.message,
            timestamp: new Date().toISOString(),
            source: 'auth-consumer'
          })
        }]
      });

      logger.info('Message sent to DLQ');
    } catch (dlqError) {
      logger.error('Failed to send message to DLQ:', dlqError);
    }
  }

  /**
   * Disconnect consumer
   */
  async disconnect() {
    try {
      if (this.consumer) {
        await this.consumer.disconnect();
        logger.info('Auth consumer disconnected');
      }
    } catch (error) {
      logger.error('Error disconnecting auth consumer:', error);
      throw error;
    }
  }

  /**
   * Get consumer group info
   */
  async getGroupInfo() {
    try {
      const kafkaClient = getKafkaClient();
      const admin = kafkaClient.getAdmin();

      const groups = await admin.describeGroups([kafkaConfig.consumerGroups.AUTH]);
      return groups.groups[0];
    } catch (error) {
      logger.error('Failed to get auth consumer group info:', error);
      throw error;
    }
  }
}

module.exports = new AuthConsumer();
