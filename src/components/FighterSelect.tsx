import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import fighters from '../data/fighters.json';
import { useGameStore } from '../store/gameStore';

export default function FighterSelect() {
  const navigate = useNavigate();

  /* state */
  const [hoveredId, setHoveredId]   = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [imgBroken, setImgBroken]   = useState(false);

  const setFighter = useGameStore((s) => s.setFighter);

  const activeId       = hoveredId || selectedId;
  const activeFighter  = fighters.find((f) => f.id === activeId) || null;

  const handleConfirm = () => {
    if (!selectedId) return;
    setFighter(selectedId);
    navigate('/fight');              // TODO: update when FightScreen exists
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-black text-neonYel font-arcade p-4">
      {/* heading is OUTSIDE the grid so it never overlaps */}
      <h1 className="text-3xl mb-6">CHOOSE&nbsp;YOUR&nbsp;FIGHTER</h1>

      {/* portrait grid */}
      <div className="grid grid-cols-5 gap-2 border-4 border-gray-600 p-2 bg-gray-800">
        {fighters.map((f) => (
          <button
            key={f.id}
            onMouseEnter={() => {
              setHoveredId(f.id);
              setImgBroken(false);   // reset 404 flag
            }}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => setSelectedId(f.id)}
            /* ——————————————————————————————————————————————
               CONSTANT SIZE:
                 • ring-2 always
                 • ring-offset-2 always
                 • only colour changes
               —————————————————————————————————————————————— */
            className={`w-32 h-32 flex items-center justify-center
                        ring-2 ring-offset-2 ring-offset-gray-800
                        ${selectedId === f.id
                          ? 'ring-yellow-400'
                          : 'ring-transparent hover:ring-blue-400'}
                        bg-gray-900 transition-none`}
          >
            <img
              src={f.portrait}
              alt={f.name}
              className="w-full h-full object-contain"
            />
          </button>
        ))}
      </div>

      {/* fixed preview zone (min-height stops any push / pull) */}
      <div className="mt-8 flex flex-col items-center min-h-[160px]">
        {activeFighter && (
          <>
            {!imgBroken ? (
              <img
                src={activeFighter.full}
                alt={activeFighter.name}
                className="w-40 h-40 object-contain mb-2"
                onError={() => setImgBroken(true)}
              />
            ) : (
              <div className="w-40 h-40 mb-2" />
            )}

            <p className="text-2xl font-bold text-yellow-400 text-center mb-1">
              {activeFighter.name}
            </p>

            <p className="text-xl text-center whitespace-nowrap">
              {activeFighter.quip}
            </p>
          </>
        )}
      </div>

      {/* confirm button */}
      <button
        disabled={!selectedId}
        onClick={handleConfirm}
        className={`mt-8 px-6 py-3 bg-yellow-500 text-black font-bold rounded
                    ${!selectedId && 'opacity-30 cursor-not-allowed'}`}
      >
        FIGHT!
      </button>
    </div>
  );
}
