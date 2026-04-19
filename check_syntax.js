const fs = require('fs');
const babel = require('@babel/standalone');

const html = fs.readFileSync('finance_tracker.html', 'utf8');

// Extract the script
const match = html.match(/<script type="text\/babel">([\s\S]*?)<\/script>/);

if (match && match[1]) {
  const code = match[1];
  try {
    const transpiled = babel.transform(code, {
      presets: ['react']
    });
    console.log("SUCCESS! No Babel syntax errors.");
  } catch (err) {
    console.error("BABEL SYNTAX ERROR:");
    console.error(err.message);
    
    // Optionally log the line
    if (err.loc) {
      console.error(`Error at line ${err.loc.line}, column ${err.loc.column}`);
      const lines = code.split('\n');
      console.error(lines[err.loc.line - 1]);
      console.error(' '.repeat(err.loc.column) + '^');
    }
  }
} else {
  console.log("No babel script found!");
}
