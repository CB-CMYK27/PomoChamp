import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudioStore } from '../store/audioStore';
import MusicConsentModal from './MusicConsentModal';

export default function AttractScreen() {
  const navigate = useNavigate();
  const { musicEnabled, enableMusic } = useAudioStore();
  
  // State for music consent modal
  const [showMusicConsent, setShowMusicConsent] = useState(false);

  const handleStart = () => {
    if (musicEnabled) {
      // Music is already enabled, go directly to mode select
      navigate('/mode');
    } else {
      // Music is not enabled, show consent modal
      setShowMusicConsent(true);
    }
  };

  const handleMusicConsentYes = () => {
    // Enable music
    enableMusic();
    
    // Hide modal and navigate
    setShowMusicConsent(false);
    navigate('/mode');
  };

  const handleMusicConsentNo = () => {
    // Music remains disabled (default state)
    
    // Hide modal and navigate
    setShowMusicConsent(false);
    navigate('/mode');
  };

  return (
    <>
      <div
        className="min-h-screen bg-bezel text-white font-arcade flex flex-col items-center justify-center p-8 relative cursor-pointer select-none"
        onClick={handleStart}
      >
        {/* Subtitle moved above title */}
        <div className="text-center mb-6 max-w-4xl">
          <h2 
            className="text-accent text-xl font-bold whitespace-nowrap"
            style={{
              textShadow: '0 0 10px rgba(255,255,255,0.6), 2px 2px 0px #07399D'
            }}
          >
            THE POMODORO TIMER THAT DOESN'T SUCK
          </h2>
        </div>

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
        
        {/* Description text */}
        <div className="text-center mb-8 max-w-4xl">
          <p className="text-white text-lg leading-relaxed italic">
            Brain dump your tasks, pick your fighter, and punch procrastination in the face.
          </p>
        </div>
        
        {/* Insert Coin Image - Pulsing slowly */}
        <div className="animate-slow-pulse">
          <img 
            src="/images/insert-coin.png" 
            alt="Insert Coin"
            className="w-48 h-48 object-contain"
          />
        </div>

        {/* Boyle the Builder badge */}
        <div className="fixed bottom-8 right-8 z-50">
          <a href="https://boylethebuilder.com" target="_blank" rel="noopener noreferrer"
             className="block transition-all duration-300 hover:shadow-2xl">
            <img src="/btb-logo.svg"
                 alt="Made by Boyle the Builder"
                 style={{ imageRendering: 'auto' }}
                 className="w-28 h-28 md:w-36 md:h-36 rounded-full shadow-lg bolt-badge bolt-badge-intro"
                 onAnimationEnd={(e) => e.currentTarget.classList.add('animated')} />
          </a>
        </div>
      </div>

      {/* Music Consent Modal */}
      {showMusicConsent && (
        <MusicConsentModal
          onYes={handleMusicConsentYes}
          onNo={handleMusicConsentNo}
        />
      )}
    </>
  );
}