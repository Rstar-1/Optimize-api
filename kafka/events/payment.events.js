/**
 * Payment Events
 * Event definitions for payment-related operations
 */

const { paymentTopics } = require('../topics/payment.topics');
const KafkaSerializer = require('../utils/serializer');

class PaymentEvents {
  /**
   * Create payment processed event
   */
  static paymentProcessed(payment, order) {
    return KafkaSerializer.createEventMessage(
      paymentTopics.PAYMENT_PROCESSED,
      {
        order_id: order._id,
        payment_id: payment._id,
        user_id: order.user_id,
        amount: payment.amount,
        currency: payment.currency || 'USD',
        method: payment.method,
        transaction_id: payment.transaction_id,
        processed_at: new Date()
      },
      {
        source: 'payment-service',
        user_id: order.user_id,
        correlation_id: order._id
      }
    );
  }

  /**
   * Create payment failed event
   */
  static paymentFailed(payment, order, reason, retryCount = 0) {
    return KafkaSerializer.createEventMessage(
      paymentTopics.PAYMENT_FAILED,
      {
        order_id: order._id,
        payment_id: payment._id,
        user_id: order.user_id,
        reason,
        retry_count: retryCount,
        failed_at: new Date()
      },
      {
        source: 'payment-service',
        user_id: order.user_id,
        correlation_id: order._id
      }
    );
  }

  /**
   * Create payment pending event
   */
  static paymentPending(payment, order) {
    return KafkaSerializer.createEventMessage(
      paymentTopics.PAYMENT_PENDING,
      {
        order_id: order._id,
        payment_id: payment._id,
        user_id: order.user_id,
        amount: payment.amount,
        currency: payment.currency || 'USD',
        pending_at: new Date()
      },
      {
        source: 'payment-service',
        user_id: order.user_id,
        correlation_id: order._id
      }
    );
  }

  /**
   * Create refund initiated event
   */
  static refundInitiated(refund, order) {
    return KafkaSerializer.createEventMessage(
      paymentTopics.REFUND_INITIATED,
      {
        refund_id: refund._id,
        order_id: order._id,
        user_id: order.user_id,
        amount: refund.amount,
        currency: refund.currency || 'USD',
        reason: refund.reason,
        initiated_at: new Date()
      },
      {
        source: 'payment-service',
        user_id: order.user_id,
        correlation_id: order._id
      }
    );
  }

  /**
   * Create refund processed event
   */
  static refundProcessed(refund, order) {
    return KafkaSerializer.createEventMessage(
      paymentTopics.REFUND_PROCESSED,
      {
        refund_id: refund._id,
        order_id: order._id,
        user_id: order.user_id,
        amount: refund.amount,
        currency: refund.currency || 'USD',
        transaction_id: refund.transaction_id,
        processed_at: new Date()
      },
      {
        source: 'payment-service',
        user_id: order.user_id,
        correlation_id: order._id
      }
    );
  }

  /**
   * Create refund failed event
   */
  static refundFailed(refund, order, reason) {
    return KafkaSerializer.createEventMessage(
      paymentTopics.REFUND_FAILED,
      {
        refund_id: refund._id,
        order_id: order._id,
        user_id: order.user_id,
        amount: refund.amount,
        reason,
        failed_at: new Date()
      },
      {
        source: 'payment-service',
        user_id: order.user_id,
        correlation_id: order._id
      }
    );
  }
}

module.exports = PaymentEvents;
