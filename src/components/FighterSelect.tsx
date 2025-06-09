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

  // Character order array - Heroes top row, Villains bottom row
  const characterOrder = [
  // Heroes (top row)
  'jack-tower',
  'ellen-ryker',
  'raging-stallion', 
  'beach-belle',
  'bond-sterling',
  
  // Villains (bottom row)
  'prof-kruber',
  'queen-chroma',
  'iron-titan',
  'jawsome',
  'dr-whiskers'
];

  // Inactive characters (will be grayed out)
  const inactiveCharacters = ['waves-mcrad', 'gen-buzzkill'];

  // Split into heroes and villains
  const heroIds = characterOrder.slice(0, 5);
const villainIds = characterOrder.slice(5, 10);

  // Get fighter data for each group, filtering out any missing fighters
  const heroes = heroIds
    .map(id => fighters.find(f => f.id === id))
    .filter(f => f !== undefined);

  const villains = villainIds
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
    // Don't allow selection of inactive characters
    if (inactiveCharacters.includes(characterId)) return;
    setSelectedId(characterId);
  };

  const handleCharacterHover = (characterId: string) => {
    setHoveredId(characterId);
    setImgBroken(false);
  };

  const renderCharacterButton = (fighter: any) => {
    const isInactive = inactiveCharacters.includes(fighter.id);
    const isSelected = selectedId === fighter.id;
    const isHovered = hoveredId === fighter.id;

    return (
      <button
        key={fighter.id}
        onMouseEnter={() => handleCharacterHover(fighter.id)}
        onMouseLeave={() => setHoveredId(null)}
        onClick={() => handleCharacterClick(fighter.id)}
        disabled={isInactive}
        className={`w-32 h-32 flex items-center justify-center
                    ring-2 ring-offset-2 ring-offset-gray-800
                    ${isSelected && !isInactive
                      ? 'ring-yellow-400'
                      : isHovered && !isInactive
                      ? 'ring-blue-400' 
                      : 'ring-transparent'}
                    ${isInactive 
                      ? 'bg-gray-700 opacity-40 cursor-not-allowed' 
                      : 'bg-gray-900 hover:bg-gray-800 cursor-pointer'}
                    transition-all duration-200`}
      >
        <img
          src={fighter.portrait}
          alt={fighter.name}
          className={`w-full h-full object-contain ${isInactive ? 'grayscale' : ''}`}
        />
        {isInactive && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-red-500 text-xs font-bold bg-black bg-opacity-70 px-2 py-1 rounded">
              INACTIVE
            </span>
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-black text-neonYel font-arcade p-4">
      {/* Heading */}
      <h1 className="text-3xl mb-6">CHOOSE&nbsp;YOUR&nbsp;FIGHTER</h1>

      {/* Main Content: Grid Left, Preview Right */}
      <div className="flex flex-row gap-8 items-start max-w-6xl w-full">
        
        {/* Left Side: Character Grid */}
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-5 gap-2 border-4 border-yellow-400 p-4 bg-gray-800">
            {heroes.map(renderCharacterButton)}
          </div>
          
          <div className="grid grid-cols-5 gap-2 border-4 border-yellow-400 p-4 bg-gray-800">
            {villains.map(renderCharacterButton)}
          </div>
        </div>

        {/* Right Side: Character Preview */}
        <div className="flex flex-col items-center min-w-[300px] max-w-[400px]">
          {activeFighter && (
            <>
              {!imgBroken ? (
                <img
                  src={activeFighter.full}
                  alt={activeFighter.name}
                  className="w-48 h-48 object-contain mb-4"
                  onError={() => setImgBroken(true)}
                />
              ) : (
                <div className="w-48 h-48 mb-4 flex items-center justify-center bg-gray-700 rounded">
                  <span className="text-gray-400 text-sm">No Image</span>
                </div>
              )}

              <p className="text-2xl font-bold text-yellow-400 text-center mb-2">
                {activeFighter.name}
              </p>

              <p className="text-lg text-center mb-4 px-4">
                {activeFighter.quip}
              </p>

              {/* Confirm Button */}
              <button
                disabled={!selectedId || (selectedId && inactiveCharacters.includes(selectedId))}
                onClick={handleConfirm}
                className={`px-6 py-3 bg-yellow-500 text-black font-bold rounded-lg text-lg
                            ${(!selectedId || (selectedId && inactiveCharacters.includes(selectedId)))
                              && 'opacity-30 cursor-not-allowed'}`}
              >
                {selectedId ? `FIGHT AS ${fighters.find(f => f.id === selectedId)?.name.toUpperCase()}!` : 'SELECT A FIGHTER!'}
              </button>
            </>
          )}
          
          {!activeFighter && (
            <div className="text-center text-gray-400 mt-12">
              <p className="text-lg">Hover over a fighter</p>
              <p className="text-sm">to see their details</p>
            </div>
          )}
        </div>
      </div>

      {/* Confirm Button */}
      <button
        disabled={!selectedId || (selectedId && inactiveCharacters.includes(selectedId))}
        onClick={handleConfirm}
        className={`mt-8 px-8 py-4 bg-yellow-500 text-black font-bold rounded-lg text-xl
                    ${(!selectedId || (selectedId && inactiveCharacters.includes(selectedId)))
                      && 'opacity-30 cursor-not-allowed'}`}
      >
        {selectedId ? `FIGHT AS ${fighters.find(f => f.id === selectedId)?.name.toUpperCase()}!` : 'SELECT A FIGHTER!'}
      </button>

      {/* Legend */}
      <div className="mt-4 text-center text-sm text-gray-400">
        <p>Heroes fight for justice • Villains fight for power</p>
        <p className="text-xs mt-1">Gray characters coming soon!</p>
      </div>
    </div>
  );
}