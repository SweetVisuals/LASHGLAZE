const fs = require('fs');
let content = fs.readFileSync('supabase/functions/send-order-emails/index.ts', 'utf8');

// Replace all escaped backticks with normal backticks
content = content.replace(/\\`/g, '`');

// Replace all escaped template expressions with normal ones
content = content.replace(/\\\${/g, '${');

fs.writeFileSync('supabase/functions/send-order-emails/index.ts', content, 'utf8');
console.log('Unescaped backticks and template expressions successfully.');
