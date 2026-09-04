import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const getEnv = (key: string) => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  return undefined;
};

let supabaseUrl = getEnv('VITE_SUPABASE_URL') || getEnv('SUPABASE_URL');
let supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('SUPABASE_ANON_KEY');

try {
  if (!supabaseUrl) supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseAnonKey) supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
} catch (e) {
  // Ignore
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
    'Backend features (sync, analytics) will be disabled. ' +
    'The app will continue to work in offline/localStorage mode.'
  );
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : null;

/** Whether the backend is available */
export const isBackendEnabled = !!supabase;
