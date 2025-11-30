-- Add user moderation columns to profiles table
-- This enables ban and suspend functionality for user management

-- Add is_banned column
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;

-- Add is_suspended column
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT FALSE;

-- Add indexes for filtering banned/suspended users (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_profiles_is_banned ON profiles(is_banned);
CREATE INDEX IF NOT EXISTS idx_profiles_is_suspended ON profiles(is_suspended);

-- Optional: Add a banned_at timestamp to track when user was banned
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS banned_at TIMESTAMPTZ;

-- Optional: Add a suspended_at timestamp to track when user was suspended
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ;

-- Optional: Add a ban_reason column to store why user was banned
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS ban_reason TEXT;

-- Optional: Add a suspension_reason column to store why user was suspended
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS suspension_reason TEXT;

-- Note: After running this migration, you can uncomment the ban/suspend 
-- functionality in UserManagementClient.tsx
