import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ArrowChip, Container, EASE_OUT } from '../site/primitives';
import { LogoLink } from '../site/Brand';
import { useSignedInHint } from '../site/SiteLink';
import { prefetchAuth, prefetchAuthProps } from '../site/prefetchAuth';
import { CARD_NEEDS, MY_RENOCRED, SIGN_IN, SIGN_UP, SOCIAL, TOOLS } from '../site/nav';
import { analytics } from '../../lib/analytics';

const PRIMARY = [
  { label: 'Cards', to: '/cards' },
  { label: 'Tools', to: TOOLS[0].to },
  { label: 'How we rank', to: '/methodology' },
  { label: 'For business', to: '/business' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];


/** Shown inline in the header on wide screens; everything else lives in the menu. */
const INLINE = [
  { label: 'Cards', to: '/cards' },
  { label: 'Tools', to: TOOLS[0].to },
  { label: 'How we rank', to: '/methodology' },
  { label: 'Business', to: '/business' },
];

/** Two lines of unequal length that meet in an X; the short one grows on hover. */
function MenuIcon({ open }: { open: boolean }) {
  return (
    <span aria-hidden className="relative block h-3 w-[18px]">
      <span className={cn('absolute right-0 h-[1.5px] rounded-full bg-current transition-all duration-500 ease-[cubic-bezier(.22,1,.36,1)]', open ? 'top-[5px] w-[18px] rotate-45' : 'top-0.5 w-[18px]')} />
      <span className={cn('absolute right-0 h-[1.5px] rounded-full bg-current transition-all duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:w-[18px]', open ? 'top-[5px] w-[18px] -rotate-45' : 'top-[9px] w-[11px]')} />
    </span>
  );
}

function MenuOverlay({ onClose, signedIn }: { onClose: () => void; signedIn: boolean }) {
  const reduce = useReducedMotion();
  const item = (i: number) => ({
    initial: reduce ? false : { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: EASE_OUT, delay: 0.08 + i * 0.05 },
  });
  return (
    <motion.div
      id="site-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[60] overflow-y-auto bg-rc-night text-rc-cream"
    >
      <Container className="flex h-16 items-center justify-between lg:h-[76px]">
        <LogoLink dark onClick={onClose} />
        <button type="button" onClick={onClose} aria-label="Close menu" className="group flex h-11 w-11 items-center justify-center rounded-full border border-white/20 transition-colors hover:border-white/60 hover:bg-white/[0.06]">
          <MenuIcon open />
        </button>
      </Container>
      <Container className="grid gap-16 pb-16 pt-10 lg:grid-cols-12 lg:pt-16">
        <nav aria-label="Main" className="lg:col-span-7">
          <ul>
            {PRIMARY.map((l, i) => (
              <motion.li key={l.to} {...item(i)}>
                <Link to={l.to} onClick={onClose} className="group flex items-baseline gap-5 py-2">
                  <span className="w-7 text-[12px] tabular-nums text-rc-mist/60">{String(i + 1).padStart(2, '0')}</span>
                  <span className="font-serif text-[clamp(2.5rem,6vw,4.75rem)] font-semibold leading-[1.02] tracking-[-0.03em] transition-colors group-hover:text-rc-pistachio">{l.label}</span>
                </Link>
              </motion.li>
            ))}
          </ul>
        </nav>
        <motion.div {...item(PRIMARY.length)} className="space-y-12 lg:col-span-4 lg:col-start-9">
          {signedIn && (
            <div>
              <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.2em] text-rc-mist/70">My RenoCred</p>
              <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                {MY_RENOCRED.map((l) => (
                  <li key={l.to}><Link to={l.to} onClick={onClose} className="text-[15px] text-rc-cream transition-colors hover:text-rc-pistachio">{l.label}</Link></li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-rc-mist/70">Best cards for</p>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5">
              {CARD_NEEDS.map((n) => (
                <li key={n.to}><Link to={n.to} onClick={onClose} className="text-[15px] text-rc-mist transition-colors hover:text-rc-cream">{n.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-rc-mist/70">Free tools</p>
            <ul className="space-y-2.5">
              {TOOLS.map((t) => (
                <li key={t.to}><Link to={t.to} onClick={onClose} className="text-[15px] text-rc-mist transition-colors hover:text-rc-cream">{t.label}</Link></li>
              ))}
            </ul>
          </div>
          <Link
            to={SIGN_UP}
            onClick={() => { analytics.track('Partner Offer Clicked', { partner: 'greenox', placement: 'menu' }); onClose(); }}
            className="flex items-center gap-5 rounded-[24px] border border-white/15 p-4 transition-colors hover:border-white/40 hover:bg-white/[0.03]"
          >
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white"><img src="/greenox_logo.png" alt="GreeNox" className="h-10 w-10 object-contain" /></span>
            <span>
              <span className="block text-[11px] font-semibold uppercase tracking-[0.22em] text-rc-mist/70">Member perk</span>
              <span className="mt-1 block font-serif text-[20px] leading-snug">20% off at GreeNox</span>
            </span>
          </Link>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[14px]">
            {!signedIn && <Link to={SIGN_IN} onClick={onClose} className="text-rc-mist hover:text-rc-cream">Log in</Link>}
            {SOCIAL.map((s) => (
              <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-rc-mist hover:text-rc-cream">
                {s.label} <ArrowUpRight className="h-3 w-3" />
              </a>
            ))}
          </div>
        </motion.div>
      </Container>
    </motion.div>
  );
}

/** Every public page opens on a dark band, so the header is always light-on-dark. */
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

  return (
    <>
      {/* The bar is full width at the top of the page and tucks into a floating capsule once you scroll. */}
      <header className="sticky top-0 z-50 h-16 w-full px-3 sm:px-5 lg:h-[76px]">
        <div
          className={cn(
            'mx-auto flex h-full items-center justify-between gap-4 rounded-full border transition-[max-width,height,margin,padding,background-color,border-color,box-shadow] duration-700 ease-[cubic-bezier(.22,1,.36,1)]',
            scrolled
              ? cn(
                'mt-2.5 h-[52px] max-w-[1040px] pl-3 pr-1.5 backdrop-blur-xl lg:mt-3 lg:h-[56px]',
                'border-white/10 bg-rc-ink/85 shadow-[0_18px_40px_-20px_rgba(0,0,0,0.8)]',
              )
              : 'max-w-[1280px] border-transparent px-2 sm:px-3 lg:px-7',
          )}
        >
          <LogoLink dark />

          <nav aria-label="Primary" className="hidden lg:block" onMouseLeave={() => setHovered(null)}>
            <ul className="flex items-center">
              {INLINE.map((l) => {
                const current = pathname === l.to || (l.to !== '/' && pathname.startsWith(`${l.to}/`));
                return (
                  <li key={l.to} className="relative">
                    {hovered === l.to && (
                      <motion.span
                        layoutId="nav-hover"
                        aria-hidden
                        className={cn('absolute inset-0 rounded-full', 'bg-white/[0.08]')}
                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      />
                    )}
                    <Link
                      to={l.to}
                      onMouseEnter={() => setHovered(l.to)}
                      onFocus={() => setHovered(l.to)}
                      aria-current={current ? 'page' : undefined}
                      className={cn(
                        'relative block rounded-full px-4 py-2 text-[14px] transition-colors',
                        'text-rc-mist hover:text-rc-cream',
                        current && 'text-rc-cream',
                      )}
                    >
                      {l.label}
                      {current && <span aria-hidden className={cn('absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full', 'bg-rc-pistachio')} />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {!signedIn && (
              <Link {...prefetchAuthProps} to={SIGN_IN} className="hidden rounded-full px-4 py-2 text-[14px] text-rc-mist transition-colors hover:bg-white/[0.06] hover:text-rc-cream sm:inline-flex">
                Log in
              </Link>
            )}
            <Link
              {...prefetchAuthProps}
              to={signedIn ? '/app' : SIGN_UP}
              className={cn(
                'group inline-flex h-10 items-center gap-2.5 rounded-full pl-4 pr-1 text-[14px] font-medium transition-colors duration-300 sm:h-11 sm:pl-5',
                'bg-rc-cream text-rc-ink hover:bg-white',
              )}
            >
              {signedIn ? 'My RenoCred' : 'Get started'}
              <ArrowChip variant="cream" size="sm" />
            </Link>
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={open}
              aria-controls="site-menu"
              onClick={() => setOpen(true)}
              className={cn(
                'group flex h-10 w-10 items-center justify-center rounded-full border transition-colors sm:h-11 sm:w-11',
                'border-white/15 text-rc-cream hover:border-white/50 hover:bg-white/[0.06]',
              )}
            >
              <MenuIcon open={false} />
            </button>
          </div>
        </div>
      </header>
      <AnimatePresence>{open && <MenuOverlay signedIn={signedIn} onClose={() => setOpen(false)} />}</AnimatePresence>
    </>
  );
}
