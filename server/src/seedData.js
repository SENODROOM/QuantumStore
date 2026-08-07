import User from './models/User.js';
import Product from './models/Product.js';
import Category from './models/Category.js';

export const sampleProducts = [
  {
    name: 'QuantumBook Pro 14',
    description:
      'Ultralight aluminum laptop with a 120Hz OLED panel, 32GB unified memory, and all-day battery for creators on the move.',
    price: 1499,
    category: 'Laptops',
    stock: 18,
    image:
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80',
    featured: true,
    brand: 'Quantum',
  },
  {
    name: 'Pulse Phone X',
    description:
      'Flagship smartphone with adaptive 6.7" display, dual-camera system, and titanium frame built for everyday speed.',
    price: 999,
    category: 'Phones',
    stock: 40,
    image:
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80',
    featured: true,
    brand: 'Pulse',
  },
  {
    name: 'Aether ANC Headphones',
    description:
      'Over-ear wireless headphones with adaptive noise canceling, spatial audio, and 40 hours of playtime.',
    price: 279,
    category: 'Audio',
    stock: 55,
    image:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
    featured: true,
    brand: 'Aether',
  },
  {
    name: 'Orbit Smartwatch S',
    description:
      'Fitness-focused smartwatch with bright always-on display, GPS, and week-long battery life.',
    price: 349,
    category: 'Wearables',
    stock: 32,
    image:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80',
    featured: true,
    brand: 'Orbit',
  },
  {
    name: 'Nova Mechanical Keyboard',
    description:
      'Hot-swappable mechanical keyboard with soft tactile switches, aluminum plate, and per-key RGB.',
    price: 159,
    category: 'Accessories',
    stock: 70,
    image:
      'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=1200&q=80',
    featured: false,
    brand: 'Nova',
  },
  {
    name: 'Vortex Gaming Mouse',
    description:
      'Lightweight wireless gaming mouse with 26K sensor, customizable grips, and 80-hour battery.',
    price: 89,
    category: 'Gaming',
    stock: 90,
    image:
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1200&q=80',
    featured: false,
    brand: 'Vortex',
  },
  {
    name: 'QuantumBook Air 13',
    description:
      'Everyday performance laptop with fanless design, vivid IPS display, and instant wake.',
    price: 1099,
    category: 'Laptops',
    stock: 25,
    image:
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=80',
    featured: false,
    brand: 'Quantum',
  },
  {
    name: 'Echo Buds Mini',
    description:
      'Compact true wireless earbuds with clear calls, IPX5 rating, and wireless charging case.',
    price: 129,
    category: 'Audio',
    stock: 120,
    image:
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1200&q=80',
    featured: false,
    brand: 'Echo',
  },
];

export async function ensureSeedData({ reset = false } = {}) {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@quaantumlogicslimited.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (reset) {
    await User.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});
  }

  const defaultCategories = ['Laptops', 'Phones', 'Audio', 'Accessories', 'Wearables', 'Gaming'];
  for (const name of defaultCategories) {
    await Category.updateOne({ name }, { name }, { upsert: true });
  }

  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    // Migrate legacy demo admin email if present
    const legacy = await User.findOne({ email: 'admin@quantumstore.com', role: 'admin' });
    if (legacy) {
      legacy.email = adminEmail;
      legacy.name = 'Quantum Logics Limited Admin';
      legacy.password = adminPassword;
      await legacy.save();
      admin = legacy;
    } else {
      admin = await User.create({
        name: 'Quantum Logics Limited Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
      });
    }
  }

  const productCountAfter = await Product.countDocuments();
  if (reset || productCountAfter === 0) {
    await Product.insertMany(sampleProducts);
  }
}
