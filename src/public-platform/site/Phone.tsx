/**
 * A phone, drawn in code, and the three RenoCred screens shown on the home page.
 * Screens are laid out at a fixed 280px design width and scale with the phone.
 */
import { useMemo, type ReactNode } from 'react';
import { ReniMark } from '../../features/taqdeer/components/ReniMark';
import { ArrowUp, Bell, CreditCard, Home, MessageCircle, Wallet } from 'lucide-react';
import { cn } from '../../lib/utils';
import { CardFace, displayCardName } from './CardFace';
import { cardsByIds, rankCards } from './swipeMath';
import { formatINR } from './primitives';

const DESIGN_W = 280;

export function Phone({ children, width = DESIGN_W, className }: { children: ReactNode; width?: number; className?: string }) {
  const k = width / DESIGN_W;
  return (
    <div className={cn('relative shrink-0', className)} style={{ width, height: width * 2.06 }}>
      <div
        className="absolute inset-0 bg-[#0b0f0d]"
        style={{ borderRadius: 46 * k, padding: 9 * k, boxShadow: '0 50px 90px -30px rgba(0,0,0,0.85), inset 0 0 0 1.5px rgba(255,255,255,0.14)' }}
      >
        <div className="relative h-full w-full overflow-hidden bg-rc-cream" style={{ borderRadius: 38 * k }}>
          <div className="origin-top-left" style={{ width: DESIGN_W - 18, transform: `scale(${k})` }}>
            <div className="flex h-11 items-center justify-between px-6 text-[11px] font-semibold text-rc-ink">
              <span>9:41</span>
              <span className="flex items-center gap-1"><span className="h-2 w-3 rounded-[2px] bg-rc-ink" /></span>
            </div>
            {children}
          </div>
          <div aria-hidden className="absolute left-1/2 -translate-x-1/2 bg-black" style={{ top: 9 * k, width: 84 * k, height: 24 * k, borderRadius: 999 }} />
        </div>
      </div>
    </div>
  );
}

function TabBar({ active }: { active: number }) {
  const icons = [Home, Wallet, MessageCircle, CreditCard];
  return (
    <div className="absolute inset-x-0 bottom-0 flex h-16 items-center justify-around border-t border-rc-ink/10 bg-rc-paper px-4">
      {icons.map((Icon, i) => (
        <Icon key={i} className={cn('h-5 w-5', i === active ? 'text-rc-ink' : 'text-rc-ink/30')} strokeWidth={1.8} />
      ))}
    </div>
  );
}

export function WalletScreen() {
  const [best, ...rest] = useMemo(() => rankCards(cardsByIds(['hdfc_swiggy', 'sbi_cashback', 'axis_ace']), 'dining', 1850), []);
  return (
    <div className="relative h-[515px] px-5">
      <p className="mt-3 text-[12px] text-rc-muted">Paying at</p>
      <div className="flex items-baseline justify-between">
        <p className="font-serif text-[26px] font-semibold text-rc-ink">swiggy</p>
        <p className="font-serif text-[26px] text-rc-ink tabular-nums">{formatINR(1850)}</p>
      </div>
      <p className="mb-3 mt-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-rc-muted">Use this card</p>
      <div className="relative">
        <CardFace name={best.card.name} bank={best.card.bank} network={best.card.network} width={232} />
        <span className="absolute -bottom-3 right-2 bg-rc-ink px-3 py-1.5 text-[13px] font-semibold text-rc-pistachio">+{formatINR(best.reward)} back</span>
      </div>
      <p className="mb-2 mt-8 text-[10px] font-semibold uppercase tracking-[0.2em] text-rc-muted">Your other cards</p>
      {rest.map((r) => (
        <div key={r.card.id} className="flex items-center justify-between border-t border-rc-ink/10 py-2.5 text-[13px]">
          <span className="text-rc-ink">{displayCardName(r.card.name)}</span>
          <span className="tabular-nums text-rc-muted">{formatINR(r.reward)}</span>
        </div>
      ))}
      <TabBar active={1} />
    </div>
  );
}

/** Reni, as seen on the landing page. */
export function TaqdeerScreen() {
  return (
    <div className="relative h-[515px] px-4">
      <div className="mt-2 flex items-center gap-2.5 px-1">
        <ReniMark size={32} tone="ink" />
        <p className="font-serif text-[20px] font-semibold text-rc-ink">reni</p>
      </div>
      <div className="mt-8 space-y-3">
        <p className="ml-auto w-[82%] bg-rc-ink px-4 py-3 text-[13px] leading-snug text-rc-cream">Goa trip next month, ₹40,000. Kaunsa card use karun?</p>
        <div className="w-[88%] bg-white px-4 py-3 text-[13px] leading-snug text-rc-ink shadow-[0_8px_20px_-14px_rgba(10,31,21,0.4)]">
          <p>Book it on your <strong>Axis Atlas</strong>.</p>
          <p className="mt-1.5 text-rc-muted">5% of ₹40,000 = ₹2,000 back, against ₹400 on Amazon Pay ICICI.</p>
        </div>
      </div>
      <div className="absolute inset-x-4 bottom-20 flex items-center gap-2 bg-white py-2 pl-4 pr-2 text-[12px] text-rc-muted shadow-[0_8px_20px_-14px_rgba(10,31,21,0.4)]">
        <span className="flex-1">Ask in English or Hindi</span>
        <span className="flex h-8 w-8 items-center justify-center bg-rc-ink text-rc-cream"><ArrowUp className="h-4 w-4" /></span>
      </div>
      <TabBar active={2} />
    </div>
  );
}

export function RemindersScreen() {
  const rows = [
    { name: 'Netflix', when: 'in 2 days', amount: 649, tag: 'price up' },
    { name: 'Cult.fit', when: 'trial ends in 5 days', amount: 1200, tag: 'trial' },
    { name: 'Spotify', when: 'in 12 days', amount: 119 },
  ];
  return (
    <div className="relative h-[515px] px-5">
      <div className="mt-2 bg-white p-3.5 shadow-[0_14px_30px_-18px_rgba(10,31,21,0.5)]">
        <p className="flex items-center gap-1.5 text-[10px] text-rc-muted"><Bell className="h-3 w-3" /> RenoCred · now</p>
        <p className="mt-1 text-[13px] font-semibold text-rc-ink">Netflix renews tomorrow</p>
        <p className="text-[12px] text-rc-muted">₹649, up from ₹499.</p>
      </div>
      <p className="mt-8 font-serif text-[24px] font-semibold text-rc-ink">coming up</p>
      <div className="mt-3">
        {rows.map((r) => (
          <div key={r.name} className="flex items-center justify-between border-t border-rc-ink/10 py-3">
            <div>
              <p className="text-[14px] text-rc-ink">{r.name}</p>
              <p className="text-[11px] text-rc-muted">{r.when}{r.tag && <span className="ml-1.5 bg-[#F4E3C8] px-1.5 py-0.5 text-[10px] text-[#7A4B12]">{r.tag}</span>}</p>
            </div>
            <p className="text-[14px] tabular-nums text-rc-ink">{formatINR(r.amount)}</p>
          </div>
        ))}
      </div>
      <TabBar active={3} />
    </div>
  );
}
