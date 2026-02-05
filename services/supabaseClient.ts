
import { createClient } from '@supabase/supabase-js';

// Fonction sécurisée pour récupérer les variables d'environnement
const getEnv = (key: string): string => {
  try {
    // Tentative d'accès via process.env ou window.process.env
    // @ts-ignore
    return process.env[key] || window.process?.env?.[key] || '';
  } catch {
    return '';
  }
};

const supabaseUrl = getEnv('SUPABASE_URL');
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY');

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;
