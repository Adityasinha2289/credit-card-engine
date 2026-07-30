# Phase 1: Project Mental Model

## What RenoCred Actually Is
RenoCred is a highly interactive, client-heavy React web application that serves as an "Intelligent Financial Operating System." It acts as a unified dashboard where users can aggregate their credit cards, view simulated AI insights on their spending behavior, optimize their wallet for maximum rewards, and consult a conversational AI agent (Taqdeer) for financial decisions.

## What Problem It Solves
The modern credit card landscape in India (and globally) is overwhelmingly complex. Users struggle to figure out which card to use for a specific purchase (e.g., dining vs. fuel) to maximize reward points or cashback. RenoCred solves the "Wallet Optimization" problem. It stops users from leaving money on the table by calculating exactly which cards they need, warning them about poor financial habits, and tracking their overall credit health.

## Who the Target User Is
The target user is an ambitious, upwardly mobile Indian professional (often referred to internally via the persona segments like `adult` or `youth`, with goals like "Maximise Cashback" or "Travel Rewards"). They likely have 1-5 credit cards, care deeply about their CIBIL score, and are tech-savvy enough to trust an AI advisor with their financial metadata.

## Main User Journeys
1.  **Onboarding**: The user signs up via Clerk, lands on an empty wallet state, and adds their first credit card (simulated manual entry or future aggregation).
2.  **Daily Review**: The user checks the dashboard to see their "RenoCred Intelligence Score", views active alerts (e.g., "High Utilization"), and reviews their transaction ledger.
3.  **Optimization**: The user visits the Wallet Optimizer to discover gaps in their spending coverage and receives a recommendation for a new card.
4.  **AI Consultation**: The user opens the Taqdeer panel to ask a natural language question (e.g., "How does closing my oldest card affect my CIBIL?").

## Primary Product Goals
*   Provide immediate, tangible financial value (measured in "Estimated Savings" and "Reward Points").
*   Foster high engagement through a premium, "wow-factor" design system (Anti-Gravity).
*   Demonstrate extreme intelligence by personalizing every insight, alert, and recommendation based on the user's specific cards and transactions.

## Current Product Maturity
**Pre-Release MVP (Version 0.0.0).** 
The UI and UX are highly polished and production-ready, giving the illusion of a mature product. However, the underlying logic is heavily reliant on client-side simulation (Mock datasets, in-browser Rule Engines). Real-world backend integration (Supabase data persistence, actual banking API connections) is either incomplete or entirely mocked. It is a stunning prototype functioning as a fully interactive demo.

## Major Capabilities
*   **Taqdeer AI Chat**: LLM-powered conversational financial advice.
*   **Intelligent Dashboard**: Time-aware, persona-driven widget orchestration.
*   **Recommendation Engine**: Rule-based matching of user spending to ideal credit cards.
*   **Behaviour Engine**: Transaction history analysis to surface insights (e.g., "Dining spend increased").

## Hidden Capabilities
*   **Intent Registry**: Taqdeer doesn't just pass text to an LLM; it first runs text through a local Intent Registry to see if it can answer deterministically (e.g., for "wallet health" queries) before falling back to the Gemini API. This saves cost and latency.

## Experimental Features
*   **Finix Sub-panels**: Features like the `UpiSimulatorPanel` (simulating RuPay UPI on credit cards) and the `CreditScoreSimulator` (interactive CIBIL modeling) are experimental, heavily reliant on complex client-side math and SVG manipulation.
*   **Live Merchant Offers**: Managed via PostHog feature flags (`useFeatureFlag('live_offers')`), demonstrating an intent to build an affiliate revenue stream later.

## Future-Ready Architecture Already Present
*   **Feature-Sliced Design (FSD)**: The `src/features` directory isolates domains perfectly. This allows the team to easily rip out a client-side engine (like `features/recommendation`) and replace it with an API call later without touching the dashboard UI components.
*   **Supabase Schema**: A production-ready schema (`20260726000000_production_schema.sql`) already exists with strict types, enums, and RLS structures, ready to accept data once the client-store is wired up fully.
