
import { createClient } from '@supabase/supabase-js';

// Fonction sécurisée pour lire les variables d'environnement
const getEnv = (key: string): string => {
  try {
    // @ts-ignore
    return (typeof process !== 'undefined' && process.env?.[key]) || (window as any).process?.env?.[key] || '';
  } catch {
    return '';
  }
};

const supabaseUrl = getEnv('SUPABASE_URL');
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY');

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;
