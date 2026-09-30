const fs = require('fs');
const path = require('path');
const https = require('https');

const structuralImages = [
  'https://stdgwd8tp3.dnspreviewer.com/wp-content/uploads/2026/04/cropped-emmoglu-1.png',
  'https://stdgwd8tp3.dnspreviewer.com/wp-content/uploads/2026/04/emmoglu.png',
  'https://stdgwd8tp3.dnspreviewer.com/wp-content/uploads/2022/03/hgt-logo-80px-beyaz.png',
  'https://stdgwd8tp3.dnspreviewer.com/wp-content/uploads/2019/06/icon.png',
  'https://stdgwd8tp3.dnspreviewer.com/wp-content/uploads/2026/04/1banner-yatay-2-bannerPic-8.jpg',
  'https://stdgwd8tp3.dnspreviewer.com/wp-content/uploads/2026/04/4-0902-1024x1024.jpg'
];

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

const replaceInFile = (filePath, replacements) => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    for (const { oldUrl, newUrl } of replacements) {
      if (content.includes(oldUrl)) {
        content = content.replaceAll(oldUrl, newUrl);
        changed = true;
      }
    }
    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  }
};

async function run() {
  const publicImagesDir = path.join(__dirname, 'public', 'images');
  if (!fs.existsSync(publicImagesDir)) {
    fs.mkdirSync(publicImagesDir, { recursive: true });
  }

  // Download all structural images
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

  // Replacements list
  const replacements = [
    { oldUrl: 'https://emmoglumenu.com/wp-content/uploads/2026/04/emmoglu.png', newUrl: '/images/emmoglu.png' },
    { oldUrl: 'https://emmoglumenu.com/wp-content/uploads/2026/04/cropped-emmoglu-1.png', newUrl: '/images/cropped-emmoglu-1.png' },
    { oldUrl: 'https://emmoglumenu.com/wp-content/uploads/2022/03/hgt-logo-80px-beyaz.png', newUrl: '/images/hgt-logo-80px-beyaz.png' },
    { oldUrl: 'https://emmoglumenu.com/wp-content/uploads/2019/06/icon.png', newUrl: '/images/icon.png' },
    { oldUrl: 'https://emmoglumenu.com/wp-content/uploads/2026/04/1banner-yatay-2-bannerPic-8.jpg', newUrl: '/images/1banner-yatay-2-bannerPic-8.jpg' },
    { oldUrl: 'https://emmoglumenu.com/wp-content/uploads/2026/04/4-0902-1024x1024.jpg', newUrl: '/images/4-0902-1024x1024.jpg' }
  ];

  // Files to replace
  const filesToUpdate = [
    'src/components/Header.tsx',
    'src/components/Footer.tsx',
    'src/app/iletisim/page.tsx',
    'src/app/galeri/page.tsx',
    'src/app/menu/page.tsx',
    'src/components/home/Hero.tsx',
    'src/components/home/Testimonials.tsx',
    'src/components/home/ContactInfo.tsx'
  ];

  for (const file of filesToUpdate) {
    replaceInFile(path.join(__dirname, file), replacements);
  }

  console.log('All TSX replacements done.');
}

run();
