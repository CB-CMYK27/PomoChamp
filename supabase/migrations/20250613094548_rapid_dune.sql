/*
  # Fix fighter_id column type in game_sessions table

  1. Changes
    - Change `fighter_id` column in `game_sessions` table from UUID to TEXT
    - Update foreign key constraint to reference the correct column type
    - This allows storing string-based fighter IDs like "jawsome", "jack-tower", etc.

  2. Background
    - The application uses string-based fighter IDs from fighters.json
    - The database was configured to expect UUID types
    - This mismatch caused "invalid input syntax for type uuid" errors

  3. Security
    - Maintains existing RLS policies
    - Updates foreign key constraint appropriately
*/

-- First, drop the existing foreign key constraint
ALTER TABLE game_sessions DROP CONSTRAINT IF EXISTS game_sessions_fighter_id_fkey;

-- Change the fighter_id column type from UUID to TEXT
ALTER TABLE game_sessions ALTER COLUMN fighter_id TYPE TEXT;

-- Also update the fighters table fighter_id column to TEXT to match
ALTER TABLE fighters DROP CONSTRAINT IF EXISTS fighters_pkey;
ALTER TABLE fighters ALTER COLUMN fighter_id TYPE TEXT;
ALTER TABLE fighters ADD CONSTRAINT fighters_pkey PRIMARY KEY (fighter_id);

-- Re-add the foreign key constraint with the correct type
ALTER TABLE game_sessions 
ADD CONSTRAINT game_sessions_fighter_id_fkey 
FOREIGN KEY (fighter_id) REFERENCES fighters(fighter_id) ON DELETE SET NULL;