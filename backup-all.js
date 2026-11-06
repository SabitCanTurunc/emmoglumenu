/**
 * Yedekleme Scripti — MongoDB + Cloudinary Görselleri
 *
 * Kullanım:  node backup-all.js
 *
 * Çıktı:
 *   backup/2026-11-06/db/categories.json
 *   backup/2026-11-06/db/products.json
 *   backup/2026-11-06/images/categories/...
 *   backup/2026-11-06/images/products/...
 *   backup/2026-11-06/images/static/...   (public/images kopyası)
 */

const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
require('dotenv').config({ path: '.env' });

// ─── Config ─────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MONGODB_URI = process.env.MONGODB_URI;
const BACKUP_DIR = path.join(__dirname, 'backup', '2026-11-06');

// ─── Mongoose Schemas ───────────────────────────────────
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

// ─── Helpers ────────────────────────────────────────────
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(destPath);
    proto.get(url, (response) => {
      // Follow redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        file.close();
        fs.unlinkSync(destPath);
        return downloadFile(response.headers.location, destPath).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(destPath);
        return reject(new Error(`HTTP ${response.statusCode} for ${url}`));
      }
      response.pipe(file);
      file.on('finish', () => { file.close(); resolve(destPath); });
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
      reject(err);
    });
  });
}

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

async function listCloudinaryFolder(folder) {
  const resources = [];
  let nextCursor = undefined;
  do {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: folder,
      max_results: 500,
      next_cursor: nextCursor,
    });
    resources.push(...result.resources);
    nextCursor = result.next_cursor;
  } while (nextCursor);
  return resources;
}

