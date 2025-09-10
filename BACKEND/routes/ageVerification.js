const express = require('express');
const router = express.Router();

// Middleware para verificar idade
const ageVerificationMiddleware = (req, res, next) => {
  const ageConfirmed = req.headers['x-age-confirmed'] || req.session?.ageConfirmed;
  
  if (!ageConfirmed || ageConfirmed !== 'true') {
    return res.status(403).json({
      error: 'Age verification required',
      message: 'You must confirm that you are 18 years or older to access this content',
      requiresAgeVerification: true
    });
  }
  
  next();
};

// Confirmar idade
router.post('/confirm', (req, res) => {
  const { confirmed } = req.body;
  
  if (!confirmed) {
    return res.status(400).json({ error: 'Age confirmation is required' });
  }
  
  // Salvar confirmação na sessão (se usando sessões)
  if (req.session) {
    req.session.ageConfirmed = true;
  }
  
  res.json({
    message: 'Age confirmed successfully',
    ageConfirmed: true,
    timestamp: new Date().toISOString()
  });
});

// Verificar status da confirmação de idade
router.get('/status', (req, res) => {
  const ageConfirmed = req.headers['x-age-confirmed'] || req.session?.ageConfirmed;
  
  res.json({
    ageConfirmed: ageConfirmed === 'true' || ageConfirmed === true,
    timestamp: new Date().toISOString()
  });
});

// Revogar confirmação de idade
router.post('/revoke', (req, res) => {
  if (req.session) {
    req.session.ageConfirmed = false;
  }
  
  res.json({
    message: 'Age confirmation revoked',
    ageConfirmed: false
  });
});

module.exports = { router, ageVerificationMiddleware };