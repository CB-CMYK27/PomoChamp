import React, { useEffect, useState } from 'react';
import { LeaderboardEntry } from '../types';
import { fetchLeaderboard } from '../services/supabase';
import { Trophy } from 'lucide-react';

const Leaderboard: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadLeaderboard = async () => {
      setIsLoading(true);
      try {
        const data = await fetchLeaderboard();
        setEntries(data);
      } catch (error) {
        console.error('Error loading leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadLeaderboard();
    
    // Refresh every 60 seconds
    const interval = setInterval(loadLeaderboard, 60000);
    return () => clearInterval(interval);
  }, []);
  
  // Ensure we only display 3 entries max
  const topEntries = entries.slice(0, 3);
  
  // Fill with placeholder entries if we have fewer than 3
  while (topEntries.length < 3) {
    topEntries.push({
      id: `placeholder-${topEntries.length}`,
      user_id: '',
      username: '---',
      score: 0,
      created_at: ''
    });
  }
  
  return (
    <div className="bg-gray-800 border-4 border-yellow-600 rounded-lg p-4 w-full shadow-lg">
      <div className="flex items-center justify-center mb-2 bg-yellow-600 py-1 rounded-t-sm">
        <Trophy className="text-yellow-300 mr-2" size={20} />
        <h2 className="text-white font-bold text-xl">TOP FIGHTERS</h2>
      </div>
      
      {isLoading ? (
        <div className="text-center text-gray-400 py-4">Loading...</div>
      ) : (
        <div className="space-y-2">
          {topEntries.map((entry, index) => (
            <div 
              key={entry.id} 
              className={`
                flex items-center justify-between p-2 
                ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-700'}
                rounded border-2 border-gray-700
              `}
            >
              <div className="flex items-center">
                <span className="w-8 h-8 flex items-center justify-center bg-black text-white font-bold rounded-full mr-2">
                  {index + 1}
                </span>
                <span className="font-bold text-white uppercase">
                  {entry.username.substring(0, 3)}
                </span>
              </div>
              <span className="bg-black text-white px-2 py-1 rounded font-mono">
                {entry.score}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;