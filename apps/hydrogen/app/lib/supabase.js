import { createClient } from '@supabase/supabase-js'

// Only create client on the client side
let supabase = null;

if (typeof window !== 'undefined') {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  
  if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false, // Disable session persistence for SSR
      }
    });
  }
}

export { supabase };