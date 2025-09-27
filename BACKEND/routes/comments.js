const express = require('express');
const router = express.Router();
const { Comment, User, CommentLike } = require('../models');
const { createNotification } = require('./notifications');
const authMiddleware = require('../Middleware/Auth');
const { Op } = require('sequelize');

// List comments
router.get('/', async (req, res) => {
  try {
    const {
      contentId,
      modelId,
      page = '1',
      limit = '50',
      sortBy = 'recent'
    } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);
    const offset = (pageNum - 1) * limitNum;

    const where = { isActive: true };
    let order = [];

    // Filters
    if (contentId) {
      where.contentId = contentId;
    }

    if (modelId) {
      where.modelId = modelId;
    }

    // Ordering
    switch (sortBy) {
      case 'popular':
        order = [['likes', 'DESC'], ['createdAt', 'DESC']];
        break;
      case 'oldest':
        order = [['createdAt', 'ASC']];
        break;
      case 'recent':
      default:
        order = [['createdAt', 'DESC']];
        break;
    }

    // userId is available only if some upstream middleware set req.user
    const userId = req.user?.id || null;

    const { count, rows } = await Comment.findAndCountAll({
      where,
      order,
      limit: limitNum,
      offset,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'isPremium', 'isAdmin', 'profilePhoto']
        },
        {
          model: Comment,
          as: 'replies',
          where: { isActive: true },
          required: false,
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'isPremium', 'isAdmin', 'profilePhoto']
          }]
        }
      ]
    });

    // Check if the current user liked each comment
    let commentsWithLikes = rows;
    if (userId) {
      const commentIds = rows.map(c => c.id);
      const userLikes = await CommentLike.findAll({
        where: {
          userId,
          commentId: { [Op.in]: commentIds }
        }
      });

      const likedCommentIds = new Set(userLikes.map(like => like.commentId));

      commentsWithLikes = rows.map(comment => ({
        ...comment.toJSON(),
        isLiked: likedCommentIds.has(comment.id)
      }));
    } else {
      commentsWithLikes = rows.map(comment => ({
        ...comment.toJSON(),
        isLiked: false
      }));
    }

    res.json({
      comments: commentsWithLikes,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(count / limitNum),
        totalItems: count,
        itemsPerPage: limitNum
      }
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Error fetching comments', details: error.message });
  }
});

// Create comment
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { contentId, modelId, text, parentId } = req.body;
    const userId = req.user.id;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    // If not a reply, must provide contentId or modelId
    if (!parentId && !contentId && !modelId) {
      return res.status(400).json({ error: 'contentId or modelId is required' });
    }

    const commentData = {
      userId,
      text: text.trim(),
      parentId: parentId || null
    };

    if (!parentId) {
      commentData.contentId = contentId || null;
      commentData.modelId = modelId || null;
    } else {
      // For replies, inherit contentId/modelId from parent
      const parentComment = await Comment.findByPk(parentId);
      if (!parentComment) {
        return res.status(400).json({ error: 'Parent comment not found' });
      }
      commentData.contentId = parentComment.contentId || null;
      commentData.modelId = parentComment.modelId || null;
    }

    const comment = await Comment.create(commentData);

    const commentWithUser = await Comment.findByPk(comment.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'isPremium', 'isAdmin', 'profilePhoto']
      }]
    });

    res.status(201).json({
      message: 'Comment created successfully',
      comment: {
        ...commentWithUser.toJSON(),
        isLiked: false
      }
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Error creating comment', details: error.message });
  }
});

// Update comment
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.user.id;

    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check permissions
    if (comment.userId !== userId && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    await comment.update({ text: text.trim() });

    const updatedComment = await Comment.findByPk(id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'isPremium', 'isAdmin', 'profilePhoto']
      }]
    });

    res.json({
      message: 'Comment updated successfully',
      comment: updatedComment
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ error: 'Error updating comment', details: error.message });
  }
});

// Delete comment (soft delete)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check permissions
    if (comment.userId !== userId && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await comment.update({ isActive: false });

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Error deleting comment', details: error.message });
  }
});

// Like / unlike comment
router.post('/:id/like', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const existingLike = await CommentLike.findOne({
      where: { userId, commentId: id }
    });

    if (existingLike) {
      // Remove like
      await existingLike.destroy();
      await comment.decrement('likes');
      await comment.reload();

      return res.json({
        message: 'Like removed',
        isLiked: false,
        likes: comment.likes
      });
    } else {
      // Add like
      await CommentLike.create({ userId, commentId: id });
      await comment.increment('likes');
      await comment.reload();

      // Create notification for comment author (if not self-like)
      if (comment.userId !== userId) {
        const liker = await User.findByPk(userId, { attributes: ['id', 'name'] });
        await createNotification(
          comment.userId,
          'comment_like',
          'Someone liked your comment',
          `${liker?.name || 'Someone'} liked your comment`,
          { commentId: id, likerId: userId }
        );
      }

      return res.json({
        message: 'Comment liked',
        isLiked: true,
        likes: comment.likes
      });
    }
  } catch (error) {
    console.error('Error liking comment:', error);
    res.status(500).json({ error: 'Error liking comment', details: error.message });
  }
});

module.exports = router;
