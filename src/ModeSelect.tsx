import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Swords, Trophy, Settings } from 'lucide-react';

/* ----------  Helper Components  ---------- */

const CornerAccent = () => (
  <>
    {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map(
      (pos) => (
        <div key={pos} className={`absolute w-4 h-4 bg-crtBlue ${pos}`} />
      )
    )}
  </>
);

const NeonCTA = ({ label }: { label: string }) => (
  <div className="mt-4 px-8 py-3 bg-neonRed rounded shadow-lg group-hover:bg-red-700 transition-colors">
    <span className="text-white font-arcade text-xl">{label}</span>
  </div>
);

export default function ModeSelect() {
  const navigate = useNavigate();

  const handleQuickBattle = () => {
    // Navigate to Quick Battle instead of showing alert
    navigate('/quick-battle');
  };

  const handleTournament = () => {
    // Disabled - do nothing
    return;
  };

  const handleAudioSettings = () => {
    navigate('/settings/audio');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-7xl">

        {/* ----------  Title  ---------- */}
        <div className="flex items-center justify-between mb-12">
          <h1 
            className="text-primary font-arcade text-5xl md:text-6xl text-center uppercase flex-1"
            style={{
              textShadow: '-3px 3px #07399D, 3px -3px #FE1C06, 0 0 12px rgba(255,255,255,.4)'
            }}
          >
            POMOCHAMP
          </h1>
          
          {/* Settings Button */}
          <button
            onClick={handleAudioSettings}
            className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-lg border-2 border-gray-500 transition-colors"
            title="Audio Settings"
          >
            <Settings size={24} />
          </button>
        </div>

        {/* ----------  Mode Cards  ---------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Quick Battle */}
          <button
            className="group relative rounded-lg p-8 bg-white border-4 border-crtBlue hover:scale-105 hover:shadow-neon transition-transform duration-300"
            onClick={handleQuickBattle}
          >
            <CornerAccent />
            <div className="flex flex-col items-center space-y-6">
              <Swords className="w-20 h-20 text-crtBlue" />
              <h2 className="text-3xl font-arcade text-neonYel text-center">QUICK BATTLE</h2>
              <p className="text-crtBlue text-center font-bold">
                1 + tasks totalling 25 min.<br />Perfect focus sprint.
              </p>
              <NeonCTA label="FIGHT!" />
            </div>
          </button>

          {/* Tournament - Disabled */}
          <button
            className="relative rounded-lg p-8 bg-gray-300 border-4 border-gray-400 cursor-not-allowed opacity-60"
            onClick={handleTournament}
            disabled
          >
            <CornerAccent />
            <div className="flex flex-col items-center space-y-6">
              <Trophy className="w-20 h-20 text-gray-500" />
              <h2 className="text-2xl font-arcade text-gray-600 text-center">TOURNAMENT MODE - COMING SOON</h2>
              <p className="text-gray-500 text-center font-bold">
                Brain-dump tasks → 4 rounds.<br />Organize & conquer.
              </p>
              <div className="mt-4 px-8 py-3 bg-gray-400 rounded shadow-lg">
                <span className="text-gray-600 font-arcade text-xl">COMING SOON</span>
              </div>
            </div>
          </button>

        </div>
      </div>
    </div>
  );
}