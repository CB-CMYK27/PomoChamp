/*
  # Guest User Tracking System

  1. Database Schema Changes
    - Add `is_guest` boolean column to users table
    - Remove unique constraint on username to allow multiple 'GST' usernames
    - Create partial unique indexes for guest vs non-guest users
    - Add efficient indexing for guest user queries

  2. Security Updates
    - Update RLS policies to differentiate between guest and registered users
    - Restrict write operations (tasks, sessions, leaderboard) to registered users only
    - Allow guest users to create profiles but not save progress

  3. Guest User Features
    - Guest users share 'GST' username but are uniquely tracked by created_at timestamp
    - Guest users can play the game but cannot save progress or data
    - Registered users maintain unique usernames and full functionality
*/

-- Add is_guest column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_guest BOOLEAN DEFAULT FALSE;

-- Update existing users to not be guests (assuming existing users are registered)
UPDATE users SET is_guest = FALSE WHERE is_guest IS NULL;

-- Drop existing unique constraint on username if it exists
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_username_key;

-- Create a partial unique index for non-guest usernames
-- This ensures 'username' is still unique for registered users
CREATE UNIQUE INDEX IF NOT EXISTS users_username_non_guest_key 
ON public.users (username) WHERE is_guest = FALSE;

-- Create a unique index for guest usernames (username + created_at)
-- This ensures each guest user session is uniquely identifiable
CREATE UNIQUE INDEX IF NOT EXISTS users_username_created_at_guest_key 
ON public.users (username, created_at) WHERE is_guest = TRUE;

-- Create an index on is_guest for efficient querying of guest users
CREATE INDEX IF NOT EXISTS idx_users_is_guest ON public.users (is_guest);

-- Modify RLS policies for 'users' table
-- Drop existing policies to recreate them with is_guest consideration
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- New INSERT policy for 'users' table:
-- Allows authenticated users to insert their own profile
-- Guests get is_guest = TRUE, registered users get is_guest = FALSE
CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO public
  WITH CHECK (
    auth.uid() IS NOT NULL AND auth.uid()::text = auth0_id
  );

-- New SELECT policy for 'users' table:
-- Allows users to read their own profile
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO public
  USING (
    auth.uid() IS NOT NULL AND auth.uid()::text = auth0_id
  );

-- New UPDATE policy for 'users' table:
-- Allows authenticated users (non-guests) to update their own profile
-- Guest users cannot update their profiles
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO public
  USING (
    auth.uid() IS NOT NULL AND auth.uid()::text = auth0_id AND is_guest = FALSE
  )
  WITH CHECK (
    auth.uid() IS NOT NULL AND auth.uid()::text = auth0_id AND is_guest = FALSE
  );

-- Modify RLS policies for 'tasks' table
-- Drop existing policies
DROP POLICY IF EXISTS "Anon can insert/select own tasks" ON tasks;
DROP POLICY IF EXISTS "Anonymous users can manage tasks" ON tasks;
DROP POLICY IF EXISTS "Users can insert own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can view own tasks" ON tasks;
DROP POLICY IF EXISTS "Registered users can insert own tasks" ON tasks;
DROP POLICY IF EXISTS "Registered users can update own tasks" ON tasks;
DROP POLICY IF EXISTS "Registered users can view own tasks" ON tasks;

-- New policies for 'tasks' table:
-- Registered users can insert their own tasks
CREATE POLICY "Registered users can insert own tasks"
  ON tasks
  FOR INSERT
  TO public
  WITH CHECK (
    user_id IN (SELECT user_id FROM users WHERE auth.uid()::text = auth0_id AND is_guest = FALSE)
  );

-- Registered users can update their own tasks
CREATE POLICY "Registered users can update own tasks"
  ON tasks
  FOR UPDATE
  TO public
  USING (
    user_id IN (SELECT user_id FROM users WHERE auth.uid()::text = auth0_id AND is_guest = FALSE)
  )
  WITH CHECK (
    user_id IN (SELECT user_id FROM users WHERE auth.uid()::text = auth0_id AND is_guest = FALSE)
  );

-- Registered users can view their own tasks
CREATE POLICY "Registered users can view own tasks"
  ON tasks
  FOR SELECT
  TO public
  USING (
    user_id IN (SELECT user_id FROM users WHERE auth.uid()::text = auth0_id AND is_guest = FALSE)
  );

-- Modify RLS policies for 'game_sessions' table
-- Drop existing policies
DROP POLICY IF EXISTS "Anon can insert/select own sessions" ON game_sessions;
DROP POLICY IF EXISTS "Users can insert own sessions" ON game_sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON game_sessions;
DROP POLICY IF EXISTS "Users can view own sessions" ON game_sessions;
DROP POLICY IF EXISTS "Registered users can insert own sessions" ON game_sessions;
DROP POLICY IF EXISTS "Registered users can update own sessions" ON game_sessions;
DROP POLICY IF EXISTS "Registered users can view own sessions" ON game_sessions;

