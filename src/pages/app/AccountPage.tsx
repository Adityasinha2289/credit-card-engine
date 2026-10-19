/**
 * Account: your details (what cards are ranked on) and the controls for your
 * account, on one page.
 */
import { useClerk, useUser } from '@clerk/clerk-react';
import { Bell, FileText, Globe, KeyRound, LogOut, Mail } from 'lucide-react';
import { PageContainer } from '../../components/shared/PageContainer';
import { ProfileTab } from '../../features/dashboard/components/ProfileTab';
import { useDashboardStore } from '../../features/dashboard/store/dashboardStore';
import { goalTitle } from '../../config/goals';
import { Row, RowList, SectionHead } from '../../components/shared/appUi';

export default function AccountPage() {
  const { signOut, openUserProfile } = useClerk();
  const { user } = useUser();
  const profile = useDashboardStore((s) => s.profile);
  const userCards = useDashboardStore((s) => s.userCards);
  const name = profile?.name || user?.fullName || '';
  const email = user?.primaryEmailAddress?.emailAddress ?? profile?.email;
  const goal = goalTitle(profile?.primaryGoal);
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || 'R';
  const since = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : null;

  return (
    <PageContainer
      eyebrow="Account"
      title={name ? <>{name.split(' ')[0]}, <span className="italic">your account.</span></> : <>Your <span className="italic">account.</span></>}
      heroActions={(
        <div className="flex items-center gap-4">
          <span aria-hidden className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-rc-pistachio font-serif text-[22px] font-semibold text-rc-ink">{initials}</span>
          <div className="min-w-0 text-[14px] leading-relaxed text-rc-mist">
            <p className="truncate text-[15px] font-medium text-rc-cream">{email}</p>
            <p className="truncate">
              {userCards.length} {userCards.length === 1 ? 'card' : 'cards'}{goal ? ` · ${goal}` : ''}{since ? ` · member since ${since}` : ''}
            </p>
          </div>
        </div>
      )}
    >
      <section>
        <SectionHead title="Your details" note="What we rank cards on. Change anything; nothing is shared." />
        <ProfileTab embedded />
      </section>

      <section className="max-w-[760px]">
        <SectionHead title="Account" />
        <RowList>
          <Row icon={Mail} title="Email" note={email} chevron={false} />
          <Row icon={KeyRound} title="Sign-in and security" note="Password, Google sign-in and active sessions" onClick={() => openUserProfile()} />
          <Row icon={Bell} title="Reminders" note="Before renewals and trials, and how many days ahead" to="/app/money?tab=subscriptions" />
          <Row icon={FileText} title="How we use your data" note="We never pull your credit report or store card numbers" to="/privacy" />
          <Row icon={Globe} title="RenoCred website" note="Guides, every card and the calculators" href="/" />
        </RowList>
        <RowList className="mt-3">
          <Row icon={LogOut} tone="danger" title={<span className="text-[#C2410C]">Sign out</span>} note="On this device" onClick={() => signOut({ redirectUrl: '/' })} chevron={false} />
        </RowList>
      </section>
    </PageContainer>
  );
}
