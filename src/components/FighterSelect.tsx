// --------------  src/pages/FighterSelect.tsx  --------------------
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import fighters from '../data/fighters.json';
import { useGameStore } from '../store/gameStore';

/* small helper — blue for heroes, red for villains */
const Frame: React.FC<{ colour: 'hero' | 'villain'; children: React.ReactNode }> =
  ({ colour, children }) => (
    <div
      className={`border-4 ${colour === 'hero' ? 'border-crtBlue' : 'border-neonRed'} 
                  bg-bezel p-3`}
    >
      {children}
    </div>
  );

/* section header, no badge square */
const SectionHeader: React.FC<{ label: string; colour: string }> =
  ({ label, colour }) => (
    <h3 className={`text-lg ${colour} mb-3 font-bold tracking-wide`}>{label}</h3>
  );

export default function FighterSelect() {
  /* ------------------------------------------------------------ */
  /*                 1.  NAV + STATE                              */
  /* ------------------------------------------------------------ */
  const navigate = useNavigate();
  const { state } = useLocation();
  const { tasks = [] } = state || {};        // breakDuration removed

  const setFighter = useGameStore(s => s.setFighter);

  /* ------------------------------------------------------------ */
  /*                 2.  CHARACTER LISTS                          */
  /* ------------------------------------------------------------ */
  const heroIds = [
    'jack-tower', 'ellen-ryker', 'raging-stallion',
    'beach-belle', 'bond-sterling', 'waves-mcrad',
  ];
  const villainIds = [
    'prof-kruber', 'queen-chroma', 'iron-titan',
    'jawsome', 'dr-whiskers', 'gen-buzzkill',
  ];

  const heroes     = heroIds.map(id => fighters.find(f => f.id === id)!);
  const villains   = villainIds.map(id => fighters.find(f => f.id === id)!);

  /* ------------------------------------------------------------ */
  /*                 3.  UI STATE                                 */
  /* ------------------------------------------------------------ */
  const [hoveredId,  setHover]    = useState<string | null>(null);
  const [selectedId, setSelect]   = useState<string | null>(null);

  const activeId      = hoveredId || selectedId;
  const activeFighter = fighters.find(f => f.id === activeId) || null;

  /* ------------------------------------------------------------ */
  /*                 4.  HELPERS                                  */
  /* ------------------------------------------------------------ */
  function handleConfirm() {
    if (!selectedId) return;
    setFighter(selectedId);
    navigate('/fight', { state: { selectedFighter: activeFighter, tasks } });
  }

  /* 144-px square button, no “bounce” */
  const ButtonTile: React.FC<{ f: any; ringColour: string }> =
    ({ f, ringColour }) => {
      const isSel  = selectedId === f.id;
      const isHover = hoveredId === f.id;

      return (
        <button
          onMouseEnter={() => setHover(f.id)}
          onMouseLeave={() => setHover(null)}
          onClick={() => setSelect(f.id)}
          className={`w-36 h-36 flex items-center justify-center 
                      bg-bezel cursor-pointer transition
                      ${isSel   ? `${ringColour} ring-4` :
                        isHover ? `${ringColour}/60 ring-4` : 'ring-0'}
                      ring-offset-0`}
        >
          <img src={f.portrait} alt={f.name} className="w-full h-full object-cover" />
        </button>
      );
    };

  /* ------------------------------------------------------------ */
  /*                 5.  RENDER                                   */
  /* ------------------------------------------------------------ */
  return (
    <div className="min-h-screen bg-bezel text-neonYel font-arcade py-8 px-6 flex flex-col items-center">
      {/* title */}
      <h1<br/> className="text-6xl mt-8 mb-12 text-primary text-center"<br/> style={{ textShadow: '-3px 3px #07399D, 3px -3px #FE1C06, 0 0 12px rgba(255,255,255,.4)' }<br/>><br/> CHOOSE&nbsp;YOUR&nbsp;FIGHTER<br/></h1>

      {/* HERO  GRID  |  PREVIEW  |  VILLAIN GRID */}
      <div className="flex justify-center items-start gap-10 flex-wrap">
        {/* ----- HEROES ----- */}
        <div className="flex flex-col items-center">
          <SectionHeader label="HEROES" colour="text-crtBlue/90" />
          <Frame colour="hero">
            <div className="grid grid-cols-3 gap-2">
              {heroes.map(f => (
                <ButtonTile key={f.id} f={f} ringColour="ring-crtBlue" />
              ))}
            </div>
          </Frame>
        </div>

        {/* ----- PREVIEW + BIO + CONFIRM  ----- */}
        <div className="flex flex-col items-center w-64 gap-4 pt-6">
          {activeFighter ? (
            <>
              <img
                src={activeFighter.full}
                alt={activeFighter.name}
                className="w-48 sm:w-64 h-auto object-contain"
              />
              <h2 className="text-neonYel text-xl text-center">
                {activeFighter.name}
              </h2>
              <p className="text-center text-base leading-snug max-w-[14rem]">
                {activeFighter.quip}
              </p>
              <button
                onClick={handleConfirm}
                disabled={!selectedId}
                className={`px-6 py-3 mt-2 bg-neonYel text-bezel font-bold rounded
                            transition-all ${
                              selectedId
                                ? 'hover:bg-neonYel/80 hover:scale-105'
                                : 'opacity-40 cursor-not-allowed'
                            }`}
              >
                {selectedId ? `FIGHT AS ${activeFighter.name.toUpperCase()}!` : 'SELECT A FIGHTER!'}
              </button>
            </>
          ) : (
            <div className="w-48 h-72 flex items-center justify-center border-2 border-dashed border-accent/40">
              <span className="text-accent/60 text-center text-sm">Hover a fighter</span>
            </div>
          )}
        </div>

        {/* ----- VILLAINS ----- */}
        <div className="flex flex-col items-center">
          <SectionHeader label="VILLAINS" colour="text-neonRed/90" />
          <Frame colour="villain">
            <div className="grid grid-cols-3 gap-2">
              {villains.map(f => (
                <ButtonTile key={f.id} f={f} ringColour="ring-neonRed" />
              ))}
            </div>
          </Frame>
        </div>
      </div>
    </div>
  );
}