// ─── Main ───────────────────────────────────────────────
async function main() {
  console.log('=== YEDEKLEME BAŞLIYOR ===\n');

  // 1. MongoDB Yedeği
  console.log('📦 MongoDB\'ye bağlanılıyor...');
  await mongoose.connect(MONGODB_URI, { dbName: 'emmoglumenu' });
  const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
  const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

  const categories = await Category.find({}).lean();
  const products = await Product.find({}).lean();

  const dbDir = path.join(BACKUP_DIR, 'db');
  fs.mkdirSync(dbDir, { recursive: true });

  fs.writeFileSync(
    path.join(dbDir, 'categories.json'),
    JSON.stringify(categories, null, 2),
    'utf8'
  );
  fs.writeFileSync(
    path.join(dbDir, 'products.json'),
    JSON.stringify(products, null, 2),
    'utf8'
  );

  console.log(`✅ MongoDB yedeği alındı:`);
  console.log(`   - ${categories.length} kategori → backup/2026-11-06/db/categories.json`);
  console.log(`   - ${products.length} ürün → backup/2026-11-06/db/products.json`);

  // Cloudinary URL'lerini DB'den topla
  const cloudinaryUrls = new Map(); // url -> { type, id }
  for (const cat of categories) {
    if (cat.image && cat.image.includes('cloudinary')) {
      cloudinaryUrls.set(cat.image, { type: 'categories', id: String(cat._id), name: cat.name });
    }
  }
  for (const prod of products) {
    if (prod.image && prod.image.includes('cloudinary')) {
      cloudinaryUrls.set(prod.image, { type: 'products', id: String(prod._id), name: prod.title });
    }
  }

  await mongoose.disconnect();
  console.log(`\n📷 Cloudinary\'de ${cloudinaryUrls.size} görsel bulundu (DB\'den)\n`);

  // 2. Cloudinary Görselleri İndirme
  if (cloudinaryUrls.size > 0) {
    console.log('📥 Cloudinary görselleri indiriliyor...');
    let downloaded = 0;
    let failed = 0;

    for (const [url, info] of cloudinaryUrls) {
      try {
        const ext = path.extname(new URL(url).pathname) || '.jpg';
        const filename = `${info.id}${ext}`;
        const destDir = path.join(BACKUP_DIR, 'images', info.type);
        fs.mkdirSync(destDir, { recursive: true });
        const destPath = path.join(destDir, filename);

        await downloadFile(url, destPath);
        downloaded++;
        console.log(`   ✅ [${downloaded}/${cloudinaryUrls.size}] ${info.name} → ${info.type}/${filename}`);
      } catch (err) {
        failed++;
        console.error(`   ❌ ${info.name}: ${err.message}`);
      }
    }

    console.log(`\n📊 Cloudinary indirme sonucu: ${downloaded} başarılı, ${failed} başarısız`);
  }

  // 3. Cloudinary API ile ek görselleri de kontrol et (DB'de referansı kalmamış olabilir)
  console.log('\n🔍 Cloudinary API ile tüm klasörler taranıyor...');
  try {
    const allResources = await listCloudinaryFolder('emmoglumenu');
    const extraResources = allResources.filter(r => !cloudinaryUrls.has(r.secure_url));

    if (extraResources.length > 0) {
      console.log(`   ℹ️  DB\'de referansı olmayan ${extraResources.length} ek görsel bulundu, indiriliyor...`);
      let extraDownloaded = 0;
      for (const resource of extraResources) {
        try {
          const urlParts = resource.public_id.split('/');
          const subType = urlParts.includes('categories') ? 'categories' : 'products';
          const filename = urlParts[urlParts.length - 1] + '.' + resource.format;
          const destDir = path.join(BACKUP_DIR, 'images', subType);
          fs.mkdirSync(destDir, { recursive: true });
          const destPath = path.join(destDir, filename);

          if (!fs.existsSync(destPath)) {
            await downloadFile(resource.secure_url, destPath);
            extraDownloaded++;
            console.log(`   ✅ [ekstra] ${resource.public_id}.${resource.format}`);
          }
        } catch (err) {
          console.error(`   ❌ ${resource.public_id}: ${err.message}`);
        }
      }
      console.log(`   📊 Ekstra: ${extraDownloaded} ek görsel indirildi`);
    } else {
      console.log('   ✅ Tüm Cloudinary görselleri DB\'de mevcut, ekstra yok.');
    }
  } catch (err) {
    console.error('   ⚠️ Cloudinary API taraması başarısız:', err.message);
    console.error('   (DB\'deki görseller zaten indirildi, sadece ek tarama atlandı)');
  }

  // 4. Statik görselleri kopyala
  console.log('\n📂 Statik görseller kopyalanıyor (public/images)...');
  const staticSrc = path.join(__dirname, 'public', 'images');
  const staticDest = path.join(BACKUP_DIR, 'images', 'static');
  copyDirRecursive(staticSrc, staticDest);

  const staticCount = fs.readdirSync(staticDest, { recursive: true })
    .filter(f => !fs.statSync(path.join(staticDest, f)).isDirectory()).length;
  console.log(`✅ ${staticCount} statik dosya kopyalandı`);

  // 5. Özet
  const totalSize = getTotalSize(BACKUP_DIR);
  console.log('\n' + '='.repeat(50));
  console.log('✅ YEDEKLEME TAMAMLANDI!');
  console.log('='.repeat(50));
  console.log(`📁 Konum: backup/2026-11-06/`);
  console.log(`💾 Toplam boyut: ${(totalSize / 1024 / 1024).toFixed(1)} MB`);
  console.log(`\n📋 İçerik:`);
  console.log(`   db/categories.json    — ${categories.length} kategori`);
  console.log(`   db/products.json      — ${products.length} ürün`);
  console.log(`   images/categories/    — Cloudinary kategori görselleri`);
  console.log(`   images/products/      — Cloudinary ürün görselleri`);
  console.log(`   images/static/        — Statik görseller (public/images)`);
}

function getTotalSize(dirPath) {
  let total = 0;
  if (!fs.existsSync(dirPath)) return 0;
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      total += getTotalSize(fullPath);
    } else {
      total += fs.statSync(fullPath).size;
    }
  }
  return total;
}

main().catch(err => {
  console.error('❌ Yedekleme hatası:', err);
  process.exit(1);
});
