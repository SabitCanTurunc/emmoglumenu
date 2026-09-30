const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

const MONGODB_URI = process.env.MONGODB_URI;

// Definitions
const CategorySchema = new mongoose.Schema({
  name: String,
  order: Number,
  image: String,
  isActive: { type: Boolean, default: true },
});

const ProductSchema = new mongoose.Schema({
  title: String,
  price: Number,
  description: String,
  image: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  order: Number,
  isActive: { type: Boolean, default: true },
});

async function run() {
  await mongoose.connect(MONGODB_URI);
  const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
  const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

  const categories = await Category.find({});
  let found = 0;
  for (const cat of categories) {
    if (cat.image && (cat.image.includes('emmoglumenu.com') || cat.image.includes('dnspreviewer'))) {
      console.log(`Cat image: ${cat.image}`);
      found++;
    }
  }

  const products = await Product.find({});
  for (const prod of products) {
    if (prod.image && (prod.image.includes('emmoglumenu.com') || prod.image.includes('dnspreviewer'))) {
      console.log(`Prod image: ${prod.image}`);
      found++;
    }
  }

  console.log(`Found ${found} bad images`);
  process.exit(0);
}

run();
