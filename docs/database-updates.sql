-- Database updates for WornVault authentication system
-- Run these queries in your Supabase SQL editor

-- 1. Add user role columns to creators table
ALTER TABLE creators 
ADD COLUMN IF NOT EXISTS supabase_user_id UUID,
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'fan',
ADD COLUMN IF NOT EXISTS is_creator BOOLEAN DEFAULT false;

-- 2. Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_creators_supabase_user_id ON creators(supabase_user_id);
CREATE INDEX IF NOT EXISTS idx_creators_role ON creators(role);

-- 3. Update existing test data to have proper roles
UPDATE creators 
SET role = 'creator', is_creator = true 
WHERE id = 'b07b970f-4cfd-4242-ad1b-1252551bebc1';

-- 4. Create RLS policies for creators table
-- Enable RLS
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all creators (public profiles)
CREATE POLICY "Public creators are viewable by everyone" ON creators
    FOR SELECT USING (true);

-- Policy: Users can only update their own creator profile
CREATE POLICY "Users can update own creator profile" ON creators
    FOR UPDATE USING (auth.uid() = supabase_user_id);

-- Policy: Users can insert their own creator profile
CREATE POLICY "Users can insert own creator profile" ON creators
    FOR INSERT WITH CHECK (auth.uid() = supabase_user_id);

-- 5. Create RLS policies for posts table
-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view published posts
CREATE POLICY "Published posts are viewable by everyone" ON posts
    FOR SELECT USING (status = 'published');

-- Policy: Creators can view their own posts (including drafts)
CREATE POLICY "Creators can view own posts" ON posts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM creators 
            WHERE creators.id = posts.creator_id 
            AND creators.supabase_user_id = auth.uid()
        )
    );

-- Policy: Creators can insert their own posts
CREATE POLICY "Creators can insert own posts" ON posts
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM creators 
            WHERE creators.id = posts.creator_id 
            AND creators.supabase_user_id = auth.uid()
        )
    );

-- Policy: Creators can update their own posts
CREATE POLICY "Creators can update own posts" ON posts
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM creators 
            WHERE creators.id = posts.creator_id 
            AND creators.supabase_user_id = auth.uid()
        )
    );

-- Policy: Creators can delete their own posts
CREATE POLICY "Creators can delete own posts" ON posts
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM creators 
            WHERE creators.id = posts.creator_id 
            AND creators.supabase_user_id = auth.uid()
        )
    );

-- 6. Create function to automatically create creator profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.creators (
    supabase_user_id,
    username,
    display_name,
    role,
    is_creator
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'User'),
    'fan',
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create trigger to automatically create creator profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 8. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.creators TO anon, authenticated;
GRANT ALL ON public.posts TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
