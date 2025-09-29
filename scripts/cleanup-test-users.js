/**
 * Script to clean up test users from Supabase
 * This will delete the specified email addresses from both auth.users and creators tables
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
try {
  const envPath = join(process.cwd(), 'apps/hydrogen/.env');
  const envContent = readFileSync(envPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  });
  
  Object.assign(process.env, envVars);
} catch (err) {
  console.log('No .env file found, using system environment variables');
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const testEmails = [
  'heidemakevin@gmail.com',
  'devanada21@gmail.com'
];

async function cleanupTestUsers() {
  console.log('🧹 Cleaning up test users...\n');

  for (const email of testEmails) {
    console.log(`🗑️  Processing: ${email}`);
    
    try {
      // First, get the user ID from auth.users
      const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
      
      if (usersError) {
        console.error(`❌ Error fetching users: ${usersError.message}`);
        continue;
      }

      const user = users.users.find(u => u.email === email);
      
      if (!user) {
        console.log(`⚠️  User not found in auth.users: ${email}`);
        continue;
      }

      console.log(`📋 Found user ID: ${user.id}`);

      // Delete from creators table first (foreign key constraint)
      const { error: creatorsError } = await supabase
        .from('creators')
        .delete()
        .eq('supabase_user_id', user.id);

      if (creatorsError) {
        console.error(`❌ Error deleting from creators: ${creatorsError.message}`);
      } else {
        console.log(`✅ Deleted from creators table`);
      }

      // Delete from auth.users (requires admin access)
      const { error: authError } = await supabase.auth.admin.deleteUser(user.id);
      
      if (authError) {
        console.error(`❌ Error deleting from auth.users: ${authError.message}`);
        console.log(`💡 You may need to delete this user manually from Supabase Dashboard > Authentication > Users`);
      } else {
        console.log(`✅ Deleted from auth.users`);
      }

    } catch (error) {
      console.error(`❌ Error processing ${email}:`, error.message);
    }
    
    console.log(''); // Empty line for readability
  }

  console.log('🎉 Cleanup completed!');
  console.log('\n📝 Note: If any users couldn\'t be deleted automatically,');
  console.log('   you can delete them manually from Supabase Dashboard > Authentication > Users');
}

cleanupTestUsers();
