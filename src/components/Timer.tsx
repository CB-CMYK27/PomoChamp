import React, { useEffect } from 'react';
import { useTimerStore } from '../store/timerStore';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';

const Timer: React.FC = () => {
  const { 
    isRunning, 
    timeLeft, 
    mode, 
    startTimer, 
    pauseTimer, 
    resetTimer, 
    switchMode,
    tick
  } = useTimerStore();

  // Timer tick effect
  useEffect(() => {
    let interval: number | undefined;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        tick();
      }, 1000);
    } else if (timeLeft === 0) {
      // Auto switch to next mode when timer completes
      setTimeout(() => {
        switchMode();
      }, 3000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, tick, switchMode]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center">
      {/* Mode indicator */}
      <div className={`
        text-2xl font-bold mb-2 px-4 py-1 rounded-t-lg border-t-4 border-x-4
        ${mode === 'work' ? 'bg-red-600 text-white border-red-800' : 'bg-blue-600 text-white border-blue-800'}
      `}>
        {mode === 'work' ? 'WORK TIME' : 'BREAK TIME'}
      </div>
      
      {/* Timer display */}
      <div className={`
        text-6xl font-bold font-mono p-6 border-8 bg-black text-white relative
        ${timeLeft === 0 ? 'animate-pulse' : ''}
        ${mode === 'work' ? 'border-red-600' : 'border-blue-600'}
      `}>
        {formatTime(timeLeft)}
        
        {/* Pixel corners */}
        <div className="absolute w-4 h-4 bg-gray-800 top-0 left-0"></div>
        <div className="absolute w-4 h-4 bg-gray-800 top-0 right-0"></div>
        <div className="absolute w-4 h-4 bg-gray-800 bottom-0 left-0"></div>
        <div className="absolute w-4 h-4 bg-gray-800 bottom-0 right-0"></div>
      </div>
      
      {/* Control buttons */}
      <div className="flex space-x-4 mt-4">
        {/* Start/Pause button */}
        <button
          onClick={isRunning ? pauseTimer : startTimer}
          className={`
            w-16 h-16 flex items-center justify-center
            ${isRunning ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'}
            text-white rounded-lg border-b-4 border-r-4
            ${isRunning ? 'border-yellow-700' : 'border-green-700'}
            transform active:translate-y-1 active:translate-x-1 active:border-b-0 active:border-r-0
            transition-all duration-100
          `}
        >
          {isRunning ? <Pause size={24} /> : <Play size={24} />}
        </button>
        
        {/* Reset button */}
        <button
          onClick={resetTimer}
          className="
            w-16 h-16 flex items-center justify-center
            bg-red-500 hover:bg-red-600 text-white rounded-lg
            border-b-4 border-r-4 border-red-700
            transform active:translate-y-1 active:translate-x-1 active:border-b-0 active:border-r-0
            transition-all duration-100
          "
        >
          <RotateCcw size={24} />
        </button>
        
        {/* Switch mode button */}
        <button
          onClick={switchMode}
          className="
            w-16 h-16 flex items-center justify-center
            bg-blue-500 hover:bg-blue-600 text-white rounded-lg
            border-b-4 border-r-4 border-blue-700
            transform active:translate-y-1 active:translate-x-1 active:border-b-0 active:border-r-0
            transition-all duration-100
          "
        >
          <Clock size={24} />
        </button>
      </div>
    </div>
  );
};

export default Timer;