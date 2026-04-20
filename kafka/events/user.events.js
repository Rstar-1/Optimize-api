/**
 * User Events
 * Event definitions for user-related operations
 */

const { authTopics } = require('../topics/auth.topics');
const KafkaSerializer = require('../utils/serializer');

class UserEvents {
  /**
   * Create user created event
   */
  static userCreated(user) {
    return KafkaSerializer.createEventMessage(
      authTopics.USER_CREATED,
      {
        user_id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        created_at: user.created_at || new Date()
      },
      {
        source: 'auth-service',
        user_id: user._id
      }
    );
  }

  /**
   * Create user updated event
   */
  static userUpdated(user, changes) {
    return KafkaSerializer.createEventMessage(
      authTopics.USER_UPDATED,
      {
        user_id: user._id,
        email: user.email,
        name: user.name,
        changes,
        updated_at: new Date()
      },
      {
        source: 'auth-service',
        user_id: user._id
      }
    );
  }

  /**
   * Create user deleted event
   */
  static userDeleted(userId, reason = 'unknown') {
    return KafkaSerializer.createEventMessage(
      authTopics.USER_DELETED,
      {
        user_id: userId,
        reason,
        deleted_at: new Date()
      },
      {
        source: 'auth-service',
        user_id: userId
      }
    );
  }

  /**
   * Create user logged in event
   */
  static userLoggedIn(user, ipAddress, userAgent) {
    return KafkaSerializer.createEventMessage(
      authTopics.USER_LOGGED_IN,
      {
        user_id: user._id,
        email: user.email,
        ip_address: ipAddress,
        user_agent: userAgent,
        logged_in_at: new Date()
      },
      {
        source: 'auth-service',
        user_id: user._id
      }
    );
  }

  /**
   * Create user logged out event
   */
  static userLoggedOut(userId) {
    return KafkaSerializer.createEventMessage(
      authTopics.USER_LOGGED_OUT,
      {
        user_id: userId,
        logged_out_at: new Date()
      },
      {
        source: 'auth-service',
        user_id: userId
      }
    );
  }

  /**
   * Create password reset event
   */
  static passwordReset(userId, email) {
    return KafkaSerializer.createEventMessage(
      authTopics.PASSWORD_RESET,
      {
        user_id: userId,
        email,
        reset_at: new Date()
      },
      {
        source: 'auth-service',
        user_id: userId
      }
    );
  }

  /**
   * Create email verified event
   */
  static emailVerified(user) {
    return KafkaSerializer.createEventMessage(
      authTopics.EMAIL_VERIFIED,
      {
        user_id: user._id,
        email: user.email,
        verified_at: new Date()
      },
      {
        source: 'auth-service',
        user_id: user._id
      }
    );
  }
}

module.exports = UserEvents;
