const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\ahmet\\.gemini\\antigravity-ide\\brain\\aa814da0-d14a-418b-98b8-4fab0c426a5c\\scratch\\dist_favicons';
const projectDir = path.resolve(__dirname, '..');
const imagesDir = path.join(projectDir, 'images');

if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Copy root icons
const rootFiles = [
  'favicon.ico',
  'favicon-16x16.png',
  'favicon-32x32.png',
  'favicon-48x48.png',
  'apple-touch-icon.png',
  'android-chrome-192x192.png',
  'android-chrome-512x512.png'
];

for (const file of rootFiles) {
  const src = path.join(srcDir, file);
  const dst = path.join(projectDir, file);
  fs.copyFileSync(src, dst);
  console.log(`Copied ${file} -> ${dst}`);
}

// Copy to images folder
fs.copyFileSync(path.join(srcDir, 'logo.png'), path.join(imagesDir, 'logo.png'));
fs.copyFileSync(path.join(srcDir, 'logo-circle.png'), path.join(imagesDir, 'logo-circle.png'));
console.log('Copied logo.png and logo-circle.png to images/');

// Create site.webmanifest
const manifest = {
  "name": "Tuzla Yol Yardım & Oto Çekici",
  "short_name": "Tuzla Çekici",
  "icons": [
    {
      "src": "/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "theme_color": "#0d1b2a",
  "background_color": "#0a0f1d",
  "display": "standalone"
};

fs.writeFileSync(path.join(projectDir, 'site.webmanifest'), JSON.stringify(manifest, null, 2), 'utf8');
console.log('Created site.webmanifest');
