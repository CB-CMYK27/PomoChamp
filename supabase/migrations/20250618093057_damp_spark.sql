/*
  # Fix Users Table RLS Policies

  1. Security Updates
    - Drop existing restrictive policies that prevent user profile creation
    - Create new policies that properly handle both authenticated and anonymous users
    - Allow users to create, read, and update their own profiles
    - Ensure anonymous users can create guest profiles

  2. Policy Changes
    - `Users can create their own profile` - allows INSERT for authenticated users
    - `Users can view their own profile` - allows SELECT for users viewing their own data
    - `Users can update their own profile` - allows UPDATE for non-guest users only
    - Handle both regular authenticated users and anonymous guest users
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Create new policies that work with both authenticated and anonymous users
CREATE POLICY "Users can create their own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth0_id = (auth.uid())::text);

CREATE POLICY "Users can view their own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth0_id = (auth.uid())::text);

CREATE POLICY "Users can update their own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth0_id = (auth.uid())::text AND is_guest = false)
  WITH CHECK (auth0_id = (auth.uid())::text AND is_guest = false);

-- Also allow public access for anonymous users to create guest profiles
CREATE POLICY "Anonymous users can create guest profiles"
  ON users
  FOR INSERT
  TO anon
  WITH CHECK (is_guest = true AND auth0_id IS NOT NULL);

CREATE POLICY "Anonymous users can view their own guest profile"
  ON users
  FOR SELECT
  TO anon
  USING (auth0_id = (auth.uid())::text AND is_guest = true);