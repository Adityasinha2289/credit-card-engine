import fs from 'fs';
const path = './src/public-platform/components/home/CardsAndRewardsSection.tsx';
let content = fs.readFileSync(path, 'utf8');

// replace variant="wallet" with variant="compact"
content = content.replace(/variant="wallet"/g, 'variant="compact"');
fs.writeFileSync(path, content);
