import React from 'react';

interface FighterProps {
  side: 'left' | 'right';
  name: string;
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
  isAttackingProp = false,
  isHitProp = false,
  redGlow = false,
  timeLeft = 0,
  gameState = 'fighting',
  fighterHP = 100,
  opponentHP = 100
}) => {
  
  // Fighter colors based on side
  const fighterClass = side === 'left' 
    ? 'bg-neonRed border-neonRed/80' 
    : 'bg-crtBlue border-crtBlue/80';
  
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
    return 'animate-pulse';
  };

  const getRedGlowClass = () => {
    return redGlow ? 'animate-redGlow' : '';
  };

  return (
    <div className={`relative ${side === 'left' ? 'mr-auto' : 'ml-auto'}`}>
      {/* Fighter sprite */}
      <div
        className={`
          w-32 h-48 relative
          transform ${getStateClass()} ${getRedGlowClass()} transition-all duration-150
          ${side === 'right' ? 'scale-x-[-1]' : ''}
        `}
      >
        {/* Head */}
        <div className={`w-16 h-16 rounded-full ${fighterClass} border-4 border-black absolute top-0 left-1/2 transform -translate-x-1/2`}>
          {/* Eyes */}
          <div className="absolute top-4 left-2 w-3 h-3 bg-white rounded-full"></div>
          <div className="absolute top-4 right-2 w-3 h-3 bg-white rounded-full"></div>
          
          {/* Mouth - changes based on state */}
          {gameState === 'victory' ? (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-8 h-2 bg-white rounded-full"></div>
          ) : isHitProp ? (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rounded-full"></div>
          ) : (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-white rounded-full"></div>
          )}
        </div>
        
        {/* Body */}
        <div className={`w-24 h-20 ${fighterClass} border-4 border-black absolute top-14 left-1/2 transform -translate-x-1/2`}>
          {/* Belt */}
          <div className="absolute bottom-0 w-full h-4 bg-neonYel border-t-2 border-black"></div>
        </div>
        
        {/* Arms */}
        <div className={`w-6 h-16 ${fighterClass} border-4 border-black absolute top-16 ${side === 'left' ? 'left-2' : 'right-2'} rounded-full transform ${isAttackingProp ? (side === 'left' ? 'rotate-45' : '-rotate-45') : ''}`}></div>
        <div className={`w-6 h-16 ${fighterClass} border-4 border-black absolute top-16 ${side === 'left' ? 'right-2' : 'left-2'} rounded-full transform ${isAttackingProp ? (side === 'left' ? '-rotate-45' : 'rotate-45') : ''}`}></div>
        
        {/* Legs */}
        <div className={`w-8 h-20 ${fighterClass} border-4 border-black absolute bottom-0 left-8 rounded-b-lg`}></div>
        <div className={`w-8 h-20 ${fighterClass} border-4 border-black absolute bottom-0 right-8 rounded-b-lg`}></div>
      </div>
      
      {/* Name tag */}
      <div className={`absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-gray-800 text-white font-bold rounded-lg border-2 border-neonYel`}>
        {name}
      </div>
    </div>
  );
};

export default Fighter;