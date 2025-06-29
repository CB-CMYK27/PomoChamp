// ----------------  src/pages/ModeSelect.tsx  ----------------
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';
import HeavySteelFrame from '../components/HeavySteelFrame';   // ← new file you added

/* quick battle icon (two gloves) & trophy pngs you generated earlier */
import GlovesIcon  from '/images/boxing-gloves.png';  // 92 × 92px transparent
import TrophyIcon  from '/images/trophy-pixel.png';   // 92 × 92px transparent
import CautionBar  from '/images/caution-bar.png';    // 460 × 32px, yellow/black stripe

export default function ModeSelect() {
  const nav = useNavigate();

  return (
    <div className="min-h-screen bg-bezel font-arcade text-white flex flex-col">
      {/* ─────────── Title & Cog ─────────── */}
      <header className="relative">
        <h1
          className="text-primary text-6xl sm:text-7xl text-center pt-10 pb-8"
          style={{
            textShadow:
              '-3px 3px #07399D, 3px -3px #FE1C06, 0 0 12px rgba(255,255,255,.4)',
          }}
        >
          CHOOSE&nbsp;YOUR&nbsp;BATTLE
        </h1>

        <button
          onClick={() => nav('/settings/audio')}
          className="absolute top-8 right-8 w-10 h-10 flex items-center
                     justify-center bg-crtBlue rounded-full hover:bg-crtBlue/80"
        >
          <Settings size={22} />
        </button>
      </header>

      {/* ─────────── Cards row ─────────── */}
      <div className="flex flex-col md:flex-row gap-10 justify-center items-center flex-1 pb-16">

        {/* ---------- QUICK BATTLE ---------- */}
        <HeavySteelFrame className="w-full md:w-[460px]">
          <img src={GlovesIcon} alt="crossed gloves" className="w-20 h-20 mb-4" />

          <h2 className="text-3xl text-neonYel mb-3">QUICK BATTLE</h2>

          <p className="text-base text-white leading-relaxed mb-6">
            1 + tasks totalling&nbsp;25&nbsp;min.<br />
            Perfect focus sprint.
          </p>

          <button
            onClick={() => nav('/quick-battle')}
            className="bg-gradient-to-r from-orange-600 to-red-600 hover:to-red-500
                       px-8 py-3 text-lg rounded font-bold tracking-wider"
          >
            FIGHT!
          </button>
        </HeavySteelFrame>

        {/* ---------- TOURNAMENT (disabled) ---------- */}
        <HeavySteelFrame className="w-full md:w-[460px] opacity-60 cursor-not-allowed relative">
          <img src={TrophyIcon} alt="trophy" className="w-20 h-20 mb-4" />

          <h2 className="text-3xl text-neonYel mb-3">TOURNAMENT&nbsp;MODE</h2>

          <p className="text-base text-white leading-relaxed mb-10">
            Brain-dump → 4 rounds.<br />
            Organize &amp; conquer.
          </p>

          {/* caution stripe overlay */}
          <img
            src={CautionBar}
            alt="Coming soon"
            className="absolute left-1/2 -translate-x-1/2 bottom-24
                       pointer-events-none opacity-90"
          />

          <div className="px-8 py-3 bg-gray-600 rounded text-black font-bold">
            COMING&nbsp;SOON
          </div>
        </HeavySteelFrame>
      </div>
    </div>
  );
}

