/**
 * Put this wherever something is loading (a Suspense fallback, a gate waiting
 * for sign-in or data). It keeps the single loading screen (lib/bootLoader) up
 * while mounted and holds the page's height so nothing jumps underneath.
 */
import { useLayoutEffect } from 'react';
import { holdLoader, releaseLoader } from '../lib/bootLoader';

export function LoaderHold({ fill = true }: { fill?: boolean }) {
  useLayoutEffect(() => {
    holdLoader();
    return releaseLoader;
  }, []);
  return fill ? <div aria-hidden className="min-h-[100dvh] w-full bg-rc-night" /> : null;
}

/** @deprecated name kept for existing call sites; the label is no longer shown. */
export function BrandLoader(_props: { label?: string }) {
  return <LoaderHold />;
}
