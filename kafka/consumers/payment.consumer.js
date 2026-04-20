/**
 * Payment Service Consumer
 * Consumes payment-related events from Kafka
 */

const { getKafkaClient } = require('../utils/kafkaClient');
const KafkaSerializer = require('../utils/serializer');
const kafkaConfig = require('../config/kafka.config');
const logger = require('../../shared/utils/logger');

class PaymentConsumer {
  constructor() {
    this.consumer = null;
  }

  /**
   * Initialize consumer
   */
  async initialize() {
    try {
      const kafkaClient = getKafkaClient();
      this.consumer = kafkaClient.getConsumer(kafkaConfig.consumerGroups.PAYMENT);

      await this.consumer.connect();
      logger.info('Payment consumer connected');
    } catch (error) {
      logger.error('Failed to initialize payment consumer:', error);
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

            logger.info(`Payment event received: ${event.event_type}`, {
              topic,
              partition,
              offset: message.offset,
              key: message.key?.toString()
            });

            // Route to handler
            const handler = handlers[event.event_type];
            if (handler) {
              await handler(event.data, event.metadata);
            } else {
              logger.warn(`No handler for event type: ${event.event_type}`);
            }
          } catch (error) {
            logger.error('Error processing payment message:', error);
            await this.sendToDLQ(message, error);
          }
        }
      });

      logger.info('Payment consumer started consuming messages');
    } catch (error) {
      logger.error('Failed to start consuming payment messages:', error);
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
            source: 'payment-consumer',
            topic: message.topic
          })
        }]
      });

      logger.info('Payment message sent to DLQ');
    } catch (dlqError) {
      logger.error('Failed to send payment message to DLQ:', dlqError);
    }
  }

  /**
   * Disconnect consumer
   */
  async disconnect() {
    try {
      if (this.consumer) {
        await this.consumer.disconnect();
        logger.info('Payment consumer disconnected');
      }
    } catch (error) {
      logger.error('Error disconnecting payment consumer:', error);
      throw error;
    }
  }

  /**
   * Handle payment processed event
   */
  async handlePaymentProcessed(data, metadata) {
    try {
      logger.info('Processing payment processed event:', { order_id: data.order_id });
      // Implement payment processing logic
    } catch (error) {
      logger.error('Error handling payment processed event:', error);
      throw error;
    }
  }

  /**
   * Handle payment failed event
   */
  async handlePaymentFailed(data, metadata) {
    try {
      logger.info('Processing payment failed event:', { order_id: data.order_id });
      // Implement payment failed logic
    } catch (error) {
      logger.error('Error handling payment failed event:', error);
      throw error;
    }
  }
}

module.exports = new PaymentConsumer();
