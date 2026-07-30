# Phase 3: Entry Flow

The execution trace of RenoCred from boot to render is explicitly designed to handle telemetry, theming, and authentication before any private data is requested.

## 1. Boot (`main.tsx`)
1.  **Environment Validation**: `import './lib/env'` runs immediately, ensuring all required environment variables (`VITE_CLERK_PUBLISHABLE_KEY`, etc.) are present before React boots.
2.  **Sentry Initialization**: `import './lib/sentry'` hooks into window errors.
3.  **Telemetry Setup**: PostHog is initialized if `VITE_POSTHOG_KEY` is present.
4.  **React Root**: `<ErrorBoundary>` wraps the entire application to catch rendering crashes.
5.  **Providers**:
    *   `<PostHogProvider>` wraps the content.
    *   `<ClerkProvider>` is instantiated with a massive configuration block that passes a custom `appearance` prop to override standard Clerk elements to match the "Anti-Gravity" theme (e.g., `formFieldInput`, `socialButtonsBlockButton`).
    *   `<AuthAnalytics>` mounts to silently link Clerk User IDs to PostHog identities.
    *   `<BrowserRouter>` initializes.

## 2. Router (`main.tsx` -> `react-router-dom`)
*   If the user hits `/` or any public route (e.g., `/privacy`), they are routed to `<PublicLayout>` which renders the `<HomePage>` or respective page. No authentication is triggered.
*   If the user hits `/app`, they are routed to the `<App />` component.

## 3. The Private App Entry (`App.tsx`)
1.  **Imports**: Heavy Finix panels (like `TaqdeerPanel`, `CibilPanel`) are mapped using `React.lazy()`.
2.  **Authentication Check**: `App.tsx` calls Clerk's `useUser()`.
    *   If `!isLoaded`, a loading spinner is shown.
    *   If `!isSignedIn`, the user is returned `<LoginScreen />` (which renders Clerk's `<SignIn />` and `<SignUp />` components).
3.  **Hydration**: Once signed in, `useEffect` triggers `dashboardStore.hydrateFromSupabase()`. This syncs the local Zustand store with PostgreSQL.
4.  **Layout Render**: `<DashboardLayout>` mounts. This component draws the Sidebar and TopNav.
5.  **Tab State Rendering**: Rather than nested routes (e.g., `/app/optimizer`), `DashboardLayout` manages an active `TabId` state. It renders children based on this state (e.g., if Tab = 'optimizer', it mounts the `WalletOptimizerTab` wrapper, which then mounts `WalletOptimizerPanel`).
6.  **Intelligence Engines**: Within `HomeTab`, React custom hooks (`useRecommendations()`, `useFinancialHealth()`, `useTaqdeerDecision()`) fire. They read directly from the `useDashboardStore`, perform client-side processing, and return insights that map into `<StatPanel>` UI components.
