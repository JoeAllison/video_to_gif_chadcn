const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing asset paths for GitHub Pages...');

const outDir = path.join(process.cwd(), 'out');
const indexPath = path.join(outDir, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.log('❌ No index.html found in out directory');
  process.exit(1);
}

let html = fs.readFileSync(indexPath, 'utf8');

// Fix all asset paths from absolute to relative
html = html.replace(/href="\/_next\//g, 'href="./_next/');
html = html.replace(/src="\/_next\//g, 'src="./_next/');

// Write the fixed HTML back
fs.writeFileSync(indexPath, html);

console.log('✅ Asset paths fixed successfully!');
console.log('🚀 Ready for GitHub Pages deployment');
