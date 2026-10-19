/**
 * Account: your member card, your details, how we remind you, and sign-in.
 */
import { useClerk, useUser } from '@clerk/clerk-react';
import { ArrowUpRight, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageContainer } from '../../components/shared/PageContainer';
import { ProfileTab } from '../../features/dashboard/components/ProfileTab';
import { ReminderSettings } from '../../features/subscriptions/components/ReminderSettings';
import { useDashboardStore } from '../../features/dashboard/store/dashboardStore';
import { Reveal } from '../../public-platform/site/primitives';
import { MemberCard } from './account/MemberCard';
import { AvatarPicker } from './account/AvatarPicker';

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <Reveal as="section">
      <h2 className="font-serif text-[26px] font-semibold leading-tight tracking-[-0.02em] text-rc-ink sm:text-[30px]">{title}</h2>
      {note && <p className="mt-1 text-[14px] text-rc-muted">{note}</p>}
      <div className="mt-4">{children}</div>
    </Reveal>
  );
}

export default function AccountPage() {
  const { signOut, openUserProfile } = useClerk();
  const { user } = useUser();
  const profile = useDashboardStore((s) => s.profile);
  const userCards = useDashboardStore((s) => s.userCards);
  const name = profile?.name || user?.fullName || '';
  const email = user?.primaryEmailAddress?.emailAddress ?? profile?.email ?? '';
  const since = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : null;

  const row = 'flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-white';

  return (
    <PageContainer
      eyebrow={email}
      title={name ? <>{name.split(' ')[0]}, <span className="italic">your account.</span></> : <>Your <span className="italic">account.</span></>}
      center
      band={<MemberCard name={name} since={since} cards={userCards.length} avatar={profile?.avatar || null} />}
    >
      <div className="mx-auto grid w-full max-w-[980px] grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-2 lg:gap-12">
        <Section title="Your details">
          <div className="space-y-4">
            <AvatarPicker />
            <ProfileTab embedded />
          </div>
        </Section>

        <div className="min-w-0 space-y-10">
          <Section title="Reminders" note="Before subscriptions renew, trials turn paid and card bills fall due.">
            <ReminderSettings />
          </Section>

          <Section title="Sign-in">
            <div className="divide-y divide-rc-ink/[0.07] overflow-hidden rounded-[24px] border border-rc-ink/[0.08] bg-rc-paper">
              <button type="button" onClick={() => openUserProfile()} className={row}>
                <span><span className="block text-[15px] font-medium text-rc-ink">Password and security</span><span className="block text-[13px] text-rc-muted">Email, password, Google sign-in, devices</span></span>
                <ChevronRight size={18} className="shrink-0 text-rc-ink/30" />
              </button>
              <Link to="/privacy" className={row}>
                <span><span className="block text-[15px] font-medium text-rc-ink">How we use your data</span><span className="block text-[13px] text-rc-muted">We never pull your credit report or store card numbers</span></span>
                <ArrowUpRight size={17} className="shrink-0 text-rc-ink/30" />
              </Link>
              <button type="button" onClick={() => signOut({ redirectUrl: '/' })} className={row}>
                <span className="text-[15px] font-medium text-[#C2410C]">Sign out</span>
              </button>
            </div>
          </Section>
        </div>
      </div>
    </PageContainer>
  );
}
