/**
 * Script to export database data for analysis
 * Run this to get a snapshot of your current database state
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

async function exportData() {
  console.log('📊 Exporting WornVault Database Data...\n');

  const exportData = {
    timestamp: new Date().toISOString(),
    tables: {}
  };

  try {
    // Export creators table
    console.log('📋 Exporting creators...');
    const { data: creators, error: creatorsError } = await supabase
      .from('creators')
      .select('*')
      .order('created_at', { ascending: false });

    if (creatorsError) {
      console.error('Error fetching creators:', creatorsError);
      exportData.tables.creators = { error: creatorsError.message };
    } else {
      exportData.tables.creators = creators;
      console.log(`✅ Found ${creators.length} creators`);
    }

    // Export posts table
    console.log('📋 Exporting posts...');
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (postsError) {
      console.error('Error fetching posts:', postsError);
      exportData.tables.posts = { error: postsError.message };
    } else {
      exportData.tables.posts = posts;
      console.log(`✅ Found ${posts.length} posts`);
    }

    // Export auth users (if accessible)
    console.log('📋 Exporting auth users...');
    try {
      const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
      if (usersError) {
        console.log('⚠️  Cannot access auth users (requires admin key)');
        exportData.tables.auth_users = { error: 'Admin access required' };
      } else {
        exportData.tables.auth_users = users.users.map(user => ({
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          email_confirmed_at: user.email_confirmed_at,
          last_sign_in_at: user.last_sign_in_at
        }));
        console.log(`✅ Found ${users.users.length} auth users`);
      }
    } catch (err) {
      console.log('⚠️  Cannot access auth users:', err.message);
      exportData.tables.auth_users = { error: err.message };
    }

    // Save to file
    const fs = await import('fs');
    const exportPath = join(process.cwd(), 'database-export.json');
    fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
    
    console.log(`\n✅ Database export saved to: ${exportPath}`);
    console.log('📄 You can share this file with me for analysis');

  } catch (error) {
    console.error('❌ Error during export:', error);
  }
}

exportData();
