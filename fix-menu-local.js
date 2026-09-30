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

const getFileName = (url) => {
  return path.basename(url.split('?')[0]);
};

async function run() {
  const publicDir = path.join(__dirname, 'public', 'images', 'menu');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const menuPath = path.join(__dirname, 'src', 'data', 'menu.json');
  const menuData = JSON.parse(fs.readFileSync(menuPath, 'utf8'));

  let downloadedCount = 0;
  
  const processImage = async (oldUrl) => {
    if (oldUrl && (oldUrl.includes('emmoglumenu.com') || oldUrl.includes('dnspreviewer.com'))) {
      const newUrl = oldUrl.replace('emmoglumenu.com', 'stdgwd8tp3.dnspreviewer.com');
      const filename = getFileName(newUrl);
      const filepath = path.join(publicDir, filename);
      
      if (!fs.existsSync(filepath)) {
        try {
          await downloadImage(newUrl, filepath);
          downloadedCount++;
        } catch (e) {
          // fallback
        }
      }
      return `/images/menu/${filename}`;
    }
    return oldUrl;
  };

  for (let cat of menuData) {
    cat.image = await processImage(cat.image);
    for (let item of cat.items) {
      item.image = await processImage(item.image);
    }
  }

  fs.writeFileSync(menuPath, JSON.stringify(menuData, null, 2));
  console.log(`Menu fixed locally. Downloaded ${downloadedCount} new images.`);
}

run();
