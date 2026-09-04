const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('emmoglumenu_galeri.html', 'utf8');
const $ = cheerio.load(html);

const images = [];

// Find images in the gallery elementor section
// Looking for img tags with large/scaled sources inside elementor containers
$('img').each((i, el) => {
  const src = $(el).attr('src');
  if (src && src.includes('uploads') && !src.includes('emmoglu.png') && !src.includes('cropped-') && !src.includes('hgt-logo')) {
      // Get the full size image URL
      let fullSrc = src;
      // if it's a thumbnail (e.g. 1024x1024.jpg), try to get the original or use as is if high quality
      if(fullSrc.includes('1024x') || fullSrc.includes('scaled') || fullSrc.includes('150x')){
          // We'll just collect unique high quality image URLs
          const srcset = $(el).attr('srcset');
          if (srcset) {
             const sources = srcset.split(',').map(s => s.trim().split(' ')[0]);
             // Usually the first one is highest quality or we can find the one with 'scaled'
             const bestSource = sources.find(s => s.includes('scaled')) || sources[0];
             if(bestSource) fullSrc = bestSource;
          }
      }
      
      if (!images.includes(fullSrc)) {
          images.push(fullSrc);
      }
  }
});

fs.writeFileSync('src/data/gallery.json', JSON.stringify(images, null, 2));
console.log(`Extracted ${images.length} gallery images.`);
