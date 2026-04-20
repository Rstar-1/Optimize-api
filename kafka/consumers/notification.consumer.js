/**
 * Notification Service Consumer
 * Consumes events for generating notifications
 */

const { getKafkaClient } = require('../utils/kafkaClient');
const KafkaSerializer = require('../utils/serializer');
const kafkaConfig = require('../config/kafka.config');
const logger = require('../../shared/utils/logger');

class NotificationConsumer {
  constructor() {
    this.consumer = null;
  }

  /**
   * Initialize consumer
   */
  async initialize() {
    try {
      const kafkaClient = getKafkaClient();
      this.consumer = kafkaClient.getConsumer(kafkaConfig.consumerGroups.NOTIFICATION);

      await this.consumer.connect();
      logger.info('Notification consumer connected');
    } catch (error) {
      logger.error('Failed to initialize notification consumer:', error);
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

            logger.info(`Notification event received: ${event.event_type}`, {
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
            logger.error('Error processing notification message:', error);
            await this.sendToDLQ(message, error);
          }
        }
      });

      logger.info('Notification consumer started consuming messages');
    } catch (error) {
      logger.error('Failed to start consuming notification messages:', error);
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
            source: 'notification-consumer'
          })
        }]
      });

      logger.info('Notification message sent to DLQ');
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
        logger.info('Notification consumer disconnected');
      }
    } catch (error) {
      logger.error('Error disconnecting notification consumer:', error);
      throw error;
    }
  }

  /**
   * Handle user created event
   */
  async handleUserCreated(data, metadata) {
    try {
      logger.info('Sending welcome notification for user:', { user_id: data.user_id });
      // Send welcome email logic
    } catch (error) {
      logger.error('Error handling user created notification:', error);
      throw error;
    }
  }

  /**
   * Handle order created event
   */
  async handleOrderCreated(data, metadata) {
    try {
      logger.info('Sending order confirmation for order:', { order_id: data.order_id });
      // Send order confirmation email logic
    } catch (error) {
      logger.error('Error handling order created notification:', error);
      throw error;
    }
  }

  /**
   * Handle order shipped event
   */
  async handleOrderShipped(data, metadata) {
    try {
      logger.info('Sending shipping notification for order:', { order_id: data.order_id });
      // Send shipping notification logic
    } catch (error) {
      logger.error('Error handling order shipped notification:', error);
      throw error;
    }
  }
}

module.exports = new NotificationConsumer();
