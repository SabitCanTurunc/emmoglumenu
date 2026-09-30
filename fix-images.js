const fs = require('fs');
const path = require('path');
const https = require('https');
const cloudinary = require('cloudinary').v2;
const mongoose = require('mongoose');

require('dotenv').config({ path: '.env' });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const MONGODB_URI = process.env.MONGODB_URI;

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

const uploadToCloudinary = async (url) => {
  try {
    const result = await cloudinary.uploader.upload(url, {
      folder: 'emmoglu'
    });
    return result.secure_url;
  } catch (error) {
    console.error(`Error uploading ${url}:`, error);
    return null;
  }
};

const getNewDomainUrl = (oldUrl) => {
  if (!oldUrl) return null;
  return oldUrl.replace('emmoglumenu.com', 'stdgwd8tp3.dnspreviewer.com');
};

async function processLocalFiles() {
  const publicImagesDir = path.join(__dirname, 'public', 'images');
  if (!fs.existsSync(publicImagesDir)) {
    fs.mkdirSync(publicImagesDir, { recursive: true });
  }

  // 1. Process specific structural images to download locally
  const structuralImages = [
    'https://stdgwd8tp3.dnspreviewer.com/wp-content/uploads/2026/04/cropped-emmoglu-1.png',
    'https://stdgwd8tp3.dnspreviewer.com/wp-content/uploads/2026/04/emmoglu.png',
    'https://stdgwd8tp3.dnspreviewer.com/wp-content/uploads/2022/03/hgt-logo-80px-beyaz.png',
    'https://stdgwd8tp3.dnspreviewer.com/wp-content/uploads/2019/06/icon.png',
    'https://stdgwd8tp3.dnspreviewer.com/wp-content/uploads/2026/04/1banner-yatay-2-bannerPic-8.jpg'
  ];

  for (const url of structuralImages) {
    const filename = path.basename(url);
    const filepath = path.join(publicImagesDir, filename);
    if (!fs.existsSync(filepath)) {
      console.log(`Downloading ${filename} locally...`);
      try {
        await downloadImage(url, filepath);
      } catch (e) {
        console.error(`Failed to download ${url}`, e);
      }
    }
  }

  // 2. Process Gallery JSON
  const galleryPath = path.join(__dirname, 'src', 'data', 'gallery.json');
  if (fs.existsSync(galleryPath)) {
    console.log('Processing gallery.json...');
    const galleryData = JSON.parse(fs.readFileSync(galleryPath, 'utf8'));
    const newGalleryData = [];
    for (let url of galleryData) {
      if (url.includes('emmoglumenu.com')) {
        const newUrl = getNewDomainUrl(url);
        console.log(`Uploading gallery image to Cloudinary: ${newUrl}`);
        const cloudUrl = await uploadToCloudinary(newUrl);
        newGalleryData.push(cloudUrl || url);
      } else {
        newGalleryData.push(url);
      }
    }
    fs.writeFileSync(galleryPath, JSON.stringify(newGalleryData, null, 2));
  }

  // 3. Process Menu JSON (for future migrations)
  const menuPath = path.join(__dirname, 'src', 'data', 'menu.json');
  if (fs.existsSync(menuPath)) {
    console.log('Processing menu.json...');
    const menuData = JSON.parse(fs.readFileSync(menuPath, 'utf8'));
    for (const cat of menuData) {
      if (cat.image && cat.image.includes('emmoglumenu.com')) {
        const newUrl = getNewDomainUrl(cat.image);
        console.log(`Uploading menu category image to Cloudinary: ${newUrl}`);
        const cloudUrl = await uploadToCloudinary(newUrl);
        if (cloudUrl) cat.image = cloudUrl;
      }
      for (const item of cat.items) {
        if (item.image && item.image.includes('emmoglumenu.com')) {
          const newUrl = getNewDomainUrl(item.image);
          console.log(`Uploading menu item image to Cloudinary: ${newUrl}`);
          const cloudUrl = await uploadToCloudinary(newUrl);
          if (cloudUrl) item.image = cloudUrl;
        }
      }
    }
    fs.writeFileSync(menuPath, JSON.stringify(menuData, null, 2));
  }
}

async function run() {
  await processLocalFiles();
  console.log('Local files done.');
}

run();
