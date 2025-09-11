const express = require('express');
const router = express.Router();
const authMiddleware = require('../Middleware/Auth');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Criar sessão do portal de billing
router.post('/portal', authMiddleware, async (req, res) => {
  try {
    const { email } = req.body;
    const userEmail = req.user.email;

    // Verificar se o email corresponde ao usuário logado
    if (email !== userEmail) {
      return res.status(403).json({ error: 'Email não autorizado' });
    }

    // Buscar ou criar customer no Stripe
    let customer;
    const existingCustomers = await stripe.customers.list({
      email: userEmail,
      limit: 1
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      // Criar novo customer se não existir
      customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          userId: req.user.id.toString()
        }
      });
    }

    // Criar sessão do portal de billing
    const session = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: `${process.env.FRONTEND_URL}/#/billing`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Erro ao criar sessão do portal de billing:', error);
    res.status(500).json({ error: 'Erro ao criar sessão do portal de billing' });
  }
});

module.exports = router;