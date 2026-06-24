import { supabase } from './services/supabase';

export async function signInAsGuest() {
  try {
    const { data, error } = await supabase.auth.signInAnonymously();

    if (error) {
      if (error.message.includes('Failed to fetch') ||
          error.message.includes('NetworkError') ||
          error.message.includes('timeout')) {
        console.warn('Network error during guest sign-in - continuing in offline mode');
      } else {
        console.error('Error signing in as guest:', error);
      }
      return null;
    }

    console.log('✅ Successfully signed in as guest:', data.user?.id);
    return data;
  } catch (error: any) {
    if (error.message?.includes('Failed to fetch') ||
        error.message?.includes('NetworkError') ||
        error.message?.includes('timeout')) {
      console.warn('Network error during guest sign-in - continuing in offline mode');
    } else {
      console.error('Unexpected error signing in as guest:', error);
    }
    return null;
  }
}