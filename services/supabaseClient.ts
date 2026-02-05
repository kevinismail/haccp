
import { createClient } from '@supabase/supabase-js';

// Configuration dynamique pour Vercel / GitHub
const supabaseUrl = (process.env.SUPABASE_URL as string) || '';
const supabaseAnonKey = (process.env.SUPABASE_ANON_KEY as string) || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
