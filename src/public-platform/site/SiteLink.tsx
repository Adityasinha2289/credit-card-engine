/**
 * The website's tools also run inside the signed-in app (/app/tools, /app/cards).
 * Inside the app, links between those pages must stay in the app, so a signed-in
 * user is never dropped onto the public site without a way back.
 *
 * Wrap app screens in <InAppProvider>; use <SiteLink> (or the primitives built on
 * it) for links on pages that render in both places.
 */
import { createContext, forwardRef, useContext, useEffect, useState, type ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';

const InAppContext = createContext(false);

export function InAppProvider({ children }: { children: ReactNode }) {
  return <InAppContext.Provider value>{children}</InAppContext.Provider>;
}

export const useInApp = () => useContext(InAppContext);

/** Public path → the same screen inside the app, when there is one. */
export function appPathFor(path: string): string {
  if (path === '/') return '/app';
  if (path === '/cards' || path.startsWith('/cards/') || path.startsWith('/cards?')) return `/app${path}`;
  if (path.startsWith('/calculators/')) return path.replace('/calculators/', '/app/tools/');
  if (path.startsWith('/app/sign-up') || path.startsWith('/app/sign-in')) return '/app';
  return path;
}

export function useSitePath() {
  const inApp = useInApp();
  return (path: string) => (inApp ? appPathFor(path) : path);
}

export const SiteLink = forwardRef<HTMLAnchorElement, LinkProps>(function SiteLink({ to, ...props }, ref) {
  const map = useSitePath();
  return <Link ref={ref} to={typeof to === 'string' ? map(to) : to} {...props} />;
});

/**
 * True when this browser has a signed-in RenoCred session. Clerk keeps a readable
 * `__client_uat` cookie (0 when signed out), so the public site can tell without
 * loading Clerk itself.
 */
export function useSignedInHint(): boolean {
  const read = () => typeof document !== 'undefined'
    && /(?:^|;\s*)__client_uat(?:_[^=]+)?=([1-9]\d*)/.test(document.cookie);
  const [signedIn, setSignedIn] = useState(read);
  useEffect(() => {
    const on = () => setSignedIn(read());
    on();
    document.addEventListener('visibilitychange', on);
    window.addEventListener('focus', on);
    return () => { document.removeEventListener('visibilitychange', on); window.removeEventListener('focus', on); };
  }, []);
  return signedIn;
}
