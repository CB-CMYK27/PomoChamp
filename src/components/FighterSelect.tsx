import { useNavigate, useLocation } from 'react-router-dom';
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

  // Character arrangement - Heroes left, Villains right
  const heroCharacters = [
    // Heroes - Left side (3x2)
    'jack-tower',
    'ellen-ryker', 
    'raging-stallion',
    'beach-belle',
    'bond-sterling',
    'waves-mcrad'        // Inactive
  ];

  const villainCharacters = [
    // Villains - Right side (3x2)
    'prof-kruber',
    'queen-chroma',
    'iron-titan',
    'jawsome',
    'dr-whiskers',
    'gen-buzzkill'       // Inactive
  ];

  // Inactive characters (currently none - all are active!)
  const inactiveCharacters: string[] = [];

  // Split heroes and villains into top/bottom rows
  const heroesTopRow = heroCharacters.slice(0, 3);
  const heroesBottomRow = heroCharacters.slice(3, 6);
  const villainsTopRow = villainCharacters.slice(0, 3);
  const villainsBottomRow = villainCharacters.slice(3, 6);

  // Get fighter data for each section
  const topLeftFighters = heroesTopRow.map(id => fighters.find(f => f.id === id)).filter(f => f !== undefined);
  const bottomLeftFighters = heroesBottomRow.map(id => fighters.find(f => f.id === id)).filter(f => f !== undefined);
  const topRightFighters = villainsTopRow.map(id => fighters.find(f => f.id === id)).filter(f => f !== undefined);
  const bottomRightFighters = villainsBottomRow.map(id => fighters.find(f => f.id === id)).filter(f => f !== undefined);

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

  const handleCharacterLeave = () => {
    setHoveredId(null);
  };

  const renderCharacterButton = (fighter: any) => {
    const isSelected = selectedId === fighter.id;
    const isHovered = hoveredId === fighter.id;

    return (
      <button
        key={fighter.id}
        onMouseEnter={() => handleCharacterHover(fighter.id)}
        onMouseLeave={handleCharacterLeave}
        onClick={() => handleCharacterClick(fighter.id)}
        className={`w-32 h-32 flex items-center justify-center relative
                    ring-2 ring-offset-2 ring-offset-gray-800
                    ${isSelected
                      ? 'ring-yellow-400'
                      : isHovered
                      ? 'ring-blue-400' 
                      : 'ring-transparent'}
                    bg-gray-900 hover:bg-gray-800 cursor-pointer
                    transition-all duration-100`}
      >
        <img
          src={fighter.portrait}
          alt={fighter.name}
          className="w-full h-full object-contain pointer-events-none"
        />
      </button>
    );
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-black text-neonYel font-arcade p-4">
      {/* Heading */}
      <h1 className="text-3xl mb-12 mt-6">CHOOSE&nbsp;YOUR&nbsp;FIGHTER</h1>

      {/* Main Grid Layout */}
      <div className="flex flex-col items-center max-w-6xl w-full">
        
        {/* Character Grid Layout - Heroes vs Villains */}
        <div className="flex items-start gap-4 mb-8">
          {/* Heroes - Left Side (Unified 3x2 Grid) */}
          <div className="flex flex-col items-center">
            <h3 className="text-lg text-blue-400 mb-2 font-bold">HEROES</h3>
            <div className="border-4 border-blue-500 p-4 bg-gray-800">
              {/* Top Row Heroes */}
              <div className="grid grid-cols-3 gap-2 mb-2">
                {topLeftFighters.map(renderCharacterButton)}
              </div>
              {/* Bottom Row Heroes */}
              <div className="grid grid-cols-3 gap-2">
                {bottomLeftFighters.map(renderCharacterButton)}
              </div>
            </div>
          </div>

          {/* Center Preview Area */}
          <div className="flex flex-col items-center min-w-[200px] max-w-[250px] justify-start mt-16">
            {activeFighter ? (
              <>
                {!imgBroken ? (
                  <img
                    src={activeFighter.full}
                    alt={activeFighter.name}
                    className="w-48 h-64 object-contain"
                    onError={() => setImgBroken(true)}
                  />
                ) : (
                  <div className="w-48 h-64 flex items-center justify-center bg-gray-700 rounded">
                    <span className="text-gray-400">No Image</span>
                  </div>
                )}
              </>
            ) : (
              <div className="w-48 h-64 flex items-center justify-center border-2 border-dashed border-gray-600 rounded">
                <span className="text-gray-500 text-center">
                  Hover over<br/>a fighter
                </span>
              </div>
            )}
          </div>

          {/* Villains - Right Side (Unified 3x2 Grid) */}
          <div className="flex flex-col items-center">
            <h3 className="text-lg text-red-400 mb-2 font-bold">VILLAINS</h3>
            <div className="border-4 border-red-500 p-4 bg-gray-800">
              {/* Top Row Villains */}
              <div className="grid grid-cols-3 gap-2 mb-2">
                {topRightFighters.map(renderCharacterButton)}
              </div>
              {/* Bottom Row Villains */}
              <div className="grid grid-cols-3 gap-2">
                {bottomRightFighters.map(renderCharacterButton)}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Info Area */}
        <div className="flex flex-col items-center min-h-[100px] max-w-4xl">
          {activeFighter && (
            <>
              <h2 className="text-2xl font-bold text-yellow-400 text-center mb-3">
                {activeFighter.name}
              </h2>

              <p className="text-lg text-center mb-4 leading-relaxed max-w-xl px-4">
                {activeFighter.quip}
              </p>

              <button
                disabled={!selectedId}
                onClick={handleConfirm}
                className={`px-6 py-3 bg-yellow-500 text-black font-bold rounded-lg text-lg transition-all
                            ${!selectedId
                              ? 'opacity-50 cursor-not-allowed' 
                              : 'hover:bg-yellow-400 hover:scale-105'}`}
              >
                {selectedId ? `FIGHT AS ${activeFighter.name.toUpperCase()}!` : 'SELECT A FIGHTER!'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}