const express = require('express');
const router = express.Router();
const authMiddleware = require('../Middleware/Auth');
const { User } = require('../models'); 
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.post('/', authMiddleware, async (req, res) => {
  const email = req.user.email;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(403).json({ error: 'Este e-mail não está autorizado para pagamento.' });
    }

    // price_id deve ser uma string do tipo "price_..."
    const priceId = process.env.STRIPE_PRICEID_MONTHLY;

    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
    });

    return res.json({ url: session.url });
  } catch (error) {
    console.error('Erro ao criar sessão de checkout:', error.message, error.stack);
    return res.status(500).json({ error: 'Erro ao criar sessão de checkout' });
  }
});

module.exports = router;
