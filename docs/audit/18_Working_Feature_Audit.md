# RENO CRED — INSIDE APP PRODUCTION WORKING-FEATURE AUDIT

## 1. Executive Summary
This working-feature audit of the authenticated RenoCred repository reveals a visually polished application with deep fragmentation in its underlying data architecture. While the routing, UI components, and authentication boundary (Clerk + Supabase) are functional, the app operates as **three separate financial universes**: 
1. **The Core Dashboard/Wallet** (which connects correctly to Supabase/Demo state).
2. **The Money Manager** (which is completely hardcoded to a separate demo state via `useMoneyStore`).
3. **The Planners** (which correctly use `usePlanStore` but suffer from localized state leakage).

**Key Finding:** The app is NOT production-ready due to disjointed data sources. Financial integrity is compromised because Money Manager and Wallet do not share the same truth. 

## 2. Current Architecture
The application is built on React + Vite, utilizing Clerk for authentication and Supabase for the primary backend.

**State Management Mapping:**
- `useDashboardStore`: Core store. Handles Profile, Cards (`userCards`), Transactions, Offers. Connects to Supabase via RPCs (`add_transaction_v1`, `add_user_card_v1`).
- `useMoneyStore`: **DISCONNECTED**. Handles Money Manager (Safe-to-Spend, Coach). It bypasses Supabase entirely and forcefully loads static `DEMO_TRANSACTIONS` on mount.
- `usePlanStore`: Manages planner state and sessions. Supports Supabase persistence but falls back to `localStorage` in Demo mode.
- `recommendEngine.ts`: Local deterministic engine for "Find My Best Card".

**Demo Mode Architecture:**
Detected via `?demo=profile` or `VITE_USE_DEMO_DATA=true`. Uses `DemoAppProvider` to inject `seedDemoStore()` (from `demoData.ts`) into `useDashboardStore` and forcibly nullifies the Supabase client to prevent network requests. 

## 3. Master Feature Matrix

| Feature | Route | UI | Logic | Data | Persistence | Demo | Error Handling | Mobile | Production | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| Dashboard Home | `/app` | GREEN | GREEN | GREEN | GREEN | GREEN | YELLOW | GREEN | YELLOW | 🟢 GREEN |
| Wallet | `/app/wallet` | GREEN | GREEN | GREEN | GREEN | GREEN | YELLOW | GREEN | YELLOW | 🟢 GREEN |
| Find Best Card | `/app/credit/*` | GREEN | GREEN | GREEN | N/A | GREEN | GREEN | GREEN | YELLOW | 🟢 GREEN |
| Compare Cards | `/app/credit/*` | GREEN | GREEN | GREEN | N/A | GREEN | GREEN | GREEN | YELLOW | 🟢 GREEN |
| Money Manager | `/app/money` | GREEN | YELLOW | RED | RED | RED | RED | GREEN | RED | 🔴 RED |
| Payment Coach | `/app/money/coach`| GREEN | GRAY | RED | RED | RED | RED | GREEN | RED | 🔴 RED |
| Trip Planner | `/app/plan/trip` | GREEN | GREEN | YELLOW | YELLOW | GREEN | YELLOW | GREEN | YELLOW | 🟡 YELLOW |
| Taqdeer Drawer | Global | GREEN | GRAY | GRAY | GRAY | GRAY | GRAY | GREEN | RED | ⚪ GRAY |
| Profile | `/app/profile` | GREEN | GREEN | GREEN | GREEN | GREEN | YELLOW | GREEN | GREEN | 🟢 GREEN |

## 4. Route Matrix
- **WORKING**: 
  - `/app` (HomePage): Fully functional, accurately derives primary actions based on `profile.primaryGoal`.
  - `/app/wallet` (WalletPage): Renders cards correctly, calculates intelligence metrics via `loadWalletIntelligence`.
  - `/app/credit/*` (CreditPage): "Find My Best Card" and "Compare" work deterministically based on `CARD_DATASET`.
- **PARTIAL**: 
  - `/app/plan/*` (Planners): Working after hook reordering and layout fixes, but session syncing between devices needs robust error handling.
