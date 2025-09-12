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
  secure: true,
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
      isVerified: false // User can browse but needs verification for premium
    });

    // Enviar email de verificação
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    
    try {
  await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to: email,
    subject: 'Email Verification - ExtremeLeaks',
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f1f5f9; padding: 20px; border-radius: 8px; max-width: 600px; margin: auto;">
        <h2 style="color: #3b82f6; text-align: center;">Welcome to ExtremeLeaks!</h2>
        <p style="font-size: 15px; line-height: 1.6; text-align: center;">
          Please click the button below to verify your email address:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; font-size: 16px; border-radius: 6px; display: inline-block;">
            Verify Email
          </a>
        </div>
        <p style="font-size: 13px; color: #94a3b8; text-align: center;">
          This link will expire in 24 hours. If you did not create an account, you can safely ignore this email.
        </p>
      </div>
    `
  });
} catch (emailError) {
  console.error('Error sending email:', emailError);
  // Continue even if email fails
}


    // Generate access token immediately (user can browse without verification)
    const accessToken = sign(
      { email: newUser.email, id: newUser.id },
      process.env.TOKEN_VERIFY_ACCESS
    );

    res.status(201).json({
      message: 'Usuário criado com sucesso. Verifique seu email para desbloquear recursos premium.',
      token: accessToken,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        isPremium: newUser.isPremium,
        isVerified: newUser.isVerified,
        language: newUser.language,
        country: newUser.country
      }
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
      return res.status(404).json({ error: 'User not found or already verified' });
    }

    // Generate new token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    await user.update({ verificationToken });

    // Build verification URL
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    // Send styled email
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: 'Email Verification - ExtremeLeaks',
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f1f5f9; padding: 20px; border-radius: 8px; max-width: 600px; margin: auto;">
          <h2 style="color: #3b82f6; text-align: center;">Email Verification</h2>
          <p style="font-size: 15px; line-height: 1.6; text-align: center;">
            Please click the button below to verify your email address:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; font-size: 16px; border-radius: 6px; display: inline-block;">
              Verify Email
            </a>
          </div>
          <p style="font-size: 13px; color: #94a3b8; text-align: center;">
            This link will expire in 24 hours. If you did not request this, you can safely ignore this email.
          </p>
        </div>
      `,
      text: `Email Verification - ExtremeLeaks\n\nClick the link below to verify your email:\n${verificationUrl}\n\nThis link will expire in 24 hours.`
    });

    res.json({ message: 'Verification email resent' });
  } catch (error) {
    console.error('Error resending verification email:', error);
    res.status(500).json({ error: 'Failed to resend verification email.' });
  }
});


// Esqueci minha senha
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    await user.update({
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetExpires
    });

    // Build reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    // Send styled email
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: 'Reset Password - ExtremeLeaks',
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f1f5f9; padding: 20px; border-radius: 8px; max-width: 600px; margin: auto;">
          <h2 style="color: #ef4444; text-align: center;">Reset Your Password</h2>
          <p style="font-size: 15px; line-height: 1.6; text-align: center;">
            Click the button below to reset your password:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; font-size: 16px; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="font-size: 13px; color: #94a3b8; text-align: center;">
            This link will expire in 1 hour. If you did not request a password reset, please ignore this email.
          </p>
        </div>
      `,
      text: `Reset Password - ExtremeLeaks\n\nClick the link below to reset your password:\n${resetUrl}\n\nThis link will expire in 1 hour.`
    });

    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Error requesting password reset:', error);
    res.status(500).json({ error: 'Failed to request password reset.' });
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