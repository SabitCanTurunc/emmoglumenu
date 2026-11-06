/**
 * Cloudflare R2'ye Görselleri Yükleme ve MongoDB URL'lerini Güncelleme Scripti
 *
 * Kullanım: node migrate-to-r2.js
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config({ path: '.env' });

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME;
const PUBLIC_URL = process.env.R2_PUBLIC_URL.replace(/\/$/, '');
const BACKUP_DIR = path.join(__dirname, 'backup', '2026-11-06', 'images');

const MIME_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};

const CategorySchema = new mongoose.Schema({
  name: String,
  order: Number,
  image: String,
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const ProductSchema = new mongoose.Schema({
  title: String,
  price: String,
  description: String,
  image: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  order: Number,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

async function uploadToR2(filePath, key) {
  const fileContent = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: fileContent,
      ContentType: contentType,
    })
  );

  return `${PUBLIC_URL}/${key}`;
}

async function main() {
  console.log('=== CLOUDFLARE R2 MİGRASYONU BAŞLIYOR ===\n');

  console.log('📦 MongoDB bağlanılıyor...');
  await mongoose.connect(process.env.MONGODB_URI, { dbName: 'emmoglumenu' });
  const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
  const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

  // 1. Kategoriler
  const categoriesDir = path.join(BACKUP_DIR, 'categories');
  if (fs.existsSync(categoriesDir)) {
    const catFiles = fs.readdirSync(categoriesDir).filter(f => !f.startsWith('.'));
    console.log(`\n📂 Kategoriler yükleniyor (${catFiles.length} adet)...`);

    for (let i = 0; i < catFiles.length; i++) {
      const filename = catFiles[i];
      const filePath = path.join(categoriesDir, filename);
      const id = path.parse(filename).name;
      const key = `categories/${filename}`;

      try {
        const publicUrl = await uploadToR2(filePath, key);
        await Category.findByIdAndUpdate(id, { image: publicUrl });
        console.log(`  [${i + 1}/${catFiles.length}] Kategori: ${filename} -> ${publicUrl}`);
      } catch (err) {
        console.error(`  ❌ Hata (${filename}):`, err.message);
      }
    }
  }

  // 2. Ürünler
  const productsDir = path.join(BACKUP_DIR, 'products');
  if (fs.existsSync(productsDir)) {
    const prodFiles = fs.readdirSync(productsDir).filter(f => !f.startsWith('.'));
    console.log(`\n📂 Ürünler yükleniyor (${prodFiles.length} adet)...`);

    for (let i = 0; i < prodFiles.length; i++) {
      const filename = prodFiles[i];
      const filePath = path.join(productsDir, filename);
      const id = path.parse(filename).name;
      const key = `products/${filename}`;

      try {
        const publicUrl = await uploadToR2(filePath, key);
        await Product.findByIdAndUpdate(id, { image: publicUrl });
        if ((i + 1) % 20 === 0 || i + 1 === prodFiles.length) {
          console.log(`  [${i + 1}/${prodFiles.length}] Ürünler yükleniyor... Son: ${filename} -> ${publicUrl}`);
        }
      } catch (err) {
        console.error(`  ❌ Hata (${filename}):`, err.message);
      }
    }
  }

  await mongoose.disconnect();
  console.log('\n========================================');
  console.log('✅ R2 YÜKLEME VE DB GÜNCELLEME TAMAMLANDI!');
  console.log('========================================');
}

main().catch(err => {
  console.error('❌ Hata:', err);
  process.exit(1);
});

