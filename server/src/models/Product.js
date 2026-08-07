import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      required: true,
      enum: ['Laptops', 'Phones', 'Audio', 'Accessories', 'Wearables', 'Gaming'],
    },
    stock: { type: Number, required: true, min: 0, default: 0 },
    image: { type: String, required: true },
    featured: { type: Boolean, default: false },
    brand: { type: String, default: 'Quantum' },
  },
  { timestamps: true }
);

export default mongoose.model('Product', productSchema);
