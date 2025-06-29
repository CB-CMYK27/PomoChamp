// ----------------  src/pages/ModeSelect.tsx  ----------------
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';

/* ————————————————————————————————————————————————————————
   1. Decorative helpers
   ———————————————————————————————————————————————————————— */

/** steel plate + four “rivets” (8×8 pixel squares) */
const ChromePlate: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    className="relative bg-gradient-to-br from-gray-400 via-gray-500 to-gray-700
               border border-gray-200/40 rounded-md shadow-inner overflow-hidden
               ring-2 ring-gray-50/5 hover:ring-neonYel transition"
  >
    {/* rivets */}
    {['top-1 left-1', 'top-1 right-1', 'bottom-1 left-1', 'bottom-1 right-1'].map(
      pos => (
        <div
          key={pos}
          className={`absolute w-2 h-2 bg-gray-200/80 ${pos} rounded-[1px]`}
        />
      )
    )}
    <div className="p-10 flex flex-col items-center gap-6">{children}</div>
  </div>
);

/** yellow → red arcade gradient button  */
const CTA: React.FC<{ label: string }> = ({ label }) => (
  <button
    className="px-10 py-2 font-arcade text-lg rounded
               bg-gradient-to-r from-warning via-orangeYellow to-danger
               text-bezel hover:scale-105 transition"
  >
    {label}
  </button>
);

/* ————————————————————————————————————————————————————————
   2. Page
   ———————————————————————————————————————————————————————— */
export default function ModeSelect() {
  const nav = useNavigate();

  return (
    <main className="min-h-screen bg-bezel font-arcade flex flex-col items-center py-12 px-6">
      {/* title + settings */}
      <header className="flex w-full max-w-7xl justify-between items-start mb-14">
        <h1
          className="text-primary text-6xl md:text-7xl text-center flex-1"
          style={{
            textShadow:
              '-3px 3px #07399D, 3px -3px #FE1C06,0 0 12px rgba(255,255,255,.4)',
          }}
        >
          CHOOSE&nbsp;YOUR&nbsp;BATTLE
        </h1>

        <button
          onClick={() => nav('/settings/audio')}
          title="Audio Settings"
          className="bg-crtBlue p-3 rounded-full ring-2 ring-crtBlue/60 hover:ring-accent transition"
        >
          <Settings size={24} className="text-accent" />
        </button>
      </header>

      {/* mode cards */}
      <section
        className="grid gap-10 w-full max-w-7xl
                   md:grid-cols-2
                   [&>*]:flex-1"   /* force equal width */
      >
        {/* ▼ QUICK BATTLE ———————————————————————————————— */}
        <ChromePlate>
          {/* icon */}
          <img
            src="/images/gloves-clash.png"
            alt=""
            className="w-24 h-24 select-none pointer-events-none"
          />

          <h2 className="text-neonYel text-3xl text-center">QUICK&nbsp;BATTLE</h2>

          {/* description in white now */}
          <p className="text-white text-center leading-snug">
            1+ tasks totalling&nbsp;25&nbsp;min. <br />
            Perfect focus sprint.
          </p>

          <CTA label="FIGHT!" onClick={() => nav('/quick-battle')} />
        </ChromePlate>

        {/* ▼ TOURNAMENT MODE (locked) ——————————— */}
        <ChromePlate>
          <img
            src="/images/trophy-outline.png"
            alt=""
            className="w-24 h-24 opacity-50"
          />

          <h2 className="text-gray-400 text-2xl text-center">TOURNAMENT MODE</h2>

          <p className="text-gray-400 text-center leading-snug">
            Brain-dump → 4 rounds. <br /> Organize &amp; conquer.
          </p>

          {/* padlock overlay */}
          <div className="absolute inset-0 bg-black/60 grid place-content-center">
            {/* simple chain effect - four links */}
            <div className="flex gap-0.5 scale-105">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className="w-4 h-6 border-2 border-goldenYellow rounded-sm"
                  style={{
                    transform: idx % 2 ? 'rotate(15deg)' : 'rotate(-15deg)',
                  }}
                />
              ))}
            </div>
            <span className="text-goldenYellow mt-2 font-arcade text-xl">
              Coming&nbsp;Soon
            </span>
          </div>
        </ChromePlate>
      </section>
    </main>
  );
}
