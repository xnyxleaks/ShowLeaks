const express = require('express');
const router = express.Router();
const slugify = require('slugify');
const crypto = require('crypto');
const { Data } = require('../models');

function generateReadableSlug(name) {
  const baseSlug = slugify(name, { lower: true, strict: true });
  const hash = crypto.createHash('md5').update(name + Date.now()).digest('hex').slice(0, 6);
  return `${baseSlug}-${hash}`;
}

router.post('/', async (req, res) => {
  try {
    const dataArray = req.body;

    if (!Array.isArray(dataArray)) {
      return res.status(400).json({ error: 'Os dados enviados devem ser um array de objetos.' });
    }

    const dataWithSlugs = dataArray.map(item => ({
      ...item,
      slug: generateReadableSlug(item.name),
    }));

    const newData = await Data.bulkCreate(dataWithSlugs); 

    res.status(201).json(newData);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar registros', details: error.message });
  }
});


router.get('/', async (req, res) => {
  try {
    const allData = await Data.findAll();
    res.status(200).json(allData);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar registros', details: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Data.findByPk(id);
    if (!item) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar item', details: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, imageUrl, description, megaLink, views } = req.body;

    const item = await Data.findByPk(id);
    if (!item) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    await item.update({ name, imageUrl, description, megaLink, views });
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar item', details: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Data.findByPk(id);
    if (!item) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    await item.destroy();
    res.status(204).send(); 
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar item', details: error.message });
  }
});

router.get('/:id/view', async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Data.findByPk(id);
    if (!item) {
      return res.status(404).json({ error: 'Item não encontrado' });
    }

    item.views += 1;
    await item.save();

    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao incrementar views', details: error.message });
  }
});

module.exports = router;
