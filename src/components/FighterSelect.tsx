import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import fighters from '../data/fighters.json';
import { useGameStore } from '../store/gameStore';

export default function FighterSelect() {
  const navigate = useNavigate();

  // hover + selection tracking
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // 404-image flag
  const [imgError, setImgError] = useState(false);

  // reset broken-image flag each time we change hover / selection
  useEffect(() => setImgError(false), [hoveredId, selectedId]);

  const setFighter = useGameStore((s) => s.setFighter);

  const handleConfirm = () => {
    if (!selectedId) return;
    setFighter(selectedId);
    navigate('/fight'); // TODO: change to real fight route
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-neonYel font-arcade p-4">
      <h1 className="text-3xl mb-4">CHOOSE YOUR FIGHTER</h1>

      {/* Portrait grid */}
      <div className="grid grid-cols-5 gap-2 border-4 border-gray-600 p-2 bg-gray-800">
        {fighters.map((f) => (
          <button
            key={f.id}
            onMouseEnter={() => setHoveredId(f.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => setSelectedId(f.id)}
            className={`w-32 h-32 flex items-center justify-center
              ${selectedId === f.id ? 'ring-4 ring-yellow-400' : ''}
              bg-gray-900 hover:ring-2 hover:ring-blue-400 transition-all`}
          >
            <img src={f.portrait} alt={f.name} className="w-full h-full object-contain" />
          </button>
        ))}
      </div>

      {/* Preview area: full-body art (if present), fighter name, quip */}
      {(hoveredId || selectedId) && (
        <div className="mt-6 flex flex-col items-center justify-center">
          {(() => {
            const fighter = fighters.find((f) => f.id === (hoveredId || selectedId));
            if (!fighter) return null;

            return (
              <>
                {/* full.png or blank placeholder so layout never jumps */}
                {!imgError ? (
                  <img
                    src={fighter.full}
                    alt={fighter.name}
                    className="w-48 h-48 object-contain mb-2"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <>
                    {/* blank placeholder */}
                    <div className="w-48 h-48 mb-2" />
                  </>
                )}

                {/* Fighter name */}
                <p className="text-2xl font-bold text-yellow-400 text-center mb-1">
                  {fighter.name}
                </p>

                {/* One-line quip */}
                <p className="text-xl text-center whitespace-nowrap">
                  {fighter.quip}
                </p>
              </>
            );
          })()}
        </div>
      )}

      {/* Confirm button */}
      <button
        className={`mt-8 px-6 py-3 bg-yellow-500 text-black font-bold rounded
          ${!selectedId ? 'opacity-30 cursor-not-allowed' : ''}`}
        disabled={!selectedId}
        onClick={handleConfirm}
      >
        FIGHT!
      </button>
    </div>
  );
}
