import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Log user activity to Firestore
 * @param {string} userId - User ID
 * @param {string} action - Action type: 'add', 'edit', 'delete', 'view', etc.
 * @param {string} entityType - Entity type: 'expense', 'revenue', 'project', 'account', etc.
 * @param {string} entityId - Entity ID (optional)
 * @param {object} details - Additional details about the action (optional)
 */
export const logActivity = async (userId, action, entityType, entityId = null, details = {}) => {
  try {
    if (!userId) {
      console.warn('Cannot log activity: userId is required');
      return;
    }

    await addDoc(collection(db, 'activityLogs'), {
      userId,
      action, // 'add', 'edit', 'delete', 'view', 'login', 'logout', etc.
      entityType, // 'expense', 'revenue', 'project', 'account', etc.
      entityId, // ID of the entity (optional)
      details, // Additional details (optional)
      timestamp: Timestamp.now(),
      createdAt: Timestamp.now(),
    });
  } catch (error) {
    // Only log if not a permissions error (user might not be fully authenticated)
    if (!error.message?.includes('permissions') && !error.code?.includes('permission')) {
      console.error('Error logging activity:', error);
    }
    // Don't throw error - logging should not break the main functionality
  }
};

