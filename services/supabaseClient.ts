
import { createClient } from '@supabase/supabase-js';

// Tentative de récupération des clés par toutes les méthodes possibles
const getEnv = (key: string): string => {
  try {
    // 1. Essai via process.env (Vite define)
    // @ts-ignore
    const pEnv = (typeof process !== 'undefined' && process.env?.[key]);
    if (pEnv) return pEnv;

    // 2. Essai via import.meta.env (Vite standard)
    // @ts-ignore
    const metaEnv = import.meta.env?.[`VITE_${key}`] || import.meta.env?.[key];
    if (metaEnv) return metaEnv;

    // 3. Essai via window (Polyfill ou Injection directe)
    const winEnv = (window as any).process?.env?.[key] || (window as any)?.[key];
    if (winEnv) return winEnv;

    return '';
  } catch {
    return '';
  }
};

const supabaseUrl = getEnv('SUPABASE_URL');
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY');

// Logging discret pour le débogage (sans afficher les clés entières)
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("⚠️ Supabase : Clés manquantes. URL:", !!supabaseUrl, "KEY:", !!supabaseAnonKey);
}

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    }) 
  : null;
