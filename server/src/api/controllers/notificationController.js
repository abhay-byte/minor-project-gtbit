const db = require('../../config/db');

/**
 * Get all notifications for the logged-in user
 * @route GET /api/notifications
 */
exports.getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { limit = 50, offset = 0, is_read, notification_type } = req.query;

    // Build query with optional filters
    let query = `
      SELECT 
        notification_id,
        title,
        message,
        notification_type,
        is_read,
        sent_at,
        created_at
      FROM notifications
      WHERE user_id = $1
    `;

    const queryParams = [userId];

    // Filter by read status
    if (is_read !== undefined) {
      query += ` AND is_read = $${queryParams.length + 1}`;
      queryParams.push(is_read === 'true' || is_read === true);
    }

    // Filter by notification type
    if (notification_type) {
      query += ` AND notification_type = $${queryParams.length + 1}`;
      queryParams.push(notification_type);
    }

    query += ` ORDER BY sent_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(parseInt(limit), parseInt(offset));

    const result = await db.query(query, queryParams);

    // Get unread count
    const unreadCountResult = await db.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = FALSE',
      [userId]
    );

    res.status(200).json({
      success: true,
      data: result.rows,
      metadata: {
        total: result.rows.length,
        unread_count: parseInt(unreadCountResult.rows[0].count),
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    next(error);
 }
};

/**
 * Mark notification as read
 * @route PUT /api/notifications/:id/read
 */
exports.markAsRead = async (req, res, next) => {
  try {
    const { id: notificationId } = req.params;
    const userId = req.user.userId;

    // Verify notification belongs to user
    const result = await db.query(
      'SELECT notification_id FROM notifications WHERE notification_id = $1 AND user_id = $2',
      [notificationId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    // Mark as read
    await db.query(
      'UPDATE notifications SET is_read = TRUE WHERE notification_id = $1',
      [notificationId]
    );

    res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });

  } catch (error) {
    console.error('Error marking notification as read:', error);
    next(error);
  }
};

/**
 * Mark all notifications as read
 * @route PUT /api/notifications/read-all
 */
exports.markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    await db.query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE',
      [userId]
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });

  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    next(error);
  }
};

/**
 * Delete a notification
 * @route DELETE /api/notifications/:id
 */
exports.deleteNotification = async (req, res, next) => {
  try {
    const { id: notificationId } = req.params;
    const userId = req.user.userId;

    // Verify notification belongs to user
    const result = await db.query(
      'SELECT notification_id FROM notifications WHERE notification_id = $1 AND user_id = $2',
      [notificationId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    // Delete notification
    await db.query('DELETE FROM notifications WHERE notification_id = $1', [notificationId]);

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting notification:', error);
    next(error);
 }
};

module.exports = {
  getNotifications: exports.getNotifications,
  markAsRead: exports.markAsRead,
  markAllAsRead: exports.markAllAsRead,
  deleteNotification: exports.deleteNotification
};