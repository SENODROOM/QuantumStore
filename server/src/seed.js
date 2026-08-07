import 'dotenv/config';
import { connectDB } from './config/db.js';
import { ensureSeedData } from './seedData.js';

async function seed() {
  await connectDB(process.env.MONGODB_URI);
  await ensureSeedData({ reset: true });

  console.log('Seed complete');
  console.log(`Admin: ${process.env.ADMIN_EMAIL || 'admin@quaantumlogicslimited.com'}`);
  console.log(`Password: ${process.env.ADMIN_PASSWORD || 'admin123'}`);
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
