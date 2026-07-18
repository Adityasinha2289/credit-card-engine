import React from 'react';
import * as Sentry from '@sentry/react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

const FallbackComponent = ({ resetError }: { resetError: () => void }) => {
  return (
    <div className="min-h-screen bg-canvas-50 dark:bg-canvas-300 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-canvas-100 dark:bg-canvas-200 rounded-[2rem] p-8 shadow-ag-glow-primary border border-canvas-200/60 dark:border-white/[0.04] flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
          <AlertTriangle size={32} className="text-red-500" />
        </div>
        
        <h1 className="text-2xl font-display font-bold text-ink-primary mb-3">
          Something went wrong
        </h1>
        
        <p className="text-sm text-ink-secondary leading-relaxed mb-8">
          We encountered an unexpected error. Our engineering team has been automatically notified and is looking into it.
        </p>

        <button
          onClick={resetError}
          className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm py-3.5 rounded-full shadow-ag-glow-primary transition-all active:scale-[0.98]"
        >
          <RefreshCcw size={16} />
          Try Again
        </button>
      </div>
    </div>
  );
};

export class ErrorBoundary extends React.Component<Props> {
  render() {
    return (
      <Sentry.ErrorBoundary fallback={({ resetError }) => <FallbackComponent resetError={resetError} />}>
        {this.props.children}
      </Sentry.ErrorBoundary>
    );
  }
}

