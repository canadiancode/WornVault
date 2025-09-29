-- Clean up test users from WornVault database
-- Run these queries in Supabase SQL Editor

-- 1. First, let's see what users we have
SELECT id, email, created_at 
FROM auth.users 
WHERE email IN ('heidemakevin@gmail.com', 'devanada21@gmail.com')
ORDER BY created_at DESC;

-- 2. Check creators table for these users
SELECT id, supabase_user_id, username, display_name
FROM creators 
WHERE supabase_user_id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('heidemakevin@gmail.com', 'devanada21@gmail.com')
);

-- 3. Delete from creators table first (due to foreign key constraints)
DELETE FROM creators 
WHERE supabase_user_id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('heidemakevin@gmail.com', 'devanada21@gmail.com')
);

-- 4. Delete from auth.users table
-- Note: This requires admin privileges and might need to be done manually
-- from Supabase Dashboard > Authentication > Users
DELETE FROM auth.users 
WHERE email IN ('heidemakevin@gmail.com', 'devanada21@gmail.com');

-- 5. Verify cleanup
SELECT 'Remaining users:' as status;
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

SELECT 'Remaining creators:' as status;
SELECT id, supabase_user_id, username, display_name 
FROM creators 
ORDER BY created_at DESC 
LIMIT 5;
