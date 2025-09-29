-- Debug authentication and creator profile creation
-- Run these queries in Supabase SQL Editor to check what happened

-- 1. Check if your user exists in auth.users
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    raw_user_meta_data
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- 2. Check if creator profile was created
SELECT 
    id,
    supabase_user_id,
    username,
    display_name,
    role,
    is_creator,
    created_at
FROM creators 
ORDER BY created_at DESC 
LIMIT 5;

-- 3. Check if the trigger function exists
SELECT 
    proname as function_name,
    prosrc as function_source
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- 4. Check if the trigger exists
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 5. Test the trigger function manually (replace 'your-user-id' with actual ID)
-- SELECT public.handle_new_user(NEW.*);
