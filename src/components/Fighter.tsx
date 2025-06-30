import React from 'react';

interface FighterProps {
  side: 'left' | 'right';
  name: string;
  fighterImageUrl: string;
  isAttackingProp?: boolean;
  isHitProp?: boolean;
  redGlow?: boolean;
  timeLeft?: number;
  gameState?: string;
  fighterHP?: number;
  opponentHP?: number;
}

const Fighter: React.FC<FighterProps> = ({ 
  side, 
  name, 
  fighterImageUrl,
  isAttackingProp = false,
  isHitProp = false,
  redGlow = false,
  timeLeft = 0,
  gameState = 'fighting',
  fighterHP = 100,
  opponentHP = 100
}) => {
  
  const getStateClass = () => {
    if (isHitProp) return 'animate-shake';
    if (isAttackingProp) return side === 'left' ? 'translate-x-2' : '-translate-x-2';
    if (gameState === 'fighting') {
      const isPlayer = side === 'left';
      if (isPlayer && fighterHP < 30) return 'animate-pulse';
      if (!isPlayer && opponentHP < 30) return 'animate-pulse';
      if (isPlayer && gameState === 'victory') return 'animate-bounce';
      if (!isPlayer && gameState === 'defeat') return 'animate-bounce';
    }
    return '';
  };

  const getRedGlowClass = () => {
    return redGlow ? 'animate-redGlow' : '';
  };

  return (
    <div className={`relative ${side === 'left' ? 'mr-auto' : 'ml-auto'}`}>
      {/* Fighter sprite container */}
      <div
        className={`
          w-80 h-[500px] relative
          transform ${getStateClass()} ${getRedGlowClass()} transition-all duration-150
          ${side === 'right' ? 'scale-x-[-1]' : ''}
        `}
      >
        {/* Actual fighter image */}
        <img 
          src={fighterImageUrl}
          alt={name}
          className="w-full h-full object-contain object-bottom"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            console.error(`Failed to load fighter image: ${fighterImageUrl}`);
          }}
        />
      </div>
      
      {/* Name tag */}
      <div className={`absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-gray-800 text-white font-bold rounded-lg border-2 border-neonYel`}>
        {name}
      </div>
    </div>
  );
};

export default Fighter;