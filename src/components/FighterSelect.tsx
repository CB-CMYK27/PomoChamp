import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import fighters from '../data/fighters.json';
import { useGameStore } from '../store/gameStore';

export default function FighterSelect() {
  const navigate = useNavigate();

  /* ----- state ----- */
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [imgBroken, setImgBroken] = useState(false); // for full.png 404s
  const setFighter = useGameStore((s) => s.setFighter);

  /* ----- helpers ----- */
  const activeId = hoveredId || selectedId;
  const activeFighter = fighters.find((f) => f.id === activeId) || null;

  const handleConfirm = () => {
    if (!selectedId) return;
    setFighter(selectedId);
    navigate('/fight'); // TODO: update when FightScreen exists
  };

  /* ----- JSX ----- */
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-neonYel font-arcade p-4">
      {/* page heading */}
      <h1 className="text-3xl mb-4">CHOOSE YOUR FIGHTER</h1>

      {/* portrait grid */}
      <div className="grid grid-cols-5 gap-2 border-4 border-gray-600 p-2 bg-gray-800">
        {fighters.map((f) => (
          <button
            key={f.id}
            onMouseEnter={() => {
              setHoveredId(f.id);
              setImgBroken(false); // reset 404 flag
            }}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => setSelectedId(f.id)}
            className={`w-32 h-32 flex items-center justify-center
              ${selectedId === f.id ? 'ring-4 ring-yellow-400' : ''}
              bg-gray-900 hover:ring-2 hover:ring-blue-400 transition-all`}
          >
            <img
              src={f.portrait}
              alt={f.name}
              className="w-full h-full object-contain"
            />
          </button>
        ))}
      </div>

      {/* fixed-height preview zone so grid never shifts */}
      <div className="mt-6 flex flex-col items-center justify-center min-h-[140px]">
        {activeFighter && (
          <>
            {/* full-body art if it exists */}
            {!imgBroken ? (
              <img
                src={activeFighter.full}
                alt={activeFighter.name}
                className="w-40 h-40 object-contain mb-2"
                onError={() => setImgBroken(true)}
              />
            ) : (
              <div className="w-40 h-40 mb-2" /> /* blank placeholder */
            )}

            {/* fighter name */}
            <p className="text-2xl font-bold text-yellow-400 text-center mb-1">
              {activeFighter.name}
            </p>

            {/* single-line quip */}
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
          ${!selectedId ? 'opacity-30 cursor-not-allowed' : ''}`}
      >
        FIGHT!
      </button>
    </div>
  );
}
