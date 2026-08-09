import React, { Suspense, lazy } from 'react';
import { Sparkles } from 'lucide-react';
import { PageContainer } from '../../components/shared/PageContainer';

const TaqdeerPanel = lazy(() => import('../../features/finix/components/TaqdeerPanel').then(m => ({ default: m.TaqdeerPanel })));

export default function TaqdeerPage() {
  return (
    <PageContainer title="Taqdeer AI" subtitle="Your AI Financial Copilot">
      <div className="panel-glass rounded-3xl p-8 min-h-[50vh] flex flex-col items-center justify-center text-center border border-brand-emerald/20">
        <div className="w-16 h-16 rounded-full bg-brand-emerald/10 flex items-center justify-center mb-6">
          <Sparkles className="text-brand-emerald" size={24} />
        </div>
        <h2 className="text-2xl font-display font-medium text-text-primary mb-2">Taqdeer is ready</h2>
        <p className="text-text-muted mb-8 max-w-md">Interact with the orb on the bottom right to start your AI-powered financial consultation.</p>
      </div>
      <Suspense fallback={null}>
        <TaqdeerPanel />
      </Suspense>
    </PageContainer>
  );
}
