import React from 'react';

interface HealthBarProps {
  health: number;
  maxHealth: number;
  player: 'left' | 'right';
  name: string;
}

const HealthBar: React.FC<HealthBarProps> = ({ health, maxHealth, player, name }) => {
  const percentage = Math.max(0, Math.min(100, (health / maxHealth) * 100));
  
  // Health bar color based on percentage
  const getHealthColor = () => {
    if (percentage > 66) return 'bg-green-500';
    if (percentage > 33) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="flex flex-col items-center">
      {/* Name tag */}
      <div className={`px-4 py-1 bg-blue-900 text-white font-bold text-lg mb-1 border-2 border-yellow-400 ${player === 'left' ? 'self-start' : 'self-end'}`}>
        {name}
      </div>
      
      {/* Health bar container */}
      <div className={`w-full h-8 bg-gray-800 border-4 border-white relative overflow-hidden ${player === 'right' ? 'transform scale-x-[-1]' : ''}`}>
        {/* Health background pattern - pixel pattern */}
        <div className="absolute inset-0 flex flex-wrap">
          {[...Array(15)].map((_, i) => (
            <div key={i} className="w-4 h-4 border border-gray-700"></div>
          ))}
        </div>
        
        {/* Health fill */}
        <div 
          className={`h-full ${getHealthColor()} transition-all duration-300`} 
          style={{ width: `${percentage}%` }}
        ></div>
        
        {/* Health segments */}
        <div className="absolute inset-0 flex">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex-1 border-r border-gray-700"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HealthBar;