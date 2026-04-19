const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const componentsDir = path.join(srcDir, 'components');
const pagesDir = path.join(srcDir, 'pages');

// Order is critical for dependency resolution in a single file
const fileOrder = [
  path.join(srcDir, 'globals.js'),
  path.join(srcDir, 'theme.js'),
  path.join(srcDir, 'utils.js'),
  path.join(srcDir, 'nlp.js'),
  path.join(srcDir, 'data.js'),
  path.join(srcDir, 'context.js'),
  
  // Shared Components
  path.join(componentsDir, 'ui.js'),
  path.join(componentsDir, 'layout.js'),
  path.join(componentsDir, 'Chatbot.js'),
  
  // Pages
  path.join(pagesDir, 'Login.js'),
  path.join(pagesDir, 'Register.js'),
  path.join(pagesDir, 'Dashboard.js'),
  path.join(pagesDir, 'Transactions.js'),
  path.join(pagesDir, 'Budgets.js'),
  path.join(pagesDir, 'Investments.js'),
  path.join(pagesDir, 'Analytics.js'),
  path.join(pagesDir, 'Reports.js'),
  path.join(pagesDir, 'Settings.js'),
  
  // App Entry
  path.join(srcDir, 'App.js'),
  path.join(srcDir, 'index.js')
];

let jsContent = '';

for (const file of fileOrder) {
  if (fs.existsSync(file)) {
    console.log(`Reading ${file}`);
    jsContent += `\n/* --- ${path.basename(file)} --- */\n`;
    jsContent += fs.readFileSync(file, 'utf8') + '\n';
  } else {
    console.warn(`File not found: ${file}`);
  }
}

const templatePath = path.join(srcDir, 'template.html');
let template = fs.readFileSync(templatePath, 'utf8');

const finalHtml = template.replace('// [[APP_CONTENT]]', jsContent);

const outputPath = path.join(__dirname, 'finance_tracker.html');
fs.writeFileSync(outputPath, finalHtml);

console.log(`Successfully built ${outputPath} with ${jsContent.split('\n').length} lines of JS code.`);
