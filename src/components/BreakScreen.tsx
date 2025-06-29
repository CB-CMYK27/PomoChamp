import React, { useState, useEffect } from 'react';

interface BreakScreenProps {
  breakDuration: number; // in minutes (5, 10, 15, 20, 25, or 30)
  onBreakComplete: () => void; // Callback when user chooses to start another pomodoro
  onSkipBreak: () => void; // Callback when user skips break early
}

const BreakScreen: React.FC<BreakScreenProps> = ({ 
  breakDuration, 
  onBreakComplete, 
  onSkipBreak 
}) => {
  // Convert minutes to seconds for countdown
  const [timeRemaining, setTimeRemaining] = useState(breakDuration * 60);
  const [isComplete, setIsComplete] = useState(false);

  // Countdown timer logic
  useEffect(() => {
    if (timeRemaining <= 0) {
      setIsComplete(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  // Format seconds into MM:SS display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Break completion screen (when timer reaches zero)
  if (isComplete) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/stages/break-beach.webp)' }}
      >
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        
        <div className="text-center bg-black bg-opacity-70 p-8 rounded-lg border-2 border-neonYel relative z-10">
          <h2 className="text-neonYel/80 font-mono text-3xl font-bold mb-6 drop-shadow-lg">
            BREAK COMPLETE!
          </h2>
          <div className="space-y-4">
            <button
              onClick={onBreakComplete}
              className="block w-full bg-green-600 text-white font-mono text-lg px-8 py-3 border-2 border-green-400 hover:bg-green-500 transition-colors rounded"
            >
              START ANOTHER POMODORO
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="block w-full bg-gray-600 text-white font-mono text-lg px-8 py-3 border-2 border-gray-400 hover:bg-gray-500 transition-colors rounded"
            >
              RETURN TO MAIN MENU
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active break screen (countdown in progress)
  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: 'url(/stages/break-beach.webp)' }}
    >
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      
      {/* Main content container */}
      <div className="text-center z-10 bg-black bg-opacity-50 p-8 rounded-lg border-2 border-cyan-400">
        <h2 className="text-cyan-300 font-mono text-2xl font-bold mb-4 drop-shadow-lg">
          🏖️ BREAK TIME 🏖️
        </h2>
        
        {/* Large countdown timer - most prominent element */}
        <div className="text-white font-mono text-7xl font-bold mb-8 drop-shadow-lg">
          {formatTime(timeRemaining)}
        </div>
        
        {/* Show selected break duration */}
        <div className="text-cyan-200 font-mono text-lg mb-6">
          {breakDuration} minute break
        </div>
        
        {/* Skip break button */}
        <button
          onClick={onSkipBreak}
          className="bg-neonRed text-white font-mono text-lg px-6 py-3 border-2 border-neonRed/80 hover:bg-neonRed/80 transition-colors rounded"
        >
          SKIP BREAK
        </button>
      </div>
    </div>
  );
};

export default BreakScreen;