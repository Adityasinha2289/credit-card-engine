import { useAuth } from '@clerk/clerk-react';
import { useEffect, useMemo, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../lib/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export function useSupabase() {
  const { getToken } = useAuth();
  // Keep one client for the component's lifetime. Clerk returns a new getToken
  // function on session refreshes; rebuilding the client each time re-ran every
  // effect that depends on it (including full store hydration).
  const getTokenRef = useRef(getToken);
  useEffect(() => { getTokenRef.current = getToken; }, [getToken]);

  return useMemo(() => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Missing Supabase Environment Variables');
      return null;
    }

    return createClient<Database>(supabaseUrl, supabaseAnonKey, {
      global: {
        fetch: async (url, options = {}) => {
          // Clerk caches session tokens and refreshes them before expiry, so this is cheap.
          const clerkToken = await getTokenRef.current({ template: 'supabase' });
          const headers = new Headers(options?.headers);

          if (clerkToken) {
            headers.set('Authorization', `Bearer ${clerkToken}`);
          }

          return fetch(url, {
            ...options,
            headers,
          });
        },
      },
    });
  }, []);
}
