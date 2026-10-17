/**
 * Product moments drawn in code (not screenshots), so they stay crisp, on-brand
 * and in sync with the real reward maths. Example data is labelled as such.
 */
import { useMemo, type ReactNode } from 'react';
import { Bell, Mail, Smartphone, Sparkles, ArrowUp } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { formatINR } from '../../site/primitives';
import { CardFace, displayCardName } from '../../site/CardFace';
import { cardsByIds, rankCards, topCardsForProfile, type SpendProfile } from '../../site/swipeMath';

function Frame({ tone, children, className }: { tone: 'pistachio' | 'ink' | 'paper'; children: ReactNode; className?: string }) {
  return (
    <div className={cn(
      'relative h-full w-full overflow-hidden rounded-[32px] p-6 sm:p-10',
      tone === 'pistachio' && 'bg-rc-pistachio',
      tone === 'ink' && 'bg-rc-ink text-rc-cream',
      tone === 'paper' && 'border border-rc-ink/10 bg-rc-paper',
      className,
    )}>
      {children}
    </div>
  );
}

function ExampleTag({ dark }: { dark?: boolean }) {
  return (
    <span className={cn('absolute right-6 top-6 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]', dark ? 'bg-white/10 text-rc-mist' : 'bg-rc-ink/[0.06] text-rc-muted')}>
      Example
    </span>
  );
}

export function WalletMock() {
  const ranked = useMemo(() => rankCards(cardsByIds(['hdfc_swiggy', 'sbi_cashback', 'axis_ace']), 'dining', 1850), []);
  return (
    <Frame tone="pistachio" className="flex flex-col justify-center">
      <ExampleTag />
      <div className="mx-auto w-full max-w-[420px]">
        <div className="flex items-center justify-between rounded-2xl bg-white px-5 py-4 shadow-[0_12px_30px_-18px_rgba(10,31,21,0.4)]">
          <div>
            <p className="text-[12px] text-rc-muted">Paying at</p>
            <p className="text-[17px] font-medium text-rc-ink">Swiggy</p>
          </div>
          <p className="font-serif text-[26px] text-rc-ink tabular-nums">{formatINR(1850)}</p>
        </div>
        <p className="mb-3 mt-7 text-[11px] font-semibold uppercase tracking-[0.2em] text-rc-ink/60">Your cards, ranked</p>
        <ol className="space-y-2.5">
          {ranked.map((r, i) => (
            <li key={r.card.id} className={cn('flex items-center gap-4 rounded-2xl px-4 py-3.5', i === 0 ? 'bg-rc-ink text-rc-cream shadow-[0_18px_40px_-20px_rgba(10,31,21,0.6)]' : 'bg-white/70 text-rc-ink')}>
              <CardFace name={r.card.name} bank={r.card.bank} width={64} lifted={false} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium">{displayCardName(r.card.name)}</p>
                <p className={cn('text-[12px]', i === 0 ? 'text-rc-mist' : 'text-rc-muted')}>{r.rate}% on dining</p>
              </div>
              <p className={cn('text-[15px] font-medium tabular-nums', i === 0 && 'text-rc-pistachio')}>+{formatINR(r.reward)}</p>
            </li>
          ))}
        </ol>
      </div>
    </Frame>
  );
}

