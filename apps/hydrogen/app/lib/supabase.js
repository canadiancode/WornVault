import { createClient } from '@supabase/supabase-js'

// Only create client on the client side
let supabase = null;

if (typeof window !== 'undefined') {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  
  if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true, // Enable session persistence for auth
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        redirectTo: `${window.location.origin}/auth/verify`
      }
    });
  }
}

export { supabase };

/**
 * Authentication helper functions
 */
export const auth = {
  // Sign up with email and password
  async signUp(email, password, userData = {}) {
    if (!supabase) throw new Error('Supabase not initialized');
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    
    return { data, error };
  },

  // Sign in with email and password
  async signIn(email, password) {
    if (!supabase) throw new Error('Supabase not initialized');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    return { data, error };
  },

  // Sign out
  async signOut() {
    if (!supabase) throw new Error('Supabase not initialized');
    
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current user
  async getCurrentUser() {
    if (!supabase) throw new Error('Supabase not initialized');
    
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  // Get current session
  async getSession() {
    if (!supabase) throw new Error('Supabase not initialized');
    
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  },

  // Listen to auth state changes
  onAuthStateChange(callback) {
    if (!supabase) throw new Error('Supabase not initialized');
    
    return supabase.auth.onAuthStateChange(callback);
  }
};