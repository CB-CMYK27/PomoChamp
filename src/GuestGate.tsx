import { useEffect, useState } from 'react';
import { supabase } from './services/supabase';   // adjust the path if your supabaseClient.ts lives elsewhere
import { signInAsGuest } from './guestAuth';

/**
 * Wrap your entire app with <GuestGate> in main.tsx.
 * It silently signs the visitor in as an anonymous Supabase user,
 * then renders the children once the session exists.
 */
export default function GuestGate({ children }: { children: JSX.Element }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Check if we already have a session stored in localStorage
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        // No session yet – sign in anonymously
        signInAsGuest().then(() => setReady(true));
      } else {
        // Session already present
        setReady(true);
      }
    });
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
