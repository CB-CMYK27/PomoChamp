import { supabase } from './services/supabase';
export async function signInAsGuest() { const { error } = await supabase.auth.signInAnonymously(); if (error) console.error(error); }