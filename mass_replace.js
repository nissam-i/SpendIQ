const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.js') && !file.includes('globals.js') && !file.includes('theme.js')) { 
      results.push(file);
    }
  });
  return results;
}

const files = walk(srcDir);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Global Tailwind class replacements for theme support
  content = content.replace(/bg-white/g, 'bg-surface');
  content = content.replace(/bg-gray-50/g, 'bg-bg');
  content = content.replace(/text-gray-900/g, 'text-text');
  content = content.replace(/text-gray-800/g, 'text-text');
  content = content.replace(/text-gray-700/g, 'text-text');
  content = content.replace(/text-gray-600/g, 'text-textSecondary');
  content = content.replace(/text-gray-500/g, 'text-textSecondary');
  content = content.replace(/text-gray-400/g, 'text-textSecondary');
  content = content.replace(/border-gray-200/g, 'border-border');
  content = content.replace(/border-gray-300/g, 'border-border');
  content = content.replace(/border-gray-100/g, 'border-border');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
