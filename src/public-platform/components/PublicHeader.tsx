import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Search, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ArrowChip, EASE_OUT, useMediaQuery } from '../site/primitives';
import { BrandMark } from '../site/Brand';
import { displayCardName } from '../site/CardFace';
import { bankLabel } from '../site/banks';
import { useSignedInHint } from '../site/SiteLink';
import { prefetchAuth, prefetchAuthProps } from '../site/prefetchAuth';
import { CARD_NEEDS, MY_RENOCRED, SIGN_IN, SIGN_UP, SOCIAL, TOOLS } from '../site/nav';
import { analytics } from '../../lib/analytics';
import { useAskTaqdeer } from '../../components/layout/askReni';
import { ReniMark } from '../../features/taqdeer/components/ReniMark';

/** The four places most visits go, as tiles at the top of the menu. */
const LINKS = [
  { label: 'Cards', to: '/cards', note: 'Every Indian card, side by side' },
  { label: 'Tools', to: TOOLS[0].to, match: '/calculators', note: 'Which card, rewards, utilisation' },
  { label: 'How we rank', to: '/methodology', note: 'Two questions, two rules' },
  { label: 'Business', to: '/business', note: 'Partner with RenoCred' },
];

const MORE = [
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

const isCurrent = (pathname: string, l: { to: string; match?: string }) =>
  pathname === l.to || pathname.startsWith(`${l.to}/`) || (!!l.match && pathname.startsWith(l.match));

/** Two lines of unequal length that meet in an X; the short one grows on hover. */
function MenuIcon({ open }: { open: boolean }) {
  return (
    <span aria-hidden className="relative block h-3 w-[18px]">
      <span className={cn('absolute right-0 h-[1.5px] rounded-full bg-current transition-all duration-500 ease-[cubic-bezier(.22,1,.36,1)]', open ? 'top-[5px] w-[18px] rotate-45' : 'top-0.5 w-[18px]')} />
      <span className={cn('absolute right-0 h-[1.5px] rounded-full bg-current transition-all duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:w-[18px]', open ? 'top-[5px] w-[18px] -rotate-45' : 'top-[9px] w-[11px]')} />
    </span>
  );
}

/**
 * How far down the page you are, drawn as a line around the bar's border: the
 * same line that counts down the spend tabs, so the site reads as one thing.
 */
function ScrollTrace({ radius, hidden }: { radius: number; hidden: boolean }) {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 220, damping: 38, restDelta: 0.001 });
  const opacity = useTransform(progress, [0, 0.015], [0, 1]);
  return (
    <svg aria-hidden className={cn('pointer-events-none absolute inset-0 h-full w-full overflow-visible transition-opacity duration-300', hidden && 'opacity-0')}>
      <motion.rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        rx={radius}
        ry={radius}
        fill="none"
        stroke="#E3EED4"
        strokeWidth="1.5"
        style={{ pathLength: progress, opacity }}
      />
    </svg>
  );
}

type DirectoryCard = Awaited<ReturnType<typeof loadDirectory>>[number];
// the card list is big; it loads when the menu first opens, not with every page
const loadDirectory = () => import('../lib/cardKnowledgeGraph').then((m) => m.getDirectoryCards());
const feeText = (fee: number | null) => (fee === null ? 'Fee not disclosed' : fee === 0 ? 'Lifetime free' : `₹${fee.toLocaleString('en-IN')} a year`);

/** Every word typed has to appear in the card's name or bank; names that start with it come first. */
function findCards(all: DirectoryCard[], query: string): DirectoryCard[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const q = words.join(' ');
  return all
    .map((c) => ({ c, hay: `${displayCardName(c.cardName)} ${bankLabel(c.issuer)} ${c.issuer}`.toLowerCase() }))
    .filter(({ hay }) => words.every((w) => hay.includes(w)))
    .sort((a, b) => Number(b.hay.startsWith(q)) - Number(a.hay.startsWith(q)) || Number(!!a.c.discontinued) - Number(!!b.c.discontinued))
    .map(({ c }) => c);
}

/**
 * The menu opens out of the header. It starts with a search across every card we
 * have read, then the four places to go set large, with a line that runs under
 * the one you point at, and the rest as plain links.
 */
