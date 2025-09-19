const express = require('express');
const router = express.Router();
const { User, Model, Content, Report, Comment, Like, UserHistory } = require('../models');
const { Op, sequelize } = require('sequelize');
const authMiddleware = require('../Middleware/Auth');
const isAdmin = require('../Middleware/isAdmin');

// Dashboard statistics
router.get('/stats', authMiddleware, isAdmin, async (req, res) => {
  try {
    // Basic counts
    const [
      totalUsers,
      premiumUsers,
      totalModels,
      totalContent,
      totalComments,
      totalLikes,
      pendingReports
    ] = await Promise.all([
      User.count(),
      User.count({ where: { isPremium: true } }),
      Model.count({ where: { isActive: true } }),
      Content.count({ where: { isActive: true } }),
      Comment.count({ where: { isActive: true } }),
      Like.count(),
      Report.count({ where: { status: 'pending' } })
    ]);

    // Recent users (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentUsers = await User.count({
      where: {
        createdAt: {
          [Op.gte]: weekAgo
        }
      }
    });

    // Total views from all models and content
    const modelViews = await Model.sum('views') || 0;
    const contentViews = await Content.sum('views') || 0;
    const totalViews = modelViews + contentViews;

    // Top content by views
    const topContent = await Content.findAll({
      where: { isActive: true },
      order: [['views', 'DESC']],
      limit: 10,
      include: [{
        model: Model,
        as: 'model',
        attributes: ['id', 'name', 'photoUrl']
      }]
    });

    // Top models by views
    const topModels = await Model.findAll({
      where: { isActive: true },
      order: [['views', 'DESC']],
      limit: 10
    });

    // Reports by reason
    const reportsByReason = await Report.findAll({
      attributes: [
        'reason',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['reason'],
      raw: true
    });

    // User growth (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const userGrowth = await User.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        createdAt: {
          [Op.gte]: thirtyDaysAgo
        }
      },
      group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
      order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']],
      raw: true
    });

    // Most active users
    const mostActiveUsers = await UserHistory.findAll({
      attributes: [
        'userId',
        [sequelize.fn('COUNT', sequelize.col('id')), 'activityCount']
      ],
      group: ['userId'],
      order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
      limit: 10,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'isPremium', 'createdAt']
      }],
      raw: false
    });

    // Content performance by type
    const contentByType = await Content.findAll({
      attributes: [
        'type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('views')), 'totalViews']
      ],
      where: { isActive: true },
      group: ['type'],
      raw: true
    });

    res.json({
      overview: {
        totalUsers,
        premiumUsers,
        totalModels,
        totalContent,
        totalViews,
        totalComments,
        totalLikes,
        pendingReports,
        recentUsers,
        conversionRate: totalUsers > 0 ? ((premiumUsers / totalUsers) * 100).toFixed(1) : 0
      },
      topContent,
      topModels,
      reportsByReason,
      userGrowth,
      mostActiveUsers,
      contentByType
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Error fetching dashboard statistics' });
  }
});

// User analytics
router.get('/users/analytics', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    // User registration over time
    const userRegistrations = await User.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        createdAt: {
          [Op.gte]: daysAgo
        }
      },
      group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
      order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']],
      raw: true
    });

    // Premium conversions over time
    const premiumConversions = await User.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('updatedAt')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        isPremium: true,
        updatedAt: {
          [Op.gte]: daysAgo
        }
      },
      group: [sequelize.fn('DATE', sequelize.col('updatedAt'))],
      order: [[sequelize.fn('DATE', sequelize.col('updatedAt')), 'ASC']],
      raw: true
    });

    res.json({
      userRegistrations,
      premiumConversions
    });
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    res.status(500).json({ error: 'Error fetching user analytics' });
  }
});

// Content analytics
router.get('/content/analytics', authMiddleware, isAdmin, async (req, res) => {
  try {
    // Most viewed content
    const mostViewedContent = await Content.findAll({
      where: { isActive: true },
      order: [['views', 'DESC']],
      limit: 20,
      include: [{
        model: Model,
        as: 'model',
        attributes: ['id', 'name', 'photoUrl']
      }]
    });

    // Content uploads over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const contentUploads = await Content.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        createdAt: {
          [Op.gte]: thirtyDaysAgo
        }
      },
      group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
      order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']],
      raw: true
    });

    // Content by model
    const contentByModel = await Content.findAll({
      attributes: [
        'modelId',
        [sequelize.fn('COUNT', sequelize.col('Content.id')), 'contentCount'],
        [sequelize.fn('SUM', sequelize.col('Content.views')), 'totalViews']
      ],
      where: { isActive: true },
      group: ['modelId', 'model.id'],
      order: [[sequelize.fn('COUNT', sequelize.col('Content.id')), 'DESC']],
      limit: 10,
      include: [{
        model: Model,
        as: 'model',
        attributes: ['id', 'name', 'photoUrl']
      }],
      raw: false
    });

    res.json({
      mostViewedContent,
      contentUploads,
      contentByModel
    });
  } catch (error) {
    console.error('Error fetching content analytics:', error);
    res.status(500).json({ error: 'Error fetching content analytics' });
  }
});

module.exports = router;