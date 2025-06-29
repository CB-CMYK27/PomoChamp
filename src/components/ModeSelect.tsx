import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Swords, Trophy, Settings } from 'lucide-react';

/* ••• REUSABLE BITS ••• ---------------------------------------*/

/* 8-pixel corner blocks (blue) */
const CornerAccent = () => (
  <>
    {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map(
      pos => (
        <div key={pos} className={`absolute w-5 h-5 bg-crtBlue ${pos}`} />
      )
    )}
  </>
);

/* Pulsing “CALL-TO-ACTION” bar */
const NeonCTA = ({ label }: { label: string }) => (
  <div className="mt-5 px-9 py-3 rounded shadow-lg relative overflow-hidden">
    {/* moving gradient bar */}
    <span className="absolute inset-0 bg-gradient-to-r
                     from-red-500 via-yellow-400 to-red-500
                     animate-shine pointer-events-none" />
    <span className="relative z-10 text-bezel font-arcade text-xl">{label}</span>
  </div>
);

/* Disabled overlay – golden chains */
const LockedOverlay = () => (
  <div className="absolute inset-0 bg-bezel/70 flex flex-col items-center justify-center z-20">
    {/* chains (simple Unicode chain-link chars; swap for sprite if you have one) */}
    <div className="text-5xl text-warning drop-shadow-[0_0_4px_#FFC300]">
      ⛓️⛓️⛓️
    </div>
    <p className="mt-2 text-warning font-arcade text-lg">Coming Soon</p>
  </div>
);

/* ••• PAGE ••• -------------------------------------------------*/
export default function ModeSelect() {
  const navigate = useNavigate();

  /* click handlers */
  const handleQuickBattle  = () => navigate('/quick-battle');
  const handleAudioSettings = () => navigate('/settings/audio');

  return (
    <div
      className="min-h-screen bg-bezel text-neonYel font-arcade
                 flex flex-col items-center px-6 pt-16  /* give top air */
                 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.07)_0%,transparent_70%)]">
      {/* ——— TITLE ——— */}
      <h1
        className="text-6xl md:text-7xl mb-14 text-primary text-center"
        style={{
          textShadow:
            '-3px 3px #07399D, 3px -3px #FE1C06, 0 0 12px rgba(255,255,255,.4)',
        }}
      >
        CHOOSE&nbsp;YOUR&nbsp;BATTLE
      </h1>

      {/* Settings “knob” (top-right) */}
      <button
        onClick={handleAudioSettings}
        title="Audio Settings"
        className="absolute top-6 right-6 bg-bezel w-14 h-14 rounded-full
                   border-4 border-crtBlue flex items-center justify-center
                   text-neonYel hover:bg-crtBlue/40 hover:rotate-12 transition"
      >
        <Settings size={26} strokeWidth={3} />
      </button>

      {/* ——— CARTRIDGES ——— */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl w-full">

        {/* QUICK BATTLE */}
        <button
          onClick={handleQuickBattle}
          className="group relative rounded-lg p-8 bg-bezel/90
                     border-4 border-crtBlue shadow-[0_0_0_4px_#000_inset]
                     hover:scale-105 hover:shadow-blueGlow
                     transition-transform duration-300"
        >
          <CornerAccent />

          <div className="flex flex-col items-center gap-6">
            <Swords
              className="w-14 h-14 text-neonYel [image-rendering:pixelated]"
            />

            <h2 className="text-3xl font-arcade text-neonYel">QUICK BATTLE</h2>

            <p className="text-crtBlue font-bold leading-tight text-center">
              1 + tasks totalling 25 min<br />
              Perfect focus sprint
            </p>

            <NeonCTA label="FIGHT!" />
          </div>
        </button>

        {/* TOURNAMENT — LOCKED */}
        <div className="relative group rounded-lg p-8 bg-bezel/70
                        border-4 border-neonRed shadow-[0_0_0_4px_#000_inset]
                        cursor-not-allowed select-none">
          <CornerAccent />

          <div className="flex flex-col items-center gap-6 opacity-40">
            <Trophy
              className="w-14 h-14 text-neonRed [image-rendering:pixelated]"
            />

            <h2 className="text-2xl font-arcade text-neonRed text-center">
              TOURNAMENT MODE
            </h2>

            <p className="text-neonRed font-bold leading-tight text-center">
              Brain-dump tasks → 4 rounds<br />
              Organize & conquer
            </p>

            <NeonCTA label="COMING SOON" />
          </div>

          {/* golden chain overlay */}
          <LockedOverlay />
        </div>
      </div>

      {/* optional scanline overlay */}
      <img
        src="/assets/scanline.png"
        className="pointer-events-none fixed inset-0 opacity-10
                   mix-blend-soft-light w-full h-full object-cover"
        alt=""
      />
    </div>
  );
}
