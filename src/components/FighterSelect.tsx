import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import fighters from '../data/fighters.json';
import { useGameStore } from '../store/gameStore';

export default function FighterSelect() {
  const navigate = useNavigate();

  /* state */
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [imgBroken, setImgBroken] = useState(false);

  const setFighter = useGameStore((s) => s.setFighter);

  // Character order array - 2x5 grid layout
  const characterOrder = [
    // Top row (5 characters)
    'jack-tower',
    'ellen-ryker',
    'raging-stallion', 
    'beach-belle',
    'bond-sterling',
    
    // Bottom row (5 characters)
    'prof-kruber',
    'queen-chroma',
    'iron-titan',
    'jawsome',
    'dr-whiskers'
  ];

  // Split into top and bottom rows
  const topRow = characterOrder.slice(0, 5);
  const bottomRow = characterOrder.slice(5, 10);

  // Get fighter data for each row, filtering out any missing fighters
  const topFighters = topRow
    .map(id => fighters.find(f => f.id === id))
    .filter(f => f !== undefined);

  const bottomFighters = bottomRow
    .map(id => fighters.find(f => f.id === id))
    .filter(f => f !== undefined);

  const activeId = hoveredId || selectedId;
  const activeFighter = fighters.find((f) => f.id === activeId) || null;

  const handleConfirm = () => {
    if (!selectedId) return;
    setFighter(selectedId);
    navigate('/fight');
  };

  const handleCharacterClick = (characterId: string) => {
    setSelectedId(characterId);
  };

  const handleCharacterHover = (characterId: string) => {
    setHoveredId(characterId);
    setImgBroken(false);
  };

  const renderCharacterButton = (fighter: any) => {
    const isSelected = selectedId === fighter.id;
    const isHovered = hoveredId === fighter.id;

    return (
      <button
        key={fighter.id}
        onMouseEnter={() => handleCharacterHover(fighter.id)}
        onMouseLeave={() => setHoveredId(null)}
        onClick={() => handleCharacterClick(fighter.id)}
        className={`w-32 h-32 flex items-center justify-center
                    ring-2 ring-offset-2 ring-offset-gray-800
                    ${isSelected
                      ? 'ring-yellow-400'
                      : isHovered
                      ? 'ring-blue-400' 
                      : 'ring-transparent'}
                    bg-gray-900 hover:bg-gray-800 cursor-pointer
                    transition-all duration-200`}
      >
        <img
          src={fighter.portrait}
          alt={fighter.name}
          className="w-full h-full object-contain"
        />
      </button>
    );
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-black text-neonYel font-arcade p-4">
      {/* Heading */}
      <h1 className="text-3xl mb-8">CHOOSE&nbsp;YOUR&nbsp;FIGHTER</h1>

      {/* Main Content: Grid Left, Preview Right */}
      <div className="flex flex-row gap-12 items-start max-w-7xl w-full justify-center">
        
        {/* Left Side: Character Grid */}
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-5 gap-3 border-4 border-yellow-400 p-6 bg-gray-800">
            {topFighters.map(renderCharacterButton)}
          </div>
          
          <div className="grid grid-cols-5 gap-3 border-4 border-yellow-400 p-6 bg-gray-800">
            {bottomFighters.map(renderCharacterButton)}
          </div>
        </div>

        {/* Right Side: Character Preview */}
        <div className="flex flex-col items-center justify-start min-w-[350px] mt-8">
          {activeFighter ? (
            <>
              {!imgBroken ? (
                <img
                  src={activeFighter.full}
                  alt={activeFighter.name}
                  className="w-56 h-56 object-contain mb-6"
                  onError={() => setImgBroken(true)}
                />
              ) : (
                <div className="w-56 h-56 mb-6 flex items-center justify-center bg-gray-700 rounded">
                  <span className="text-gray-400">No Image</span>
                </div>
              )}

              <h2 className="text-3xl font-bold text-yellow-400 text-center mb-4">
                {activeFighter.name}
              </h2>

              <p className="text-xl text-center mb-6 px-4 leading-relaxed">
                {activeFighter.quip}
              </p>

              {/* Single Confirm Button */}
              <button
                disabled={!selectedId}
                onClick={handleConfirm}
                className={`px-8 py-4 bg-yellow-500 text-black font-bold rounded-lg text-xl transition-all
                            ${!selectedId ? 'opacity-50 cursor-not-allowed' : 'hover:bg-yellow-400 hover:scale-105'}`}
              >
                {selectedId ? `FIGHT AS ${activeFighter.name.toUpperCase()}!` : 'SELECT A FIGHTER!'}
              </button>
            </>
          ) : (
            <div className="text-center text-gray-400 mt-16">
              <div className="text-6xl mb-4">👆</div>
              <p className="text-xl mb-2">Choose Your Champion</p>
              <p className="text-lg">Hover to preview • Click to select</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}