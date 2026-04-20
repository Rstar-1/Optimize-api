/**
 * Product Service Producer
 * Publishes product and inventory-related events to Kafka
 */

const { getKafkaClient } = require('../utils/kafkaClient');
const KafkaSerializer = require('../utils/serializer');
const logger = require('../../shared/utils/logger');

class ProductProducer {
  /**
   * Publish event to Kafka
   */
  static async publishEvent(topic, event) {
    try {
      const kafkaClient = getKafkaClient();

      if (!kafkaClient.isConnected()) {
        throw new Error('Kafka client not connected');
      }

      const producer = kafkaClient.getProducer();

      const message = {
        key: event.data?.product_id || event.product_id,
        value: KafkaSerializer.serialize(event),
        headers: {
          'correlation-id': event.metadata?.correlation_id || event.metadata?.trace_id,
          'source': 'product-service',
          'timestamp': Date.now().toString()
        }
      };

      const result = await producer.send({
        topic,
        messages: [message],
        timeout: 30000,
        compression: 1 // Gzip
      });

      logger.info(`Product event published to topic: ${topic}`, {
        partition: result[0].partition,
        offset: result[0].offset
      });

      return result;
    } catch (error) {
      logger.error(`Failed to publish event to topic ${topic}:`, error);
      throw error;
    }
  }

  /**
   * Publish batch of events
   */
  static async publishBatch(topic, events) {
    try {
      const kafkaClient = getKafkaClient();

      if (!kafkaClient.isConnected()) {
        throw new Error('Kafka client not connected');
      }

      const producer = kafkaClient.getProducer();

      const messages = events.map(event => ({
        key: event.data?.product_id || event.product_id,
        value: KafkaSerializer.serialize(event),
        headers: {
          'correlation-id': event.metadata?.correlation_id || event.metadata?.trace_id,
          'source': 'product-service'
        }
      }));

      const result = await producer.send({
        topic,
        messages,
        timeout: 30000
      });

      logger.info(`Batch of ${events.length} product events published to topic: ${topic}`);

      return result;
    } catch (error) {
      logger.error(`Failed to publish batch to topic ${topic}:`, error);
      throw error;
    }
  }

  /**
   * Publish inventory update events
   */
  static async publishInventoryUpdate(topic, inventoryEvents) {
    try {
      const kafkaClient = getKafkaClient();
      const producer = kafkaClient.getProducer();

      const messages = inventoryEvents.map(event => ({
        key: event.product_id,
        value: KafkaSerializer.serialize({
          event_type: event.event_type,
          data: event,
          metadata: {
            source: 'product-service',
            timestamp: new Date().toISOString()
          }
        }),
        headers: {
          'source': 'product-service',
          'event-type': event.event_type
        }
      }));

      const result = await producer.send({
        topic,
        messages,
        timeout: 30000,
        compression: 1
      });

      logger.info(`Inventory events published: ${inventoryEvents.length} events`);
      return result;
    } catch (error) {
      logger.error('Failed to publish inventory events:', error);
      throw error;
    }
  }

  /**
   * Publish with retry logic
   */
  static async publishWithRetry(topic, event, maxRetries = 3) {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.publishEvent(topic, event);
      } catch (error) {
        lastError = error;
        logger.warn(`Product publish attempt ${attempt}/${maxRetries} failed for topic ${topic}`);

        if (attempt < maxRetries) {
          const delayMs = Math.pow(2, attempt) * 100;
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    }

    logger.error(`Failed to publish product event after ${maxRetries} retries`, lastError);
    throw lastError;
  }
}

module.exports = ProductProducer;
