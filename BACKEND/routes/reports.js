const express = require('express');
const router = express.Router();
const { Report, Content, Model, User } = require('../models');
const authMiddleware = require('../Middleware/Auth');
const isAdmin = require('../Middleware/isAdmin');

// Criar denúncia
router.post('/', async (req, res) => {
  try {
    const { contentId, modelId, reason, description } = req.body;
    const userId = req.headers.authorization ? req.user?.id : null;
    const ipAddress = req.ip || req.connection.remoteAddress;

    // Validar se pelo menos contentId ou modelId foi fornecido
    if (!contentId && !modelId) {
      return res.status(400).json({ error: 'É necessário fornecer contentId ou modelId' });
    }

    // Verificar se o conteúdo/modelo existe
    if (contentId) {
      const content = await Content.findByPk(contentId);
      if (!content) {
        return res.status(404).json({ error: 'Conteúdo não encontrado' });
      }
    }

    if (modelId) {
      const model = await Model.findByPk(modelId);
      if (!model) {
        return res.status(404).json({ error: 'Modelo não encontrado' });
      }
    }

    const report = await Report.create({
      contentId,
      modelId,
      userId,
      reason,
      description,
      ipAddress
    });

    // Se for link quebrado, atualizar status automaticamente
    if (reason === 'broken_link' && contentId) {
      await Content.update(
        { status: 'broken' },
        { where: { id: contentId } }
      );
    }

    res.status(201).json({
      message: 'Denúncia registrada com sucesso',
      reportId: report.id
    });
  } catch (error) {
    console.error('Erro ao criar denúncia:', error);
    res.status(500).json({ error: 'Erro ao criar denúncia', details: error.message });
  }
});

// Listar denúncias (admin)
router.get('/', authMiddleware, isAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      reason,
      sortBy = 'recent'
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};
    let order = [];

    // Filtros
    if (status) {
      where.status = status;
    }

    if (reason) {
      where.reason = reason;
    }

    // Ordenação
    switch (sortBy) {
      case 'oldest':
        order = [['createdAt', 'ASC']];
        break;
      case 'recent':
      default:
        order = [['createdAt', 'DESC']];
        break;
    }

    const { count, rows } = await Report.findAndCountAll({
      where,
      order,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: Content,
          as: 'content',
          attributes: ['id', 'title', 'url', 'status'],
          required: false
        },
        {
          model: Model,
          as: 'model',
          attributes: ['id', 'name', 'slug'],
          required: false
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
          required: false
        }
      ]
    });

    res.json({
      reports: rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar denúncias:', error);
    res.status(500).json({ error: 'Erro ao buscar denúncias', details: error.message });
  }
});

// Atualizar status da denúncia (admin)
router.put('/:id', authMiddleware, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const report = await Report.findByPk(id);
    if (!report) {
      return res.status(404).json({ error: 'Denúncia não encontrada' });
    }

    await report.update({
      status,
      adminNotes,
      reviewedAt: new Date(),
      reviewedBy: req.user.id
    });

    // Se a denúncia foi resolvida e era sobre conteúdo inadequado
    if (status === 'resolved' && report.contentId) {
      const content = await Content.findByPk(report.contentId);
      if (content && ['child_content', 'no_consent'].includes(report.reason)) {
        await content.update({ status: 'removed', isActive: false });
      }
    }

    res.json({
      message: 'Status da denúncia atualizado',
      report
    });
  } catch (error) {
    console.error('Erro ao atualizar denúncia:', error);
    res.status(500).json({ error: 'Erro ao atualizar denúncia', details: error.message });
  }
});

// Estatísticas de denúncias (admin)
router.get('/stats', authMiddleware, isAdmin, async (req, res) => {
  try {
    const stats = await Report.findAll({
      attributes: [
        'reason',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['reason']
    });

    const statusStats = await Report.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    res.json({
      byReason: stats,
      byStatus: statusStats
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas', details: error.message });
  }
});

module.exports = router;