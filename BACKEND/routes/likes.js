const express = require('express');
const router = express.Router();
const { Like, Content, Model } = require('../models');
const authMiddleware = require('../Middleware/Auth');

// Toggle like (curtir/descurtir)
router.post('/toggle', authMiddleware, async (req, res) => {
  try {
    const { contentId, modelId, type } = req.body;
    const userId = req.user.id;

    if (!type || (type !== 'content' && type !== 'model')) {
      return res.status(400).json({ error: 'Tipo deve ser "content" ou "model"' });
    }

    if (type === 'content' && !contentId) {
      return res.status(400).json({ error: 'contentId é obrigatório para tipo "content"' });
    }

    if (type === 'model' && !modelId) {
      return res.status(400).json({ error: 'modelId é obrigatório para tipo "model"' });
    }

    // Verificar se o conteúdo/modelo existe
    if (type === 'content') {
      const content = await Content.findByPk(contentId);
      if (!content) {
        return res.status(404).json({ error: 'Conteúdo não encontrado' });
      }
    } else {
      const model = await Model.findByPk(modelId);
      if (!model) {
        return res.status(404).json({ error: 'Modelo não encontrado' });
      }
    }

    const whereClause = {
      userId,
      type,
      ...(contentId && { contentId }),
      ...(modelId && { modelId })
    };

    const existingLike = await Like.findOne({ where: whereClause });

    if (existingLike) {
      // Remover curtida
      await existingLike.destroy();
      
      res.json({
        message: 'Curtida removida',
        isLiked: false
      });
    } else {
      // Adicionar curtida
      await Like.create(whereClause);
      
      res.json({
        message: 'Curtida adicionada',
        isLiked: true
      });
    }
  } catch (error) {
    console.error('Erro ao alternar curtida:', error);
    res.status(500).json({ error: 'Erro ao alternar curtida', details: error.message });
  }
});

// Obter estatísticas de curtidas
router.get('/stats', async (req, res) => {
  try {
    const { contentId, modelId } = req.query;
    
    // Extract user ID from token if available
    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = require('jsonwebtoken').verify(token, process.env.TOKEN_VERIFY_ACCESS);
        userId = decoded.id;
      } catch (err) {
        // Token inválido, mas continua sem userId
      }
    }

    if (!contentId && !modelId) {
      return res.status(400).json({ error: 'É necessário fornecer contentId ou modelId' });
    }

    const whereClause = {
      ...(contentId && { contentId }),
      ...(modelId && { modelId })
    };

    const totalLikes = await Like.count({ where: whereClause });

    let isLiked = false;
    if (userId) {
      const userLike = await Like.findOne({
        where: {
          ...whereClause,
          userId
        }
      });
      isLiked = !!userLike;
    }

    res.json({
      totalLikes,
      isLiked
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas de curtidas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas', details: error.message });
  }
});

module.exports = router;