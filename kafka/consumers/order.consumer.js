/**
 * Order Service Consumer
 * Consumes order-related events from Kafka
 */

const { getKafkaClient } = require('../utils/kafkaClient');
const KafkaSerializer = require('../utils/serializer');
const kafkaConfig = require('../config/kafka.config');
const logger = require('../../shared/utils/logger');

class OrderConsumer {
  constructor() {
    this.consumer = null;
  }

  /**
   * Initialize consumer
   */
  async initialize() {
    try {
      const kafkaClient = getKafkaClient();
      this.consumer = kafkaClient.getConsumer(kafkaConfig.consumerGroups.ORDER);

      await this.consumer.connect();
      logger.info('Order consumer connected');
    } catch (error) {
      logger.error('Failed to initialize order consumer:', error);
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

            logger.info(`Order event received: ${event.event_type}`, {
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
            logger.error('Error processing order message:', error);
            await this.sendToDLQ(message, error);
          }
        }
      });

      logger.info('Order consumer started consuming messages');
    } catch (error) {
      logger.error('Failed to start consuming order messages:', error);
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
            source: 'order-consumer'
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
        logger.info('Order consumer disconnected');
      }
    } catch (error) {
      logger.error('Error disconnecting order consumer:', error);
      throw error;
    }
  }

  /**
   * Get consumer lag
   */
  async getConsumerLag() {
    try {
      const kafkaClient = getKafkaClient();
      const admin = kafkaClient.getAdmin();

      const offsets = await admin.fetchOffsets({
        groupId: kafkaConfig.consumerGroups.ORDER
      });

      return offsets;
    } catch (error) {
      logger.error('Failed to get consumer lag:', error);
      throw error;
    }
  }
}

module.exports = new OrderConsumer();
