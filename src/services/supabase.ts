import { createClient } from '@supabase/supabase-js';

// Get the Supabase URL and anon key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Generate a random 3-character username
function generateRandomUsername(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 3; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Create or fetch user profile
export async function createOrFetchUserProfile() {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    console.error('Error getting session:', sessionError);
    return null;
  }
  
  if (!session?.user) {
    console.log('No authenticated user found');
    return null;
  }
  
  // First try to get existing user data
  const { data: existingUser, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('auth0_id', session.user.id)
    .maybeSingle(); // Use maybeSingle() instead of single() to avoid error when no rows found
    
  if (fetchError) {
    console.error('Error fetching user data:', fetchError);
    return null;
  }
  
  // If user exists, return it
  if (existingUser) {
    return existingUser;
  }
  
  // If user doesn't exist, create a new profile
  console.log('Creating new user profile for anonymous user');
  
  const newUserData = {
    auth0_id: session.user.id,
    email: session.user.email || null,
    username: generateRandomUsername(),
    subscription_status: 'guest',
    guest_session_id: session.user.id,
    total_score: 0,
    tournaments_won: 0,
    created_at: new Date().toISOString(),
    last_active: new Date().toISOString()
  };
  
  const { data: newUser, error: createError } = await supabase
    .from('users')
    .insert([newUserData])
    .select()
    .single();
    
  if (createError) {
    console.error('Error creating user profile:', createError);
    return null;
  }
  
  console.log('✅ New user profile created:', newUser);
  return newUser;
}

// Task related functions
export async function fetchTasks() {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
  
  return data || [];
}

export async function addTask(task: { 
  title: string; 
  completed: boolean; 
  user_id: string | null;
  estimated_minutes: number;
  round_number: number;
  session_id: string | null;
}) {
  const { data, error } = await supabase
    .from('tasks')
    .insert([task])
    .select();
    
  if (error) {
    console.error('Error adding task:', error);
    return null;
  }
  
  return data?.[0] || null;
}

export async function updateTask(id: string, updates: { completed?: boolean; title?: string }) {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select();
    
  if (error) {
    console.error('Error updating task:', error);
    return null;
  }
  
  return data?.[0] || null;
}

export async function deleteTask(id: string) {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error('Error deleting task:', error);
    return false;
  }
  
  return true;
}

// Game Session related functions
export async function createGameSession(sessionData: {
  user_id: string;
  fighter_id: string;
  session_type: 'standard' | 'training' | 'tournament';
}) {
  console.log('🎮 Creating game session:', sessionData);
  
  const { data, error } = await supabase
    .from('game_sessions')
    .insert([{
      user_id: sessionData.user_id,
      fighter_id: sessionData.fighter_id,
      session_type: sessionData.session_type,
      total_score: 0,
      rounds_completed: 0,
      tournament_won: false,
      grudge_match_attempted: false,
      created_at: new Date().toISOString()
    }])
    .select()
    .single();
    
  if (error) {
    console.error('Error creating game session:', error);
    return null;
  }
  
  console.log('✅ Game session created:', data);
  return data;
}

export async function updateGameSession(sessionId: string, updates: {
  total_score?: number;
  rounds_completed?: number;
  tournament_won?: boolean;
  grudge_match_attempted?: boolean;
  ended_at?: string;
}) {
  console.log('🎮 Updating game session:', sessionId, updates);
  
  const { data, error } = await supabase
    .from('game_sessions')
    .update(updates)
    .eq('session_id', sessionId)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating game session:', error);
    return null;
  }
  
  console.log('✅ Game session updated:', data);
  return data;
}

// Enhanced task functions for game sessions
export async function addTaskToSession(task: {
  title: string;
  estimated_minutes: number;
  user_id: string;
  session_id: string;
  round_number: number;
}) {
  console.log('📝 Adding task to session:', task);
  
  const { data, error } = await supabase
    .from('tasks')
    .insert([{
      title: task.title,
      estimated_minutes: task.estimated_minutes,
      user_id: task.user_id,
      session_id: task.session_id,
      round_number: task.round_number,
      completed: false,
      points_earned: 0,
      created_at: new Date().toISOString()
    }])
    .select()
    .single();
    
  if (error) {
    console.error('Error adding task to session:', error);
    return null;
  }
  
  console.log('✅ Task added to session:', data);
  return data;
}

export async function updateTaskStatus(taskId: string, updates: {
  completed: boolean;
  points_earned: number;
  completed_at?: string;
  actual_minutes?: number;
}) {
  console.log('📝 Updating task status:', taskId, updates);
  
  const updateData: any = {
    completed: updates.completed,
    points_earned: updates.points_earned
  };
  
  if (updates.completed) {
    updateData.completed_at = new Date().toISOString();
  }
  
  if (updates.actual_minutes !== undefined) {
    updateData.actual_minutes = updates.actual_minutes;
  }
  
  const { data, error } = await supabase
    .from('tasks')
    .update(updateData)
    .eq('task_id', taskId)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating task status:', error);
    return null;
  }
  
  console.log('✅ Task status updated:', data);
  return data;
}

// User related functions
export async function getCurrentUser() {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Error getting session:', error);
    return null;
  }
  
  if (!session?.user) {
    console.log('No authenticated user found');
    return null;
  }
  
  // Get user data from users table using maybeSingle to avoid errors
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('auth0_id', session.user.id)
    .maybeSingle();
    
  if (userError) {
    console.error('Error fetching user data:', userError);
    return null;
  }
  
  // If no user data found, create profile
  if (!userData) {
    return await createOrFetchUserProfile();
  }
  
  return userData;
}

export async function updateUserStats(userId: string, updates: {
  total_score?: number;
  tournaments_won?: number;
  last_active?: string;
}) {
  console.log('👤 Updating user stats:', userId, updates);
  
  const { data, error } = await supabase
    .from('users')
    .update({
      ...updates,
      last_active: new Date().toISOString()
    })
    .eq('user_id', userId)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating user stats:', error);
    return null;
  }
  
  console.log('✅ User stats updated:', data);
  return data;
}

// Leaderboard related functions
export async function fetchLeaderboard() {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .order('score', { ascending: false })
    .limit(3);
    
  if (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
  
  return data || [];
}

export async function updateLeaderboard(entry: { user_id: string; username: string; score: number }) {
  console.log('🏆 Updating leaderboard:', entry);
  
  // First check if user exists
  const { data: existingEntry } = await supabase
    .from('leaderboard')
    .select('*')
    .eq('user_id', entry.user_id)
    .single();
    
  if (existingEntry) {
    // Update if new score is higher
    if (entry.score > existingEntry.score) {
      const { error } = await supabase
        .from('leaderboard')
        .update({ score: entry.score })
        .eq('user_id', entry.user_id);
        
      if (error) {
        console.error('Error updating leaderboard:', error);
      } else {
        console.log('✅ Leaderboard updated with new high score');
      }
    }
  } else {
    // Insert new entry
    const { error } = await supabase
      .from('leaderboard')
      .insert([entry]);
      
    if (error) {
      console.error('Error adding to leaderboard:', error);
    } else {
      console.log('✅ New leaderboard entry created');
    }
  }
}