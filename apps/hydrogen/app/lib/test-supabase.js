import { supabase } from './supabase.js'

// Test database connection
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('creators')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('Supabase connection error:', error)
      return false
    }
    
    console.log('✅ Supabase connected successfully!')
    console.log('Test data:', data)
    return true
  } catch (err) {
    console.error('Connection failed:', err)
    return false
  }
}