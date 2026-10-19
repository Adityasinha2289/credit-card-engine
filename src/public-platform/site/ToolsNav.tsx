/** The free tools as one section: a switcher at the top of every tool page. */
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { SiteLink as Link } from './SiteLink';
import { TOOLS } from './nav';
import { cn } from '../../lib/utils';

export function ToolsNav({ current }: { current: string }) {
  const ref = useRef<HTMLElement>(null);
  // on a narrow screen, keep the current tool in view
  useEffect(() => {
    const nav = ref.current;
    const on = nav?.querySelector<HTMLElement>('[aria-current="page"]');
    if (nav && on) nav.scrollLeft = on.offsetLeft - (nav.clientWidth - on.offsetWidth) / 2;
  }, [current]);
  return (
    <nav ref={ref} aria-label="Free tools" className="-mx-5 overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
      <ul className="flex w-max gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1">
        {TOOLS.map((t) => {
          const on = t.to === current;
          return (
            <li key={t.to} className="relative">
              {on && <motion.span layoutId="tools-nav" className="absolute inset-0 rounded-full bg-rc-pistachio" transition={{ type: 'spring', stiffness: 420, damping: 36 }} />}
              <Link to={t.to} aria-current={on ? 'page' : undefined} className={cn('relative block whitespace-nowrap rounded-full px-4 py-2 text-[14px] font-medium transition-colors', on ? 'text-rc-ink' : 'text-rc-mist hover:text-rc-cream')}>
                <span className="sm:hidden">{t.short ?? t.label}</span>
                <span className="hidden sm:inline">{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
