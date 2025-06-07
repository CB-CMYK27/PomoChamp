import React from 'react';
import { useTimerStore } from '../store/timerStore';

interface StartButtonProps {
  onClick?: () => void;
}

const StartButton: React.FC<StartButtonProps> = ({ onClick }) => {
  const { isRunning, startTimer } = useTimerStore();
  
  const handleClick = () => {
    if (!isRunning) {
      startTimer();
    }
    if (onClick) onClick();
  };
  
  return (
    <button
      onClick={handleClick}
      disabled={isRunning}
      className={`
        relative bg-red-600 text-white font-bold text-4xl
        px-8 py-4 rounded-lg shadow-lg
        border-b-8 border-red-800
        transform hover:scale-105 active:scale-95 active:border-b-4
        transition-all duration-150
        ${isRunning ? 'opacity-50 cursor-not-allowed' : 'animate-pulse'}
      `}
    >
      {/* Arcade button styling */}
      <div className="absolute inset-0 bg-gradient-to-b from-red-500 to-red-700 rounded-lg opacity-50"></div>
      
      {/* Pixel corners */}
      <div className="absolute w-4 h-4 bg-red-800 top-0 left-0 rounded-tl-lg"></div>
      <div className="absolute w-4 h-4 bg-red-800 top-0 right-0 rounded-tr-lg"></div>
      <div className="absolute w-4 h-4 bg-red-800 bottom-0 left-0 rounded-bl-lg"></div>
      <div className="absolute w-4 h-4 bg-red-800 bottom-0 right-0 rounded-br-lg"></div>
      
      {/* Button text */}
      <span className="relative z-10 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
        START!
      </span>
    </button>
  );
};

export default StartButton;