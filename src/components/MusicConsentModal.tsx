import React from 'react';

interface MusicConsentModalProps {
  onYes: () => void;
  onNo: () => void;
}

const MusicConsentModal: React.FC<MusicConsentModalProps> = ({ onYes, onNo }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 font-arcade">
      {/* Modal Container - Changed from max-w-lg to max-w-xl */}
      <div className="bg-bezel border-4 border-neonYel rounded-lg p-8 max-w-xl mx-4 text-center">
        {/* Title */}
        <h2 className="text-neonYel text-2xl font-bold mb-6">
          🎵 PUMP UP THE JAMS? 🎵
        </h2>
        
        {/* Description */}
        <p className="text-white text-sm mb-8 leading-relaxed">
          Want epic background music to fuel your productivity battles?
        </p>
        
        {/* Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={onYes}
            className="bg-neonYel text-bezel font-bold px-8 py-3 rounded border-2 border-neonYel hover:bg-transparent hover:text-neonYel transition-colors"
          >
            YES!
          </button>
          
          <button
            onClick={onNo}
            className="bg-gray-600 text-white font-bold px-8 py-3 rounded border-2 border-gray-500 hover:bg-gray-500 transition-colors"
          >
            NO THANKS
          </button>
        </div>
        
        {/* Small note */}
        <p className="text-gray-400 text-xs mt-4">
          You can change this later in audio settings
        </p>
      </div>
    </div>
  );
};

export default MusicConsentModal;