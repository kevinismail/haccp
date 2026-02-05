
import { createClient } from '@supabase/supabase-js';

// Vite remplace ces expressions au moment du build (voir vite.config.ts)
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;

// Diagnostic pour l'utilisateur dans la console
if (!url || url === '' || !key || key === '') {
  console.warn("🔧 Supabase : Les clés sont vides ou non détectées.");
  console.info("Action requise : Vérifiez que SUPABASE_URL et SUPABASE_ANON_KEY sont bien définies dans vos variables d'environnement.");
} else {
  console.log("🚀 Supabase : Clés détectées. Tentative de connexion à :", url.substring(0, 20) + "...");
}

// Initialisation du client uniquement si les clés ressemblent à des valeurs valides
export const supabase = (url && url.startsWith('http') && key && key.length > 20) 
  ? createClient(url, key, {
      auth: { persistSession: true }
    }) 
  : null;
