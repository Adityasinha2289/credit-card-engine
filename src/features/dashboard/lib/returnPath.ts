/**
 * Where to go after signing in. A signed-out visit to a page in the app sends
 * you to sign-in with `?redirect_url=/app/wallet`; once you're in, you land on
 * that page instead of Overview. Only paths inside the app are accepted, so the
 * parameter can't send anyone to another site.
 */
export const RETURN_PARAM = 'redirect_url';

export function safeReturnPath(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let path = raw;
  try { path = decodeURIComponent(raw); } catch { return null; }
  // a full URL on this site is fine; keep only its path
  if (/^https?:\/\//i.test(path)) {
    try {
      const u = new URL(path);
      if (typeof window === 'undefined' || u.origin !== window.location.origin) return null;
      path = u.pathname + u.search;
    } catch { return null; }
  }
  if (!path.startsWith('/app') || path.startsWith('//') || /[\\\s]/.test(path)) return null;
  if (path !== '/app' && !path.startsWith('/app/') && !path.startsWith('/app?')) return null;
  if (/^\/app\/sign-(in|up)/.test(path) || /(^|\/)\.\.(\/|$)/.test(path)) return null;
  return path;
}

/** The sign-in (or sign-up) address that brings you back to `path` afterwards. */
export function authPathFor(mode: 'signin' | 'signup', path: string | null): string {
  const base = mode === 'signin' ? '/app/sign-in' : '/app/sign-up';
  const back = safeReturnPath(path);
  return back && back !== '/app' ? `${base}?${RETURN_PARAM}=${encodeURIComponent(back)}` : base;
}
