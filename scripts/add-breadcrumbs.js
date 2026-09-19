const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const BASE_URL = 'https://tuzlayolyardim.com';

const titleMap = {
  // Hizmetler
  'oto-cekici.html': 'Oto Çekici',
  'oto-kurtarma.html': 'Oto Kurtarma',
  'lastik-tamir-degisim.html': 'Lastik Tamir & Değişim',
  'yol-yardim-aku-takviye.html': 'Akü Takviye & Yol Yardım',
  'ariza-yol-yardim.html': 'Arıza Yol Yardım',
  'motosiklet-cekici.html': 'Motosiklet Çekici',
  'tekne-karavan-cekici.html': 'Tekne & Karavan Çekici',
  'agir-vasita-kurtarma.html': 'Minibüs & Ticari Araç Çekici',
  'sehirlerarasi-arac-tasima.html': 'Şehirlerarası Araç Taşıma',
  'kaza-kurtarma-vinc.html': 'Kaza Kurtarma & Vinç',
  'kapali-otopark-cekici.html': 'Kapalı Otopark Çekici',
  'ahtapot-cekici.html': 'Ahtapot Çekici',

  // Standart
  'galeri.html': 'Galeri & Filomuz',
  'hakkimizda.html': 'Hakkımızda',
  'iletisim.html': 'İletişim & Konum'
};

function getRegionName(filename) {
  const base = filename.replace('.html', '');
  return base
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function generateBreadcrumb(filePath) {
  const relPath = path.relative(ROOT_DIR, filePath).replace(/\\/g, '/');
  const filename = path.basename(filePath);

  // Zaten varsa atla
  const content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('"@type": "BreadcrumbList"')) {
    return null;
  }

  let items = [];

  if (relPath.startsWith('hizmetler/')) {
    if (filename === 'index.html') {
      items = [
        { name: 'Ana Sayfa', url: `${BASE_URL}/` },
        { name: 'Hizmetlerimiz', url: `${BASE_URL}/hizmetler/` }
      ];
    } else {
      const name = titleMap[filename] || getRegionName(filename);
      items = [
        { name: 'Ana Sayfa', url: `${BASE_URL}/` },
        { name: 'Hizmetlerimiz', url: `${BASE_URL}/hizmetler/` },
        { name: name, url: `${BASE_URL}/hizmetler/${filename}` }
      ];
    }
  } else if (relPath.startsWith('bolgeler/')) {
    if (filename === 'index.html') {
      items = [
        { name: 'Ana Sayfa', url: `${BASE_URL}/` },
        { name: 'Hizmet Bölgelerimiz', url: `${BASE_URL}/bolgeler/` }
      ];
    } else {
      const name = getRegionName(filename);
      items = [
        { name: 'Ana Sayfa', url: `${BASE_URL}/` },
        { name: 'Hizmet Bölgelerimiz', url: `${BASE_URL}/bolgeler/` },
        { name: name, url: `${BASE_URL}/bolgeler/${filename}` }
      ];
    }
  } else if (relPath.startsWith('blog/')) {
    if (filename === 'index.html') {
      items = [
        { name: 'Ana Sayfa', url: `${BASE_URL}/` },
        { name: 'Sürücü Rehberi & Blog', url: `${BASE_URL}/blog/` }
      ];
    } else {
      // Başlığı title etiketinden alalım
      const match = content.match(/<title>([^<]+)<\/title>/i);
      let pageTitle = 'Sürücü Rehberi Yazısı';
      if (match) {
        pageTitle = match[1].split('|')[0].trim();
      }
      items = [
        { name: 'Ana Sayfa', url: `${BASE_URL}/` },
        { name: 'Sürücü Rehberi & Blog', url: `${BASE_URL}/blog/` },
        { name: pageTitle, url: `${BASE_URL}/blog/${filename}` }
      ];
    }
  } else if (['galeri.html', 'hakkimizda.html', 'iletisim.html'].includes(filename)) {
    const name = titleMap[filename] || filename.replace('.html', '');
    items = [
      { name: 'Ana Sayfa', url: `${BASE_URL}/` },
      { name: name, url: `${BASE_URL}/${filename}` }
    ];
  }

  if (items.length === 0) return null;

  const schemaObj = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.url
    }))
  };

  const schemaStr = `\n  <!-- BreadcrumbList Schema -->\n  <script type="application/ld+json">\n  ${JSON.stringify(schemaObj, null, 2).split('\n').join('\n  ')}\n  </script>\n`;

  // </head> öncesine ekle
  if (content.includes('</head>')) {
    const updated = content.replace('</head>', `${schemaStr}</head>`);
    fs.writeFileSync(filePath, updated, 'utf8');
    return true;
  }

  return false;
}

function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', '.git'].includes(entry.name)) {
        processDirectory(fullPath);
      }
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      const res = generateBreadcrumb(fullPath);
      if (res) {
        console.log(`[Breadcrumb Eklendi]: ${path.relative(ROOT_DIR, fullPath)}`);
      }
    }
  }
}

console.log('BreadcrumbList JSON-LD schema entegrasyonu başlatılıyor...');
processDirectory(ROOT_DIR);
console.log('İşlem tamamlandı.');
