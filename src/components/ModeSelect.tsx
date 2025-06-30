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
    className={`relative p-4 ${className}`}
    style={{
      background: '#4a5568',                // dark grey outer border
      boxShadow:
        'inset 0 0 4px #000, 0 0 6px rgba(255,255,255,.3)', // bevel
    }}
  >
    {/* Inner lighter grey border with rivets */}
    <div 
      className="relative w-full h-full p-3" // Added padding to make light grey visible
      style={{
        background: '#a0aec0',              // lighter grey inner border
        border: '2px solid #4a5568'         // reduced border to show more light grey
      }}
    >
      {/* 8 rivets (small circles) positioned ON the light grey frame */}
      {[
        'top-3 left-3',                              // positioned on light grey frame
        'top-3 left-1/2 -translate-x-1/2',          // top center on frame
        'top-3 right-3',                             // positioned on light grey frame
        'top-1/2 -translate-y-1/2 left-3',          // middle left on frame
        'top-1/2 -translate-y-1/2 right-3',         // middle right on frame
        'bottom-3 left-3',                           // positioned on light grey frame
        'bottom-3 left-1/2 -translate-x-1/2',       // bottom center on frame
        'bottom-3 right-3',                          // positioned on light grey frame
      ].map((pos, i) => (
        <span
          key={i}
          className={`absolute ${pos.replace('middle', 'top-1/2 -translate-y-1/2')}
                      w-3 h-3 bg-gray-700 rounded-full
                      shadow-[inset_0_1px_1px_#fff4,0_0_3px_#0009]`}
        />
      ))}

      {/* Black card content area */}
      <div 
        className="w-full h-full p-6"
        style={{
          background: '#0D0D0F'              // black inner screen
        }}
      >
        {/* content - removed opacity dimming */}
        <div className="h-full">{children}</div>
      </div>
    </div>
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
      <div className="flex flex-col md:flex-row gap-12 items-center justify-center flex-1 pb-16 px-8">

        {/* ---------- QUICK BATTLE ---------- */}
        <SteelFrame className="w-full md:w-[640px] h-[480px]">
          <div className="relative flex flex-col items-center text-center h-full">
            {/* Image container with fixed height - center the image */}
            <div className="h-[200px] flex items-center justify-center">
              <img src={GlovesPNG} alt="Crossed gloves" className="w-40 h-40" />
            </div>

            {/* Title */}
            <h2 className="text-3xl text-neonYel mb-4">QUICK BATTLE</h2>

            {/* Description */}
            <div className="flex-1 flex items-center pb-4">
              <p className="text-base leading-relaxed">
                1&nbsp;session<br />
                25&nbsp;minutes<br />
                No&nbsp;excuses
              </p>
            </div>

            {/* Button container with fixed positioning from bottom */}
            <div className="h-[100px] flex items-start pt-2">
              <button
                onClick={() => nav('/quick-battle')}
                className="bg-gradient-to-r from-orange-600 to-red-600
                           hover:to-red-500 px-10 py-3 text-lg rounded font-bold
                           tracking-wider shadow-[0_0_8px_rgba(255,255,255,.25)]"
              >
                FIGHT!
              </button>
            </div>
          </div>
        </SteelFrame>

        {/* ---------- TOURNAMENT (disabled button but full color) ---------- */}
        <SteelFrame className="w-full md:w-[640px] h-[480px]">
          <div className="relative flex flex-col items-center text-center h-full">
            {/* Image container - add top padding to align with larger gloves */}
            <div className="h-[200px] flex items-center justify-center pt-6">
              <img src={TrophyPNG} alt="Trophy" className="w-28 h-28" />
            </div>

            {/* Title */}
            <h2 className="text-3xl text-neonYel mb-4">TOURNAMENT&nbsp;MODE</h2>

            {/* Description */}
            <div className="flex-1 flex items-center pb-4">
              <p className="text-base leading-relaxed">
                4&nbsp;sessions<br />
                2&nbsp;hours<br />
                No&nbsp;mercy
              </p>
            </div>

            {/* Button container with fixed positioning from bottom */}
            <div className="h-[100px] flex items-start pt-2">
              <div 
                className="px-10 py-3 text-lg rounded font-bold text-black relative cursor-not-allowed overflow-hidden tracking-wider shadow-[0_0_8px_rgba(255,255,255,.25)]"
                style={{
                  backgroundImage: 'repeating-linear-gradient(135deg, #FFC300 0 20px, #000000 20px 40px)',
                }}
              >
                COMING&nbsp;SOON
              </div>
            </div>
          </div>
        </SteelFrame>
      </div>
    </div>
  );
}