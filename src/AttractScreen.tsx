import React from 'react';

export default function AttractScreen({ onStart }: { onStart: () => void }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center cursor-pointer select-none"
      onClick={onStart}
    >
      <h1 
        className="text-neonYel font-arcade text-6xl mb-16"
        style={{
          textShadow: '-3px 3px #07399D, 3px -3px #FE1C06, 0 0 12px rgba(255,255,255,.4)'
        }}
      >
        POMOCHAMP
      </h1>
      <p className="font-arcade text-neonYel text-2xl animate-pulse">INSERT&nbsp;COIN</p>
    </div>
  );
}