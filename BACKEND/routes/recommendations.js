const express = require('express');
const router = express.Router();
const { Recommendation, Model, User } = require('../models');
const authMiddleware = require('../Middleware/Auth');
const isAdmin = require('../Middleware/isAdmin');
const { Op } = require('sequelize');

// Create recommendation (Premium users only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { modelId, description } = req.body;

    // Check if user is premium
    const user = await User.findByPk(userId);
    if (!user || !user.isPremium) {
      return res.status(403).json({ error: 'Premium membership required to submit recommendations' });
    }

    // Check monthly limit (2 recommendations per month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyCount = await Recommendation.count({
      where: {
        userId,
        createdAt: {
          [Op.gte]: startOfMonth
        }
      }
    });

    if (monthlyCount >= 2) {
      return res.status(429).json({ error: 'Monthly recommendation limit reached (2 per month)' });
    }

    // Check if model exists
    const model = await Model.findByPk(modelId);
    if (!model) {
      return res.status(404).json({ error: 'Model not found' });
    }

    // Check if user already recommended this model this month
    const existingRecommendation = await Recommendation.findOne({
      where: {
        userId,
        modelId,
        createdAt: {
          [Op.gte]: startOfMonth
        }
      }
    });

    if (existingRecommendation) {
      return res.status(409).json({ error: 'You have already recommended this model this month' });
    }

    const recommendation = await Recommendation.create({
      userId,
      modelId,
      description
    });

    res.status(201).json({
      message: 'Recommendation submitted successfully',
      recommendation
    });
  } catch (error) {
    console.error('Error creating recommendation:', error);
    res.status(500).json({ error: 'Failed to submit recommendation' });
  }
});

// Get remaining recommendations for current month
router.get('/remaining', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user is premium
    const user = await User.findByPk(userId);
    if (!user || !user.isPremium) {
      return res.json({ remaining: 0 });
    }

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyCount = await Recommendation.count({
      where: {
        userId,
        createdAt: {
          [Op.gte]: startOfMonth
        }
      }
    });

    res.json({ remaining: Math.max(0, 2 - monthlyCount) });
  } catch (error) {
    console.error('Error getting remaining recommendations:', error);
    res.status(500).json({ error: 'Failed to get remaining recommendations' });
  }
});

// Get all recommendations (Admin only)
router.get('/', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) {
      where.status = status;
    }

    const { count, rows } = await Recommendation.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'isPremium']
        },
        {
          model: Model,
          as: 'model',
          attributes: ['id', 'name', 'photoUrl', 'slug']
        }
      ]
    });

    res.json({
      recommendations: rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

// Update recommendation status (Admin only)
router.put('/:id', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const recommendation = await Recommendation.findByPk(id);
    if (!recommendation) {
      return res.status(404).json({ error: 'Recommendation not found' });
    }

    await recommendation.update({
      status,
      adminNotes,
      reviewedAt: new Date(),
      reviewedBy: req.user.id
    });

    res.json({
      message: 'Recommendation status updated',
      recommendation
    });
  } catch (error) {
    console.error('Error updating recommendation:', error);
    res.status(500).json({ error: 'Failed to update recommendation' });
  }
});

module.exports = router;