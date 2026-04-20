/**
 * Kafka Message Serializer/Deserializer
 * Handles message serialization for consistent format across services
 */

const logger = require('../../shared/utils/logger');

class KafkaSerializer {
  /**
   * Serialize message to JSON
   */
  static serialize(message) {
    try {
      if (typeof message === 'string') {
        return Buffer.from(message);
      }

      const payload = {
        event_type: message.event_type,
        data: message.data || message,
        metadata: {
          timestamp: new Date().toISOString(),
          version: message.metadata?.version || '1.0',
          source: message.metadata?.source || process.env.SERVICE_NAME || 'unknown',
          trace_id: message.metadata?.trace_id || this.generateTraceId(),
          ...message.metadata
        }
      };

      return Buffer.from(JSON.stringify(payload), 'utf-8');
    } catch (error) {
      logger.error('Serialization error:', error);
      throw new Error(`Failed to serialize message: ${error.message}`);
    }
  }

  /**
   * Deserialize message from JSON
   */
  static deserialize(message) {
    try {
      if (!message) {
        return null;
      }

      if (typeof message === 'string') {
        return JSON.parse(message);
      }

      if (Buffer.isBuffer(message)) {
        return JSON.parse(message.toString('utf-8'));
      }

      return message;
    } catch (error) {
      logger.error('Deserialization error:', error);
      throw new Error(`Failed to deserialize message: ${error.message}`);
    }
  }

  /**
   * Validate message schema
   */
  static validateSchema(message, schema) {
    try {
      const requiredFields = schema.required || [];

      for (const field of requiredFields) {
        if (!message.hasOwnProperty(field)) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      return true;
    } catch (error) {
      logger.error('Schema validation error:', error);
      throw error;
    }
  }

  /**
   * Generate trace ID for tracking
   */
  static generateTraceId() {
    return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create event message
   */
  static createEventMessage(eventType, data, options = {}) {
    return {
      event_type: eventType,
      data,
      metadata: {
        source: options.source || process.env.SERVICE_NAME || 'unknown',
        trace_id: options.trace_id || this.generateTraceId(),
        version: options.version || '1.0',
        correlation_id: options.correlation_id,
        user_id: options.user_id,
        ...options
      }
    };
  }

  /**
   * Extract metadata from message
   */
  static extractMetadata(message) {
    const deserialized = typeof message === 'string' ? 
      JSON.parse(message) : message;

    return deserialized.metadata || {};
  }

  /**
   * Extract event data from message
   */
  static extractEventData(message) {
    const deserialized = typeof message === 'string' ? 
      JSON.parse(message) : message;

    return {
      event_type: deserialized.event_type,
      data: deserialized.data || deserialized,
      metadata: deserialized.metadata || {}
    };
  }
}

module.exports = KafkaSerializer;
