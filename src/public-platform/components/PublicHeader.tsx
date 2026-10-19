import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ArrowChip, EASE_OUT, useMediaQuery } from '../site/primitives';
import { LogoLink } from '../site/Brand';
import { useSignedInHint } from '../site/SiteLink';
import { prefetchAuth, prefetchAuthProps } from '../site/prefetchAuth';
import { CARD_NEEDS, MY_RENOCRED, SIGN_IN, SIGN_UP, SOCIAL, TOOLS } from '../site/nav';
import { analytics } from '../../lib/analytics';
import { useAskTaqdeer } from '../../components/layout/askReni';
import { ReniMark } from '../../features/taqdeer/components/ReniMark';

/** The four places most visits go: inline in the bar on wide screens, tiles in the menu. */
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

/** The menu opens out of the bar, rather than covering the page. */
function MenuPanel({ signedIn, pathname, onClose }: { signedIn: boolean; pathname: string; onClose: () => void }) {
  const reduce = useReducedMotion();
  const label = 'mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-rc-mist/70';
  return (
    <motion.div
      id="site-menu"
      initial={reduce ? false : { height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
      transition={{ duration: 0.45, ease: EASE_OUT }}
      className="overflow-hidden"
    >
      <div className="max-h-[calc(100dvh-5.5rem)] overflow-y-auto overscroll-contain border-t border-white/10 p-2.5 lg:p-3">
        <div className="grid gap-2.5 lg:grid-cols-12 lg:gap-3">
          <nav aria-label="Main" className="lg:col-span-7">
            <ul className="grid grid-cols-2 gap-2 lg:gap-2.5">
              {LINKS.map((l) => {
                const on = isCurrent(pathname, l);
                return (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      onClick={onClose}
                      aria-current={on ? 'page' : undefined}
                      className={cn(
                        'group flex h-full min-h-[96px] flex-col justify-between rounded-[20px] border p-4 transition-colors lg:min-h-[132px] lg:p-5',
                        on ? 'border-rc-pistachio/50 bg-rc-pistachio/[0.08]' : 'border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]',
                      )}
                    >
                      <span className="flex items-start justify-between gap-2">
                        <span className="font-serif text-[21px] font-semibold leading-[1.05] tracking-[-0.02em] lg:text-[28px]">{l.label}</span>
                        <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-rc-mist transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-rc-pistachio" />
                      </span>
                      <span className="mt-3 text-[12.5px] leading-snug text-rc-mist lg:text-[13.5px]">{l.note}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="space-y-6 px-2 pb-1 pt-3 lg:col-span-5 lg:px-3 lg:pt-2">
            {signedIn && (
              <div>
                <p className={label}>Your dashboard</p>
                <ul className="flex flex-wrap gap-1.5">
                  {MY_RENOCRED.map((l) => (
                    <li key={l.to}><Link to={l.to} onClick={onClose} className="inline-flex rounded-full bg-rc-pistachio/15 px-3 py-1.5 text-[13px] font-medium text-rc-cream transition-colors hover:bg-rc-pistachio hover:text-rc-ink">{l.label}</Link></li>
                  ))}
                </ul>
              </div>
            )}
            <div>
              <p className={label}>Best cards for</p>
              <ul className="flex flex-wrap gap-1.5">
                {CARD_NEEDS.map((n) => (
                  <li key={n.to}><Link to={n.to} onClick={onClose} className="inline-flex rounded-full border border-white/[0.12] px-3 py-1.5 text-[13px] text-rc-mist transition-colors hover:border-white/40 hover:text-rc-cream">{n.label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <p className={label}>Free tools</p>
              <ul className="space-y-2">
                {TOOLS.map((t) => (
                  <li key={t.to}><Link to={t.to} onClick={onClose} className="text-[14px] text-rc-mist transition-colors hover:text-rc-cream">{t.label}</Link></li>
                ))}
              </ul>
            </div>
            <Link
              to={SIGN_UP}
              onClick={() => { analytics.track('Partner Offer Clicked', { partner: 'greenox', placement: 'menu' }); onClose(); }}
              className="flex items-center gap-3.5 rounded-[18px] border border-white/10 p-2.5 transition-colors hover:border-white/30"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white"><img src="/greenox_logo.png" alt="GreeNox" className="h-8 w-8 object-contain" /></span>
              <span className="min-w-0">
                <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-rc-mist/70">Member perk</span>
                <span className="block text-[14px] font-medium text-rc-cream">20% off at GreeNox</span>
              </span>
            </Link>
          </div>
        </div>

        <div className="mt-2.5 flex flex-col gap-3 border-t border-white/10 px-2 pb-1 pt-3.5 sm:flex-row sm:items-center sm:justify-between lg:px-3">
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
 * The site header: one floating bar on every page. The links sit beside the logo, a
 * line runs around the bar's border as you read down the page, and the menu opens
 * out of the bar. Every page opens on a dark band, so it is always light-on-dark.
 */
export function PublicHeader() {
  const { pathname, search } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
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
  const cta = cn(
    'group inline-flex h-9 items-center gap-2.5 rounded-full px-4 text-[13px] font-semibold transition-colors duration-300 sm:h-10 sm:pl-5 sm:pr-1 sm:text-[14px] sm:font-medium',
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
      {/* One floating bar on every page and at every width; it narrows a little as you scroll. */}
      <header className="sticky top-0 z-50 h-16 w-full px-3 sm:px-5 lg:h-[76px]">
        <div
          className={cn(
            'relative mx-auto mt-2 rounded-[26px] border backdrop-blur-xl transition-[max-width,background-color,border-color,box-shadow] duration-700 ease-[cubic-bezier(.22,1,.36,1)] lg:mt-2.5 lg:rounded-[28px]',
            open
              ? 'max-w-[1180px] border-white/[0.14] bg-rc-ink shadow-[0_40px_90px_-30px_rgba(0,0,0,0.9)]'
              : scrolled
                ? 'max-w-[1040px] border-white/10 bg-rc-ink/85 shadow-[0_18px_40px_-20px_rgba(0,0,0,0.8)]'
                : 'max-w-[1180px] border-white/10 bg-white/[0.04]',
          )}
        >
          <ScrollTrace radius={lg ? 28 : 26} hidden={open} />
          <div className="relative flex h-[50px] items-center gap-3 pl-2.5 pr-1.5 sm:h-[52px] lg:h-[56px] lg:pl-3.5">
            <LogoLink dark compact onClick={() => setOpen(false)} />

            <nav aria-label="Primary" aria-hidden={open || undefined} className={cn('ml-5 hidden transition-opacity duration-300 lg:block', open && 'pointer-events-none opacity-0')} onMouseLeave={() => setHovered(null)}>
              <ul className="flex items-center">
                {LINKS.map((l) => {
                  const current = isCurrent(pathname, l);
                  return (
                    <li key={l.to} className="relative">
                      {hovered === l.to && (
                        <motion.span layoutId="nav-hover" aria-hidden className="absolute inset-0 rounded-full bg-white/[0.08]" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />
                      )}
                      <Link
                        to={l.to}
                        onMouseEnter={() => setHovered(l.to)}
                        onFocus={() => setHovered(l.to)}
                        aria-current={current ? 'page' : undefined}
                        className={cn('relative block rounded-full px-4 py-2 text-[14px] transition-colors hover:text-rc-cream', current ? 'text-rc-cream' : 'text-rc-mist')}
                      >
                        {l.label}
                        {current && <span aria-hidden className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-rc-pistachio" />}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
              {!signedIn && (
                <Link {...prefetchAuthProps} to={SIGN_IN} className="hidden rounded-full px-4 py-2 text-[14px] text-rc-mist transition-colors hover:bg-white/[0.06] hover:text-rc-cream sm:inline-flex">
                  Log in
                </Link>
              )}
              {inApp && ask && (
                <button
                  type="button"
                  onClick={() => { setOpen(false); ask(); }}
                  className="inline-flex h-9 items-center gap-2 rounded-full bg-white/[0.07] pl-0.5 pr-3.5 text-[13px] font-medium text-rc-cream ring-1 ring-white/10 transition-colors active:bg-white/[0.12] md:hidden"
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
                className="group flex h-10 w-10 items-center justify-center rounded-full text-rc-cream transition-colors hover:bg-white/[0.08]"
              >
                <MenuIcon open={open} />
              </button>
            </div>
          </div>
          <AnimatePresence initial={false}>
            {open && <MenuPanel signedIn={signedIn} pathname={pathname} onClose={() => setOpen(false)} />}
          </AnimatePresence>
        </div>
      </header>
    </>
  );
}
