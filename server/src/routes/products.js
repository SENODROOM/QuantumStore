import express from 'express';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import { adminOnly, protect } from '../middleware/auth.js';
import { validateProductPayload } from '../utils/validate.js';

const router = express.Router();

const DEFAULT_CATEGORIES = ['Laptops', 'Phones', 'Audio', 'Accessories', 'Wearables', 'Gaming'];

async function listCategoryNames() {
  const rows = await Category.find().sort({ name: 1 });
  if (!rows.length) return DEFAULT_CATEGORIES;
  return rows.map((row) => row.name);
}

router.get('/', async (req, res) => {
  try {
    const { category, search, featured } = req.query;
    const filter = {};

    if (category && category !== 'All') filter.category = category;
    if (featured === 'true') filter.featured = true;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
      ];
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/categories', async (_req, res) => {
  try {
    res.json(await listCategoryNames());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/low-stock', protect, adminOnly, async (req, res) => {
  try {
    const threshold = Number(req.query.threshold) || 10;
    const products = await Product.find({ stock: { $lte: threshold } }).sort({ stock: 1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: 'Invalid product id' });
  }
});

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { errors, data } = validateProductPayload(req.body);
    if (errors.length) return res.status(400).json({ message: errors.join('. ') });

    const categories = await listCategoryNames();
    if (!categories.includes(data.category)) {
      return res.status(400).json({ message: `Category must be one of: ${categories.join(', ')}` });
    }

    const product = await Product.create({
      brand: 'Quantum',
      featured: false,
      ...data,
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { errors, data } = validateProductPayload(req.body, { partial: true });
    if (errors.length) return res.status(400).json({ message: errors.join('. ') });

    if (data.category) {
      const categories = await listCategoryNames();
      if (!categories.includes(data.category)) {
        return res.status(400).json({ message: `Category must be one of: ${categories.join(', ')}` });
      }
    }

    const product = await Product.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
