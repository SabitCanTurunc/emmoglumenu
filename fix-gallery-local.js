const fs = require('fs');
const path = require('path');
const https = require('https');

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

async function run() {
  const publicDir = path.join(__dirname, 'public', 'images', 'gallery');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const galleryPath = path.join(__dirname, 'src', 'data', 'gallery.json');
  const galleryData = JSON.parse(fs.readFileSync(galleryPath, 'utf8'));
  const newGalleryData = [];

  for (let oldUrl of galleryData) {
    if (oldUrl.includes('emmoglumenu.com') || oldUrl.includes('dnspreviewer.com')) {
      const newUrl = oldUrl.replace('emmoglumenu.com', 'stdgwd8tp3.dnspreviewer.com');
      const filename = path.basename(newUrl);
      const filepath = path.join(publicDir, filename);
      
      console.log(`Downloading ${newUrl}`);
      try {
        await downloadImage(newUrl, filepath);
        newGalleryData.push(`/images/gallery/${filename}`);
      } catch (e) {
        console.error(e);
        newGalleryData.push(`/images/gallery/${filename}`); // fallback
      }
    } else {
      newGalleryData.push(oldUrl);
    }
  }

  fs.writeFileSync(galleryPath, JSON.stringify(newGalleryData, null, 2));
  console.log('Gallery fixed locally.');
}

run();
