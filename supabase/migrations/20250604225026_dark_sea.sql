/*
  # Create Leaderboard Table

  1. New Tables
    - `leaderboard`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `username` (varchar(3), not null)
      - `score` (integer, not null)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `leaderboard` table
    - Add policy for public read access
    - Add policy for authenticated users to insert/update their own scores
*/

CREATE TABLE IF NOT EXISTS leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(user_id) ON DELETE CASCADE,
  username varchar(3) NOT NULL,
  score integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Allow public read access to leaderboard
CREATE POLICY "Leaderboard is publicly viewable"
  ON leaderboard
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to insert their own scores
CREATE POLICY "Users can insert own scores"
  ON leaderboard
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid()::text IN (
      SELECT auth0_id 
      FROM users 
      WHERE user_id = leaderboard.user_id
    )
  );

-- Allow users to update their own scores
CREATE POLICY "Users can update own scores"
  ON leaderboard
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid()::text IN (
      SELECT auth0_id 
      FROM users 
      WHERE user_id = leaderboard.user_id
    )
  );

-- Create index for faster score ordering
CREATE INDEX idx_leaderboard_score ON leaderboard(score DESC);