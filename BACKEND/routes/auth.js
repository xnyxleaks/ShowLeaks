const express = require('express');
const router = express.Router();
const { User } = require('../models');
const bcrypt = require('bcryptjs');
const { sign } = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const authMiddleware = require('../Middleware/Auth');
const { Op } = require('sequelize');

// Configurar nodemailer (você deve configurar suas credenciais SMTP)

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true se porta for 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});


// Registro com verificação de email
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, language, country, ageConfirmed } = req.body;

    // Verificar se confirmou idade
    if (!ageConfirmed) {
      return res.status(400).json({ error: 'É necessário confirmar que você tem mais de 18 anos' });
    }

    // Verificar se email já existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Email já cadastrado!' });
    }

    // Hash da senha
    const hashPassword = await bcrypt.hash(password, 10);

    // Gerar token de verificação
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Criar usuário
    const newUser = await User.create({
      name,
      email,
      password: hashPassword,
      language: language || 'en',
      country,
      ageConfirmed,
      verificationToken,
      isVerified: false
    });

    // Enviar email de verificação
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    
    try {
      await transporter.sendMail({
        from: process.env.FROM_EMAIL,
        to: email,
        subject: 'Verificação de Email - ExtremeLeaks',
        html: `
          <h2>Bem-vindo ao ExtremeLeaks!</h2>
          <p>Clique no link abaixo para verificar seu email:</p>
          <a href="${verificationUrl}">Verificar Email</a>
          <p>Este link expira em 24 horas.</p>
        `
      });
    } catch (emailError) {
      console.error('Erro ao enviar email:', emailError);
    }

    res.status(201).json({
      message: 'Usuário criado com sucesso. Verifique seu email para ativar a conta.',
      userId: newUser.id
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro ao registrar usuário.' });
  }
});

// Verificar email
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    const user = await User.findOne({
      where: {
        verificationToken: token,
        isVerified: false
      }
    });

    if (!user) {
      return res.status(400).json({ error: 'Token inválido ou expirado' });
    }

    await user.update({
      isVerified: true,
      verificationToken: null
    });

    // Gerar token de acesso
    const accessToken = sign(
      { email: user.email, id: user.id },
      process.env.TOKEN_VERIFY_ACCESS
    );

    res.json({
      message: 'Email verificado com sucesso!',
      token: accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isPremium: user.isPremium,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Erro na verificação:', error);
    res.status(500).json({ error: 'Erro ao verificar email.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: "Credenciais incorretas!" });
    }

    if (!user.isVerified) {
      return res.status(401).json({ error: "Email não verificado. Verifique sua caixa de entrada." });
    }

    // Atualizar último login
    await user.update({ lastLoginAt: new Date() });

    const accessToken = sign(
      { email: user.email, id: user.id },
      process.env.TOKEN_VERIFY_ACCESS
    );

    res.json({
      token: accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isPremium: user.isPremium,
        isVerified: user.isVerified,
        language: user.language,
        country: user.country
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro ao realizar login.' });
  }
});

// Reenviar email de verificação
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({
      where: {
        email,
        isVerified: false
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado ou já verificado' });
    }

    // Gerar novo token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    await user.update({ verificationToken });

    // Reenviar email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: 'Verificação de Email - ExtremeLeaks',
      html: `
        <h2>Verificação de Email</h2>
        <p>Clique no link abaixo para verificar seu email:</p>
        <a href="${verificationUrl}">Verificar Email</a>
        <p>Este link expira em 24 horas.</p>
      `
    });

    res.json({ message: 'Email de verificação reenviado' });
  } catch (error) {
    console.error('Erro ao reenviar verificação:', error);
    res.status(500).json({ error: 'Erro ao reenviar email de verificação.' });
  }
});

// Esqueci minha senha
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Gerar token de reset
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hora

    await user.update({
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetExpires
    });

    // Enviar email de reset
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: 'Redefinir Senha - ExtremeLeaks',
      html: `
        <h2>Redefinir Senha</h2>
        <p>Clique no link abaixo para redefinir sua senha:</p>
        <a href="${resetUrl}">Redefinir Senha</a>
        <p>Este link expira em 1 hora.</p>
      `
    });

    res.json({ message: 'Email de redefinição enviado' });
  } catch (error) {
    console.error('Erro ao solicitar reset:', error);
    res.status(500).json({ error: 'Erro ao solicitar redefinição de senha.' });
  }
});

// Redefinir senha
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          [Op.gt]: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({ error: 'Token inválido ou expirado' });
    }

    // Hash da nova senha
    const hashPassword = await bcrypt.hash(password, 10);

    await user.update({
      password: hashPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null
    });

    res.json({ message: 'Senha redefinida com sucesso' });
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    res.status(500).json({ error: 'Erro ao redefinir senha.' });
  }
});

// Dashboard do usuário
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password', 'verificationToken', 'resetPasswordToken'] }
    });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    // Verificar se premium expirou
    if (user.expiredPremium && new Date(user.expiredPremium) < new Date()) {
      await user.update({ isPremium: false });
    }

    res.json(user);
  } catch (error) {
    console.error('Erro no dashboard:', error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Atualizar perfil
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, language, country } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    await user.update({
      name: name || user.name,
      language: language || user.language,
      country: country || user.country
    });

    res.json({
      message: 'Perfil atualizado com sucesso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        language: user.language,
        country: user.country
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ error: 'Erro ao atualizar perfil.' });
  }
});

module.exports = router;