/*
  # Populate fighters table with game data

  1. Data Population
    - Insert all fighter data from fighters.json into the fighters table
    - Includes all 12 fighters with their complete information
    - Sets proper fighter_type as 'premade' for all default fighters
    - Ensures fighter_id matches the IDs used in the application

  2. Data Integrity
    - Uses INSERT with ON CONFLICT to prevent duplicates
    - Maintains referential integrity for game_sessions foreign key
*/

-- Insert all fighters from the JSON data
INSERT INTO fighters (
  fighter_id,
  fighter_name,
  original_prompt,
  enhanced_prompt,
  fighter_image_url,
  fighter_type,
  is_active,
  win_count,
  loss_count,
  created_at,
  last_used
) VALUES 
(
  'jack-tower',
  'Jack Tower',
  'Action hero construction worker',
  'Yippee-ki-pay-your-tasks!',
  '/fighters/jack-tower/full.png',
  'premade',
  true,
  0,
  0,
  now(),
  now()
),
(
  'prof-kruber',
  'Professor Kruber',
  'Evil scientist villain',
  'I have an appointment with productivity.',
  '/fighters/prof-kruber/full.png',
  'premade',
  true,
  0,
  0,
  now(),
  now()
),
(
  'raging-stallion',
  'Raging Stallion',
  'Boxing champion hero',
  'Ain''t so tough, deadlines!',
  '/fighters/raging-stallion/full.png',
  'premade',
  true,
  0,
  0,
  now(),
  now()
),
(
  'iron-titan',
  'Iron Titan',
  'Soviet boxing villain',
  'In Soviet Russia, tasks complete YOU!',
  '/fighters/iron-titan/full.png',
  'premade',
  true,
  0,
  0,
  now(),
  now()
),
(
  'bond-sterling',
  'Bond Sterling',
  'Secret agent hero',
  'The name''s Sterling. Bond Sterling.',
  '/fighters/bond-sterling/full.png',
  'premade',
  true,
  0,
  0,
  now(),
  now()
),
(
  'dr-whiskers',
  'Dr. Whiskers',
  'Evil cat mastermind',
  'We expect you to WORK, Mr Sterling.',
  '/fighters/dr-whiskers/full.png',
  'premade',
  true,
  0,
  0,
  now(),
  now()
),
(
  'waves-mcrad',
  'Waves McRad',
  'Surfer dude hero',
  'Shore thing, brah!',
  '/fighters/waves-mcrad/full.png',
  'premade',
  true,
  0,
  0,
  now(),
  now()
),
(
  'gen-buzzkill',
  'General Buzzkill',
  'Military drill sergeant villain',
  'Drop and give me twenty tasks!',
  '/fighters/gen-buzzkill/full.png',
  'premade',
  true,
  0,
  0,
  now(),
  now()
),
(
  'beach-belle',
  'Beach Belle',
  'Lifeguard hero',
  'No drowning in tasks on my watch!',
  '/fighters/beach-belle/full.png',
  'premade',
  true,
  0,
  0,
  now(),
  now()
),
(
  'jawsome',
  'Jawsome',
  'Shark villain',
  'Just when you thought it was safe to procrastinate…',
  '/fighters/jawsome/full.png',
  'premade',
  true,
  0,
  0,
  now(),
  now()
),
(
  'ellen-ryker',
  'Ellen Ryker',
  'Space marine hero',
  'Let''s nuke these tasks from orbit—only way to be sure.',
  '/fighters/ellen-ryker/full.png',
  'premade',
  true,
  0,
  0,
  now(),
  now()
),
(
  'queen-chroma',
  'Queen Chroma',
  'Alien queen villain',
  'Your precious focus… feeds the hive.',
  '/fighters/queen-chroma/full.png',
  'premade',
  true,
  0,
  0,
  now(),
  now()
)
ON CONFLICT (fighter_id) DO UPDATE SET
  fighter_name = EXCLUDED.fighter_name,
  original_prompt = EXCLUDED.original_prompt,
  enhanced_prompt = EXCLUDED.enhanced_prompt,
  fighter_image_url = EXCLUDED.fighter_image_url,
  fighter_type = EXCLUDED.fighter_type,
  is_active = EXCLUDED.is_active,
  last_used = now();