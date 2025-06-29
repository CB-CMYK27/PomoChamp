/*
  # Fix user profile creation RLS policy

  1. Security Changes
    - Drop existing INSERT policy if it exists
    - Create a new INSERT policy that properly handles anonymous users
    - Ensure the policy works with both authenticated and anonymous users
    - Fix any type mismatches between auth.uid() and auth0_id column

  This migration fixes the "new row violates row-level security policy" error
  by creating a proper INSERT policy for the users table.
*/

-- Drop existing INSERT policy if it exists
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Create a new INSERT policy that handles both authenticated and anonymous users
CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO public
  WITH CHECK (
    auth.uid() IS NOT NULL AND 
    auth.uid()::text = auth0_id
  );

-- Also ensure we have proper SELECT and UPDATE policies for completeness
DROP POLICY IF EXISTS "Users can read own profile" ON users;
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO public
  USING (
    auth.uid() IS NOT NULL AND 
    auth.uid()::text = auth0_id
  );

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO public
  USING (
    auth.uid() IS NOT NULL AND 
    auth.uid()::text = auth0_id
  )
  WITH CHECK (
    auth.uid() IS NOT NULL AND 
    auth.uid()::text = auth0_id
  );