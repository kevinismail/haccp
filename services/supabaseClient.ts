
import { createClient } from '@supabase/supabase-js';

// Sur Vercel, les variables sont injectées dans process.env
// Notre polyfill dans index.html assure que window.process.env existe toujours.
const env = typeof process !== 'undefined' ? process.env : (window as any).process?.env || {};

const supabaseUrl = env.SUPABASE_URL || '';
const supabaseAnonKey = env.SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;
