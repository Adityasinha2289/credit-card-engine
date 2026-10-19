import { ClerkProvider } from '@clerk/clerk-react';
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
        // Light, on-brand auth UI (the sign-in page and the app are both light).
        variables: {
          colorPrimary: '#0F2A1D',
          colorText: '#0F2A1D',
          colorTextSecondary: '#4D6354',
          colorBackground: '#FFFFFF',
          colorInputBackground: '#FFFFFF',
          colorInputText: '#0F2A1D',
          colorDanger: '#B42318',
          colorSuccess: '#2A9D5C',
          borderRadius: '0.875rem',
          fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
          fontSize: '15px',
        },
        elements: {
          rootBox: 'w-full',
          cardBox: 'w-full shadow-none border-none',
          card: 'bg-transparent shadow-none border-none w-full p-0 sm:p-0 gap-6',
          header: 'hidden',
          socialButtonsBlockButton: 'h-12 bg-white border border-[#0F2A1D]/15 !shadow-none hover:bg-[#F6F4EC] text-[#0F2A1D] !rounded-full transition-colors',
          socialButtonsBlockButtonText: 'text-[14px] font-medium text-[#0F2A1D]',
          dividerLine: 'bg-[#0F2A1D]/10',
          dividerText: 'text-[#4D6354] text-[11px] uppercase tracking-[0.2em]',
          formFieldLabel: 'text-[13px] font-medium text-[#0F2A1D]',
          formFieldInput: 'h-12 bg-white border border-[#0F2A1D]/15 !shadow-none text-[#0F2A1D] !rounded-full px-4 placeholder:text-[#4D6354]/70 focus:border-[#0F2A1D]/50 focus:ring-0 transition-colors',
          formButtonPrimary: 'h-12 bg-[#0F2A1D] hover:bg-[#16382A] text-[#F6F4EC] text-[14px] font-medium normal-case !rounded-full !border-none !shadow-none transition-colors',
          formFieldAction: 'text-[#375534]',
          footer: 'hidden',
          footerAction: 'hidden',
          identityPreview: 'bg-white border border-[#0F2A1D]/15 !rounded-full',
          identityPreviewText: 'text-[#0F2A1D]',
          identityPreviewEditButtonIcon: 'text-[#375534]',
          otpCodeFieldInput: 'border-[#0F2A1D]/20 text-[#0F2A1D]',
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <AuthAnalytics />
        <App />
      </QueryClientProvider>
    </ClerkProvider>
  );
}
