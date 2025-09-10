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

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const email = session.customer_email;

    try {
      const user = await User.findOne({ where: { email } });

      if (user) {
        const currentDate = new Date();
        const newDate = user.expiredPremium && user.expiredPremium > currentDate
          ? new Date(user.expiredPremium)
          : currentDate;
        newDate.setDate(newDate.getDate() + 30);

        await user.update({
          isPremium: true,
          expiredPremium: newDate,
        });

        console.log(`Usuário ${email} atualizado com premium até: ${newDate}`);
      }
    } catch (err) {
      console.error('Erro ao atualizar usuário após pagamento:', err.message);
    }
  }

  res.sendStatus(200);
});

module.exports = router;
