const express = require('express');
const router = express.Router();
const authMiddleware = require('../Middleware/Auth');
const { User } = require('../models');
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
      return_url: `${process.env.FRONTEND_URL}/billing`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Erro ao criar sessão do portal de billing:', error);
    res.status(500).json({ error: 'Erro ao criar sessão do portal de billing' });
  }
});

// Cancelar assinatura
router.post('/cancel', authMiddleware, async (req, res) => {
  try {
    const { email } = req.body;
    const userEmail = req.user.email;

    // Verificar se o email corresponde ao usuário logado
    if (email !== userEmail) {
      return res.status(403).json({ error: 'Email não autorizado' });
    }

    // Buscar customer no Stripe
    const existingCustomers = await stripe.customers.list({
      email: userEmail,
      limit: 1
    });

    if (existingCustomers.data.length === 0) {
      return res.status(404).json({ error: 'Customer não encontrado' });
    }

    const customer = existingCustomers.data[0];

    // Buscar assinaturas ativas do customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 1
    });

    if (subscriptions.data.length === 0) {
      return res.status(404).json({ error: 'Nenhuma assinatura ativa encontrada' });
    }

    const subscription = subscriptions.data[0];

    // Cancelar assinatura no final do período
    await stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: true
    });

    res.json({ 
      message: 'Assinatura cancelada com sucesso',
      cancelAt: new Date(subscription.current_period_end * 1000)
    });
  } catch (error) {
    console.error('Erro ao cancelar assinatura:', error);
    res.status(500).json({ error: 'Erro ao cancelar assinatura' });
  }
});

module.exports = router;