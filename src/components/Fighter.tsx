import React, { useState, useEffect } from 'react';
import { useTimerStore } from '../store/timerStore';

interface FighterProps {
  side: 'left' | 'right';
  name: string;
}

const Fighter: React.FC<FighterProps> = ({ side, name }) => {
  const { progress, isRunning, mode, timeLeft } = useTimerStore();
  const [isAttacking, setIsAttacking] = useState(false);
  const [isHit, setIsHit] = useState(false);
  const [isVictorious, setIsVictorious] = useState(false);
  
  // Fighter colors based on side
  const fighterClass = side === 'left' 
    ? 'bg-red-600 border-red-800' 
    : 'bg-blue-600 border-blue-800';
  
  // Animation for attacking
  useEffect(() => {
    if (isRunning && timeLeft > 0 && timeLeft % 10 === 0) {
      if (side === 'left' && mode === 'work') {
        setIsAttacking(true);
        setTimeout(() => {
          setIsAttacking(false);
          setIsHit(false);
        }, 500);
      } else if (side === 'right' && mode === 'break') {
        setIsAttacking(true);
        setTimeout(() => {
          setIsAttacking(false);
          setIsHit(false);
        }, 500);
      }
    }
  }, [isRunning, timeLeft, side, mode]);
  
  // Set victory pose when timer completes
  useEffect(() => {
    if (timeLeft === 0) {
      if ((side === 'left' && mode === 'work') || (side === 'right' && mode === 'break')) {
        setIsVictorious(true);
      } else {
        setIsHit(true);
      }
    } else {
      setIsVictorious(false);
      setIsHit(false);
    }
  }, [timeLeft, side, mode]);
  
  const getStateClass = () => {
    if (isVictorious) return 'animate-bounce';
    if (isHit) return 'animate-ping opacity-50';
    if (isAttacking) return side === 'left' ? 'translate-x-5' : '-translate-x-5';
    return 'animate-pulse';
  };

  return (
    <div className={`relative ${side === 'left' ? 'mr-auto' : 'ml-auto'}`}>
      {/* Fighter sprite */}
      <div
        className={`
          w-32 h-48 relative
          transform ${getStateClass()} transition-all duration-300
          ${side === 'right' ? 'scale-x-[-1]' : ''}
        `}
      >
        {/* Head */}
        <div className={`w-16 h-16 rounded-full ${fighterClass} border-4 border-black absolute top-0 left-1/2 transform -translate-x-1/2`}>
          {/* Eyes */}
          <div className="absolute top-4 left-2 w-3 h-3 bg-white rounded-full"></div>
          <div className="absolute top-4 right-2 w-3 h-3 bg-white rounded-full"></div>
          
          {/* Mouth - changes based on state */}
          {isVictorious ? (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-8 h-2 bg-white rounded-full"></div>
          ) : isHit ? (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rounded-full"></div>
          ) : (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-white rounded-full"></div>
          )}
        </div>
        
        {/* Body */}
        <div className={`w-24 h-20 ${fighterClass} border-4 border-black absolute top-14 left-1/2 transform -translate-x-1/2`}>
          {/* Belt */}
          <div className="absolute bottom-0 w-full h-4 bg-yellow-400 border-t-2 border-black"></div>
        </div>
        
        {/* Arms */}
        <div className={`w-6 h-16 ${fighterClass} border-4 border-black absolute top-16 ${side === 'left' ? 'left-2' : 'right-2'} rounded-full transform ${isAttacking ? (side === 'left' ? 'rotate-45' : '-rotate-45') : ''}`}></div>
        <div className={`w-6 h-16 ${fighterClass} border-4 border-black absolute top-16 ${side === 'left' ? 'right-2' : 'left-2'} rounded-full transform ${isAttacking ? (side === 'left' ? '-rotate-45' : 'rotate-45') : ''}`}></div>
        
        {/* Legs */}
        <div className={`w-8 h-20 ${fighterClass} border-4 border-black absolute bottom-0 left-8 rounded-b-lg`}></div>
        <div className={`w-8 h-20 ${fighterClass} border-4 border-black absolute bottom-0 right-8 rounded-b-lg`}></div>
      </div>
      
      {/* Name tag */}
      <div className={`absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-gray-800 text-white font-bold rounded-lg border-2 border-yellow-400`}>
        {name}
      </div>
    </div>
  );
};

export default Fighter;