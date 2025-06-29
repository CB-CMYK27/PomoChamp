import { useEffect, useState } from 'react';
import { supabase, createOrFetchUserProfile } from './services/supabase';   // adjust the path if your supabaseClient.ts lives elsewhere
import { signInAsGuest } from './guestAuth';

/**
 * Wrap your entire app with <GuestGate> in main.tsx.
 * It silently signs the visitor in as an anonymous Supabase user,
 * then renders the children once the session exists.
 */
export default function GuestGate({ children }: { children: JSX.Element }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function initializeUser() {
      try {
        // Check if we already have a session stored in localStorage
        const { data } = await supabase.auth.getSession();
        
        if (!data.session) {
          // No session yet – sign in anonymously
          await signInAsGuest();
        }
        
        // Ensure user profile exists in the database
        await createOrFetchUserProfile();
        
        setReady(true);
      } catch (error) {
        console.error('Error initializing user:', error);
        setReady(true); // Still set ready to avoid infinite loading
      }
    }

    initializeUser();
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center text-neonYel font-arcade">
        CONNECTING …
      </div>
    );
  }

  // Session is ready — render the real app
  return children;
}