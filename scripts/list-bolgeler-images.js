const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const bolgelerDir = path.join(rootDir, 'bolgeler');

const usedInBolgeler = {};
fs.readdirSync(bolgelerDir).forEach(f => {
  if (!f.endsWith('.html') || f === 'index.html') return;
  const content = fs.readFileSync(path.join(bolgelerDir, f), 'utf8');
  const m = content.match(/class="photo-box"[^>]*>[\s\S]*?<img\s+src="([^"]+)"/);
  if (m) {
    const src = m[1];
    const clean = src.split('?')[0];
    const filename = path.basename(clean);
    const exists = fs.existsSync(path.resolve(bolgelerDir, clean));
    console.log(f.padEnd(45) + src.padEnd(35) + (exists ? 'EXISTS' : '>>> MISSING <<<'));
    if (exists) usedInBolgeler[filename] = (usedInBolgeler[filename] || []).concat(f);
  }
});

const imagesDir = path.join(rootDir, 'images');
const allImages = fs.readdirSync(imagesDir).filter(f => f.endsWith('.webp') && !f.includes('logo') && !f.includes('kapak'));
console.log('\n--- ALL IMAGES IN images/ NOT CURRENTLY USED IN ANY bolgeler/*.html ---');
allImages.forEach(img => {
  if (!usedInBolgeler[img]) {
    console.log(img);
  }
});
