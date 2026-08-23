const fs = require('fs');
const { execSync } = require('child_process');

try {
  const files = execSync('find src/pages/app src/components/layout src/features/dashboard src/features/taqdeer -name "*.tsx"').toString().split('\n').filter(Boolean);
  
  const replacements = [
    { p: /text-white\/90/g, r: 'text-gray-900' },
    { p: /text-white\/80/g, r: 'text-gray-900' },
    { p: /text-white\/70/g, r: 'text-gray-800' },
    { p: /text-white\/60/g, r: 'text-gray-700' },
    { p: /text-white\/50/g, r: 'text-gray-600' },
    { p: /text-white\/40/g, r: 'text-gray-500' },
    { p: /text-white\/30/g, r: 'text-gray-500' },
    { p: /text-white\/20/g, r: 'text-gray-400' },
    { p: /text-white\/10/g, r: 'text-gray-300' },
    { p: /text-white/g, r: 'text-gray-900' },
    { p: /text-\[\#F2F4F2\]/g, r: 'text-gray-900' },
    
    // Borders should be darker to look sharp
    { p: /border-gray-100/g, r: 'border-gray-300' },
    { p: /border-gray-200/g, r: 'border-gray-300' },
    { p: /border-white\/\[0\.04\]/g, r: 'border-gray-300' },
    { p: /border-white\/\[0\.08\]/g, r: 'border-gray-300' },
    { p: /border-white\/10/g, r: 'border-gray-300' },
    { p: /border-white\/20/g, r: 'border-gray-300' },
    { p: /border-white\/30/g, r: 'border-gray-300' },
    { p: /border-white\/50/g, r: 'border-gray-400' },
    
    // Extra fixes for any missed backgrounds
    { p: /hover:bg-white\/\[0\.02\]/g, r: 'hover:bg-gray-50' },
    { p: /hover:bg-white\/\[0\.04\]/g, r: 'hover:bg-gray-100' },
    { p: /bg-white\/\[0\.02\]/g, r: 'bg-gray-50' },
    { p: /bg-white\/\[0\.03\]/g, r: 'bg-gray-100' },
    { p: /bg-white\/\[0\.04\]/g, r: 'bg-gray-100' },
    
    // Typography contrast
    { p: /text-\[\#737C77\]/g, r: 'text-gray-600' },
    { p: /text-\[\#A0AAA5\]/g, r: 'text-gray-700' },
    { p: /text-gray-500/g, r: 'text-gray-600' },
  ];

  files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    replacements.forEach(({ p, r }) => {
      content = content.replace(p, r);
    });
    if (content !== original) {
      fs.writeFileSync(file, content);
      console.log('Fixed ' + file);
    }
  });
} catch(e) { console.error(e) }
