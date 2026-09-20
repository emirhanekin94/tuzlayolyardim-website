const fs = require('fs');
const path = require('path');

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        results = results.concat(getFiles(fullPath));
      }
    } else if (file.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}

const rootDir = path.resolve(__dirname, '..');
const htmlFiles = getFiles(rootDir);
const broken = [];

function resolvePath(file, src) {
  const clean = src.split('?')[0].split('#')[0];
  if (clean.startsWith('/')) {
    return path.join(rootDir, clean.slice(1));
  }
  return path.resolve(path.dirname(file), clean);
}

htmlFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
  let match;
  while ((match = imgRegex.exec(content)) !== null) {
    const src = match[1];
    if (src.startsWith('http') || src.startsWith('data:') || src.startsWith('//')) continue;
    const resolved = resolvePath(file, src);
    if (!fs.existsSync(resolved)) {
      broken.push({
        file: path.relative(rootDir, file),
        src: src,
        resolved: path.relative(rootDir, resolved)
      });
    }
  }

  const bgRegex = /url\(["']?([^"')]+)["']?\)/gi;
  while ((match = bgRegex.exec(content)) !== null) {
    const src = match[1];
    if (src.startsWith('http') || src.startsWith('data:') || src.startsWith('//')) continue;
    const resolved = resolvePath(file, src);
    if (!fs.existsSync(resolved)) {
      broken.push({
        file: path.relative(rootDir, file),
        bgSrc: src,
        resolved: path.relative(rootDir, resolved)
      });
    }
  }
});

const cssDir = path.join(rootDir, 'css');
if (fs.existsSync(cssDir)) {
  fs.readdirSync(cssDir).forEach(file => {
    if (!file.endsWith('.css')) return;
    const filePath = path.join(cssDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const bgRegex = /url\(["']?([^"')]+)["']?\)/gi;
    let match;
    while ((match = bgRegex.exec(content)) !== null) {
      const src = match[1];
      if (src.startsWith('http') || src.startsWith('data:') || src.startsWith('//')) continue;
      const resolved = resolvePath(filePath, src);
      if (!fs.existsSync(resolved)) {
        broken.push({
          file: path.relative(rootDir, filePath),
          cssUrl: src,
          resolved: path.relative(rootDir, resolved)
        });
      }
    }
  });
}

console.log(JSON.stringify(broken, null, 2));
