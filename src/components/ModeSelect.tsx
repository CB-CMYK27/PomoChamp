//  src/pages/ModeSelect.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Settings } from 'lucide-react';

/* ――― Re-usable bits ――― */

/* 8-pixel corner squares in CRT blue */
const CornerAccent = () => (
  <>
    {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map(
      pos => (
        <div key={pos} className={`absolute w-5 h-5 bg-crtBlue ${pos}`} />
      )
    )}
  </>
);

/* Pulsing CTA bar */
const NeonCTA = ({ label }: { label: string }) => (
  <div className="mt-6 px-9 py-3 rounded shadow-lg relative overflow-hidden">
    {/* animated gradient sweep */}
    <span className="absolute inset-0 bg-gradient-to-r from-red-500 via-yellow-400 to-red-500 animate-shine pointer-events-none" />
    <span className="relative z-10 text-bezel font-arcade text-xl">{label}</span>
  </div>
);

/* Golden-chain lock */
const LockedOverlay = () => (
  <div className="absolute inset-0 bg-bezel/80 flex flex-col items-center justify-center z-20">
    <div className="text-5xl text-warning drop-shadow-[0_0_4px_#FFC300]">⛓️⛓️⛓️</div>
    <p className="mt-2 font-arcade text-warning text-lg">Coming&nbsp;Soon</p>
  </div>
);

export default function ModeSelect() {
  const nav = useNavigate();

  return (
    <div
      className="min-h-screen bg-bezel text-neonYel font-arcade flex flex-col
                 items-center px-6 pt-16 pb-24
                 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06)_0%,transparent_70%)]"
    >
      {/* Settings button (top-right) */}
      <button
        onClick={() => nav('/settings/audio')}
        title="Audio Settings"
        className="fixed top-5 right-6 bg-bezel w-14 h-14 rounded-full border-4 border-crtBlue
                   flex items-center justify-center text-neonYel
                   hover:bg-crtBlue/40 hover:rotate-12 transition"
      >
        <Settings size={28} strokeWidth={3} />
      </button>

      {/* Title */}
      <h1
        className="text-primary text-6xl md:text-7xl mb-16 text-center"
        style={{
          textShadow:
            '-3px 3px #07399D, 3px -3px #FE1C06, 0 0 12px rgba(255,255,255,.4)',
        }}
      >
        CHOOSE&nbsp;YOUR&nbsp;BATTLE
      </h1>

      {/* Cartridges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        {/* ─── QUICK BATTLE ───────────────────────────────────────── */}
        <button
          onClick={() => nav('/quick-battle')}
          className="group relative rounded-lg p-10 bg-bezel/90 border-4 border-crtBlue
                     shadow-[0_0_0_4px_#000_inset] hover:scale-105 hover:shadow-blueGlow
                     transition-transform duration-300 w-[22rem] md:w-[24rem]"
        >
          <CornerAccent />

          <div className="flex flex-col items-center gap-6">
            {/* boxing-glove icon (pixel art) */}
            <img
              src="/images/gloves.png"
              alt="Boxing gloves"
              className="w-20 h-20 object-contain [image-rendering:pixelated]"
            />

            <h2 className="text-3xl text-neonYel">QUICK&nbsp;BATTLE</h2>

            <p className="text-crtBlue font-bold leading-tight text-center">
              1 + tasks totalling 25 min<br />Perfect focus sprint
            </p>

            <NeonCTA label="FIGHT!" />
          </div>
        </button>

        {/* ─── TOURNAMENT (locked) ────────────────────────────────── */}
        <div
          className="relative rounded-lg p-10 bg-bezel/70 border-4 border-neonRed
                     shadow-[0_0_0_4px_#000_inset] w-[22rem] md:w-[24rem]
                     cursor-not-allowed select-none"
        >
          <CornerAccent />

          <div className="flex flex-col items-center gap-6 opacity-40">
            <Trophy
              className="w-20 h-20 text-neonRed [image-rendering:pixelated]"
            />

            <h2 className="text-2xl text-neonRed text-center">
              TOURNAMENT&nbsp;MODE
            </h2>

            <p className="text-neonRed font-bold leading-tight text-center">
              Brain-dump tasks → 4 rounds<br />Organize & conquer
            </p>

            <NeonCTA label="COMING SOON" />
          </div>

          {/* lock */}
          <LockedOverlay />
        </div>
      </div>

      {/* faint scan-lines overlay */}
      <img
        src="/assets/scanline.png"
        className="pointer-events-none fixed inset-0 opacity-10 mix-blend-soft-light
                   w-full h-full object-cover"
        alt=""
      />
    </div>
  );
}
