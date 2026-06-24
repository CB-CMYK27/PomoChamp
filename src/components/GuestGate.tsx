import React, { useEffect, useState } from 'react';
import { supabase, createOrFetchUserProfile } from '../services/supabase';
import { signInAsGuest } from '../guestAuth';

/**
 * Wrap your entire app with <GuestGate> in main.tsx.
 * It silently signs the visitor in as an anonymous Supabase user,
 * then renders the children once the session exists.
 */
export default function GuestGate({ children }: { children: JSX.Element }) {
  const [ready, setReady] = useState(false);
  const [connectionError, setConnectionError] = useState(false);

  useEffect(() => {
    async function initializeUser() {
      try {
        // Set a timeout to detect if Supabase is unreachable
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Connection timeout')), 5000);
        });

        // Check if we already have a session stored in localStorage
        const sessionPromise = supabase.auth.getSession();

        const { data } = await Promise.race([sessionPromise, timeoutPromise]) as any;

        if (!data.session) {
          // No session yet – sign in anonymously
          try {
            await Promise.race([
              signInAsGuest(),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Sign-in timeout')), 5000))
            ]);
          } catch (signInError) {
            console.warn('Could not sign in as guest, continuing in offline mode:', signInError);
            setConnectionError(true);
            setReady(true);
            return;
          }
        }

        // Ensure user profile exists in the database
        try {
          await createOrFetchUserProfile();
        } catch (profileError) {
          console.warn('Could not create/fetch user profile, continuing in offline mode:', profileError);
          setConnectionError(true);
        }

        setReady(true);
      } catch (error) {
        console.warn('Supabase connection failed, running in offline mode:', error);
        setConnectionError(true);
        setReady(true);
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

  // Show offline notification if there's a connection error
  if (connectionError) {
    console.log('⚠️ Running in offline mode - some features may be limited');
  }

  // Session is ready — render the real app
  return children;
}