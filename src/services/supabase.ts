import { createClient } from '@supabase/supabase-js';

// Get the Supabase URL and anon key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
      }
    }
  } else {
    // Insert new entry
    const { error } = await supabase
      .from('leaderboard')
      .insert([entry]);
      
    if (error) {
        console.error('Error adding to leaderboard:', error);
      }
    }
}