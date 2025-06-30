// ----------------  src/pages/ModeSelect.tsx  ----------------
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';

/* ───── Local PNGs for the icons (replace with yours) ──── */
import GlovesPNG from '/images/boxing-gloves.png';   // 92×92 transparent
import TrophyPNG from '/images/trophy-pixel.png';    // 92×92 transparent

/*────────────────────────  NEW – SteelFrame  ───────────────────────*/
const SteelFrame: React.FC<
  React.PropsWithChildren<{ disabled?: boolean; className?: string }>
> = ({ disabled, className = '', children }) => (
  /* LAYER ① – dark outer bezel */
  <div
    className={`relative p-3 bg-[#3b3f4a] ${className}`}
    style={{ boxShadow: '0 0 8px #0008' }}
  >
    {/* LAYER ② – lighter steel plate + rivets */}
    <div className="relative w-full h-full bg-[#9aa3ad]">
      {/* eight rivets on the steel rim */}
      {[
        'top-0 left-0',
        'top-0 left-1/2 -translate-x-1/2',
        'top-0 right-0',
        'top-1/2 -translate-y-1/2 left-0',
        'top-1/2 -translate-y-1/2 right-0',
        'bottom-0 left-0',
        'bottom-0 left-1/2 -translate-x-1/2',
        'bottom-0 right-0',
      ].map((pos, i) => (
        <span
          key={i}
          className={`absolute ${pos} w-4 h-4 bg-[#444b55] rounded-full
                      shadow-[inset_0_1px_2px_#ffffff2b,0_0_3px_#0009]`}
        />
      ))}

      {/* LAYER ③ – black inner card */}
      <div className="m-6 bg-bezel h-full flex flex-col p-6">
        {/* content (opacity if disabled) */}
        <div className={disabled ? 'opacity-50 select-none' : ''}>{children}</div>
      </div>
    </div>
  </div>
);
/*───────────────────────────────────────────────────────────────────*/

export default function ModeSelect() {
  const nav = useNavigate();

  return (
    <div className="min-h-screen bg-bezel font-arcade text-white flex flex-col">
      {/* TITLE */}
      <header className="relative">
        <h1
          className="text-primary text-6xl sm:text-7xl text-center pt-12 pb-10"
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

      {/* CENTRED CARD ROW  */}
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col md:flex-row gap-14 px-8">

          {/* ───────── QUICK BATTLE ───────── */}
          <SteelFrame className="w-full md:w-[480px] max-w-xl h-[430px]">
            <img src={GlovesPNG} alt="" className="w-24 h-24 mx-auto" />

            <h2 className="text-3xl text-neonYel mt-6 mb-3">QUICK BATTLE</h2>

            <p className="text-base leading-relaxed mb-8">
              1 session<br />25 minutes<br />No excuses
            </p>

            <button
              onClick={() => nav('/quick-battle')}
              className="mt-auto bg-gradient-to-r from-orange-600 to-red-600
                         hover:to-red-500 px-10 py-3 text-lg rounded font-bold
                         tracking-wider shadow-[0_0_8px_rgba(255,255,255,.25)]"
            >
              FIGHT!
            </button>
          </SteelFrame>

          {/* ───────── TOURNAMENT ───────── */}
          <SteelFrame disabled className="w-full md:w-[480px] max-w-xl h-[430px] relative">
            <img src={TrophyPNG} alt="" className="w-24 h-24 mx-auto" />

            <h2 className="text-3xl text-neonYel mt-6 mb-3">TOURNAMENT MODE</h2>

            <p className="text-base leading-relaxed mb-8">
              Brain-dump → 4 rounds.<br />Organize & conquer.
            </p>

            <div className="mt-auto px-10 py-3 bg-gray-600 rounded font-bold text-white
                            cursor-not-allowed text-lg tracking-wider">
              COMING&nbsp;SOON
            </div>

            {/* yellow/black caution tape */}
            <div
              className="absolute left-6 right-6 bottom-8 h-8 opacity-70 pointer-events-none"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(135deg,#FFC300 0 20px,#0D0D0F 20px 40px)',
              }}
            />
          </SteelFrame>
        </div>
      </div>
    </div>
  );
}