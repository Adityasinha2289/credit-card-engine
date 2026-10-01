import fs from 'fs';
const path = './src/public-platform/components/home/CardsAndRewardsSection.tsx';
let content = fs.readFileSync(path, 'utf8');

// replace the fake card block
