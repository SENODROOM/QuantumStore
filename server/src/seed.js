import 'dotenv/config';
import { connectDB } from './config/db.js';
import User from './models/User.js';
import Product from './models/Product.js';

const products = [
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

async function seed() {
  await connectDB(process.env.MONGODB_URI);

  await User.deleteMany({});
  await Product.deleteMany({});

  await User.create({
    name: 'Store Admin',
    email: process.env.ADMIN_EMAIL || 'admin@quantumstore.com',
    password: process.env.ADMIN_PASSWORD || 'admin123',
    role: 'admin',
  });

  await Product.insertMany(products);

  console.log('Seed complete');
  console.log(`Admin: ${process.env.ADMIN_EMAIL || 'admin@quantumstore.com'}`);
  console.log(`Password: ${process.env.ADMIN_PASSWORD || 'admin123'}`);
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