- **BROKEN (Data-wise)**: 
  - `/app/money` (Money ManagerPage): Hardcoded to call `loadDemoData()` on mount. Ignores authenticated user's actual transactions.

## 5. Working Features
- **Wallet Intelligence**: `loadWalletIntelligence` correctly scans `userCards` against `CARD_DATASET` to calculate optimization gaps.
- **Recommendation Engine**: `recommendCards` accurately uses CIBIL, Salary, and Categories from the active profile to filter and score cards. 
- **Card Comparison**: Matrix generation works flawlessly, scoring cards against selected variables.
- **Planner Layouts**: Forms, selections, and step-by-step UI (`AdaptivePlanningShell`) work responsively.

## 6. Partial Features
- **Taqdeer**: Exists as UI shells but lacks the deep integration to actually execute financial actions.
- **Insights**: Renders correctly but derived calculations overlap with Money Manager.

## 7. Broken Features
- **Money Manager (Safe to Spend)**: Completely disjointed. Uses `SafeToSpendEngine.calculate` feeding off `DEMO_ACCOUNTS` and `DEMO_TRANSACTIONS` from `moneyStore`, ignoring `dashboardStore.transactions`.

## 8. Stubbed Features
- **Add Debit Card / UPI ID**: Modals show "Coming soon" toasts.
- **Marketplace / Lifestyle**: Routes redirect or show static stubs.

## 9. Financial Integrity Findings
**CRITICAL (P0) — Fragmented Universes:**
- **Issue**: `demoData.ts` (Dashboard) provisions "Aarav" with an SBI Cashback and HDFC Diners card, plus 4 transactions (Zomato, Snitch, etc.).
- **Issue**: `demoTransactions.ts` (Money) provisions completely different transactions and cards. 
- **Impact**: If a user adds a real transaction in the Dashboard, it NEVER appears in the Money Manager. 

**HARDCODED PRESENTATIONAL DATA:**
- Rewards Multipliers: `dashboardStore` defaults `EMPTY_REWARDS` to arbitrary 3x/2x/1x multipliers.
- Savings calculation in `HomePage` defaults to `12000` if `CommerceOptimizationService` fails.

## 10. Demo Data Findings
Demo mode is cleanly isolated for the Dashboard via `DemoAppProvider` which:
1. Calls `seedDemoStore()`.
2. Nullifies the Supabase client (preventing accidental production writes).
However, it fails to seed the `moneyStore`. 

## 11. Cross-Feature Consistency Findings
- **Home → Wallet**: Consistent. Both read from `useDashboardStore(s => s.userCards)`.
- **Home → Analyze (Find Best Card)**: Consistent. Reads Profile criteria accurately.
- **Home → Money**: **INCONSISTENT**. Money reads from `useMoneyStore`.
- **Plan → Dashboard**: **INCONSISTENT**. Plans do not currently deduct from Safe-to-Spend or verify budget constraints in `dashboardStore`.

## 12. Plan Audit
- **Entry**: `/app/plan/*`
- **State Machine**: Uses `usePlanStore` with `activeSessions`.
- **Persistence**: Uses `localStorage` (`renocred:demo-plan:*`) during demo mode. 
- **Bugs Fixed**: Hook rendering crashes and `h-[100dvh]` scroll overflow have been resolved.
- **Remaining Risk**: `completePlan` does not reliably sync to Supabase if the user closes the tab instantly.

## 13. Money Manager Audit
- **Status**: Visual prototype / Broken.
- **Trace**: `MoneyManagerPage` → `useMoneyStore` → `loadDemoData()` → `SafeToSpendEngine`.
- **Verdict**: Requires complete rewiring to consume `useDashboardStore(s => s.transactions)` instead of its own siloed state.

## 14. Taqdeer Audit
- Taqdeer acts primarily as a UI layer for AI actions. The actual engine logic (`TaqdeerPlanningBrain`) is stubbed in the context of financial execution. It works for generating text/plans but cannot execute transactions.