-- New policies for 'game_sessions' table:
-- Registered users can insert their own sessions
CREATE POLICY "Registered users can insert own sessions"
  ON game_sessions
  FOR INSERT
  TO public
  WITH CHECK (
    user_id IN (SELECT user_id FROM users WHERE auth.uid()::text = auth0_id AND is_guest = FALSE)
  );

-- Registered users can update their own sessions
CREATE POLICY "Registered users can update own sessions"
  ON game_sessions
  FOR UPDATE
  TO public
  USING (
    user_id IN (SELECT user_id FROM users WHERE auth.uid()::text = auth0_id AND is_guest = FALSE)
  )
  WITH CHECK (
    user_id IN (SELECT user_id FROM users WHERE auth.uid()::text = auth0_id AND is_guest = FALSE)
  );

-- Registered users can view their own sessions
CREATE POLICY "Registered users can view own sessions"
  ON game_sessions
  FOR SELECT
  TO public
  USING (
    user_id IN (SELECT user_id FROM users WHERE auth.uid()::text = auth0_id AND is_guest = FALSE)
  );

-- Modify RLS policies for 'user_performance' table
-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert own performance" ON user_performance;
DROP POLICY IF EXISTS "Users can view own performance" ON user_performance;
DROP POLICY IF EXISTS "Registered users can insert own performance" ON user_performance;
DROP POLICY IF EXISTS "Registered users can view own performance" ON user_performance;

-- New policies for 'user_performance' table:
-- Registered users can insert their own performance
CREATE POLICY "Registered users can insert own performance"
  ON user_performance
  FOR INSERT
  TO public
  WITH CHECK (
    user_id IN (SELECT user_id FROM users WHERE auth.uid()::text = auth0_id AND is_guest = FALSE)
  );

-- Registered users can view their own performance
CREATE POLICY "Registered users can view own performance"
  ON user_performance
  FOR SELECT
  TO public
  USING (
    user_id IN (SELECT user_id FROM users WHERE auth.uid()::text = auth0_id AND is_guest = FALSE)
  );

-- Modify RLS policies for 'leaderboard' table
-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert own scores" ON leaderboard;
DROP POLICY IF EXISTS "Users can update own scores" ON leaderboard;
DROP POLICY IF EXISTS "Registered users can insert own scores" ON leaderboard;
DROP POLICY IF EXISTS "Registered users can update own scores" ON leaderboard;

-- New policies for 'leaderboard' table:
-- Registered users can insert their own scores
CREATE POLICY "Registered users can insert own scores"
  ON leaderboard
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id IN (SELECT user_id FROM users WHERE auth.uid()::text = auth0_id AND is_guest = FALSE)
  );

-- Registered users can update their own scores
CREATE POLICY "Registered users can update own scores"
  ON leaderboard
  FOR UPDATE
  TO authenticated
  USING (
    user_id IN (SELECT user_id FROM users WHERE auth.uid()::text = auth0_id AND is_guest = FALSE)
  );

-- Modify RLS policies for 'fighters' table
-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert own fighters" ON fighters;
DROP POLICY IF EXISTS "Users can update own fighters" ON fighters;
DROP POLICY IF EXISTS "Users can view own fighters" ON fighters;
DROP POLICY IF EXISTS "Registered users can insert own fighters" ON fighters;
DROP POLICY IF EXISTS "Registered users can update own fighters" ON fighters;
DROP POLICY IF EXISTS "Registered users can view own fighters" ON fighters;

-- New policies for 'fighters' table:
-- Registered users can insert their own fighters
CREATE POLICY "Registered users can insert own fighters"
  ON fighters
  FOR INSERT
  TO public
  WITH CHECK (
    user_id IN (SELECT user_id FROM users WHERE auth.uid()::text = auth0_id AND is_guest = FALSE)
  );

-- Registered users can update their own fighters
CREATE POLICY "Registered users can update own fighters"
  ON fighters
  FOR UPDATE
  TO public
  USING (
    user_id IN (SELECT user_id FROM users WHERE auth.uid()::text = auth0_id AND is_guest = FALSE)
  )
  WITH CHECK (
    user_id IN (SELECT user_id FROM users WHERE auth.uid()::text = auth0_id AND is_guest = FALSE)
  );

-- Registered users can view their own fighters
CREATE POLICY "Registered users can view own fighters"
  ON fighters
  FOR SELECT
  TO public
  USING (
    user_id IN (SELECT user_id FROM users WHERE auth.uid()::text = auth0_id AND is_guest = FALSE)
  );