function MenuPanel({ signedIn, pathname, onClose }: { signedIn: boolean; pathname: string; onClose: () => void }) {
  const reduce = useReducedMotion();
  const navigate = useNavigate();
  const wide = useMediaQuery('(min-width: 1024px)');
  const [cards, setCards] = useState<DirectoryCard[] | null>(null);
  const [query, setQuery] = useState('');
  useEffect(() => { void loadDirectory().then(setCards).catch(() => setCards([])); }, []);
  const matches = useMemo(() => (cards ? findCards(cards, query) : []), [cards, query]);
  const searching = query.trim().length > 0;
  const allResults = `/cards?q=${encodeURIComponent(query.trim())}`;
  const go = (to: string) => { onClose(); navigate(to); };

  const label = 'mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-rc-mist/70';
  const rise = (i: number) => ({
    initial: reduce ? false : { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: EASE_OUT, delay: 0.05 + i * 0.05 },
  });
  return (
    <motion.div
      id="site-menu"
      initial={reduce ? false : { height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
      transition={{ duration: 0.45, ease: EASE_OUT }}
      className="overflow-hidden"
    >
      <div className="max-h-[calc(100dvh-6rem)] overflow-y-auto overscroll-contain px-4 pb-4 pt-4 sm:px-6 sm:pb-5 sm:pt-5 lg:px-8 lg:pt-6">
        <form
          role="search"
          onSubmit={(e) => { e.preventDefault(); if (searching) go(matches.length === 1 ? `/cards/${matches[0].slug}` : allResults); }}
          className="flex h-12 items-center gap-3 rounded-full bg-white/[0.06] px-4 ring-1 ring-white/10 transition-shadow focus-within:ring-2 focus-within:ring-rc-pistachio/70 lg:h-14 lg:px-5"
        >
          <Search aria-hidden className="h-[18px] w-[18px] shrink-0 text-rc-mist" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus={wide}
            aria-label="Search cards"
            placeholder={cards?.length ? `Search ${cards.length} cards by name or bank` : 'Search cards by name or bank'}
            className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-rc-cream outline-none placeholder:text-rc-mist/60 lg:text-[16px] [&::-webkit-search-cancel-button]:hidden"
          />
          {searching && (
            <button type="button" onClick={() => setQuery('')} aria-label="Clear search" className="flex h-7 w-7 items-center justify-center rounded-full text-rc-mist hover:bg-white/10 hover:text-rc-cream">
              <X className="h-4 w-4" />
            </button>
          )}
        </form>

        {searching ? (
          <div className="mt-3 min-h-[180px]" aria-live="polite">
            {!cards ? (
              <p className="px-4 py-6 text-[14px] text-rc-mist">Loading the cards…</p>
            ) : matches.length === 0 ? (
              <p className="px-4 py-6 text-[14px] text-rc-mist">No card matches “{query.trim()}”. Try a bank, like HDFC, or part of a name.</p>
            ) : (
              <>
                <ul className="divide-y divide-white/[0.07]">
                  {matches.slice(0, 6).map((c) => (
                    <li key={c.id}>
                      <Link to={`/cards/${c.slug}`} onClick={onClose} className="group flex items-center justify-between gap-4 rounded-xl px-4 py-3 transition-colors hover:bg-white/[0.05]">
                        <span className="min-w-0">
                          <span className="block truncate text-[15px] font-medium text-rc-cream">{displayCardName(c.cardName)}</span>
                          <span className="mt-0.5 block truncate text-[13px] text-rc-mist">{bankLabel(c.issuer)} · {feeText(c.annualFee)}{c.discontinued ? ' · not issued now' : ''}</span>
                        </span>
                        <ArrowRight aria-hidden className="h-4 w-4 shrink-0 text-rc-mist transition-transform group-hover:translate-x-0.5 group-hover:text-rc-pistachio" />
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link to={allResults} onClick={onClose} className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 text-[14px] font-medium text-rc-pistachio hover:underline">
                  {matches.length > 6 ? `See all ${matches.length} matching cards` : 'Open in the card directory'} <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className="mt-5 grid gap-9 lg:mt-7 lg:grid-cols-12 lg:gap-12">
            <nav aria-label="Main" className="lg:col-span-7">
              <ol>
                {LINKS.map((l, i) => {
                  const on = isCurrent(pathname, l);
                  return (
                    <motion.li key={l.to} {...rise(i)}>
                      <Link to={l.to} onClick={onClose} aria-current={on ? 'page' : undefined} className="group relative flex items-baseline gap-4 py-3.5 lg:py-4">
                        <span className="w-6 shrink-0 font-mono text-[11px] tracking-[0.1em] text-rc-mist/60">{String(i + 1).padStart(2, '0')}</span>
                        <span className="min-w-0 flex-1 sm:flex sm:items-baseline sm:justify-between sm:gap-6">
                          <span className={cn('block font-serif text-[30px] font-semibold leading-none tracking-[-0.025em] transition-[color,transform] duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:translate-x-1.5 group-hover:text-rc-pistachio lg:text-[42px]', on ? 'text-rc-pistachio' : 'text-rc-cream')}>
                            {l.label}
                          </span>
                          <span className="mt-1.5 block text-[13px] text-rc-mist sm:mt-0 sm:text-right">{l.note}</span>
                        </span>
                        {/* the hairline under each row, and the line that runs along it when you point */}
                        <span aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-white/10" />
                        <span aria-hidden className={cn('absolute bottom-0 left-0 h-[1.5px] w-full origin-left bg-rc-pistachio transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-x-100 group-focus-visible:scale-x-100', on ? 'scale-x-100' : 'scale-x-0')} />
                      </Link>
                    </motion.li>
                  );
                })}
              </ol>
            </nav>

            <motion.div {...rise(LINKS.length)} className="grid grid-cols-2 gap-x-6 gap-y-8 lg:col-span-5 lg:pt-2">
              <div className="col-span-2 sm:col-span-1 lg:col-span-2">
                <p className={label}>Best cards for</p>
                <ul className="grid grid-cols-2 gap-x-6 gap-y-2">
                  {CARD_NEEDS.map((n) => (
                    <li key={n.to}><Link to={n.to} onClick={onClose} className="text-[14px] text-rc-mist transition-colors hover:text-rc-cream">{n.label}</Link></li>
                  ))}
                </ul>
              </div>
              <div className="col-span-2 sm:col-span-1 lg:col-span-2">
                <p className={label}>{signedIn ? 'Your dashboard' : 'Free tools'}</p>
                <ul className={signedIn ? 'grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3' : 'space-y-2'}>
                  {(signedIn ? MY_RENOCRED : TOOLS).map((t) => (
                    <li key={t.to}><Link to={t.to} onClick={onClose} className="text-[14px] text-rc-mist transition-colors hover:text-rc-cream">{t.label}</Link></li>
                  ))}
                </ul>
              </div>
              <Link
                to={SIGN_UP}
                onClick={() => { analytics.track('Partner Offer Clicked', { partner: 'greenox', placement: 'menu' }); onClose(); }}
                className="col-span-2 flex items-center gap-3 text-[14px] text-rc-mist transition-colors hover:text-rc-cream"
              >
                <img src="/greenox_logo.png" alt="" className="h-8 w-8 rounded-lg bg-white object-contain p-0.5" />
                <span>Member perk: <span className="text-rc-cream">20% off at GreeNox</span></span>
              </Link>
            </motion.div>
          </div>
        )}

        <div className="mt-7 flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px]">
            {MORE.map((l) => <Link key={l.to} to={l.to} onClick={onClose} className="text-rc-mist hover:text-rc-cream">{l.label}</Link>)}
            {SOCIAL.map((s) => (
              <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-rc-mist hover:text-rc-cream">
                {s.label} <ArrowUpRight className="h-3 w-3" />
              </a>
            ))}
          </div>
          {!signedIn && (
            <div className="grid grid-cols-2 gap-2 sm:hidden">
              <Link {...prefetchAuthProps} to={SIGN_IN} onClick={onClose} className="inline-flex h-11 items-center justify-center rounded-full border border-white/15 px-5 text-[14px] font-medium text-rc-cream hover:border-white/40">Log in</Link>
              <Link {...prefetchAuthProps} to={SIGN_UP} onClick={onClose} className="inline-flex h-11 items-center justify-center rounded-full bg-rc-cream px-5 text-[14px] font-semibold text-rc-ink hover:bg-white">Get started</Link>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/**
 * The site header: two floating pieces. On the left the brand, whose name folds into
 * the mark as you scroll while a line runs round it to show how far you've read; on
 * the right what you can do, and the menu, which opens beneath both. Every page opens
 * on a dark band, so it is always light-on-dark.
 */
export function PublicHeader() {
  const { pathname, search } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [peek, setPeek] = useState(false);
  // signed-in visitors browse the site freely and always have a one-click way back into the app
  const signedIn = useSignedInHint();
  // returning members will almost certainly open My RenoCred: fetch it while they read
  useEffect(() => {
    if (!signedIn) return;
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(prefetchAuth); else setTimeout(prefetchAuth, 1500);
  }, [signedIn]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname, search]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [open]);

  const lg = useMediaQuery('(min-width: 1024px)');
  // on a signed-in page, phones reach Reni from the bar (the tab bar below has the sections)
  const ask = useAskTaqdeer();
  const inApp = pathname.startsWith('/app');
  // the name folds into the mark once you scroll; pointing at the mark unfolds it again
  const folded = scrolled && !peek && !open;
  const island = cn(
    'relative flex h-[50px] items-center rounded-full border backdrop-blur-xl transition-[background-color,border-color,box-shadow] duration-500 lg:h-[54px]',
    open
      ? 'border-white/[0.14] bg-rc-ink'
      : scrolled
        ? 'border-white/10 bg-rc-ink/85 shadow-[0_18px_40px_-20px_rgba(0,0,0,0.8)]'
        : 'border-white/10 bg-white/[0.04]',
  );
  const cta = cn(
    'group inline-flex h-10 items-center gap-2.5 rounded-full px-4 text-[13px] font-semibold transition-colors duration-300 sm:pl-5 sm:pr-1 sm:text-[14px] sm:font-medium lg:h-[42px]',
    'bg-rc-cream text-rc-ink hover:bg-white',
  );

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="scrim"
            aria-hidden
            onClick={() => setOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-rc-night/70 backdrop-blur-[3px]"
          />
        )}
      </AnimatePresence>
      {/* Two floating pieces: the brand on the left, what you can do on the right. */}
      <header className="sticky top-0 z-50 h-16 w-full px-3 sm:px-5 lg:h-[76px]">
        <div className="relative mx-auto flex max-w-[1180px] items-start justify-between gap-3 pt-2 lg:pt-2.5">
          <Link
            to="/"
            aria-label="RenoCred home"
            onClick={() => setOpen(false)}
            onMouseEnter={() => setPeek(true)}
            onMouseLeave={() => setPeek(false)}
            onFocus={() => setPeek(true)}
            onBlur={() => setPeek(false)}
            className={cn(island, 'shrink-0 p-[6px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4')}
          >
            <ScrollTrace radius={lg ? 27 : 25} hidden={open} />
            <span className="relative flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-full bg-rc-pistachio lg:h-10 lg:w-10">
              <BrandMark size={lg ? 23 : 21} />
            </span>
            <span
              aria-hidden
              className={cn(
                'relative overflow-hidden whitespace-nowrap text-[17px] font-semibold tracking-[-0.02em] text-rc-cream transition-[max-width,opacity,padding] duration-500 ease-[cubic-bezier(.22,1,.36,1)] lg:text-[18px]',
                folded ? 'max-w-0 px-0 opacity-0' : 'max-w-[140px] pl-2.5 pr-3.5 opacity-100',
              )}
            >
              Reno<span className="text-rc-pistachio">Cred</span>
            </span>
          </Link>

          <div className={cn(island, 'gap-1 p-[5px] sm:gap-1.5')}>
            {!signedIn && (
              <Link {...prefetchAuthProps} to={SIGN_IN} className="hidden rounded-full px-4 py-2 text-[14px] text-rc-mist transition-colors hover:bg-white/[0.06] hover:text-rc-cream sm:inline-flex">
                Log in
              </Link>
            )}
            {inApp && ask && (
              <button
                type="button"
                onClick={() => { setOpen(false); ask(); }}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-white/[0.07] pl-1 pr-3.5 text-[13px] font-medium text-rc-cream transition-colors active:bg-white/[0.12] md:hidden"
              >
                <ReniMark size={32} tone="pistachio" /> Ask Reni
              </button>
            )}
            <Link {...prefetchAuthProps} to={signedIn ? '/app' : SIGN_UP} onClick={() => setOpen(false)} className={cn(cta, inApp && ask && 'hidden md:inline-flex')}>
              {signedIn ? 'Dashboard' : <><span className="sm:hidden">Start free</span><span className="hidden sm:inline">Get started</span></>}
              <ArrowChip variant="cream" size="sm" className="hidden sm:flex" />
            </Link>
            <button
              type="button"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              aria-controls="site-menu"
              onClick={() => setOpen((o) => !o)}
              className="group flex h-10 items-center justify-center gap-2.5 rounded-full px-3 text-[14px] text-rc-cream transition-colors hover:bg-white/[0.08] lg:h-[42px] lg:px-4"
            >
              <span className="hidden lg:inline">{open ? 'Close' : 'Menu'}</span>
              <MenuIcon open={open} />
            </button>
          </div>

          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                key="menu"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: EASE_OUT }}
                className="absolute inset-x-0 top-full mt-2 overflow-hidden rounded-[26px] border border-white/[0.14] bg-rc-ink shadow-[0_40px_90px_-30px_rgba(0,0,0,0.9)]"
              >
                <MenuPanel signedIn={signedIn} pathname={pathname} onClose={() => setOpen(false)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>
    </>
  );
}
