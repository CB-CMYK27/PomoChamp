import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import fighters from '../data/fighters.json';
import { useGameStore } from '../store/gameStore';

/* ---------- tiny helper for re-using the arcade header ---------- */
const SectionHeader: React.FC<{ label: string; colour: string }> = ({ label, colour }) => (
  <div className="flex items-center gap-3 mb-3">
    <span className={`w-7 h-7 grid place-content-center ${colour} text-bezel`}>3</span>
    <h3 className="text-primary">{label}</h3>
  </div>
);

export default function FighterSelect() {
  const nav = useNavigate();
  const { state } = useLocation();
  const { tasks, breakDuration } = state || { tasks: [], breakDuration: 5 };

  /* state */
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [imgBroken, setImgBroken] = useState(false);
  const setFighter = useGameStore(s => s.setFighter);

  /* hero / villain ids */
  const heroes = [
    'jack-tower','ellen-ryker','raging-stallion',
    'beach-belle','bond-sterling','waves-mcrad'
  ];
  const villains = [
    'prof-kruber','queen-chroma','iron-titan',
    'jawsome','dr-whiskers','gen-buzzkill'
  ];

  const heroRows    = [heroes.slice(0,3), heroes.slice(3)];
  const villainRows = [villains.slice(0,3), villains.slice(3)];

  /* derived */
  const activeId       = hoveredId || selectedId;
  const activeFighter  = fighters.find(f => f.id === activeId) || null;

  /* helpers */
  const handleConfirm  = () => {
    if (!selectedId) return;
    const f = fighters.find(x => x.id === selectedId);
    if (!f) return;
    setFighter(selectedId);
    nav('/fight', { state: { selectedFighter: f, tasks, breakDuration } });
  };

  const renderButton = (f: any) => {
    const isSelected = selectedId === f.id;
    const isHovered  = hoveredId === f.id;
    return (
      <button
        key={f.id}
        onMouseEnter={() => { setHoveredId(f.id); setImgBroken(false); }}
        onMouseLeave={() => setHoveredId(null)}
        onClick={() => setSelectedId(f.id)}
        className={`w-44 h-44 flex items-center justify-center relative
                    ring-2 ring-offset-2 ring-offset-bezel
                    ${isSelected ? 'ring-neonYel'
                     : isHovered ? 'ring-crtBlue'
                     : 'ring-transparent'}
                    bg-bezel hover:bg-bezel/80 transition`}
      >
        <img src={f.portrait} alt={f.name} className="w-full h-full object-contain pointer-events-none" />
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-bezel text-accent font-arcade flex flex-col items-center py-6 px-4">

      {/* neon title */}
      <h1
        className="text-6xl text-primary mb-10"
        style={{ textShadow:'-3px 3px 0 #07399D, 3px -3px 0 #FF3A08, 0 0 12px rgba(255,255,255,.35)' }}
      >
        CHOOSE&nbsp;YOUR&nbsp;FIGHTER
      </h1>

      {/* whole board */}
      <div className="max-w-6xl w-full flex flex-col items-center gap-8">

        {/* row with hero grid • preview • villain grid */}
        <div className="flex gap-10">
          {/* HEROES */}
          <div className="flex flex-col items-center">
            <SectionHeader label="HEROES" colour="bg-primary" />
            <div className="border-4 border-crtBlue p-3 bg-bezel/70">
              {heroRows.map((row, r) => (
                <div key={r} className="grid grid-cols-3 gap-3 mb-3 last:mb-0">
                  {row.map(id => renderButton(fighters.find(f => f.id === id)))}
                </div>
              ))}
            </div>
          </div>

          {/* PREVIEW */}
          <div className="flex flex-col items-center pt-10">
            {activeFighter ? (
              !imgBroken ? (
                <img
                  src={activeFighter.full}
                  onError={() => setImgBroken(true)}
                  alt={activeFighter.name}
                  className="w-48 h-64 object-contain"
                />
              ) : (
                <div className="w-48 h-64 flex items-center justify-center bg-bezel/50 text-slate-500">
                  No Image
                </div>
              )
            ) : (
              <div className="w-48 h-64 flex items-center justify-center border-2 border-dashed border-crtBlue text-xs text-crtBlue/60 text-center">
                Hover over a fighter
              </div>
            )}
          </div>

          {/* VILLAINS */}
          <div className="flex flex-col items-center">
            <SectionHeader label="VILLAINS" colour="bg-danger" />
            <div className="border-4 border-danger p-3 bg-bezel/70">
              {villainRows.map((row, r) => (
                <div key={r} className="grid grid-cols-3 gap-3 mb-3 last:mb-0">
                  {row.map(id => renderButton(fighters.find(f => f.id === id)))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* fighter bio + confirm */}
        {activeFighter && (
          <div className="text-center max-w-2xl mt-6 flex flex-col items-center gap-4">
            <h2 className="text-2xl text-neonYel">{activeFighter.name}</h2>
            <p className="text-base leading-relaxed mx-auto px-2">{activeFighter.quip}</p>
            <div className="text-cyan-400 text-sm font-mono">🏖 Break Duration: {breakDuration} min</div>
            <button
              onClick={handleConfirm}
              disabled={!selectedId}
              className={`px-8 py-4 text-lg font-bold border-4 rounded-sm transition
                ${selectedId
                  ? 'bg-primary text-bezel border-primary hover:bg-transparent hover:text-primary shadow-goldenGlow'
                  : 'border-crtBlue text-crtBlue/40 cursor-not-allowed bg-transparent'}`}
            >
              {selectedId ? `FIGHT AS ${activeFighter.name.toUpperCase()}` : 'SELECT A FIGHTER!'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
