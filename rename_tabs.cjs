const fs = require('fs');

let sidebar = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');
sidebar = sidebar.replace(/export type TabId = 'home' \| 'analyze' \| 'wallet' \| 'perks' \| 'insights' \| 'profile';/, "export type TabId = 'home' | 'wallet' | 'taqdeer' | 'discover' | 'insights' | 'profile';");
sidebar = sidebar.replace(
  /const NAV_ITEMS: NavItem\[\] = \[\s*\{ id: 'home',     label: 'Dashboard', Icon: LayoutDashboard, description: 'Overview & cards'      \},\s*\{ id: 'analyze',  label: 'Analyzer',  Icon: Search,          description: 'Card recommendations'  \},\s*\{ id: 'wallet',   label: 'Wallet',    Icon: Wallet,          description: 'Optimizer & payments'   \},\s*\{ id: 'perks',    label: 'Perks',     Icon: Gift,            description: 'Rewards & subscriptions'\},\s*\{ id: 'insights', label: 'Insights',  Icon: BarChart3,       description: 'Spend analysis & CIBIL' \},\s*\{ id: 'profile',  label: 'Profile',   Icon: User,            description: 'Settings & details'     \},\s*\];/,
  `const NAV_ITEMS: NavItem[] = [
  { id: 'home',     label: 'Home',      Icon: LayoutDashboard, description: 'Overview & cards'      },
  { id: 'wallet',   label: 'Wallet',    Icon: Wallet,          description: 'Optimizer & payments'  },
  { id: 'taqdeer',  label: 'TAQDEER',   Icon: Search,          description: 'AI Copilot'            },
  { id: 'discover', label: 'Discover',  Icon: Gift,            description: 'Rewards & subscriptions'},
  { id: 'insights', label: 'Insights',  Icon: BarChart3,       description: 'Spend analysis & CIBIL'},
  { id: 'profile',  label: 'Profile',   Icon: User,            description: 'Settings & details'    },
];`
);
fs.writeFileSync('src/components/layout/Sidebar.tsx', sidebar);

let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace(
  /      \{activeTab === 'home'     && <HomeTab \/>\}\n      \{activeTab === 'analyze'  && <AnalyzeTab \/>\}\n      \{activeTab === 'wallet'   && <WalletTab \/>\}\n      \{activeTab === 'perks'    && <PerksTab \/>\}\n      \{activeTab === 'insights' && <InsightsTab \/>\}\n      \{activeTab === 'profile'  && <ProfileTab \/>\}/,
  `      {activeTab === 'home'     && <DashboardV3 />}
      {activeTab === 'wallet'   && <WalletTab />}
      {activeTab === 'taqdeer'  && <AnalyzeTab />}
      {activeTab === 'discover' && <PerksTab />}
      {activeTab === 'insights' && <InsightsTab />}
      {activeTab === 'profile'  && <ProfileTab />}`
);
// Make sure DashboardV3 import is added (we'll add it later)
fs.writeFileSync('src/App.tsx', app);

console.log("Renamed tabs");
