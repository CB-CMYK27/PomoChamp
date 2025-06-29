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
      {/* Main Title - Responsive sizing that stretches across screen */}
      <div className="text-center mb-8 w-full">
        <h1 
          className="text-primary text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold mb-4 w-full"
          style={{
            textShadow: '-3px 3px #07399D, 3px -3px #FE1C06, 0 0 12px rgba(255,255,255,.4)'
          }}
        >
          POMOCHAMP
        </h1>
      </div>
      
      {/* Value Proposition - Subtitle on one line */}
      <div className="text-center mb-8 max-w-4xl">
        <h2 
          className="text-accent text-xl font-bold mb-8 whitespace-nowrap"
          style={{
            textShadow: '0 0 10px rgba(255,255,255,0.6), 2px 2px 0px #07399D'
          }}
        >
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