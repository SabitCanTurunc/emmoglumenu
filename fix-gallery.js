const fs = require('fs');
const path = require('path');
const https = require('https');
const cloudinary = require('cloudinary').v2;

require('dotenv').config({ path: '.env' });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

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

const uploadToCloudinary = async (filepath) => {
  try {
    const result = await cloudinary.uploader.upload(filepath, { folder: 'emmoglu' });
    return result.secure_url;
  } catch (error) {
    console.error(`Error uploading ${filepath}:`, error.message);
    return null;
  }
};

async function run() {
  const galleryPath = path.join(__dirname, 'src', 'data', 'gallery.json');
  const galleryData = JSON.parse(fs.readFileSync(galleryPath, 'utf8'));
  const newGalleryData = [];

  for (let oldUrl of galleryData) {
    if (oldUrl.includes('emmoglumenu.com')) {
      const newUrl = oldUrl.replace('emmoglumenu.com', 'stdgwd8tp3.dnspreviewer.com');
      const filename = path.basename(newUrl);
      const tempPath = path.join(__dirname, filename);
      
      console.log(`Downloading ${newUrl}`);
      try {
        await downloadImage(newUrl, tempPath);
        console.log(`Uploading ${filename} to Cloudinary`);
        const cloudUrl = await uploadToCloudinary(tempPath);
        newGalleryData.push(cloudUrl || newUrl);
        fs.unlinkSync(tempPath); // cleanup
      } catch (e) {
        console.error(e);
        newGalleryData.push(newUrl);
      }
    } else {
      newGalleryData.push(oldUrl);
    }
  }

  fs.writeFileSync(galleryPath, JSON.stringify(newGalleryData, null, 2));
  console.log('Gallery fixed.');
}

run();
