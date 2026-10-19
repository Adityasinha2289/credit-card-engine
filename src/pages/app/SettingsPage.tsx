import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useClerk, useUser } from '@clerk/clerk-react';
import { Bell, FileText, KeyRound, LogOut, Target, User, Wallet } from 'lucide-react';

import { PageContainer } from '../../components/shared/PageContainer';
import { cn } from '../../lib/utils';
import { useDashboardStore } from '../../features/dashboard/store/dashboardStore';
import { goalTitle } from '../../config/goals';

/** Every row leads somewhere real; nothing here is a placeholder. */
function SettingsRow({ icon: Icon, title, description, onClick, destructive }: {
  icon: React.ElementType;
  title: string;
  description: React.ReactNode;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center justify-between gap-4 border-b border-rc-ink/[0.07] px-5 py-4 text-left transition-colors last:border-0 hover:bg-white/70"
    >
      <span className="flex items-start gap-4">
        <span className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl',
          destructive ? 'bg-[#C2410C]/10 text-[#C2410C]' : 'bg-rc-ink/[0.06] text-rc-forest',
        )}>
          <Icon size={18} strokeWidth={1.7} />
        </span>
        <span>
          <span className={cn('block text-[15px] font-semibold', destructive ? 'text-[#C2410C]' : 'text-rc-ink')}>{title}</span>
          <span className="mt-0.5 block text-[14px] text-rc-muted">{description}</span>
        </span>
      </span>
      {!destructive && <span aria-hidden className="text-rc-muted transition-transform group-hover:translate-x-0.5">→</span>}
    </button>
  );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 font-display text-[24px] font-semibold tracking-[-0.02em] text-rc-ink">{title}</h2>
      <div className="overflow-hidden rounded-[26px] border border-rc-ink/10 bg-rc-paper">{children}</div>
    </section>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { signOut, openUserProfile } = useClerk();
  const { user } = useUser();
  const profile = useDashboardStore((s) => s.profile);
  const userCards = useDashboardStore((s) => s.userCards);
  const subscriptions = useDashboardStore((s) => s.subscriptions);
  const goal = goalTitle(profile?.primaryGoal);
  const email = user?.primaryEmailAddress?.emailAddress ?? profile?.email;
  const activeSubs = subscriptions.filter((s) => s.status === 'active').length;

  return (
    <PageContainer
      eyebrow="Settings"
      title={<>Your account, <span className="italic">your rules.</span></>}
      subtitle={email ? `Signed in as ${email}.` : undefined}
      heroStats={[
        { value: userCards.length, label: userCards.length === 1 ? 'card in your wallet' : 'cards in your wallet' },
        { value: activeSubs, label: activeSubs === 1 ? 'subscription tracked' : 'subscriptions tracked' },
      ]}
    >
      <div className="grid max-w-[760px] gap-9">
        <SettingsSection title="You">
          <SettingsRow icon={User} title="Profile" description="Name, income range and credit score range." onClick={() => navigate('/app/profile')} />
          <SettingsRow icon={Target} title="Goal" description={goal ? `Optimising for: ${goal}.` : 'Tell RenoCred what to optimise for.'} onClick={() => navigate('/app/profile')} />
          <SettingsRow icon={Wallet} title="Cards" description="Add or remove the cards you hold, and their limits." onClick={() => navigate('/app/wallet')} />
        </SettingsSection>

        <SettingsSection title="Reminders">
          <SettingsRow
            icon={Bell}
            title="Renewal and trial reminders"
            description="Choose email or push, and how many days before each charge."
            onClick={() => navigate('/app/money/subscriptions')}
          />
        </SettingsSection>

        <SettingsSection title="Account and privacy">
          <SettingsRow icon={KeyRound} title="Sign-in and security" description="Email, password, connected Google account and active sessions." onClick={() => openUserProfile()} />
          <SettingsRow icon={FileText} title="How we use your data" description="We never pull your credit report or store full card numbers." onClick={() => navigate('/privacy')} />
          <SettingsRow icon={LogOut} title="Sign out" description="Sign out of RenoCred on this device." destructive onClick={() => signOut({ redirectUrl: '/' })} />
        </SettingsSection>
      </div>
    </PageContainer>
  );
}
