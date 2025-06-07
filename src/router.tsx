import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AttractScreen from './AttractScreen';
import ModeSelect from './ModeSelect';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<AttractScreen onStart={() => (window.location.href = '/mode')} />}
        />
        <Route path="/mode" element={<ModeSelect />} />
      </Routes>
    </BrowserRouter>
  );
}