export function ChatMock() {
  return (
    <Frame tone="ink" className="flex flex-col">
      <ExampleTag dark />
      <div className="flex items-center gap-3">
        <img src="/taqdeer-logo.png" alt="" className="h-9 w-9 rounded-full bg-rc-moss object-cover" />
        <div>
          <p className="text-[15px] font-medium">Taqdeer</p>
          <p className="text-[12px] text-rc-mist">Answers from your cards and our catalogue</p>
        </div>
      </div>
      <div className="mt-8 flex flex-1 flex-col justify-center gap-4">
        <p className="ml-auto max-w-[80%] rounded-[20px] rounded-br-md bg-rc-pistachio px-5 py-3.5 text-[15px] leading-relaxed text-rc-ink">
          Goa trip next month, ₹40,000 on flights and hotels. Kaunsa card use karun?
        </p>
        <div className="max-w-[88%] rounded-[20px] rounded-bl-md bg-rc-moss px-5 py-4 text-[15px] leading-relaxed">
          <p>Book it on your <strong className="font-semibold text-rc-pistachio">Axis Atlas</strong>.</p>
          <ul className="mt-2 space-y-1 text-rc-cream/90">
            <li>5% of ₹40,000 = <span className="tabular-nums">₹2,000</span> in miles</li>
            <li>Amazon Pay ICICI would earn ₹400 (1%)</li>
          </ul>
          <p className="mt-2 text-[13px] text-rc-mist">Travel rewards can be capped each month, so check Atlas's limit before one big booking.</p>
        </div>
      </div>
      <div className="mt-6 flex items-center gap-3 rounded-full bg-white/[0.06] py-2 pl-5 pr-2 text-[14px] text-rc-mist">
        <span className="flex-1">Ask about any card, in English or Hindi</span>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-rc-cream text-rc-ink"><ArrowUp className="h-4 w-4" /></span>
      </div>
    </Frame>
  );
}

const MONEY = { income: 90000, spent: 20000, budgets: 17420, renewals: 1968, savings: 15000 };
const SAFE = MONEY.income - MONEY.spent - MONEY.budgets - MONEY.renewals - MONEY.savings;

