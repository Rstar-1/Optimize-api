/**
 * Kafka Client Utility
 * Provides centralized Kafka client instance for producer and consumer operations
 */

const { Kafka, logLevel } = require('kafkajs');
const logger = require('../../shared/utils/logger');

// Map environment log level to kafkajs logLevel
const getKafkaLogLevel = () => {
  const envLevel = process.env.LOG_LEVEL || 'info';
  const levelMap = {
    debug: logLevel.DEBUG,
    info: logLevel.INFO,
    warn: logLevel.WARN,
    error: logLevel.ERROR
  };
  return levelMap[envLevel] || logLevel.INFO;
};

class KafkaClient {
  constructor() {
    this.kafka = null;
    this.producer = null;
    this.admin = null;
    this.connected = false;
  }

  /**
   * Initialize Kafka client
   */
  async initialize() {
    try {
      if (this.connected) {
        logger.info('Kafka client already initialized');
        return;
      }

      this.kafka = new Kafka({
        clientId: process.env.KAFKA_CLIENT_ID || 'ecommerce-app',
        brokers: (process.env.KAFKA_BROKERS || 'kafka:9092').split(','),
        logLevel: getKafkaLogLevel(),
        connectionTimeout: 10000,
        requestTimeout: 25000,
        retry: {
          initialRetryTime: 100,
          retries: 8,
          multiplier: 2,
          randomizationFactor: 0.2
        },
        ssl: process.env.KAFKA_SSL === 'true',
        sasl: process.env.KAFKA_SASL_MECHANISM ? {
          mechanism: process.env.KAFKA_SASL_MECHANISM,
          username: process.env.KAFKA_SASL_USERNAME,
          password: process.env.KAFKA_SASL_PASSWORD
        } : undefined
      });

      this.admin = this.kafka.admin();
      this.producer = this.kafka.producer({
        idempotent: true,
        maxInFlightRequests: 5,
        compression: 1 // Gzip compression
      });

      await this.admin.connect();
      await this.producer.connect();

      this.connected = true;
      logger.info('Kafka client connected successfully');
    } catch (error) {
      logger.error('Failed to initialize Kafka client:', error);
      throw error;
    }
  }

  /**
   * Get Kafka instance
   */
  getKafka() {
    if (!this.kafka) {
      throw new Error('Kafka client not initialized');
    }
    return this.kafka;
  }

  /**
   * Get producer instance
   */
  getProducer() {
    if (!this.producer) {
      throw new Error('Kafka producer not initialized');
    }
    return this.producer;
  }

  /**
   * Get admin instance
   */
  getAdmin() {
    if (!this.admin) {
      throw new Error('Kafka admin not initialized');
    }
    return this.admin;
  }

  /**
   * Get consumer instance
   */
  getConsumer(groupId) {
    if (!this.kafka) {
      throw new Error('Kafka client not initialized');
    }
    return this.kafka.consumer({
      groupId,
      sessionTimeout: 30000,
      heartbeatInterval: 3000,
      allowAutoTopicCreation: false
    });
  }

  /**
   * Disconnect Kafka client
   */
  async disconnect() {
    try {
      if (this.producer) {
        await this.producer.disconnect();
        logger.info('Kafka producer disconnected');
      }

      if (this.admin) {
        await this.admin.disconnect();
        logger.info('Kafka admin disconnected');
      }

      this.connected = false;
    } catch (error) {
      logger.error('Error disconnecting Kafka client:', error);
      throw error;
    }
  }

  /**
   * Check if client is connected
   */
  isConnected() {
    return this.connected;
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      if (!this.admin) {
        return false;
      }

      const cluster = await this.admin.describeCluster();
      return cluster && cluster.brokers.length > 0;
    } catch (error) {
      logger.error('Kafka health check failed:', error);
      return false;
    }
  }
}

// Singleton instance
let instance = null;

/**
 * Get or create Kafka client instance
 */
const getKafkaClient = () => {
  if (!instance) {
    instance = new KafkaClient();
  }
  return instance;
};

module.exports = {
  KafkaClient,
  getKafkaClient
};
