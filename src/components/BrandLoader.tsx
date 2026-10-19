/**
 * Put this wherever something is loading (a Suspense fallback, a gate waiting
 * for sign-in or data). It keeps the single loading screen (lib/bootLoader) up
 * while mounted and holds the page's height so nothing jumps underneath.
 */
import { useLayoutEffect } from 'react';
import { holdLoader, releaseLoader } from '../lib/bootLoader';

export function LoaderHold({ fill = true, now = false }: { fill?: boolean; now?: boolean }) {
  useLayoutEffect(() => {
    holdLoader(now);
    return releaseLoader;
  }, [now]);
  return fill ? <div aria-hidden className="min-h-[100dvh] w-full bg-rc-night" /> : null;
}

/** @deprecated name kept for existing call sites; the label is no longer shown. */
export function BrandLoader(_props: { label?: string }) {
  return <LoaderHold />;
}
