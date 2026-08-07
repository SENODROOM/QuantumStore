import express from 'express';
import Stripe from 'stripe';
import Order from '../models/Order.js';
import { sendOrderEmails } from '../utils/mail.js';

const router = express.Router();

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

router.get('/config', (_req, res) => {
  res.json({
    stripeEnabled: Boolean(process.env.STRIPE_SECRET_KEY),
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
  });
});

router.post('/create-checkout-session', async (req, res) => {
  try {
    const stripe = getStripe();
    if (!stripe) {
      return res.status(400).json({ message: 'Stripe is not configured. Use manual checkout.' });
    }

    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Order already paid' });
    }

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: order.email,
      line_items: order.items.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: 'usd',
          unit_amount: Math.round(item.price * 100),
          product_data: {
            name: item.name,
            images: item.image?.startsWith('http') ? [item.image] : [],
          },
        },
      })),
      success_url: `${clientUrl}/order-success?orderId=${order._id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/checkout?canceled=1`,
      metadata: { orderId: String(order._id) },
    });

    order.paymentMethod = 'stripe';
    order.paymentStatus = 'pending';
    order.stripeSessionId = session.id;
    await order.save();

    res.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/confirm-session', async (req, res) => {
  try {
    const stripe = getStripe();
    if (!stripe) return res.status(400).json({ message: 'Stripe is not configured' });

    const { sessionId, orderId } = req.body;
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const order = await Order.findById(orderId || session.metadata?.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (session.payment_status === 'paid') {
      const wasUnpaid = order.paymentStatus !== 'paid';
      order.paymentStatus = 'paid';
      order.status = order.status === 'pending' ? 'confirmed' : order.status;
      order.stripeSessionId = session.id;
      await order.save();

      if (wasUnpaid) {
        try {
          await sendOrderEmails(order);
        } catch (mailError) {
          console.warn('Order email failed:', mailError.message);
        }
      }
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export async function stripeWebhookHandler(req, res) {
  const stripe = getStripe();
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(400).send('Webhook not configured');
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const order = await Order.findById(session.metadata?.orderId);
    if (order && order.paymentStatus !== 'paid') {
      order.paymentStatus = 'paid';
      order.status = 'confirmed';
      order.stripeSessionId = session.id;
      await order.save();
      try {
        await sendOrderEmails(order);
      } catch (mailError) {
        console.warn('Order email failed:', mailError.message);
      }
    }
  }

  res.json({ received: true });
}

export default router;
