import React from 'react';

interface SpinalTapModalProps {
  onClose: () => void;
}

const SpinalTapModal: React.FC<SpinalTapModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 font-arcade">
      {/* Modal Container */}
      <div className="bg-bezel border-4 border-neonRed rounded-lg p-8 max-w-lg mx-4 text-center relative">
        {/* Glowing border effect */}
        <div className="absolute inset-0 bg-neonRed/20 rounded-lg animate-pulse"></div>
        
        {/* Content */}
        <div className="relative z-10">
          {/* Title with rock styling */}
          <h2 className="text-neonRed text-3xl font-bold mb-6 animate-pulse">
            🎸 SPINAL TAP MODE 🎸
          </h2>
          
          {/* Main message */}
          <p className="text-white text-lg mb-4 leading-relaxed">
            EVERYTHING HAS BEEN
          </p>
          
          {/* Big "11" */}
          <div className="text-neonYel text-8xl font-bold mb-4 animate-bounce">
            11
          </div>
          
          <p className="text-white text-lg mb-8 leading-relaxed">
            TURNED UP TO ELEVEN!
          </p>
          
          {/* Subtitle */}
          <p className="text-gray-300 text-sm mb-8 italic">
            "These go to eleven... It's one louder, isn't it?"
          </p>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="bg-neonRed text-white font-bold px-8 py-4 rounded border-2 border-neonRed hover:bg-transparent hover:text-neonRed transition-colors text-xl"
          >
            FUCK YEAH!
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpinalTapModal;