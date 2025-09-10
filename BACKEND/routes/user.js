const express = require('express');
const router = express.Router();
const { User } = require('../models');
const bcrypt = require('bcryptjs');
const { sign } = require('jsonwebtoken');
const Authmiddleware = require('../Middleware/Auth');
const isAdmin = require('../Middleware/isAdmin');
const dotenv = require('dotenv');
const { Op } = require("sequelize");

dotenv.config();

router.post('/register', async (req, res) => {
    const { name, email, password, ...users } = req.body;

    try {
        const existingEmail = await User.findOne({ where: { email } });

        if (existingEmail) {
            return res.status(409).json({ error: 'Email já cadastrado!' });
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const createNewUser = await User.create({
            ...users,
            name,
            email,
            password: hashPassword,
        });

        const accessToken = sign(
            { email: createNewUser.email, id: createNewUser.id },
            process.env.TOKEN_VERIFY_ACCESS
        );

        await createNewUser.update({ token: accessToken });

        const { password: _, ...userWithoutPassword } = createNewUser.dataValues;

        res.status(201).json({
            ...userWithoutPassword,
            token: accessToken
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao registrar usuário.' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email } });

        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ error: "Credenciais incorretas!" });
        }

        const accessToken = sign(
            { email: user.email, id: user.id },
            process.env.TOKEN_VERIFY_ACCESS
        );

        res.json({ token: accessToken, name: user.name, email: user.email, isPremium: user.isPremium });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao realizar login.' });
    }
});

router.get('/dashboard', Authmiddleware, async (req, res) => {
    const userId = req.user.id;
  
    try {
      const user = await User.findByPk(userId);
  
      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
  
      if (user.expiredPremium && new Date(user.expiredPremium) < new Date()) {
        await user.update({ isPremium: false });
      }
  
      res.json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  });
  

router.get('/', Authmiddleware, isAdmin, async (req, res) => {
    try {
        const getAllUsers = await User.findAll();
        res.status(200).json(getAllUsers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao buscar usuários." });
    }
});

router.get('/is-vip/:email', async (req, res) => {
    const { email } = req.params;

    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado!' });
        }

        res.status(200).json({ isVip: user.isVip });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao verificar status VIP' });
    }
});

router.get('/dashboard', Authmiddleware, async (req, res) => {
    const userId = req.user.id;

    try {
        const user = await User.findByPk(userId);
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
});

module.exports = router;
