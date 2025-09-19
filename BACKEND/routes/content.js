const express = require('express');
const router = express.Router();
const { Content, Model, UserHistory } = require('../models');
const { Op } = require('sequelize');
const authMiddleware = require('../Middleware/Auth');

// Listar todos os conteúdos
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = 'recent',
      search
    } = req.query;

    const offset = (page - 1) * limit;
    const where = { isActive: true, status: 'active' };
    let order = [];

    // Filtros
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { '$model.name$': { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Ordenação
    switch (sortBy) {
      case 'popular':
        order = [['views', 'DESC']];
        break;
      case 'oldest':
        order = [['createdAt', 'ASC']];
        break;
      case 'recent':
      default:
        order = [['createdAt', 'DESC']];
        break;
    }

    const { count, rows } = await Content.findAndCountAll({
      where,
      order,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [{
        model: Model,
        as: 'model',
        attributes: ['id', 'name', 'slug', 'photoUrl']
      }]
    });

    res.json({
      contents: rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar conteúdos:', error);
    res.status(500).json({ error: 'Erro ao buscar conteúdos', details: error.message });
  }
});

// Listar conteúdos por modelo
router.get('/model/:modelId', async (req, res) => {
  try {
    const { modelId } = req.params;
    const {
      page = 1,
      limit = 20,
      type,
      tags,
      sortBy = 'recent'
    } = req.query;

    const offset = (page - 1) * limit;
    const where = { modelId, isActive: true, status: 'active' };
    let order = [];

    // Filtros
    if (type) {
      where.type = type;
    }

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      where.tags = {
        [Op.overlap]: tagArray
      };
    }

    // Ordenação
    switch (sortBy) {
      case 'popular':
        order = [['views', 'DESC']];
        break;
      case 'oldest':
        order = [['createdAt', 'ASC']];
        break;
      case 'recent':
      default:
        order = [['createdAt', 'DESC']];
        break;
    }

    const { count, rows } = await Content.findAndCountAll({
      where,
      order,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [{
        model: Model,
        as: 'model',
        attributes: ['id', 'name', 'slug']
      }]
    });

    res.json({
      contents: rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar conteúdos:', error);
    res.status(500).json({ error: 'Erro ao buscar conteúdos', details: error.message });
  }
});

// Criar novo conteúdo
router.post('/', async (req, res) => {
  try {
    const contentData = { ...req.body };
    
    // Validar e processar info se fornecido
    if (contentData.info) {
      const { images, videos, size } = contentData.info;
      contentData.info = {};
      
      if (images && images > 0) contentData.info.images = parseInt(images);
      if (videos && videos > 0) contentData.info.videos = parseInt(videos);
      if (size && size > 0) contentData.info.size = parseInt(size);
      
      // Se info está vazio, definir como null
      if (Object.keys(contentData.info).length === 0) {
        contentData.info = null;
      }
    }
    
    const newContent = await Content.create(contentData);
    res.status(201).json(newContent);
  } catch (error) {
    console.error('Erro ao criar conteúdo:', error);
    res.status(500).json({ error: 'Erro ao criar conteúdo', details: error.message });
  }
});

// Detalhes do conteúdo
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers.authorization ? req.user?.id : null;

    const content = await Content.findOne({
      where: { id, isActive: true },
      include: [{
        model: Model,
        as: 'model',
        attributes: ['id', 'name', 'photoUrl', 'slug']
      }]
    });

    if (!content) {
      return res.status(404).json({ error: 'Conteúdo não encontrado' });
    }

    res.json(content);
  } catch (error) {
    console.error('Erro ao buscar conteúdo:', error);
    res.status(500).json({ error: 'Erro ao buscar conteúdo', details: error.message });
  }
});

// Registrar visualização
router.post('/:id/view', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers.authorization ? req.user?.id : null;

    const content = await Content.findByPk(id);
    if (!content) {
      return res.status(404).json({ error: 'Conteúdo não encontrado' });
    }

    // Incrementar visualizações
    await content.increment('views');

    // Registrar no histórico do usuário se logado
    if (userId) {
      await UserHistory.create({
        userId,
        contentId: content.id,
        modelId: content.modelId,
        action: 'view'
      });
    }

    res.json({ message: 'Visualização registrada', views: content.views + 1 });
  } catch (error) {
    console.error('Erro ao registrar visualização:', error);
    res.status(500).json({ error: 'Erro ao registrar visualização', details: error.message });
  }
});

// Compartilhar conteúdo
router.post('/:id/share', async (req, res) => {
  try {
    const { id } = req.params;
    const { platform } = req.body;
    const userId = req.headers.authorization ? req.user?.id : null;

    const content = await Content.findByPk(id, {
      include: [{
        model: Model,
        as: 'model',
        attributes: ['name', 'slug']
      }]
    });

    if (!content) {
      return res.status(404).json({ error: 'Conteúdo não encontrado' });
    }

    // Registrar compartilhamento no histórico
    if (userId) {
      await UserHistory.create({
        userId,
        contentId: content.id,
        modelId: content.modelId,
        action: 'share',
        metadata: { platform }
      });
    }

    // Gerar URL de compartilhamento
    const shareUrl = `${process.env.FRONTEND_URL}/model/${content.model.slug}?content=${content.id}`;
    const shareText = `Confira ${content.title} - ${content.model.name}`;

    res.json({
      shareUrl,
      shareText,
      platform
    });
  } catch (error) {
    console.error('Erro ao compartilhar conteúdo:', error);
    res.status(500).json({ error: 'Erro ao compartilhar conteúdo', details: error.message });
  }
});

// Atualizar conteúdo
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const content = await Content.findByPk(id);

    if (!content) {
      return res.status(404).json({ error: 'Conteúdo não encontrado' });
    }

    const updateData = { ...req.body };
    
    // Processar info se fornecido
    if (updateData.info) {
      const { images, videos, size } = updateData.info;
      updateData.info = {};
      
      if (images && images > 0) updateData.info.images = parseInt(images);
      if (videos && videos > 0) updateData.info.videos = parseInt(videos);
      if (size && size > 0) updateData.info.size = parseInt(size);
      
      if (Object.keys(updateData.info).length === 0) {
        updateData.info = null;
      }
    }
    
    await content.update(updateData);
    
    // Processar info se fornecido
    if (updateData.info) {
      const { images, videos, size } = updateData.info;
      updateData.info = {};
      
      if (images && images > 0) updateData.info.images = parseInt(images);
      if (videos && videos > 0) updateData.info.videos = parseInt(videos);
      if (size && size > 0) updateData.info.size = parseInt(size);
      
      if (Object.keys(updateData.info).length === 0) {
        updateData.info = null;
      }
    }
    
    await content.update(updateData);
    res.json(content);
  } catch (error) {
    console.error('Erro ao atualizar conteúdo:', error);
    res.status(500).json({ error: 'Erro ao atualizar conteúdo', details: error.message });
  }
});

// Deletar conteúdo
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const content = await Content.findByPk(id);

    if (!content) {
      return res.status(404).json({ error: 'Conteúdo não encontrado' });
    }

    await content.update({ isActive: false });
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar conteúdo:', error);
    res.status(500).json({ error: 'Erro ao deletar conteúdo', details: error.message });
  }
});

module.exports = router;