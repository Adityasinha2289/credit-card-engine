# Folder Structure

RenoCred utilizes a highly modular directory structure optimized for scalability. 

## Tree Overview

```text
credit-card-engine/
├── api/                        # Backend API handlers (Vercel serverless functions/Supabase Edge)
├── benchmarks/                 # Testing and performance benchmarking scripts
├── docs/                       # Project documentation (including this audit)
├── marketing/                  # Marketing assets or specific static pages
├── public/                     # Static assets (images, fonts, robots.txt, icons)
├── scripts/                    # Utility scripts (e.g., importCards.ts, evaluate.ts)
├── supabase/                   # Supabase configuration, migrations, and Edge Functions
├── src/                        # Primary React Source Code
│   ├── assets/                 # SVGs, raw images
│   ├── components/             # Generic, Reusable UI Components
│   │   ├── layout/             # Sidebar, Header, Page Wrappers
│   │   └── ui/                 # Buttons, Inputs, Skeletons, Modals
│   ├── features/               # Feature-Sliced Domains (Business Logic)
│   │   ├── behaviour/          # User behaviour analytics
│   │   ├── card-intelligence/  # Card scoring and datasets
│   │   ├── cards/              # Card display components (ActiveCard, etc.)
│   │   ├── dashboard/          # Main dashboard views and Zustand store
│   │   ├── events/             # Global event bus or tracking
│   │   ├── feature-flags/      # PostHog feature flag hooks
│   │   ├── financial-health/   # CIBIL and Wallet health calculators
│   │   ├── financial-ledger/   # Savings tracking and ledgers
│   │   ├── finix/              # Complex sub-panels (Taqdeer, Simulators, Reports)
│   │   ├── knowledge/          # Financial knowledge graph / tips
│   │   ├── merchant-intelligence/# Merchant data, logos, and offers mapping
│   │   ├── notifications/      # Smart alerts and notifications
│   │   ├── personalization/    # User personas and segmentation
│   │   ├── recommendation/     # Core recommendation rules engine
│   │   └── taqdeer/            # LLM Prompts and Taqdeer AI Chat interface
│   ├── hooks/                  # Global custom hooks (e.g., useSupabase)
│   ├── lib/                    # Core utilities and configs
│   │   ├── analytics.ts        # PostHog wrapper
│   │   ├── env.ts              # Environment variable validation
│   │   ├── sentry.ts           # Sentry initialization
│   │   └── utils.ts            # Tailwind merge, formatting helpers
│   ├── public-platform/        # Public-facing marketing pages (SEO optimized)
│   │   ├── components/         # Marketing specific components
│   │   ├── layouts/            # PublicLayout
│   │   └── pages/              # About, Terms, Home, Methodology
│   ├── App.css                 # Legacy CSS (mostly migrated to index.css)
│   ├── App.tsx                 # Private App Router & Dynamic Component Loader
│   ├── index.css               # Global CSS Variables and Design System overrides
│   └── main.tsx                # Application Entry Point & Provider Definitions
├── tailwind.config.js          # Design System configuration (Colors, Shadows, Radii)
├── vite.config.ts              # Vite build configuration (Port 3000, Chunking)
└── package.json                # Dependencies and Scripts
```

## Quality Assessment
- **Organization**: Excellent. The move to Feature-Sliced Design (`src/features/`) prevents the `components` folder from becoming a dumping ground.
- **Naming Consistency**: Mostly consistent (PascalCase for components, camelCase for functions/hooks).
- **Separation of Concerns**: High. Public marketing pages are strictly separated from private application views (`public-platform` vs `features`).
