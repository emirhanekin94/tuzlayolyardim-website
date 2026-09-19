const fs = require('fs');
const path = require('path');

let errors = 0;
let totalChecked = 0;

function checkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !['node_modules', '.git'].includes(entry.name)) {
      checkDir(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      const html = fs.readFileSync(fullPath, 'utf8');
      const matches = html.matchAll(/<script type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi);
      for (const m of matches) {
        totalChecked++;
        try {
          JSON.parse(m[1].trim());
        } catch (e) {
          console.error(`❌ JSON-LD Error in ${fullPath}: ${e.message}`);
          errors++;
        }
      }
    }
  }
}

checkDir(path.resolve(__dirname, '..'));
console.log(`✅ Kontrol tamamlandı. Toplam ${totalChecked} adet JSON-LD Schema kontrol edildi. Hata sayısı: ${errors}`);
