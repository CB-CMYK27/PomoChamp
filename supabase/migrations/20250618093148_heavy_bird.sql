/*
  # Fix RLS policies for guest user creation

  1. Policy Updates
    - Update anonymous user insert policy to properly handle guest profile creation
    - Ensure anonymous users can create profiles with their own auth.uid()
    - Fix policy conditions to work with Supabase's anonymous authentication

  2. Security
    - Maintain security by ensuring users can only create/update their own profiles
    - Allow anonymous users to create guest profiles
    - Prevent unauthorized access to other users' data
*/

-- Drop existing policies that might be conflicting
DROP POLICY IF EXISTS "Anonymous users can create guest profiles" ON users;
DROP POLICY IF EXISTS "Anonymous users can view their own guest profile" ON users;

-- Create updated policy for anonymous users to insert guest profiles
CREATE POLICY "Anonymous users can create guest profiles"
  ON users
  FOR INSERT
  TO anon
  WITH CHECK (
    is_guest = true 
    AND auth0_id = (auth.uid())::text
  );

-- Create updated policy for anonymous users to view their own guest profile
CREATE POLICY "Anonymous users can view their own guest profile"
  ON users
  FOR SELECT
  TO anon
  USING (
    auth0_id = (auth.uid())::text 
    AND is_guest = true
  );

-- Update the authenticated user insert policy to be more permissive
DROP POLICY IF EXISTS "Users can create their own profile" ON users;
CREATE POLICY "Users can create their own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth0_id = (auth.uid())::text);

-- Ensure the update policy works correctly
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
CREATE POLICY "Users can update their own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth0_id = (auth.uid())::text)
  WITH CHECK (auth0_id = (auth.uid())::text);

-- Ensure the select policy works correctly
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
CREATE POLICY "Users can view their own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth0_id = (auth.uid())::text);