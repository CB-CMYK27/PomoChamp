import React from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';          // keep global styles

import App from './App';       // your main app component
import GuestGate from './GuestGate';  // ⬅️ the file you just created

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/*  All screens are rendered only after an anonymous Supabase session is ready */}
    <GuestGate>
      <App />
    </GuestGate>
  </React.StrictMode>
);
