import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Swords, Trophy } from 'lucide-react';

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
    // For now, we'll just show an alert since Quick Battle isn't implemented yet
    alert('Quick Battle coming soon! Try Tournament mode for now.');
  };

  const handleTournament = () => {
    navigate('/brain-dump');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-7xl">

        {/* ----------  Title  ---------- */}
        <h1 className="text-neonYel font-arcade text-5xl md:text-6xl mb-12 text-center uppercase">
          POMOCHAMP
        </h1>

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

          {/* Tournament */}
          <button
            className="group relative rounded-lg p-8 bg-white border-4 border-crtBlue hover:scale-105 hover:shadow-neon transition-transform duration-300"
            onClick={handleTournament}
          >
            <CornerAccent />
            <div className="flex flex-col items-center space-y-6">
              <Trophy className="w-20 h-20 text-crtBlue" />
              <h2 className="text-3xl font-arcade text-neonYel text-center">TOURNAMENT</h2>
              <p className="text-crtBlue text-center font-bold">
                Brain-dump tasks → 4 rounds.<br />Organize &amp; conquer.
              </p>
              <NeonCTA label="ENTER" />
            </div>
          </button>
        </div>

        {/* Footer */}
        <p className="text-center mt-8 text-white font-arcade">SELECT YOUR MODE</p>
      </div>
    </div>
  );
}