const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
require('dotenv').config({ path: '.env' });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

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

const uploadToCloudinary = async (url) => {
  try {
    const result = await cloudinary.uploader.upload(url, { folder: 'emmoglu' });
    return result.secure_url;
  } catch (error) {
    console.error(`Error uploading ${url}:`, error.message);
    return null;
  }
};

const getNewDomainUrl = (oldUrl) => {
  if (!oldUrl) return null;
  return oldUrl.replace('emmoglumenu.com', 'stdgwd8tp3.dnspreviewer.com');
};

async function run() {
  await mongoose.connect(MONGODB_URI);
  const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
  const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

  const categories = await Category.find({});
  for (const cat of categories) {
    if (cat.image && cat.image.includes('emmoglumenu.com')) {
      const newUrl = getNewDomainUrl(cat.image);
      console.log(`Uploading cat image ${newUrl}`);
      const cloudUrl = await uploadToCloudinary(newUrl);
      if (cloudUrl) {
        cat.image = cloudUrl;
        await cat.save();
      }
    }
  }

  const products = await Product.find({});
  for (const prod of products) {
    if (prod.image && prod.image.includes('emmoglumenu.com')) {
      const newUrl = getNewDomainUrl(prod.image);
      console.log(`Uploading prod image ${newUrl}`);
      const cloudUrl = await uploadToCloudinary(newUrl);
      if (cloudUrl) {
        prod.image = cloudUrl;
        await prod.save();
      }
    }
  }

  console.log('DB Migration done.');
  process.exit(0);
}

run();
