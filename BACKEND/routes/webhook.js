const express = require('express');
const router = express.Router();
const { User } = require('../models');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

router.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.sendStatus(400);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const email = session.customer_email; // presente no checkout
        if (!email) break;

        const user = await User.findOne({ where: { email } });
        if (!user) break;

        const now = new Date();
        const base = (user.expiredPremium && user.expiredPremium > now) ? new Date(user.expiredPremium) : now;
        base.setDate(base.getDate() + 30);

        await user.update({ isPremium: true, expiredPremium: base });
        console.log(`Premium ativado para ${email} até ${base.toISOString()}`);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object;
        const customerId = invoice.customer; // cus_...
        if (!customerId) break;

        // Obter e-mail do cliente
        const customer = await stripe.customers.retrieve(customerId);
        const email = customer?.email;
        if (!email) break;

        const user = await User.findOne({ where: { email } });
        if (!user) break;

        // Renovação: somar +30 dias a partir do maior entre agora e a data atual de expiração
        const now = new Date();
        const base = (user.expiredPremium && user.expiredPremium > now) ? new Date(user.expiredPremium) : now;
        base.setDate(base.getDate() + 30);

        await user.update({ isPremium: true, expiredPremium: base });
        console.log(`Renovação registrada para ${email}. Nova expiração: ${base.toISOString()}`);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        if (!customerId) break;

        const customer = await stripe.customers.retrieve(customerId);
        const email = customer?.email;
        if (!email) break;

        const user = await User.findOne({ where: { email } });
        if (!user) break;

        // Cancelamento: remover premium. Opcionalmente zerar expiração.
        const now = new Date();
        await user.update({ isPremium: false, expiredPremium: now });
        console.log(`Assinatura cancelada para ${email}. Premium desativado.`);
        break;
      }

      default:
        // eventos não tratados
        break;
    }

    return res.sendStatus(200);
  } catch (err) {
    console.error('Erro interno ao processar webhook:', err.message, err.stack);
    return res.sendStatus(500);
  }
});

module.exports = router;
