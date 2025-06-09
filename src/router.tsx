import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AttractScreen from './AttractScreen';
import ModeSelect from './ModeSelect';
import BrainDump from './components/BrainDump';
import QuickBattle from './components/QuickBattle';
import FighterSelect from './components/FighterSelect';
import FightScreen from './components/FightScreen';  // ADD THIS

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<AttractScreen onStart={() => (window.location.href = '/mode')} />}
        />
        <Route path="/mode" element={<ModeSelect />} />
        <Route path="/brain-dump" element={<BrainDump />} />
        <Route path="/quick-battle" element={<QuickBattle />} />
        <Route path="/fighter-select" element={<FighterSelect />} />
        <Route path="/fight" element={<FightScreen />} />  {/* ADD THIS LINE */}
      </Routes>
    </BrowserRouter>
  );
}