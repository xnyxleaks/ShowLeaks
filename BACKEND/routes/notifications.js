const express = require('express');
const router = express.Router();
const { Notification, User } = require('../models');
const authMiddleware = require('../Middleware/Auth');

// Get all notifications for user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const offset = (page - 1) * limit;

    const where = { userId };
    if (unreadOnly === 'true') {
      where.isRead = false;
    }

    const { count, rows } = await Notification.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      notifications: rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Error fetching notifications' });
  }
});

// Get unread count
router.get('/unread-count', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await Notification.count({
      where: { userId, isRead: false }
    });

    res.json({ count });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ error: 'Error getting unread count' });
  }
});

// Mark notification as read
router.put('/:id/read', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOne({
      where: { id, userId }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await notification.update({ isRead: true });

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Error marking notification as read' });
  }
});

// Mark all notifications as read
router.put('/read-all', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.update(
      { isRead: true },
      { where: { userId, isRead: false } }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Error marking all notifications as read' });
  }
});

// Create notification (internal use)
const createNotification = async (userId, type, title, message, data = null) => {
  try {
    await Notification.create({
      userId,
      type,
      title,
      message,
      data
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

module.exports = { router, createNotification };