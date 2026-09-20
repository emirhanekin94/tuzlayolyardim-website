const fs = require('fs');
const path = require('path');

const imagesDir = path.resolve(__dirname, '..', 'images');

const imageCopies = [
  // 1. Pendik: Toyota Avensis on tow truck
  { from: 'otomobil-cekici-1.webp', to: 'oto-kurtarici-1.webp' },

  // 2. Bayramoğlu: Luxury BMW coupe in front of Filizler
  { from: 'luks-arac-cekici-3.webp', to: 'luks-arac-cekici-4.webp' },

  // 3. Çayırova: Industrial Yanmar excavator on tow truck
  { from: 'is-makinesi-cekici.webp', to: 'is-makinesi-cekici-1.webp' },

  // 4. İstanbul Park: White Porsche Panamera sports car
  { from: 'luks-arac-cekici.webp', to: 'spor-arac-cekici.webp' },

  // 5. Sevindikli: Rollover 4x4 Jeep recovery with broken axle
  { from: 'kazali-arac-cekici-2.webp', to: 'kurtarma-vinc.webp' },

  // 6. Şifa Mahallesi: Station wagon recovery at night
  { from: 'otomobil-cekici-5.webp', to: 'oto-kurtarma.webp' },

  // 7. Aydınlı: White commercial panelvan in KOSB area
  { from: 'ticari-cekici-3.webp', to: 'oto-kurtarici.webp' },

  // 8. Tuzla Marina: Boat hull / vessel transport
  { from: 'ozel-cekici.webp', to: 'tekne-cekici.webp' },

  // 9. Hizmetler Index: Kayar kasa oto çekici
  { from: 'otomobil-cekici.webp', to: 'oto-kurtarma-1.webp' }
];

imageCopies.forEach(({ from, to }) => {
  const fromPath = path.join(imagesDir, from);
  const toPath = path.join(imagesDir, to);
  if (!fs.existsSync(fromPath)) {
    console.error(`Source file not found: ${from}`);
    return;
  }
  fs.copyFileSync(fromPath, toPath);
  console.log(`Copied ${from} -> ${to} (${(fs.statSync(toPath).size / 1024).toFixed(1)} KB)`);
});
