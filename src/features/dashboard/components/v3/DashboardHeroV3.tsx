import { getGreeting } from '../../../../lib/utils';
import type { UserProfile } from '../../types/dashboard.types';
import type { LedgerSummary } from '../../../../features/financial-ledger';

interface DashboardHeroV3Props {
  profile: UserProfile | null;
  ledgerSummary: LedgerSummary;
}

export function DashboardHeroV3({ profile, ledgerSummary }: DashboardHeroV3Props) {
  const firstName = profile?.name?.split(' ')[0] || 'there';
  
  // Decide subtitle based on ledger
  const hasSavings = ledgerSummary.totalSavings > 0;
  const subtitle = hasSavings 
    ? `You have ₹${ledgerSummary.totalSavings.toLocaleString('en-IN')} in potential savings today.`
    : 'Your wallet is fully optimised today.';

  return (
    <div className="pt-6 pb-2">
      <h1 className="text-3xl md:text-4xl font-display font-semibold tracking-tight text-ink-primary">
        {getGreeting()}, <span className="text-gradient-brand">{firstName}</span>.
      </h1>
      <p className="text-sm md:text-base text-ink-secondary mt-2 font-medium">
        {subtitle}
      </p>
    </div>
  );
}
