import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Insert import at the top
if (!content.includes('import { DashboardV3 }')) {
  content = content.replace(
    /import \{ useClerk \} from '@clerk\/clerk-react';/,
    "import { useClerk } from '@clerk/clerk-react';\nimport { DashboardV3 } from './features/dashboard/components/v3/DashboardV3';"
  );
}

// Now we need to remove the HomeTab function.
// It starts at `function HomeTab() {` and ends before `function StatPanel` or `export default function App() {`
const startRegex = /\/\/\s*─────────────────────────────────────────────────────────────────────────────\n\/\/\s*HOME TAB\n\/\/\s*─────────────────────────────────────────────────────────────────────────────\n\nfunction HomeTab\(\) \{[\s\S]*?(?=\/\/\s*─────────────────────────────────────────────────────────────────────────────\n\/\/\s*STAT PANEL)/;
content = content.replace(startRegex, '');

fs.writeFileSync('src/App.tsx', content);
console.log("Updated App.tsx");
