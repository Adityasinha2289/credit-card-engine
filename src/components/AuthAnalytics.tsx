import { useEffect, useRef } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { analytics } from '../lib/analytics';

export function AuthAnalytics() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const previousAuthState = useRef<boolean | undefined>(undefined);

  useEffect(() => {
    if (!isLoaded) return;

    // Track Login / Signup
    if (isSignedIn && user && previousAuthState.current === false) {
      analytics.identify(user.id);
      
      const isNewUser = 
        user.createdAt && 
        (Date.now() - new Date(user.createdAt).getTime()) < 60000;
      
      if (isNewUser) {
        analytics.track('User Signed Up', { method: 'clerk' });
      } else {
        analytics.track('User Logged In', { method: 'clerk' });
      }
    }

    // Track Logout
    if (!isSignedIn && previousAuthState.current === true) {
      analytics.track('User Logged Out');
      analytics.reset();
    }

    // Initialize state on first load without triggering login if they were already logged in
    if (previousAuthState.current === undefined && isSignedIn && user) {
      analytics.identify(user.id);
      // We don't trigger "User Logged In" on simple page refresh to avoid duplicate events.
    }

    previousAuthState.current = isSignedIn;
  }, [isSignedIn, isLoaded, user]);

  return null;
}
