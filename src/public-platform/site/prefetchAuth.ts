/**
 * Sign-in is a separate chunk (Clerk's SDK and the signed-in pages). Start
 * fetching it, and open the connection to Clerk, the moment someone shows intent:
 * hovering or touching a sign-in link, or simply being a returning signed-in
 * visitor. Then the click lands on a page that is already there.
 */
let started = false;

function clerkFrontendHost(): string | null {
  const key = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string | undefined;
  const encoded = key?.split('_')[2];
  if (!encoded) return null;
  try {
    return atob(encoded).replace(/\$$/, '') || null;
  } catch {
    return null;
  }
}

export function prefetchAuth() {
  if (started || typeof document === 'undefined') return;
  started = true;
  const host = clerkFrontendHost();
  if (host) {
    for (const rel of ['preconnect', 'dns-prefetch']) {
      const link = document.createElement('link');
      link.rel = rel;
      link.href = `https://${host}`;
      if (rel === 'preconnect') link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    }
  }
  void import('../../components/AuthenticatedAppWrapper');
}

/** Props for a link that leads into sign-in or the signed-in pages. */
export const prefetchAuthProps = {
  onMouseEnter: prefetchAuth,
  onFocus: prefetchAuth,
  onTouchStart: prefetchAuth,
};
