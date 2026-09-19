const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

function getHtmlFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    if (file === 'node_modules' || file === '.git' || file === '.system_generated' || file === 'scratch') continue;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getHtmlFiles(fullPath));
    } else if (file.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}

const htmlFiles = getHtmlFiles(rootDir);
console.log(`Found ${htmlFiles.length} HTML files.`);

let updatedCount = 0;

for (const filePath of htmlFiles) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Skip if already has favicon
  if (content.includes('rel="icon"') || content.includes('favicon.ico')) {
    console.log(`Skipping (already has favicon): ${path.relative(rootDir, filePath)}`);
    continue;
  }

  const relDir = path.relative(rootDir, path.dirname(filePath));
  const isSubdir = relDir !== '' && relDir !== '.';
  const prefix = isSubdir ? '../' : '';

  const faviconSnippet = `  <!-- Favicon & Tarayıcı Sekme İkonu (Yuvarlak Logo) -->
  <link rel="icon" type="image/x-icon" href="${prefix}favicon.ico">
  <link rel="icon" type="image/png" sizes="16x16" href="${prefix}favicon-16x16.png">
  <link rel="icon" type="image/png" sizes="32x32" href="${prefix}favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="48x48" href="${prefix}favicon-48x48.png">
  <link rel="apple-touch-icon" sizes="180x180" href="${prefix}apple-touch-icon.png">
  <link rel="manifest" href="${prefix}site.webmanifest">
  <meta name="theme-color" content="#0d1b2a">
`;

  // Insert before </head>
  if (content.includes('</head>')) {
    content = content.replace('</head>', `${faviconSnippet}</head>`);
    fs.writeFileSync(filePath, content, 'utf8');
    updatedCount++;
    console.log(`Updated: ${path.relative(rootDir, filePath)}`);
  } else {
    console.warn(`No </head> tag found in ${path.relative(rootDir, filePath)}`);
  }
}

console.log(`Successfully updated ${updatedCount} HTML files.`);
