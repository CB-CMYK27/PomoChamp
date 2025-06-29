// ----------------  src/pages/ModeSelect.tsx  ----------------
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';

/* ───── Local PNGs for the icons (replace with yours) ──── */
import GlovesPNG from '/images/boxing-gloves.png';   // 92×92 transparent
import TrophyPNG from '/images/trophy-pixel.png';    // 92×92 transparent

/* ───── Generic "steel plate" wrapper ──── */
const SteelFrame: React.FC<
  React.PropsWithChildren<{ disabled?: boolean; className?: string }>
> = ({ disabled, className = '', children }) => (
  <div
    className={`relative p-6 ${className}`}
    style={{
      background: '#0D0D0F',                // black inner plate
      border: '10px solid #9aa3ad',         // thick steel border
      boxShadow:
        'inset 0 0 4px #000, 0 0 6px rgba(255,255,255,.3)', // bevel
    }}
  >
    {/* 8 rivets (small circles) */}
    {[
      'top-0 left-0',
      'top-0 left-1/2 -translate-x-1/2',
      'top-0 right-0',
      'middle left-0',
      'middle right-0',
      'bottom-0 left-0',
      'bottom-0 left-1/2 -translate-x-1/2',
      'bottom-0 right-0',
    ].map((pos, i) => (
      <span
        key={i}
        className={`absolute ${pos.replace('middle', 'top-1/2 -translate-y-1/2')}
                    w-3 h-3 bg-gray-700 rounded-full
                    shadow-[inset_0_1px_1px_#fff4,0_0_3px_#0009]`}
      />
    ))}

    {/* content */}
    <div className={`${disabled ? 'opacity-60' : ''}`}>{children}</div>
  </div>
);

export default function ModeSelect() {
  const nav = useNavigate();

  return (
    <div className="min-h-screen bg-bezel font-arcade text-white flex flex-col">
      {/* ─────────── Title & Settings ─────────── */}
      <header className="relative">
        <h1
          className="text-primary text-6xl sm:text-7xl text-center pt-12 pb-8"
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

      {/* ─────────── Cards ─────────── */}
      <div className="flex flex-col md:flex-row gap-12 items-center justify-center flex-1 pb-16">

        {/* ---------- QUICK BATTLE ---------- */}
        <SteelFrame className="w-full md:w-[480px] h-[400px]">
          <div className="flex flex-col items-center text-center space-y-6 h-full justify-center">
            <img src={GlovesPNG} alt="Crossed gloves" className="w-24 h-24" />

            <h2 className="text-3xl text-neonYel">QUICK BATTLE</h2>

            <p className="text-base leading-relaxed">
              25 minutes<br />
              No excuses
            </p>

            <button
              onClick={() => nav('/quick-battle')}
              className="bg-gradient-to-r from-orange-600 to-red-600
                         hover:to-red-500 px-10 py-3 text-lg rounded font-bold
                         tracking-wider shadow-[0_0_8px_rgba(255,255,255,.25)]"
            >
              FIGHT!
            </button>
          </div>
        </SteelFrame>

        {/* ---------- TOURNAMENT (disabled) ---------- */}
        <SteelFrame disabled className="w-full md:w-[480px] h-[400px] relative">
          <div className="flex flex-col items-center text-center space-y-6 h-full justify-center">
            <img src={TrophyPNG} alt="Trophy" className="w-24 h-24" />

            <h2 className="text-3xl text-neonYel">TOURNAMENT&nbsp;MODE</h2>

            <p className="text-base leading-relaxed">
              Brain-dump → 4 rounds.<br />
              Organize & conquer.
            </p>

            <div className="px-8 py-3 bg-gray-600 rounded font-bold text-white relative">
              COMING&nbsp;SOON
            </div>
          </div>

          {/* Caution strip overlay positioned over the button */}
          <div
            className="absolute left-0 right-0 bottom-6 h-8 opacity-70 pointer-events-none"
            style={{
              backgroundImage:
                'repeating-linear-gradient(135deg,#FFC300 0 20px,#0D0D0F 20px 40px)',
            }}
          />
        </SteelFrame>
      </div>
    </div>
  );
}