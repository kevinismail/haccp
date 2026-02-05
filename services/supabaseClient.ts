
import { createClient } from '@supabase/supabase-js';

const getSecret = (key: string): string => {
  // @ts-ignore
  const env = import.meta.env;
  // @ts-ignore
  const proc = (typeof process !== 'undefined' ? process.env : {});

  // On cherche par ordre de priorité :
  // 1. Version standard (SUPABASE_URL)
  // 2. Version Vite (VITE_SUPABASE_URL)
  // 3. Version injectée via window
  const value = 
    env?.[key] || 
    env?.[`VITE_${key}`] || 
    proc?.[key] || 
    proc?.[`VITE_${key}`] ||
    (window as any)?.[key] ||
    (window as any)?.[`VITE_${key}`];

  return (typeof value === 'string') ? value.trim() : '';
};

const url = getSecret('SUPABASE_URL');
const key = getSecret('SUPABASE_ANON_KEY');

if (!url || !key) {
  console.warn("🔧 Supabase : En attente des clés de configuration...");
}

export const supabase = (url && url.startsWith('http') && key) 
  ? createClient(url, key, {
      auth: { persistSession: true }
    }) 
  : null;
