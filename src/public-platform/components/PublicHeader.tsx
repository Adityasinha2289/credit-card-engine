import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ChevronDown, Menu, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Container, EASE_OUT } from '../site/primitives';
import { CardFace } from '../site/CardFace';
import { CARD_NEEDS, COMPANY, SIGN_IN, SIGN_UP, TOOLS } from '../site/nav';
import { CATALOG_STATS } from '../site/swipeMath';
import { getPopularComparisons } from '../lib/cardKnowledgeGraph';
import { analytics } from '../../lib/analytics';

type Panel = 'cards' | 'tools' | null;

const BAR_KEY = 'rc.announcement.greenox.dismissed';

function readDismissed(): boolean {
  try { return localStorage.getItem(BAR_KEY) === '1'; } catch { return false; }
}

function AnnouncementBar() {
  const [hidden, setHidden] = useState(readDismissed);
  if (hidden) return null;
  return (
    <div className="relative bg-rc-ink text-rc-cream">
      <Container className="flex h-10 items-center justify-center gap-3 text-[13px]">
        <span className="hidden text-[11px] font-semibold uppercase tracking-[0.18em] text-rc-mist sm:inline">Member perk</span>
        <span aria-hidden className="hidden h-3 w-px bg-rc-cream/25 sm:inline" />
        <a
          href="/#perks"
          onClick={() => analytics.track('Partner Offer Clicked', { partner: 'greenox', placement: 'announcement' })}
          className="group inline-flex items-center gap-1.5 truncate"
        >
          <span>20% off at GreeNox for RenoCred members</span>
          <ArrowRight aria-hidden className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
        </a>
      </Container>
      <button
        type="button"
        aria-label="Dismiss announcement"
        onClick={() => { try { localStorage.setItem(BAR_KEY, '1'); } catch { /* storage blocked */ } setHidden(true); }}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-rc-mist transition-colors hover:text-rc-cream"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function Logo() {
  return (
    <Link to="/" className="flex shrink-0 items-center gap-2.5 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rc-forest">
      <img src="/logo.jpg" alt="" width={32} height={32} className="h-8 w-8 rounded-[9px] object-cover" />
      <span className="text-[17px] font-semibold tracking-[-0.01em] text-rc-ink">RenoCred</span>
    </Link>
  );
}

function CardsPanel() {
  const comparisons = getPopularComparisons().slice(0, 5);
  return (
    <Container className="grid gap-10 py-10 lg:grid-cols-12">
      <div className="lg:col-span-4">
        <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-rc-muted">Best cards for</p>
        <ul className="grid grid-cols-2 gap-x-6 gap-y-3">
          {CARD_NEEDS.map((n) => (
            <li key={n.to}>
              <Link to={n.to} className="text-[15px] text-rc-ink transition-colors hover:text-rc-forest">{n.label}</Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="lg:col-span-4">
        <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-rc-muted">Popular comparisons</p>
        <ul className="space-y-3">
          {comparisons.map((c) => (
            <li key={c.slug}>
              <Link to={`/compare/${c.slug}`} className="text-[15px] text-rc-ink transition-colors hover:text-rc-forest">{c.label}</Link>
            </li>
          ))}
        </ul>
      </div>
      <Link
        to="/cards"
        className="group relative flex min-h-[220px] flex-col justify-between overflow-hidden rounded-2xl bg-rc-ink p-6 text-rc-cream lg:col-span-4"
      >
        <div>
          <p className="font-serif text-[28px] leading-tight">All {CATALOG_STATS.cards} cards</p>
          <p className="mt-2 max-w-[22ch] text-[14px] leading-relaxed text-rc-mist">Every fee and reward rule from {CATALOG_STATS.banks} issuers, in one place.</p>
        </div>
        <span className="inline-flex items-center gap-2 text-[14px] font-medium">
          Browse the directory <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
        <div className="pointer-events-none absolute -bottom-6 -right-10 rotate-[-8deg] transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-[-5deg]">
          <CardFace name="Axis Bank ATLAS Credit Card" bank="AXIS" width={210} />
        </div>
      </Link>
    </Container>
  );
}

function ToolsPanel() {
  return (
    <Container className="grid gap-6 py-10 md:grid-cols-3">
      {TOOLS.map((t) => (
        <Link key={t.to} to={t.to} className="group rounded-2xl border border-rc-ink/10 bg-rc-paper p-6 transition-colors hover:border-rc-ink/30">
          <p className="font-serif text-[24px] leading-tight text-rc-ink">{t.label}</p>
          <p className="mt-2 text-[14px] leading-relaxed text-rc-muted">{t.description}</p>
          <span className="mt-6 inline-flex items-center gap-2 text-[13px] font-medium text-rc-ink">
            Open <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      ))}
    </Container>
  );
}

function MobileMenu({ onClose }: { onClose: () => void }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      id="mobile-menu"
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-40 overflow-y-auto bg-rc-cream lg:hidden"
    >
      {/* clears the sticky header (and the announcement bar when it is still on screen) */}
      <Container className="flex min-h-full flex-col pb-10 pt-28">
        <nav aria-label="Mobile" className="flex flex-col">
          {[{ label: 'All cards', to: '/cards' }, ...TOOLS.slice(0, 1).map((t) => ({ label: 'Reward calculator', to: t.to })), ...COMPANY].map((item, i) => (
            <motion.div
              key={item.to}
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.04 * i }}
            >
              <Link to={item.to} onClick={onClose} className="block border-b border-rc-ink/10 py-4 font-serif text-[32px] leading-tight text-rc-ink">
                {item.label}
              </Link>
            </motion.div>
          ))}
        </nav>
        <p className="mb-3 mt-8 text-[11px] font-semibold uppercase tracking-[0.2em] text-rc-muted">Best cards for</p>
        <div className="flex flex-wrap gap-2">
          {CARD_NEEDS.map((n) => (
            <Link key={n.to} to={n.to} onClick={onClose} className="rounded-full border border-rc-ink/15 px-4 py-2 text-[14px] text-rc-ink">
              {n.label}
            </Link>
          ))}
        </div>
        <div className="mt-auto grid grid-cols-2 gap-3 pt-10">
          <Link to={SIGN_IN} onClick={onClose} className="flex h-12 items-center justify-center rounded-full border border-rc-ink/20 text-[15px] font-medium text-rc-ink">Log in</Link>
          <Link to={SIGN_UP} onClick={onClose} className="flex h-12 items-center justify-center rounded-full bg-rc-ink text-[15px] font-medium text-rc-cream">Get started</Link>
        </div>
      </Container>
    </motion.div>
  );
}

export function PublicHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const location = useLocation();
  const reduce = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setPanel(null); setMobileOpen(false); }, [location.pathname, location.search]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setPanel(null); setMobileOpen(false); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const openPanel = (p: Panel) => { if (closeTimer.current) clearTimeout(closeTimer.current); setPanel(p); };
  const scheduleClose = () => { closeTimer.current = setTimeout(() => setPanel(null), 160); };

  const trigger = (p: Exclude<Panel, null>, label: string) => (
    <button
      type="button"
      aria-expanded={panel === p}
      aria-controls={`panel-${p}`}
      onClick={() => setPanel(panel === p ? null : p)}
      onMouseEnter={() => openPanel(p)}
      onMouseLeave={scheduleClose}
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-3 py-2 text-[14px] font-medium transition-colors',
        panel === p ? 'text-rc-ink' : 'text-rc-ink/75 hover:text-rc-ink',
      )}
    >
      {label}
      <ChevronDown aria-hidden className={cn('h-3.5 w-3.5 transition-transform duration-300', panel === p && 'rotate-180')} />
    </button>
  );

  const solid = scrolled || panel !== null || mobileOpen;

  return (
    <>
      <AnnouncementBar />
      <header
        className={cn(
          'sticky top-0 z-50 w-full transition-[background-color,border-color,backdrop-filter] duration-300',
          solid ? 'border-b border-rc-ink/10 bg-rc-cream/90 backdrop-blur-xl' : 'border-b border-transparent bg-rc-cream',
        )}
      >
        <Container className="flex h-16 items-center justify-between gap-6 lg:h-[72px]">
          <Logo />

          <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
            {trigger('cards', 'Cards')}
            {trigger('tools', 'Tools')}
            <Link to="/methodology" className="rounded-full px-3 py-2 text-[14px] font-medium text-rc-ink/75 transition-colors hover:text-rc-ink">How we rank</Link>
            <Link to="/business" className="rounded-full px-3 py-2 text-[14px] font-medium text-rc-ink/75 transition-colors hover:text-rc-ink">For business</Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link to={SIGN_IN} className="hidden rounded-full px-4 py-2 text-[14px] font-medium text-rc-ink/80 transition-colors hover:text-rc-ink sm:inline-flex">Log in</Link>
            <Link to={SIGN_UP} className="hidden h-10 items-center rounded-full bg-rc-ink px-5 text-[14px] font-medium text-rc-cream transition-colors hover:bg-rc-moss sm:inline-flex">Get started</Link>
            <button
              type="button"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              onClick={() => setMobileOpen((v) => !v)}
              className="-mr-2 rounded-full p-2 text-rc-ink lg:hidden"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </Container>

        <AnimatePresence>
          {panel && (
            <motion.div
              id={`panel-${panel}`}
              key={panel}
              onMouseEnter={() => openPanel(panel)}
              onMouseLeave={scheduleClose}
              initial={reduce ? false : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: EASE_OUT }}
              className="absolute inset-x-0 top-full hidden border-b border-rc-ink/10 bg-rc-cream shadow-[0_24px_48px_-24px_rgba(10,31,21,0.25)] lg:block"
            >
              {panel === 'cards' ? <CardsPanel /> : <ToolsPanel />}
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      <AnimatePresence>{mobileOpen && <MobileMenu onClose={() => setMobileOpen(false)} />}</AnimatePresence>
    </>
  );
}
