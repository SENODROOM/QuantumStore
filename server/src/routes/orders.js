import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { adminOnly, optionalAuth, protect } from '../middleware/auth.js';
import { validateOrderPayload } from '../utils/validate.js';
import { sendOrderEmails } from '../utils/mail.js';

const router = express.Router();

async function buildOrderFromItems(items) {
  let totalAmount = 0;
  const orderItems = [];
  const stockUpdates = [];

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) {
      const error = new Error(`Product not found: ${item.productId}`);
      error.status = 404;
      throw error;
    }
    const quantity = Number(item.quantity);
    if (product.stock < quantity) {
      const error = new Error(`Insufficient stock for ${product.name}`);
      error.status = 400;
      throw error;
    }

    orderItems.push({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.image,
    });
    totalAmount += product.price * quantity;
    stockUpdates.push({ product, quantity });
  }

  return { orderItems, totalAmount, stockUpdates };
}

async function applyStockUpdates(stockUpdates) {
  for (const { product, quantity } of stockUpdates) {
    product.stock -= quantity;
    await product.save();
  }
}

router.post('/', optionalAuth, async (req, res) => {
  try {
    const errors = validateOrderPayload(req.body);
    if (errors.length) return res.status(400).json({ message: errors.join('. ') });

    const { customerName, email, phone, address, items, paymentMethod = 'manual' } = req.body;
    const { orderItems, totalAmount, stockUpdates } = await buildOrderFromItems(items);
    await applyStockUpdates(stockUpdates);

    const order = await Order.create({
      user: req.user?.id || null,
      customerName: String(customerName).trim(),
      email: String(email).trim().toLowerCase(),
      phone: String(phone).trim(),
      address: String(address).trim(),
      items: orderItems,
      totalAmount,
      paymentMethod: paymentMethod === 'stripe' ? 'stripe' : 'manual',
      paymentStatus: paymentMethod === 'stripe' ? 'pending' : 'unpaid',
      status: 'pending',
    });

    if (order.paymentMethod === 'manual') {
      try {
        await sendOrderEmails(order);
      } catch (mailError) {
        console.warn('Order email failed:', mailError.message);
      }
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
});

router.get('/mine', protect, async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [{ user: req.user.id }, { email: req.user.email }],
    }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/stats', protect, adminOnly, async (_req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: 1 });
    const byDayMap = new Map();

    for (const order of orders) {
      const day = order.createdAt.toISOString().slice(0, 10);
      const current = byDayMap.get(day) || { day, orders: 0, revenue: 0 };
      current.orders += 1;
      current.revenue += order.totalAmount;
      byDayMap.set(day, current);
    }

    const lowStock = await Product.find({ stock: { $lte: 10 } }).sort({ stock: 1 }).limit(8);

    res.json({
      totalOrders: orders.length,
      revenue: orders.reduce((sum, order) => sum + order.totalAmount, 0),
      paidOrders: orders.filter((order) => order.paymentStatus === 'paid').length,
      byDay: Array.from(byDayMap.values()).slice(-14),
      lowStock,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const filter = {};
    if (req.query.status && req.query.status !== 'all') {
      filter.status = req.query.status;
    }
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const isOwner =
      (order.user && String(order.user) === String(req.user.id)) || order.email === req.user.email;
    const user = await User.findById(req.user.id);
    if (!isOwner && user?.role !== 'admin') {
      return res.status(403).json({ message: 'Not allowed' });
    }

    res.json(order);
  } catch (error) {
    res.status(400).json({ message: 'Invalid order id' });
  }
});

router.patch('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
