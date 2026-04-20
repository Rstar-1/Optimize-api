/**
 * Order Events
 * Event definitions for order-related operations
 */

const { orderTopics } = require('../topics/order.topics');
const KafkaSerializer = require('../utils/serializer');

class OrderEvents {
  /**
   * Create order created event
   */
  static orderCreated(order) {
    return KafkaSerializer.createEventMessage(
      orderTopics.ORDER_CREATED,
      {
        order_id: order._id,
        order_number: order.order_number,
        user_id: order.user_id,
        items: order.items,
        total: order.pricing.total,
        status: order.status,
        created_at: order.created_at || new Date()
      },
      {
        source: 'order-service',
        user_id: order.user_id,
        correlation_id: order._id
      }
    );
  }

  /**
   * Create order confirmed event
   */
  static orderConfirmed(order) {
    return KafkaSerializer.createEventMessage(
      orderTopics.ORDER_CONFIRMED,
      {
        order_id: order._id,
        order_number: order.order_number,
        user_id: order.user_id,
        payment_status: order.payment.status,
        confirmed_at: new Date()
      },
      {
        source: 'order-service',
        user_id: order.user_id,
        correlation_id: order._id
      }
    );
  }

  /**
   * Create order processing event
   */
  static orderProcessing(order, estimatedShipDate) {
    return KafkaSerializer.createEventMessage(
      orderTopics.ORDER_PROCESSING,
      {
        order_id: order._id,
        order_number: order.order_number,
        user_id: order.user_id,
        estimated_ship_date: estimatedShipDate,
        started_at: new Date()
      },
      {
        source: 'order-service',
        user_id: order.user_id,
        correlation_id: order._id
      }
    );
  }

  /**
   * Create order shipped event
   */
  static orderShipped(order, trackingInfo) {
    return KafkaSerializer.createEventMessage(
      orderTopics.ORDER_SHIPPED,
      {
        order_id: order._id,
        order_number: order.order_number,
        user_id: order.user_id,
        tracking_number: trackingInfo.tracking_number,
        carrier: trackingInfo.carrier,
        estimated_delivery: trackingInfo.estimated_delivery,
        shipped_at: new Date()
      },
      {
        source: 'order-service',
        user_id: order.user_id,
        correlation_id: order._id
      }
    );
  }

  /**
   * Create order delivered event
   */
  static orderDelivered(order) {
    return KafkaSerializer.createEventMessage(
      orderTopics.ORDER_DELIVERED,
      {
        order_id: order._id,
        order_number: order.order_number,
        user_id: order.user_id,
        delivered_at: new Date()
      },
      {
        source: 'order-service',
        user_id: order.user_id,
        correlation_id: order._id
      }
    );
  }

  /**
   * Create order cancelled event
   */
  static orderCancelled(order, reason = 'unknown') {
    return KafkaSerializer.createEventMessage(
      orderTopics.ORDER_CANCELLED,
      {
        order_id: order._id,
        order_number: order.order_number,
        user_id: order.user_id,
        reason,
        refund_initiated: true,
        cancelled_at: new Date()
      },
      {
        source: 'order-service',
        user_id: order.user_id,
        correlation_id: order._id
      }
    );
  }

  /**
   * Create order status changed event
   */
  static orderStatusChanged(order, previousStatus, newStatus) {
    return KafkaSerializer.createEventMessage(
      orderTopics.ORDER_STATUS_CHANGED,
      {
        order_id: order._id,
        order_number: order.order_number,
        user_id: order.user_id,
        previous_status: previousStatus,
        new_status: newStatus,
        changed_at: new Date()
      },
      {
        source: 'order-service',
        user_id: order.user_id,
        correlation_id: order._id
      }
    );
  }
}

module.exports = OrderEvents;
