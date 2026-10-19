/**
 * Experiences: the perks already on your cards (as tickets), plans for trips,
 * dates and weekends that pay with the right card at each step, and partner
 * offers by category.
 */
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Film, Gift, Heart, Map as MapIcon, PlaneTakeoff, Plus, Utensils } from 'lucide-react';
import { PageContainer } from '../../components/shared/PageContainer';
import { MARKETPLACE_CATEGORIES } from '../../features/marketplace/taxonomy/categories';
import { useDashboardStore } from '../../features/dashboard/store/dashboardStore';
import AddCardModal from '../../features/dashboard/components/AddCardModal';
import { cardsByIds } from '../../public-platform/site/swipeMath';
import { EASE_OUT, formatINR } from '../../public-platform/site/primitives';
import { PerkTicket, type Perk } from './PerkTicket';

const PLANS = [
  { to: '/app/plan/trip', icon: PlaneTakeoff, title: 'A trip', note: 'Flights, stays and getting around' },
  { to: '/app/plan/weekend', icon: MapIcon, title: 'A weekend away', note: 'A short break, sorted' },
  { to: '/app/plan/date', icon: Heart, title: 'A date', note: 'Dinner and after' },
  { to: '/app/plan/movie', icon: Film, title: 'A movie night', note: 'Tickets and food' },
  { to: '/app/plan/food', icon: Utensils, title: 'A food day', note: 'Where to eat, all day' },
  { to: '/app/plan/occasion', icon: Gift, title: 'An occasion', note: 'Birthdays and the rest' },
];

export default function MarketplaceHome() {
  const reduce = useReducedMotion();
  const userCards = useDashboardStore((s) => s.userCards);
  const [adding, setAdding] = useState(false);

  // what the issuers publish for the cards in the wallet: lounges, joining bonuses, fee waivers
  const perks = useMemo<Perk[]>(() => {
    const out: Perk[] = [];
    for (const c of cardsByIds(userCards.map((u) => u.id))) {
      if (c.loungeAccess) out.push({ key: `${c.id}-lounge`, kind: 'Airport lounge', big: String(c.loungeAccess), unit: 'visits a year, free', card: c });
      if (c.welcomeBonus) out.push({ key: `${c.id}-welcome`, kind: 'Welcome', big: c.welcomeBonus.match(/₹[\d,]+/)?.[0] ?? '✓', unit: c.welcomeBonus.replace(/₹[\d,]+\s*/, '') || 'joining benefit', card: c });
      if (c.annualFee && c.feeWaiverSpend) out.push({ key: `${c.id}-waiver`, kind: 'Fee waiver', big: formatINR(c.feeWaiverSpend), unit: `a year in spend waives the ${formatINR(c.annualFee)} fee`, card: c });
    }
    return out.sort((a, b) => ['Airport lounge', 'Welcome', 'Fee waiver'].indexOf(a.kind) - ['Airport lounge', 'Welcome', 'Fee waiver'].indexOf(b.kind));
  }, [userCards]);
  const lounges = perks.filter((p) => p.kind === 'Airport lounge').reduce((s, p) => s + Number(p.big), 0);

  const band = perks.length > 0 ? (
    <div>
      <p className="text-[15px] text-rc-mist">
        {lounges > 0 ? <><span className="font-semibold text-rc-cream">{lounges} free lounge visits</span> a year across your cards, and what else they come with.</> : 'What your cards come with, as each issuer publishes it.'}
      </p>
      <div className="-mx-5 mt-6 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 pb-6 pt-2 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:snap-none sm:px-0 [&::-webkit-scrollbar]:hidden">
        {perks.map((p, i) => <PerkTicket key={p.key} perk={p} i={i} />)}
      </div>
    </div>
  ) : (
    <button type="button" onClick={() => setAdding(true)} className="flex w-full max-w-[420px] items-center gap-4 rounded-[22px] border border-dashed border-white/20 px-5 py-5 text-left hover:border-white/40">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rc-pistachio text-rc-ink"><Plus size={19} /></span>
      <span>
        <span className="block text-[16px] font-medium text-rc-cream">Add your cards</span>
        <span className="block text-[14px] text-rc-mist">Their lounge visits, joining bonuses and fee waivers show up here.</span>
      </span>
    </button>
  );

  return (
    <PageContainer eyebrow="Experiences" title={<>Already on <span className="italic">your cards.</span></>} band={band}>
      {/* plan something */}
      <section>
        <h2 className="font-serif text-[30px] font-semibold leading-tight tracking-[-0.02em] text-rc-ink sm:text-[36px]">Plan something <span className="italic text-rc-forest">worth it.</span></h2>
        <p className="mt-1 text-[15px] text-rc-muted">Build the plan; we tell you which of your cards to pay with at each step.</p>
        <ul className="mt-5 grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-3">
          {PLANS.map((p, i) => (
            <motion.li key={p.to} initial={reduce ? false : { opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.45, ease: EASE_OUT, delay: (i % 3) * 0.06 }}>
              <Link to={p.to} className={i === 0
                ? 'group flex h-full min-h-[150px] flex-col justify-between rounded-[24px] bg-rc-ink p-4 text-rc-cream sm:p-5'
                : 'group flex h-full min-h-[150px] flex-col justify-between rounded-[24px] border border-rc-ink/[0.08] bg-rc-paper p-4 text-rc-ink transition-colors hover:bg-white sm:p-5'}>
                <span className="flex items-start justify-between">
                  <span className={i === 0 ? 'flex h-11 w-11 items-center justify-center rounded-full bg-rc-pistachio text-rc-ink' : 'flex h-11 w-11 items-center justify-center rounded-full bg-rc-pistachio/70 text-rc-forest'}>
                    <p.icon size={19} strokeWidth={1.8} />
                  </span>
                  <ArrowUpRight size={18} className="opacity-40 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" />
                </span>
                <span>
                  <span className="block font-serif text-[21px] font-semibold leading-tight">{p.title}</span>
                  <span className={i === 0 ? 'mt-0.5 block text-[13px] text-rc-mist' : 'mt-0.5 block text-[13px] text-rc-muted'}>{p.note}</span>
                </span>
              </Link>
            </motion.li>
          ))}
        </ul>
      </section>

      {/* partner offers by category */}
      <section>
        <h2 className="font-serif text-[30px] font-semibold leading-tight tracking-[-0.02em] text-rc-ink sm:text-[36px]">Offers by category</h2>
        <p className="mt-1 text-[15px] text-rc-muted">Partners we list, and the card that earns most for each kind of spend.</p>
        <ul className="mt-5 grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
          {MARKETPLACE_CATEGORIES.map((c) => (
            <li key={c.id}>
              <Link to={`/app/marketplace/${c.slug}`} className="group relative block aspect-[4/5] overflow-hidden rounded-[22px] bg-rc-ink sm:aspect-[4/3]">
                <img src={c.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105" />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-rc-night via-rc-night/40 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3.5 text-rc-cream sm:p-4">
                  <p className="flex items-center justify-between gap-2 text-[16px] font-semibold leading-tight">{c.name} <ArrowUpRight size={16} className="shrink-0 opacity-70" /></p>
                  <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-rc-mist">{c.description}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <AnimatePresence>{adding && <AddCardModal onClose={() => setAdding(false)} />}</AnimatePresence>
    </PageContainer>
  );
}
