// ----------------  src/pages/FighterSelect.tsx  -----------------
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import fighters from '../data/fighters.json';
import { useGameStore } from '../store/gameStore';

/* coloured frame around each 3 × 2 grid */
const Frame: React.FC<{ side: 'hero' | 'villain'; children: React.ReactNode }> =
  ({ side, children }) => (
    <div
      className={`border-4 p-3 bg-bezel
        ${side === 'hero' ? 'border-crtBlue' : 'border-neonRed'}`}
    >
      {children}
    </div>
  );

/* yellow section headings – one line, no badge -- */
const SectionHeader: React.FC<{ label: string }> = ({ label }) => (
  <h3 className="text-neonYel text-lg mb-4 tracking-wide">{label}</h3>
);

export default function FighterSelect() {
  /* ------------------------------------------------------------------
     1. routing & game store
  ------------------------------------------------------------------ */
  const navigate         = useNavigate();
  const { state }        = useLocation();
  const { tasks = [] }   = state || {};          // breakDuration removed
  const setFighter       = useGameStore(s => s.setFighter);

  /* ------------------------------------------------------------------
     2. hero / villain lists (order matters)
  ------------------------------------------------------------------ */
  const heroIds = [
    'jack-tower', 'ellen-ryker', 'raging-stallion',
    'beach-belle', 'bond-sterling', 'waves-mcrad',
  ];
  const villainIds = [
    'prof-kruber', 'queen-chroma', 'iron-titan',
    'jawsome', 'dr-whiskers', 'gen-buzzkill',
  ];

  const heroes   = heroIds.map(id => fighters.find(f => f.id === id)!);
  const villains = villainIds.map(id => fighters.find(f => f.id === id)!);

  /* ------------------------------------------------------------------
     3. local UI state
  ------------------------------------------------------------------ */
  const [hoverId,    setHover]  = useState<string | null>(null);
  const [selectedId, setSelect] = useState<string | null>(null);

  const activeId      = hoverId || selectedId;
  const activeFighter = fighters.find(f => f.id === activeId) || null;

  /* ------------------------------------------------------------------
     4. helpers
  ------------------------------------------------------------------ */
  function confirmChoice() {
    if (!selectedId) return;
    setFighter(selectedId);
    navigate('/fight', { state: { selectedFighter: activeFighter, tasks } });
  }

  /* 144-px portrait button – no bounce */
  const Tile: React.FC<{ f: any; ring: string }> = ({ f, ring }) => {
    const sel = selectedId === f.id;
    const hov = hoverId    === f.id;

    return (
      <button
        onMouseEnter={() => setHover(f.id)}
        onMouseLeave={() => setHover(null)}
        onClick={() => setSelect(f.id)}
        className={`w-36 h-36 ring-offset-0 transition
          ${sel ? `${ring} ring-4`
               : hov ? `${ring}/60 ring-4`
               : 'ring-0'}`}
      >
        <img
          src={f.portrait}
          alt={f.name}
          className="w-full h-full object-cover select-none"
        />
      </button>
    );
  };

  /* ------------------------------------------------------------------
     5. render
  ------------------------------------------------------------------ */
  return (
    <div className="min-h-screen bg-bezel text-neonYel font-arcade
                    flex flex-col items-center px-6 py-10">

      {/* title – moved down a bit for breathing room */}
      <h1
        className="text-6xl mb-14 text-primary text-center"
        style={{
          textShadow:
            '-3px 3px #07399D, 3px -3px #FE1C06, 0 0 12px rgba(255,255,255,.4)',
        }}
      >
        CHOOSE&nbsp;YOUR&nbsp;FIGHTER
      </h1>

      {/* HERO GRID | PREVIEW | VILLAIN GRID */}
      <div className="flex gap-12 flex-wrap justify-center items-start">
        {/* ---------- HEROES ---------- */}
        <div className="flex flex-col items-center">
          <SectionHeader label="HEROES" />
          <Frame side="hero">
            <div className="grid grid-cols-3 gap-2">
              {heroes.map(f => (
                <Tile key={f.id} f={f} ring="ring-crtBlue" />
              ))}
            </div>
          </Frame>
        </div>

        {/* ---------- PREVIEW / BIO / CONFIRM ---------- */}
        <div className="flex flex-col items-center **w-[28rem] max-w-full** gap-4 self-center">
          {activeFighter ? (
            <>
              {/* sprite: 192 px wide, auto height; no shifting */}
              <img
                src={activeFighter.full}
                alt={activeFighter.name}
                className="w-48 sm:w-56 md:w-64 h-auto object-contain"
              />

              <h2 className="text-primary text-2xl text-center">
                {activeFighter.name}
              </h2>

              <p className="text-center text-base truncate max-w-[16rem]">
                {activeFighter.quip}
              </p>

              <button
                onClick={confirmChoice}
                disabled={!selectedId}
                className={`px-6 py-3 bg-neonYel text-bezel font-bold rounded
                            transition
                  ${selectedId
                    ? 'hover:bg-neonYel/80 hover:scale-105'
                    : 'opacity-40 cursor-not-allowed'}`}
              >
                {selectedId
                  ? `FIGHT AS ${activeFighter.name.toUpperCase()}!`
                  : 'SELECT A FIGHTER!'}
              </button>
            </>
          ) : (
            <div
              className="w-56 h-[17rem] flex flex-col items-center justify-center
                         border-2 border-dashed border-accent/30"
            >
              <span className="text-accent/60 text-sm text-center">
                Hover&nbsp;over<br />a fighter
              </span>
            </div>
          )}
        </div>

        {/* ---------- VILLAINS ---------- */}
        <div className="flex flex-col items-center">
          <SectionHeader label="VILLAINS" />
          <Frame side="villain">
            <div className="grid grid-cols-3 gap-2">
              {villains.map(f => (
                <Tile key={f.id} f={f} ring="ring-neonRed" />
              ))}
            </div>
          </Frame>
        </div>
      </div>
    </div>
  );
}
