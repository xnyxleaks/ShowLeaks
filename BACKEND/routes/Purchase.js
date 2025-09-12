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

        const prices = {
            monthly: process.env.STRIPE_PRICEID_MONTHLY,
        };

const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  customer_email: email,
  line_items: [
    {
      price: prices,
      quantity: 1,
    },
  ],
  mode: 'payment',
  success_url: `${process.env.FRONTEND_URL}/success`,
  cancel_url: `${process.env.FRONTEND_URL}/cancel`,
});

          

        res.json({ url: session.url });

        if(success_url){
          const updatePremium =  await User.findOne({ where: { email } });
        }

      } catch (error) {
        console.error('Erro ao criar sessão de checkout:', error.message, error.stack);
        res.status(500).json({ error: 'Erro ao criar sessão de checkout' });
    }
});

module.exports = router;