## 15. Persistence Audit
- **Zustand Persistence**: `dashboardStore` uses `persist` middleware (localStorage), creating risks of stale state if multiple users log into the same browser. 
- **Mitigation**: `App.tsx` correctly implements a `queryClient.clear()` and `_reset()` on logout/user change, mitigating cross-user state leakage.

## 16. Mobile Audit
- **Working**: Bottom navigation, card stacks (`WalletPage`), comparison tables (horizontal scroll).
- **Fixed**: `AdaptivePlanningShell` now correctly adapts to mobile heights without pushing the "Next" button off-screen.

## 17. P0/P1/P2/P3/P4 Findings
- **P0 [MM-01]**: Money Manager uses isolated hardcoded store (`useMoneyStore`). *Fix: Refactor `useMoneyStore` to derive data from `useDashboardStore` or merge them.*
- **P1 [DB-01]**: `addTransaction` RPC fallback writes to Supabase without verifying if the user has completed onboarding.
- **P2 [PL-01]**: Planners use `localStorage` for demo state but lack a cleanup mechanism, potentially bloating storage over time.
- **P3 [UX-01]**: "Find my best card" shows "No eligible cards" if Salary/CIBIL is missing, rather than prompting the user to update their profile.

## 18. Master Demo Dataset Design
To unify the application, ONE deterministic dataset must be created:
- **User**: Aarav (742 CIBIL, ₹9L/yr).
- **Cards**: HDFC Diners Club Black, SBI Cashback.
- **Transactions**: 
  - Tx1: Zomato (Dining) - ₹1,250 (SBI)
  - Tx2: Snitch (Shopping) - ₹2,999 (SBI)
  - Tx3: Uber (Travel) - ₹420 (HDFC)
  - Tx4: Airtel (Utility) - ₹1,500 (HDFC)
- **Engine Rules**: Money Manager MUST calculate Safe-to-Spend using THESE 4 transactions. Wallet Intelligence MUST calculate coverage using THESE 2 cards.

## 19. Phased Implementation Plan

**PHASE 0: Critical Blockers (Data Unification)**
- **TASK 0.1**: Delete `DEMO_TRANSACTIONS` and `DEMO_ACCOUNTS` from `features/money/data`.
- **TASK 0.2**: Refactor `useMoneyStore` to consume `userCards` and `transactions` directly from `useDashboardStore`. 

**PHASE 1: Core Working-Feature Fixes**
- **TASK 1.1**: Update `SafeToSpendEngine` to accept standard `Transaction[]` types from the dashboard.
- **TASK 1.2**: Fix `HomePage` fallback savings calculation to return `0` instead of `12000` to prevent fake data leakage.

**PHASE 2: Demo Data Unification**
- **TASK 2.1**: Centralize `seedDemoStore()` to populate both Dashboard and Money stores simultaneously.

**PHASE 3: Cross-Feature Integration**
- **TASK 3.1**: Connect Planner outcomes to Money Manager (deduct generated plan budgets from Safe-to-Spend).

**PHASE 4: Testing & Hardening**
- **TASK 4.1**: Write Cypress/Playwright E2E tests for the "Add Transaction -> Verify in Money Manager" flow.

## 20. Testing Plan
- **Unit**: Verify `recommendEngine.ts` and `SafeToSpendEngine.ts` output correct math given standard unified inputs.
- **Integration**: Verify `DemoAppProvider` fully isolates Supabase clients.
- **E2E**: Validate `Home -> Wallet -> Money -> Plan` journey using the single Demo Profile.

## 21. Production Acceptance Checklist
- [ ] Money Manager reads from global `transactions` state.
- [ ] `useMoneyStore` standalone demo data is deleted.
- [ ] No hardcoded Rupee amounts exist outside of `demoData.ts`.
- [ ] `HomePage` savings derived strictly from actual `CommerceOptimizationService`.
- [ ] Planners correctly validate dates and transport modes (frontend validation).
- [ ] Supabase RPCs tested against RLS (Row Level Security) policies.
- [ ] Logout fully clears `localStorage` persists.
