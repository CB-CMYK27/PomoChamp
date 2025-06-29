import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AttractScreen() {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/mode');
  };

  return (
    <div
      className="min-h-screen bg-bezel text-white font-arcade flex flex-col items-center justify-center p-8 relative cursor-pointer select-none"
      onClick={handleStart}
    >
      {/* Main Title - Made twice as big */}
      <div className="text-center mb-8">
        <h1 
          className="text-primary text-[12rem] font-bold mb-4"
          style={{
            textShadow: '-3px 3px #07399D, 3px -3px #FE1C06, 0 0 12px rgba(255,255,255,.4)'
          }}
        >
          POMOCHAMP
        </h1>
      </div>
      
      {/* Value Proposition - Subtitle on one line */}
      <div className="text-center mb-8 max-w-4xl">
        <h2 className="text-accent text-xl font-bold mb-4 whitespace-nowrap">
          THE POMODORO TIMER THAT DOESN'T SUCK
        </h2>
        <p className="text-white text-lg leading-relaxed">
          Brain dump your tasks, pick your fighter, and punch procrastination in the face.
        </p>
      </div>
      
      {/* Insert Coin */}
      <div className="animate-pulse">
        <p className="text-primary text-2xl font-bold">INSERT COIN</p>
      </div>
    </div>
  );
}