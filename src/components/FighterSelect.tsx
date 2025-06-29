// -------------------  src/pages/FighterSelect.tsx  -------------------
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import fighters from '../data/fighters.json';
import { useGameStore } from '../store/gameStore';

/* coloured frame round each 3×2 grid ------------------------------- */
const Frame: React.FC<{ side: 'hero' | 'villain'; children: React.ReactNode }> =
  ({ side, children }) => (
    <div
      className={`border-4 p-3 bg-bezel
        ${side === 'hero' ? 'border-crtBlue' : 'border-neonRed'}`}
    >
      {children}
    </div>
  );

/* simple yellow arcade header ------------------------------------- */
const Header: React.FC<{ text: string }> = ({ text }) => (
  <h3 className="text-neonYel text-lg mb-4 tracking-wider">{text}</h3>
);

export default function FighterSelect() {
  /* -------- routing / global store ------------------------------ */
  const navigate         = useNavigate();
  const { state }        = useLocation();
  const { tasks = [] }   = state || {};        // no breakDuration any more
  const setFighterGlobal = useGameStore(s => s.setFighter);

  /* -------- fighter lists --------------------------------------- */
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

  /* -------- local UI state -------------------------------------- */
  const [hoverId,    setHover]  = useState<string | null>(null);
  const [selectedId, setSelect] = useState<string | null>(null);

  const activeId      = hoverId || selectedId;
  const activeFighter = fighters.find(f => f.id === activeId) || null;

  /* -------- helpers --------------------------------------------- */
  function confirm() {
    if (!selectedId) return;
    setFighterGlobal(selectedId);
    navigate('/fight', { state: { selectedFighter: activeFighter, tasks } });
  }

  /* indiv. portrait button (144 px) ------------------------------ */
  const Tile: React.FC<{ f: any; ring: string }> = ({ f, ring }) => {
    const sel = selectedId === f.id;
    const hov = hoverId    === f.id;

    return (
      <button
        onMouseEnter={() => setHover(f.id)}
        onMouseLeave={() => setHover(null)}
        onClick={() => setSelect(f.id)}
        className={`w-36 h-36 transition
          ${sel ? `${ring} ring-4` : hov ? `${ring}/60 ring-4` : 'ring-0'}`}
      >
        <img src={f.portrait} alt={f.name} className="w-full h-full object-cover" />
      </button>
    );
  };

  /* -------- render ---------------------------------------------- */
  return (
    <div className="min-h-screen bg-bezel text-neonYel font-arcade
                    flex flex-col items-center px-6 py-10">
      {/* title pushed down a little for breathing-room */}
      <h1
        className="text-6xl mb-14 text-primary text-center"
        style={{
          textShadow:
            '-3px 3px #07399D, 3px -3px #FE1C06, 0 0 12px rgba(255,255,255,.4)',
        }}
      >
        CHOOSE&nbsp;YOUR&nbsp;FIGHTER
      </h1>

      {/* hero grid – preview – villain grid */}
      <div className="flex gap-14 flex-wrap justify-center items-start">
        {/* ---------- HEROES ---------- */}
        <div className="flex flex-col items-center">
          <Header text="HEROES" />
          <Frame side="hero">
            <div className="grid grid-cols-3 gap-2">
              {heroes.map(f => (
                <Tile key={f.id} f={f} ring="ring-crtBlue" />
              ))}
            </div>
          </Frame>
        </div>

        {/* ---------- PREVIEW / BIO / CONFIRM ---------- */}
        <div className="flex flex-col items-center w-80 gap-4 pt-6">
          {activeFighter ? (
            <>
              <img
                src={activeFighter.full}
                alt={activeFighter.name}
                className="w-64 h-auto object-contain"
              />

              <h2 className="text-primary text-2xl text-center">
                {activeFighter.name}
              </h2>

              {/* full quip, wraps naturally, italics */}
              <p className="italic text-center text-base leading-snug max-w-[24rem]">
                {activeFighter.quip}
              </p>

              <button
                onClick={confirm}
                disabled={!selectedId}
                className={`px-6 py-3 bg-neonYel text-bezel font-bold rounded
                  transition ${
                    selectedId
                      ? 'hover:bg-neonYel/80 hover:scale-105'
                      : 'opacity-40 cursor-not-allowed'
                  }`}
              >
                {selectedId
                  ? `FIGHT AS ${activeFighter.name.toUpperCase()}!`
                  : 'SELECT A FIGHTER!'}
              </button>
            </>
          ) : (
            <div
              className="w-64 h-[17rem] flex flex-col items-center justify-center
                         border-2 border-dashed border-accent/40"
            >
              <span className="text-accent/60 text-sm text-center">
                Hover&nbsp;over<br />a fighter
              </span>
            </div>
          )}
        </div>

        {/* ---------- VILLAINS ---------- */}
        <div className="flex flex-col items-center">
          <Header text="VILLAINS" />
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
