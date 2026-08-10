# Wallet V3 Visual & Structural Audit

## Current Visual State
Based on the rendered `/app/wallet` and underlying components (`WalletPage.tsx`, `WalletOptimizerPanel`, etc.):
- **Generic Hierarchy:** The page behaves like a generic utility dashboard with a large pill-cluster navigation (Optimizer, Pay, Bills, EMI) dominating the top. It lacks an authoritative, editorial financial feel.
- **Card Presentation:** "Cards in Wallet" uses basic rectangular boxes side-by-side. They don't feel like distinct, premium financial instruments.
- **Intelligence Presentation:** The "Category Recommendations" list is a repetitive stack of basic rows (Dining, Travel, etc.) that feels like a directory rather than actionable intelligence.
- **Missing Elements:** There is no overarching Wallet Intelligence Summary, no Optimization Coverage visualization, and no operational Attention/Action system for the wallet itself.
- **Over-contained:** Excessive nesting of grey containers and borders makes the UI feel boxed-in rather than an open, expansive command surface.

## Structural State (`dashboardStore` & `PaymentMethodProvider`)
- **Data Availability:** The store maintains `userCards`, `creditAccounts`, and `subscriptions`. It successfully calculates rewards and tracks active cards.
- **Integration Points:** We have the real data (network, bank, pan/last 4, limits) available to populate a premium card view.
- **Limitations:** The UI relies heavily on frontend mapping (e.g., categorizing by static IDs). We must ensure we use the real `userCards` array without hardcoding fake backend functionality. The UI currently routes everything through rigid tab panels (`WalletOptimizerPanel`, etc.) which need to be dismantled in favor of a unified command surface.

## Opportunities for Redesign
1. **Wallet Command Header:** Replace the generic `PageContainer` header and pill navigation with an editorial, stats-driven header ("WALLET ACTIVE | X PAYMENT METHODS | OPTIMIZATION READY").
2. **Intelligence Summary:** Create a dedicated top-level metric surface detailing active cards, optimization coverage, and potential savings.
3. **Hero Payment Methods:** Elevate the cards into detailed, premium instruments (Bank, Network, Last 4, Status, Optimization capability) with sophisticated hover states and primary indicators.
4. **Coverage Visualization:** Transform the basic category list into an analytical "Optimization Coverage" matrix.
5. **Attention System:** Add operational notices (e.g., missing metadata) in a restrained graphite/amber style.
6. **Refined CTA:** Convert the "+ Add Card" into an elegant "+ Add payment method" interaction without the heavy SaaS button styling.
7. **Taqdeer Context:** Ensure Taqdeer remains global (bottom-right) but contextualized to the Wallet when on this route.

## What to Remove
- The 4-tab pill cluster navigation (Optimizer, Pay, Bills, EMI).
- Generic rectangular card containers.
- The grey-on-grey nested boxes.
- The basic "Category Recommendations" list view.

## What to Keep
- The `dashboardStore` and underlying Supabase data connections.
- The existing Obsidian material foundation (colors, typography).
- The Taqdeer global bot (do not redesign it, just let it exist on the page).
