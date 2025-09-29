-- Fix: Create creator profile for existing Supabase user
-- Run this after getting your user ID from the debug queries above

-- Step 1: Get your user ID (replace with actual ID from debug query)
-- SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Step 2: Create creator profile (replace 'your-user-id' with actual ID)
INSERT INTO creators (
    supabase_user_id,
    username,
    display_name,
    role,
    is_creator,
    bio,
    created_at,
    updated_at
) VALUES (
    'your-user-id-here',  -- Replace with your actual Supabase user ID
    'your-username',      -- Replace with desired username
    'Your Display Name',  -- Replace with your display name
    'fan',               -- Start as fan, can upgrade to creator later
    false,               -- Not a creator yet
    'Welcome to WornVault!', -- Default bio
    NOW(),
    NOW()
);

-- Step 3: Verify the profile was created
SELECT 
    id,
    supabase_user_id,
    username,
    display_name,
    role,
    is_creator
FROM creators 
WHERE supabase_user_id = 'your-user-id-here';
