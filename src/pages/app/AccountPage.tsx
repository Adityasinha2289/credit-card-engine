/**
 * Account: who you are to RenoCred (the profile form) and the controls for your
 * account, on one page. Replaces the separate Profile and Settings screens.
 */
import type { ElementType, ReactNode } from 'react';
import { useClerk, useUser } from '@clerk/clerk-react';
import { Bell, FileText, Globe, KeyRound, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/shared/PageContainer';
import { ProfileTab } from '../../features/dashboard/components/ProfileTab';
import { useDashboardStore } from '../../features/dashboard/store/dashboardStore';
import { goalTitle } from '../../config/goals';
import { cn } from '../../lib/utils';

function Row({ icon: Icon, title, description, onClick, href, destructive }: {
  icon: ElementType; title: string; description: ReactNode; onClick?: () => void; href?: string; destructive?: boolean;
}) {
  const inner = (
    <>
      <span className="flex items-start gap-4">
        <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl', destructive ? 'bg-[#C2410C]/10 text-[#C2410C]' : 'bg-rc-ink/[0.06] text-rc-forest')}>
          <Icon size={18} strokeWidth={1.7} />
        </span>
        <span>
          <span className={cn('block text-[15px] font-semibold', destructive ? 'text-[#C2410C]' : 'text-rc-ink')}>{title}</span>
          <span className="mt-0.5 block text-[14px] text-rc-muted">{description}</span>
        </span>
      </span>
      {!destructive && <span aria-hidden className="text-rc-muted">→</span>}
    </>
  );
  const cls = 'flex w-full items-center justify-between gap-4 border-b border-rc-ink/[0.07] px-5 py-4 text-left transition-colors last:border-0 hover:bg-white/70';
  return href ? <a href={href} className={cls}>{inner}</a> : <button type="button" onClick={onClick} className={cls}>{inner}</button>;
}

export default function AccountPage() {
  const navigate = useNavigate();
  const { signOut, openUserProfile } = useClerk();
  const { user } = useUser();
  const profile = useDashboardStore((s) => s.profile);
  const name = profile?.name || user?.fullName || '';
  const email = user?.primaryEmailAddress?.emailAddress ?? profile?.email;
  const goal = goalTitle(profile?.primaryGoal);

  return (
    <PageContainer
      eyebrow="Account"
      title={name ? <>{name.split(' ')[0]}, <span className="italic">your account.</span></> : <>Your <span className="italic">account.</span></>}
      subtitle={[email, goal ? `Goal: ${goal}` : null].filter(Boolean).join(' · ')}
    >
      <ProfileTab embedded />

      <section className="max-w-[760px]">
        <h2 className="mb-3 font-display text-[26px] font-semibold tracking-[-0.02em] text-rc-ink">Account</h2>
        <div className="overflow-hidden rounded-[26px] border border-rc-ink/10 bg-rc-paper">
          <Row icon={Bell} title="Reminders" description="Email or push before renewals and trials, and how many days ahead." onClick={() => navigate('/app/money?tab=subscriptions')} />
          <Row icon={KeyRound} title="Sign-in and security" description="Email, password, Google sign-in and active sessions." onClick={() => openUserProfile()} />
          <Row icon={FileText} title="How we use your data" description="We never pull your credit report or store full card numbers." onClick={() => navigate('/privacy')} />
          <Row icon={Globe} title="RenoCred website" description="The public site; its header takes you straight back here." href="/" />
          <Row icon={LogOut} title="Sign out" description="Sign out of RenoCred on this device." destructive onClick={() => signOut({ redirectUrl: '/' })} />
        </div>
      </section>
    </PageContainer>
  );
}
