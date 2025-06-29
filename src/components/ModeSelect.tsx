// --------------  src/pages/ModeSelect.tsx  ----------------
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';

/* UTILS ---------------------------------------------------------------- */

const Plate: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="relative rounded-md ring-4 ring-gray-300/50 shadow-xl overflow-hidden">
    {/* rivets */}
    {['top-1 left-1', 'top-1 right-1', 'bottom-1 left-1', 'bottom-1 right-1'].map(
      p => (
        <span key={p} className={`absolute w-2 h-2 bg-gray-200 ${p} rounded-[1px]`} />
      )
    )}
    {/* black inset panel */}
    <div className="bg-bezel/95 p-10 flex flex-col items-center gap-6">
      {children}
    </div>
  </div>
);

const CTA: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="px-12 py-2 bg-gradient-to-r from-warning via-orangeYellow to-danger
               text-bezel font-arcade text-lg rounded hover:scale-105 transition"
  >
    FIGHT!
  </button>
);

/* caution-stripe overlay sprite (semi-transparent) */
const CautionOverlay = () => (
  <img
    src="/images/caution-stripe.png"        /* save your stripe slice here */
    alt=""
    className="absolute inset-0 w-full h-full object-cover opacity-80 pointer-events-none"
  />
);

/* MAIN ------------------------------------------------------------------ */
export default function ModeSelect() {
  const nav = useNavigate();

  return (
    <main className="min-h-screen bg-bezel font-arcade flex flex-col items-center py-12 px-6">
      {/* title + settings */}
      <header className="w-full max-w-7xl flex justify-between items-start mb-14">
        <h1
          className="flex-1 text-center text-6xl md:text-7xl text-primary"
          style={{
            textShadow:
              '-3px 3px #07399D, 3px -3px #FE1C06, 0 0 12px rgba(255,255,255,.4)',
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

      {/* cards */}
      <section className="grid gap-12 max-w-7xl w-full md:grid-cols-2">
        {/* QUICK BATTLE -------------------------------------------------- */}
        <Plate>
          <img
            src="/images/gloves-clash.png" /* your pixel-art gloves PNG */
            alt=""
            className="w-24 h-24"
          />
          <h2 className="text-neonYel text-3xl text-center">QUICK&nbsp;BATTLE</h2>

          <p className="text-white text-center leading-snug">
            1+ tasks totalling&nbsp;25&nbsp;min.&nbsp; Perfect focus sprint.
          </p>

          <CTA onClick={() => nav('/quick-battle')} />
        </Plate>

        {/* TOURNAMENT (locked) ----------------------------------------- */}
        <Plate>
          <div className="relative w-24 h-24">
            <img
              src="/images/trophy-pixel.png" /* generate with prompt below */
              alt=""
              className="w-full h-full opacity-40"
            />
            <CautionOverlay />
          </div>

          <h2 className="text-gray-300 text-2xl text-center">TOURNAMENT&nbsp;MODE</h2>

          <p className="text-gray-300 text-center leading-snug">
            Brain-dump → 4 rounds. Organize &amp; conquer.
          </p>

          <div className="h-10 relative w-full">
            <CautionOverlay />
          </div>
        </Plate>
      </section>
    </main>
  );
}