export function MoneyMock() {
  const parts = [
    { label: 'Spent so far', value: MONEY.spent, cls: 'bg-rc-ink' },
    { label: 'Held for budgets', value: MONEY.budgets, cls: 'bg-rc-forest' },
    { label: 'Renewals due', value: MONEY.renewals, cls: 'bg-rc-sage' },
    { label: 'Savings goals', value: MONEY.savings, cls: 'bg-rc-mist' },
    { label: 'Safe to spend', value: SAFE, cls: 'bg-rc-emerald' },
  ];
  return (
    <Frame tone="paper" className="flex flex-col justify-center">
      <ExampleTag />
      <div className="mx-auto w-full max-w-[440px]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-rc-muted">Safe to spend this month</p>
        <p className="mt-3 font-serif text-[clamp(3rem,6vw,4.5rem)] leading-none text-rc-ink tabular-nums">{formatINR(SAFE)}</p>
        <p className="mt-3 text-[15px] text-rc-muted">About {formatINR(SAFE / 16)} a day for the next 16 days</p>
        <div className="mt-10 flex h-3 overflow-hidden rounded-full" aria-hidden>
          {parts.map((p) => <span key={p.label} className={p.cls} style={{ width: `${(p.value / MONEY.income) * 100}%` }} />)}
        </div>
        <dl className="mt-6 divide-y divide-rc-ink/10 border-y border-rc-ink/10">
          <div className="flex justify-between py-3 text-[14px]"><dt className="text-rc-muted">Income</dt><dd className="tabular-nums text-rc-ink">{formatINR(MONEY.income)}</dd></div>
          {parts.map((p) => (
            <div key={p.label} className="flex items-center justify-between py-3 text-[14px]">
              <dt className="flex items-center gap-2.5 text-rc-muted"><span className={cn('h-2 w-2 rounded-full', p.cls)} />{p.label}</dt>
              <dd className={cn('tabular-nums', p.label === 'Safe to spend' ? 'font-medium text-rc-emerald' : 'text-rc-ink')}>{p.label === 'Safe to spend' ? '' : '−'}{formatINR(p.value)}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Frame>
  );
}

const RENEWALS = [
  { name: 'Netflix', when: 'Renews in 2 days', amount: 649, note: 'Up from ₹499', tone: 'warn' as const },
  { name: 'Cult.fit', when: 'Free trial ends in 5 days', amount: 1200, note: 'Converts to paid', tone: 'warn' as const },
  { name: 'Spotify', when: 'Renews in 12 days', amount: 119 },
  { name: 'Amazon Prime', when: 'Renews yearly, 4 Nov', amount: 1499 },
];

export function RemindersMock() {
  return (
    <Frame tone="pistachio" className="flex flex-col justify-center">
      <div className="mx-auto w-full max-w-[440px]">
        {/* notification, as it lands on the phone */}
        <div className="mb-8 ml-auto w-[88%] rounded-2xl bg-white/90 p-4 shadow-[0_20px_40px_-24px_rgba(10,31,21,0.5)] backdrop-blur">
          <div className="flex items-center gap-2 text-[11px] text-rc-muted">
            <img src="/logo.jpg" alt="" className="h-4 w-4 rounded" /> RenoCred · now
          </div>
          <p className="mt-1.5 text-[14px] font-medium text-rc-ink">Netflix renews tomorrow</p>
          <p className="text-[13px] text-rc-muted">₹649 will be charged. That's ₹150 more than last month.</p>
        </div>
        <div className="rounded-[22px] bg-white p-2 shadow-[0_20px_50px_-30px_rgba(10,31,21,0.45)]">
          <div className="flex items-center justify-between px-4 pb-2 pt-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-rc-muted">Coming up</p>
            <div className="flex gap-1.5 text-rc-muted" aria-label="Reminder channels: email, push, in-app">
              <Mail className="h-4 w-4" /><Smartphone className="h-4 w-4" /><Bell className="h-4 w-4" />
            </div>
          </div>
          <ul>
            {RENEWALS.map((r) => (
              <li key={r.name} className="flex items-center justify-between gap-4 rounded-2xl px-4 py-3 odd:bg-rc-cream/60">
                <div className="min-w-0">
                  <p className="text-[14px] font-medium text-rc-ink">{r.name}</p>
                  <p className="text-[12px] text-rc-muted">
                    {r.when}{r.note && <span className="ml-1.5 rounded-full bg-[#F4E3C8] px-2 py-0.5 text-[11px] text-[#7A4B12]">{r.note}</span>}
                  </p>
                </div>
                <p className="text-[14px] tabular-nums text-rc-ink">{formatINR(r.amount)}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Frame>
  );
}

const PROFILE: SpendProfile = { dining: 6000, travel: 5000, shopping: 8000, utilities: 3000, groceries: 6000, fuel: 2000 };

export function DiscoverMock() {
  const top = useMemo(() => topCardsForProfile(PROFILE, 3), []);
  const monthly = Object.values(PROFILE).reduce((s, v) => s + (v ?? 0), 0);
  return (
    <Frame tone="ink" className="flex flex-col justify-center">
      <ExampleTag dark />
      <div className="mx-auto w-full max-w-[460px]">
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-rc-mist">
          <Sparkles className="h-3.5 w-3.5" /> For {formatINR(monthly)} a month of spend
        </p>
        <ol className="mt-6 space-y-3">
          {top.map((r, i) => (
            <li key={r.card.id} className={cn('flex items-center gap-4 rounded-2xl p-4', i === 0 ? 'bg-rc-cream text-rc-ink' : 'bg-white/[0.05]')}>
              <span className="hidden sm:block"><CardFace name={r.card.name} bank={r.card.bank} width={92} lifted={i === 0} /></span>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-medium leading-snug">{displayCardName(r.card.name)}</p>
                <p className={cn('text-[12px]', i === 0 ? 'text-rc-muted' : 'text-rc-mist')}>
                  {r.card.annualFee ? `${formatINR(r.card.annualFee)} fee` : 'No annual fee'}
                  {r.card.minIncome ? ` · income ${formatINR(r.card.minIncome / 100000)}L+` : ''}
                </p>
              </div>
              <p className="text-right">
                <span className={cn('block font-serif text-[22px] leading-none tabular-nums', i === 0 ? 'text-rc-emerald' : 'text-rc-pistachio')}>+{formatINR(r.net)}</span>
                <span className={cn('text-[11px]', i === 0 ? 'text-rc-muted' : 'text-rc-mist')}>a year, after fee</span>
              </p>
            </li>
          ))}
        </ol>
      </div>
    </Frame>
  );
}
