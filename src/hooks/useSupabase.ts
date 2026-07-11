import { useAuth } from '@clerk/clerk-react';
import { useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../lib/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export function useSupabase() {
  const { getToken } = useAuth();
  
  return useMemo(() => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Missing Supabase Environment Variables');
      return null;
    }

    return createClient<Database>(supabaseUrl, supabaseAnonKey, {
      global: {
        fetch: async (url, options = {}) => {
          const clerkToken = await getToken({ template: 'supabase' });
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
  }, [getToken]);
}
