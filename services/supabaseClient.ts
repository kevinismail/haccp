
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

// On n'initialise le client que si les clés sont présentes
// Sinon on exporte null, ce qui sera géré par l'application
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

if (!supabase) {
  console.warn("Supabase : Les variables d'environnement SUPABASE_URL ou SUPABASE_ANON_KEY sont manquantes.");
}
