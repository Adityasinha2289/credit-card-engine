/**
 * Tools, inside the app: the website's calculators and card directory, opened
 * in the app shell so a signed-in user never has to leave it to use them.
 */
import { Calculator, CreditCard, Gauge, Percent, Scale, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ArrowChip } from '../../public-platform/site/primitives';
import { CardFan } from '../../public-platform/site/CardFan';
import { CATALOG_STATS, cardsByIds } from '../../public-platform/site/swipeMath';
import { useDashboardStore } from '../../features/dashboard/store/dashboardStore';
import { cn } from '../../lib/utils';

const TOOLS = [
  { to: '/app/tools/which-card-to-use', icon: Sparkles, title: 'Which card to use', body: 'Rank the cards you hold for any spend, with the rupee value of each.' },
  { to: '/app/tools/credit-card-reward-calculator', icon: Calculator, title: 'Reward calculator', body: 'A year of rewards on your spending, after caps and the annual fee.' },
  { to: '/app/tools/annual-fee-break-even', icon: Scale, title: 'Annual fee break-even', body: 'How much you need to spend before a fee pays for itself.' },
  { to: '/app/tools/credit-utilization', icon: Gauge, title: 'Credit utilisation', body: 'How much of your limit you use, and what that does to your score.' },
];

export default function ToolsPage() {
  const userCards = useDashboardStore((s) => s.userCards);
  const sample = cardsByIds(['hdfc_infinia', 'axis_atlas', 'sbi_cashback', 'hdfc_swiggy', 'icici_amazon_pay']);
  const fan = userCards.length >= 3
    ? userCards.slice(0, 5).map((c) => ({ id: c.id, name: c.label || 'Credit card', bank: c.bank || '', network: c.network }))
    : sample.map((c) => ({ id: c.id, name: c.name, bank: c.bank, network: c.network }));

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col px-4 pb-24 pt-2 md:px-8 lg:px-12">
      <section className="relative overflow-hidden rounded-[36px] bg-rc-night px-7 py-10 text-rc-cream md:px-10 md:py-12">
        <div aria-hidden className="pointer-events-none absolute -left-24 -top-32 h-[420px] w-[520px] rounded-full bg-[radial-gradient(closest-side,rgba(227,238,212,0.12),transparent)]" />
        <div className="relative grid items-center gap-8 md:grid-cols-[1fr_auto]">
          <div>
            <p className="flex items-center gap-2.5 text-[12px] font-semibold uppercase tracking-[0.2em] text-rc-mist">
              <span aria-hidden className="h-2 w-2 rounded-full bg-rc-pistachio" /> Tools
            </p>
            <h1 className="mt-5 font-display text-[clamp(2.4rem,4.6vw,3.9rem)] font-semibold leading-[1] tracking-[-0.03em]">
              Work it out, <span className="italic text-rc-pistachio">before you pay.</span>
            </h1>
            <p className="mt-5 max-w-[46ch] text-[16px] leading-relaxed text-rc-mist">
              The same calculators as the website, plus the full card directory: {CATALOG_STATS.cards} cards with reward rates you can compare. They open right here in the app.
            </p>
          </div>
          <CardFan className="hidden md:block" width={180} cards={fan} />
        </div>
      </section>

      <ul className="mt-6 grid gap-3 md:grid-cols-2">
        {TOOLS.map((t, i) => (
          <li key={t.to}>
            <Link
              to={t.to}
              className={cn(
                'group flex h-full items-start justify-between gap-6 rounded-[28px] border p-6 transition-[border-color,box-shadow,transform] duration-500 hover:-translate-y-0.5 md:p-7',
                i === 0 ? 'border-transparent bg-rc-pistachio text-rc-ink' : 'border-rc-ink/10 bg-rc-paper text-rc-ink hover:border-rc-ink/25 hover:shadow-[0_24px_50px_-34px_rgba(15,42,29,0.45)]',
              )}
            >
              <span>
                <span className={cn('flex h-11 w-11 items-center justify-center rounded-2xl', i === 0 ? 'bg-rc-ink text-rc-pistachio' : 'bg-rc-ink/[0.06] text-rc-forest')}>
                  <t.icon className="h-5 w-5" strokeWidth={1.8} />
                </span>
                <span className="mt-6 block font-display text-[26px] font-semibold leading-tight tracking-[-0.02em]">{t.title}</span>
                <span className="mt-2 block max-w-[38ch] text-[15px] leading-relaxed text-rc-ink/70">{t.body}</span>
              </span>
              <ArrowChip variant="ink" size="md" />
            </Link>
          </li>
        ))}
      </ul>

      <Link
        to="/app/cards"
        className="group mt-3 flex flex-col justify-between gap-6 overflow-hidden rounded-[28px] bg-rc-ink p-6 text-rc-cream transition-transform duration-500 hover:-translate-y-0.5 md:flex-row md:items-center md:p-8"
      >
        <span className="flex items-center gap-5">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rc-pistachio text-rc-ink"><CreditCard className="h-5 w-5" strokeWidth={1.8} /></span>
          <span>
            <span className="block font-display text-[26px] font-semibold leading-tight tracking-[-0.02em]">Card directory</span>
            <span className="mt-1 block text-[15px] text-rc-mist">Fees, reward rates, lounge access and eligibility, card by card.</span>
          </span>
        </span>
        <span className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-[14px] text-rc-mist"><Percent className="h-4 w-4" /> {CATALOG_STATS.cards} cards · {CATALOG_STATS.banks} issuers</span>
          <ArrowChip variant="cream" size="md" />
        </span>
      </Link>
    </div>
  );
}
