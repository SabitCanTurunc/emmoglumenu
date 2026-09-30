const fs = require('fs');
const path = require('path');
const https = require('https');
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env' });

const downloadImage = (url, filepath) => {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        res.pipe(fs.createWriteStream(filepath))
           .on('error', reject)
           .once('close', () => resolve(filepath));
      } else {
        res.resume();
        reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));
      }
    });
  });
};

const getFileName = (url) => {
  return path.basename(url.split('?')[0]);
};

async function run() {
  const publicDir = path.join(__dirname, 'public', 'images', 'menu');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const options = { dbName: 'emmoglumenu' };
  await mongoose.connect(process.env.MONGODB_URI, options);
  
  const Category = mongoose.models.Category || mongoose.model('Category', new mongoose.Schema({ name: String, image: String }));
  const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({ title: String, image: String, category: mongoose.Schema.Types.ObjectId }));
  
  let fixedCount = 0;
  
  const processImage = async (oldUrl) => {
    if (oldUrl && (oldUrl.includes('emmoglumenu.com') || oldUrl.includes('dnspreviewer.com'))) {
      const newUrl = oldUrl.replace('emmoglumenu.com', 'stdgwd8tp3.dnspreviewer.com');
      const filename = getFileName(newUrl);
      const filepath = path.join(publicDir, filename);
      
      if (!fs.existsSync(filepath)) {
        try {
          await downloadImage(newUrl, filepath);
        } catch (e) {
          // fallback
        }
      }
      return `/images/menu/${filename}`;
    }
    return oldUrl;
  };

  const cats = await Category.find({});
  for (let cat of cats) {
    if (cat.image && cat.image.includes('emmoglumenu.com')) {
      cat.image = await processImage(cat.image);
      await cat.save();
      fixedCount++;
      console.log('Fixed category:', cat.name);
    }
  }

  const prods = await Product.find({});
  for (let prod of prods) {
    if (prod.image && prod.image.includes('emmoglumenu.com')) {
      prod.image = await processImage(prod.image);
      await prod.save();
      fixedCount++;
      // console.log('Fixed product:', prod.title);
    }
  }

  console.log(`DB fixed locally. Fixed ${fixedCount} documents.`);
  process.exit(0);
}

run();
