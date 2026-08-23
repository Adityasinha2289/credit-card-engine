import { ClerkProvider } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthAnalytics } from './AuthAnalytics';
import App from '../App';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'mock_key';

export default function AuthenticatedAppWrapper() {
  return (
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY} 
      afterSignOutUrl="/"
      signInFallbackRedirectUrl="/app"
      signUpFallbackRedirectUrl="/app"
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#2A9D5C',
          colorText: 'white',
          colorBackground: 'transparent',
          colorInputBackground: 'rgba(255, 255, 255, 0.03)',
          colorInputText: 'white',
          borderRadius: '0.75rem',
          fontFamily: 'inherit',
        },
        elements: {
          rootBox:"w-full flex justify-center",
          cardBox:"w-full shadow-none border-none",
          card:"bg-transparent shadow-none border-none w-full p-0 sm:p-0",
          headerTitle:"font-display font-bold text-2xl text-white tracking-tight",
          headerSubtitle:"text-white/60",
          socialButtonsBlockButton:"bg-[#151515] border border-gray-700 !shadow-none hover:bg-[#1e1e1e] text-white !rounded-full py-3 transition-colors",
          socialButtonsBlockButtonText:"text-sm font-semibold",
          dividerLine:"bg-white/10",
          dividerText:"text-white/40 text-xs uppercase tracking-widest font-bold",
          formFieldLabel:"text-xs font-bold text-white/60",
          formFieldInput:"bg-[#151515] border border-gray-700 !shadow-none !outline-none text-white !rounded-full px-4 py-3 focus:border-[#2A9D5C]/50 focus:ring-1 focus:ring-[#2A9D5C]/30 transition-all text-sm",
          formButtonPrimary:"bg-[#2A9D5C] hover:bg-[#2A9D5C]/90 text-white font-bold text-sm py-3 !rounded-full !border-none !shadow-none transition-all active:scale-[0.98]",
          footer:"hidden",
          footerAction:"hidden",
          footerActionText:"hidden",
          footerActionLink:"hidden",
          identityPreviewText:"text-white",
          identityPreviewEditButtonIcon:"text-[#2A9D5C] hover:text-[#2A9D5C]/80",
        }
      }}
    >
      <QueryClientProvider client={queryClient}>
        <AuthAnalytics />
        <App />
      </QueryClientProvider>
    </ClerkProvider>
  );
}
