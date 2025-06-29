// --------------------  src/pages/ModeSelect.tsx  --------------------
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';

/* ─────────────────────────────── HELPERS ─────────────────────────── */

const Plate: React.FC<{
  locked?: boolean;
  children: React.ReactNode;
}> = ({ locked, children }) => (
  <div
    className={`relative ring-4 ${
      locked ? 'ring-neonRed' : 'ring-crtBlue'
    }`}
    style={{
      /* seamless chrome wall */
      backgroundImage: "url('/images/steel-plate.png')",
      backgroundSize: '32px 32px',
    }}
  >
    {/* corner rivets */}
    {['tl', 'tr', 'bl', 'br'].map(key => (
      <span
        key={key}
        className={`absolute w-3 h-3 bg-gray-200 rounded-[1px] ${
          key === 'tl'
            ? 'top-1 left-1'
            : key === 'tr'
            ? 'top-1 right-1'
            : key === 'bl'
            ? 'bottom-1 left-1'
            : 'bottom-1 right-1'
        }`}
      />
    ))}

    {/* inner black panel */}
    <div className="bg-bezel/97 px-10 py-12 flex flex-col items-center gap-6 relative">
      {children}

      {/* caution mask if locked */}
      {locked && (
        <img
          src="/images/caution-stripe.png"
          alt=""
          className="absolute inset-x-0 bottom-0 h-10 w-full object-cover opacity-90 pointer-events-none"
        />
      )}
    </div>
  </div>
);

const CTA: React.FC<{ onClick: () => void; disabled?: boolean }> = ({
  onClick,
  disabled,
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-12 py-2 font-arcade rounded transition-all text-bezel text-lg
      ${
        disabled
          ? 'bg-gray-600 opacity-50 cursor-not-allowed'
          : 'bg-gradient-to-r from-warning via-orangeYellow to-danger hover:scale-105'
      }`}
  >
    {disabled ? 'COMING SOON' : 'FIGHT!'}
  </button>
);

/* ─────────────────────────────── MAIN ────────────────────────────── */

export default function ModeSelect() {
  const nav = useNavigate();

  return (
    <main className="min-h-screen bg-bezel font-arcade flex flex-col">
      {/* Title + settings -- pushed down a bit for breathing room */}
      <header className="flex items-start justify-between px-6 md:px-12 mt-10 mb-14">
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
          className="shrink-0 bg-crtBlue p-3 rounded-full ring-2 ring-crtBlue/60 hover:ring-accent transition"
        >
          <Settings size={24} className="text-accent" />
        </button>
      </header>

      {/* Card row – centred between title & page bottom */}
      <section className="flex-1 flex items-start justify-center">
        <div className="grid gap-12 md:grid-cols-2">
          {/* ――― QUICK BATTLE ――― */}
          <Plate>
            <img src="/images/gloves-clash.png" alt="" className="w-24 h-24" />

            <h2 className="text-neonYel text-3xl text-center">QUICK BATTLE</h2>

            <p className="text-white text-center leading-snug max-w-[18rem]">
              1 + tasks totalling 25 min.<br />Perfect focus sprint.
            </p>

            <CTA onClick={() => nav('/quick-battle')} />
          </Plate>

          {/* ――― TOURNAMENT (locked) ――― */}
          <Plate locked>
            <img
              src="/images/trophy-pixel.png"
              alt=""
              className="w-24 h-24 opacity-50"
            />

            <h2 className="text-neonYel/50 text-2xl text-center">
              TOURNAMENT MODE
            </h2>

            <p className="text-neonYel/50 text-center leading-snug max-w-[18rem]">
              Brain-dump → 4 rounds.<br />Organize &amp; conquer.
            </p>

            <CTA onClick={() => {}} disabled />
          </Plate>
        </div>
      </section>
    </main>
  );
}
