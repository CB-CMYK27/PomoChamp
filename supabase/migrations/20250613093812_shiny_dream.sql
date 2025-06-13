/*
  # Add INSERT policy for users table

  1. Security Changes
    - Add RLS policy to allow authenticated users (including anonymous) to insert their own user profiles
    - Policy ensures users can only create profiles with their own auth ID
    - Fixes the "new row violates row-level security policy" error

  This migration adds the missing INSERT policy that allows users to create their initial profile
  when signing in anonymously through the GuestGate component.
*/

-- Add INSERT policy for users table to allow profile creation
CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO public
  WITH CHECK (auth.uid()::text = auth0_id);