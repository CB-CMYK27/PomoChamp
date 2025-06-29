/*
  # Fix username column length constraint

  1. Changes
    - Modify `username` column in `users` table from VARCHAR(3) to VARCHAR(255)
    - This allows for longer usernames including 'GUEST' for anonymous users
    - Maintains existing data while expanding the constraint

  2. Security
    - No changes to existing RLS policies
    - Column modification only affects data type constraint
*/

-- Modify the username column to allow longer usernames
ALTER TABLE users ALTER COLUMN username TYPE VARCHAR(255);