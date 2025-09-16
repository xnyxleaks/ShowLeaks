const express = require('express');
const router = express.Router();
const { User } = require('../models');
const bcrypt = require('bcryptjs');
const { sign } = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const authMiddleware = require('../Middleware/Auth');
const { Op } = require('sequelize');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

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

    if (!token) {
      return res.status(400).json({ error: 'Token é obrigatório' });
    }

    const user = await User.findOne({
      where: {
        verificationToken: token,
        isVerified: false
      }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid token, expired token, or user already verified' });
    }

    // Atualizar usuário
    const updatedUser = await user.update({
      isVerified: true,
      verificationToken: null
    });

    // Gerar token de acesso
    const accessToken = sign(
      { email: updatedUser.email, id: updatedUser.id },
      process.env.TOKEN_VERIFY_ACCESS
    );

    res.json({
      message: 'Email verificado com sucesso!',
      token: accessToken,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        isPremium: updatedUser.isPremium,
        isVerified: updatedUser.isVerified,
        language: updatedUser.language,
        country: updatedUser.country,
        ageConfirmed: updatedUser.ageConfirmed,
        isAdmin: updatedUser.isAdmin,
        expiredPremium: updatedUser.expiredPremium,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
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

    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' });
    }

    const user = await User.findOne({
      where: {
        email,
        isVerified: false
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado ou já verificado' });
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
        <div style="font-family: 'Inter', Arial, sans-serif; background: linear-gradient(135deg, #121212 0%, #0d0d0d 100%); color: #f1f5f9; padding: 40px 20px; border-radius: 16px; max-width: 600px; margin: auto; border: 1px solid #1e1e1e;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); border-radius: 20px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 24px; box-shadow: 0 10px 25px rgba(249, 115, 22, 0.3);">
              <span style="color: white; font-size: 36px;">📧</span>
            </div>
            <h1 style="color: #f97316; font-size: 28px; font-weight: bold; margin: 0; text-align: center;">Email Verification</h1>
          </div>
          <div style="background: rgba(249, 115, 22, 0.1); border: 1px solid rgba(249, 115, 22, 0.2); border-radius: 12px; padding: 24px; margin-bottom: 32px;">
            <p style="font-size: 16px; line-height: 1.6; text-align: center; margin: 0; color: #f1f5f9;">
              You requested a new verification email for your ExtremeLeaks account.
            </p>
          </div>
          <p style="font-size: 15px; line-height: 1.6; text-align: center; margin-bottom: 32px; color: #cbd5e1;">
              <span style="color: white; font-size: 36px;">🎉</span>
            </div>
            <h1 style="color: #f97316; font-size: 28px; font-weight: bold; margin: 0; text-align: center;">Welcome to ExtremeLeaks!</h1>
          </div>
          <div style="background: rgba(249, 115, 22, 0.1); border: 1px solid rgba(249, 115, 22, 0.2); border-radius: 12px; padding: 24px; margin-bottom: 32px;">
            <p style="font-size: 16px; line-height: 1.6; text-align: center; margin: 0; color: #f1f5f9;">
              Thank you for joining our community! We're excited to have you on board.
            </p>
          </div>
          <p style="font-size: 15px; line-height: 1.6; text-align: center; margin-bottom: 32px; color: #cbd5e1;">
            Please click the button below to verify your email address:
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${verificationUrl}" style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 16px 32px; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 12px; display: inline-block; box-shadow: 0 4px 15px rgba(249, 115, 22, 0.4); transition: all 0.3s ease;">
              Verify Email
            </a>
          </div>
          <div style="border-top: 1px solid #1e1e1e; padding-top: 24px; margin-top: 32px;">
            <p style="font-size: 13px; color: #64748b; text-align: center; margin: 0;">
              This link will expire in 24 hours for security reasons.
            </p>
            <p style="font-size: 13px; color: #64748b; text-align: center; margin: 8px 0 0 0;">
              If you didn't request this, you can safely ignore this email.
            </p>
          </div>
          <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #1e1e1e;">
            <p style="font-size: 12px; color: #475569; margin: 0;">
              © 2024 ExtremeLeaks. All rights reserved.
            </p>
          </div>
        </div>
        <div style="max-width: 600px; margin: 20px auto 0; text-align: center;">
          <p style="font-size: 11px; color: #64748b; margin: 0;">
            <h3 style="color: #22c55e; font-size: 16px; font-weight: 600; margin: 0 0 12px 0; text-align: center;">What's Next?</h3>
            <ul style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px;">
              <li>Verify your email to unlock all features</li>
              <li>Browse unlimited premium content</li>
              <li>Interact with the community</li>
              <li>Upgrade to premium for exclusive benefits</li>
            </ul>
          </div>
          <div style="border-top: 1px solid #1e1e1e; padding-top: 24px; margin-top: 32px;">
            <p style="font-size: 13px; color: #64748b; text-align: center; margin: 0;">
              This link will expire in 24 hours for security reasons.
            </p>
            <p style="font-size: 13px; color: #64748b; text-align: center; margin: 8px 0 0 0;">
              If you didn't create this account, you can safely ignore this email.
            </p>
          </div>
          <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #1e1e1e;">
            <p style="font-size: 12px; color: #475569; margin: 0;">
              © 2024 ExtremeLeaks. All rights reserved.
            </p>
          </div>
        </div>
        <div style="max-width: 600px; margin: 20px auto 0; text-align: center;">
          <p style="font-size: 11px; color: #64748b; margin: 0;">
            This link will expire in 24 hours. If you did not request this, you can safely ignore this email.
          </p>
        </div>
      `,
      text: `Email Verification - ExtremeLeaks\n\nClick the link below to verify your email:\n${verificationUrl}\n\nThis link will expire in 24 hours.`
    });

    res.json({ message: 'Email de verificação reenviado com sucesso' });
  } catch (error) {
    console.error('Error resending verification email:', error);
    res.status(500).json({ error: 'Erro ao reenviar email de verificação' });
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
        <div style="font-family: 'Inter', Arial, sans-serif; background: linear-gradient(135deg, #121212 0%, #0d0d0d 100%); color: #f1f5f9; padding: 40px 20px; border-radius: 16px; max-width: 600px; margin: auto; border: 1px solid #1e1e1e;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); border-radius: 20px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 24px; box-shadow: 0 10px 25px rgba(249, 115, 22, 0.3);">
              <span style="color: white; font-size: 36px;">🔒</span>
            </div>
            <h1 style="color: #f97316; font-size: 28px; font-weight: bold; margin: 0; text-align: center;">Reset Your Password</h1>
          </div>
          <div style="background: rgba(249, 115, 22, 0.1); border: 1px solid rgba(249, 115, 22, 0.2); border-radius: 12px; padding: 24px; margin-bottom: 32px;">
            <p style="font-size: 16px; line-height: 1.6; text-align: center; margin: 0; color: #f1f5f9;">
              We received a request to reset your password for your ExtremeLeaks account.
            </p>
          </div>
          <p style="font-size: 15px; line-height: 1.6; text-align: center; margin-bottom: 32px; color: #cbd5e1;">
            Click the button below to reset your password:
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}" style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 16px 32px; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 12px; display: inline-block; box-shadow: 0 4px 15px rgba(249, 115, 22, 0.4); transition: all 0.3s ease;">
              Reset Password
            </a>
          </div>
          <div style="border-top: 1px solid #1e1e1e; padding-top: 24px; margin-top: 32px;">
            <p style="font-size: 13px; color: #64748b; text-align: center; margin: 0;">
              This link will expire in 1 hour for security reasons.
            </p>
            <p style="font-size: 13px; color: #64748b; text-align: center; margin: 8px 0 0 0;">
              If you didn't request this reset, please ignore this email.
            </p>
          </div>
          <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #1e1e1e;">
            <p style="font-size: 12px; color: #475569; margin: 0;">
              © 2024 ExtremeLeaks. All rights reserved.
            </p>
          </div>
        </div>
        <div style="max-width: 600px; margin: 20px auto 0; text-align: center;">
          <p style="font-size: 11px; color: #64748b; margin: 0;">
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

// Upload profile photo
router.post('/upload-photo', authMiddleware, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhuma imagem foi enviada' });
    }

    const userId = req.user.id;
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'profile_photos',
          public_id: `user_${userId}_${Date.now()}`,
          transformation: [
            { width: 200, height: 200, crop: 'fill', gravity: 'face' },
            { quality: 'auto', fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    // Update user profile photo
    const updatedUser = await user.update({
      profilePhoto: uploadResult.secure_url
    });

    res.json({
      message: 'Foto de perfil atualizada com sucesso',
      profilePhoto: uploadResult.secure_url,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        profilePhoto: updatedUser.profilePhoto,
        isPremium: updatedUser.isPremium,
        isVerified: updatedUser.isVerified,
        language: updatedUser.language,
        country: updatedUser.country
      }
    });
  } catch (error) {
    console.error('Erro ao fazer upload da foto:', error);
    res.status(500).json({ error: 'Erro ao fazer upload da foto' });
  }
});

module.exports = router;