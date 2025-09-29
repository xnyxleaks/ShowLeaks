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
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'), false);
  },
});

// Configure nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

// Register with email verification
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, language, country, ageConfirmed } = req.body;

    if (!ageConfirmed) {
      return res.status(400).json({ error: 'You must confirm that you are over 18 years old.' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered.' });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const newUser = await User.create({
      name,
      email,
      password: hashPassword,
      language: language || 'en',
      country,
      ageConfirmed,
      verificationToken,
      isVerified: false,
    });

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    try {
      await transporter.sendMail({
        from: process.env.FROM_EMAIL,
        to: email,
        subject: 'Email Verification - ShowLeaks',
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f1f5f9; padding: 20px; border-radius: 8px; max-width: 600px; margin: auto;">
            <h2 style="color: #3b82f6; text-align: center;">Welcome to ShowLeaks!</h2>
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
    }

    const accessToken = sign(
      { email: newUser.email, id: newUser.id },
      process.env.TOKEN_VERIFY_ACCESS
    );

    res.status(201).json({
      message: 'User created successfully. Check your email to unlock premium features.',
      token: accessToken,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        isPremium: newUser.isPremium,
        isVerified: newUser.isVerified,
        language: newUser.language,
        country: newUser.country,
      },
    });
  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).json({ error: 'Error registering user.' });
  }
});

router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const user = await User.findOne({
      where: { verificationToken: token, isVerified: false },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid token, expired token, or user already verified' });
    }

    const updatedUser = await user.update({ isVerified: true, verificationToken: null });

    const accessToken = sign(
      { email: updatedUser.email, id: updatedUser.id },
      process.env.TOKEN_VERIFY_ACCESS
    );

    res.json({
      message: 'Email verified successfully.',
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
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error verifying:', error);
    res.status(500).json({ error: 'Error verifying email.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    if (!user.isVerified) {
      return res.status(401).json({ error: 'Email not verified. Check your inbox.' });
    }

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
        country: user.country,
      },
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Error logging in.' });
  }
});

// Resend verification email
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await User.findOne({ where: { email, isVerified: false } });
    if (!user) return res.status(404).json({ error: 'User not found or already verified' });

    const verificationToken = crypto.randomBytes(32).toString('hex');
    await user.update({ verificationToken });

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: 'Email Verification - ShowLeaks',
      text: `Email Verification - ShowLeaks\n\nClick the link below to verify your email:\n${verificationUrl}\n\nThis link will expire in 24 hours.`,
    });

    res.json({ message: 'Verification email re-sent successfully.' });
  } catch (error) {
    console.error('Error resending verification email:', error);
    res.status(500).json({ error: 'Failed to resend verification email.' });
  }
});

// Forgot password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000);

    await user.update({ resetPasswordToken: resetToken, resetPasswordExpires: resetExpires });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: 'Reset Password - ShowLeaks',
      text: `Reset Password - ShowLeaks\n\nClick the link below to reset your password:\n${resetUrl}\n\nThis link will expire in 1 hour.`,
    });

    res.json({ message: 'Password reset email sent.' });
  } catch (error) {
    console.error('Error requesting password reset:', error);
    res.status(500).json({ error: 'Failed to request password reset.' });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      where: { resetPasswordToken: token, resetPasswordExpires: { [Op.gt]: new Date() } },
    });

    if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

    const hashPassword = await bcrypt.hash(password, 10);
    await user.update({ password: hashPassword, resetPasswordToken: null, resetPasswordExpires: null });

    res.json({ message: 'Password reset successfully.' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Error resetting password.' });
  }
});

// User dashboard
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password', 'verificationToken', 'resetPasswordToken'] },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.expiredPremium && new Date(user.expiredPremium) < new Date()) {
      await user.update({ isPremium: false });
    }

    res.json(user);
  } catch (error) {
    console.error('Error in dashboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, language, country } = req.body;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await user.update({
      name: name || user.name,
      language: language || user.language,
      country: country || user.country,
    });

    res.json({
      message: 'Profile updated successfully.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        language: user.language,
        country: user.country,
      },
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Error updating profile.' });
  }
});

// Change password
router.put('/change-password', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!bcrypt.compareSync(currentPassword, user.password)) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const hashPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashPassword });

    res.json({ message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Failed to change password.' });
  }
});

// Delete account
router.delete('/account', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(400).json({ error: 'Password is incorrect' });
    }

    await user.update({
      isActive: false,
      email: `deleted_${Date.now()}_${user.email}`,
      name: 'Deleted User',
    });

    res.json({ message: 'Account deleted successfully.' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ error: 'Failed to delete account.' });
  }
});

// Upload profile photo
router.post('/upload-photo', authMiddleware, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image was sent' });

    const userId = req.user.id;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'profile_photos',
          public_id: `user_${userId}_${Date.now()}`,
          transformation: [
            { width: 200, height: 200, crop: 'fill', gravity: 'face' },
            { quality: 'auto', fetch_format: 'auto' },
          ],
        },
        (error, result) => (error ? reject(error) : resolve(result))
      ).end(req.file.buffer);
    });

    const updatedUser = await user.update({ profilePhoto: uploadResult.secure_url });

    res.json({
      message: 'Profile picture updated successfully.',
      profilePhoto: uploadResult.secure_url,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        profilePhoto: updatedUser.profilePhoto,
        isPremium: updatedUser.isPremium,
        isVerified: updatedUser.isVerified,
        language: updatedUser.language,
        country: updatedUser.country,
      },
    });
  } catch (error) {
    console.error('Error uploading photo:', error);
    res.status(500).json({ error: 'Error uploading photo.' });
  }
});

module.exports = router;
