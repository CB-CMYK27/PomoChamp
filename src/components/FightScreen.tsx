import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface Fighter {
  id: string;
  name: string;
  portrait: string;
  sprite: string;
  quip: string;
  stage: string;
}

interface Task {
  id: string;
  name: string;
  estimatedTime: number;
  completed: boolean;
}

interface FightSession {
  selectedFighter: Fighter;
  tasks: Task[];
  timeRemaining: number; // in seconds
  fighterHP: number;
  opponentHP: number;
  gameState: 'fighting' | 'paused' | 'victory' | 'defeat';
}

const FightScreen: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<{ [key: string]: HTMLAudioElement }>({});

  // Get data from navigation state
  const { selectedFighter, tasks: initialTasks } = location.state || {};

  const [session, setSession] = useState<FightSession>({
    selectedFighter: selectedFighter || null,
    tasks: initialTasks?.map((task: any, index: number) => ({
      ...task,
      id: task.id || `task-${index}`,
      completed: false
    })) || [],
    timeRemaining: 25 * 60, // 25 minutes in seconds
    fighterHP: 100,
    opponentHP: 100,
    gameState: 'fighting'
  });

  const [musicStarted, setMusicStarted] = useState(false);

  // Audio setup
  useEffect(() => {
    const sounds = ['punch', 'grunt', 'victory'];
    sounds.forEach(sound => {
      audioRef.current[sound] = new Audio(`/sfx/${sound}.wav`);
      audioRef.current[sound].preload = 'auto';
    });
    
    // Background music
    audioRef.current['bg-music'] = new Audio('/sfx/fight-music.mp3');
    audioRef.current['bg-music'].loop = true;
    audioRef.current['bg-music'].volume = 0.3;
  }, []);

  // Play sound effect
  const playSound = (soundName: string) => {
    if (audioRef.current[soundName]) {
      audioRef.current[soundName].currentTime = 0;
      audioRef.current[soundName].play().catch(() => {
        // Ignore audio play errors (browser restrictions)
      });
    }
  };

  // Timer logic with drift correction
  useEffect(() => {
    if (session.gameState === 'fighting' && session.timeRemaining > 0) {
      const startTime = Date.now();
      const expectedTime = session.timeRemaining * 1000;

      timerRef.current = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, expectedTime - elapsedTime);
        const remainingSeconds = Math.ceil(remainingTime / 1000);

        setSession(prev => {
          if (remainingSeconds <= 0) {
            // Time's up - player takes damage
            const newFighterHP = Math.max(0, prev.fighterHP - 20);
            playSound('grunt');
            
            if (newFighterHP <= 0) {
              return { ...prev, timeRemaining: 0, fighterHP: 0, gameState: 'defeat' };
            }
            
            return { ...prev, timeRemaining: 0, fighterHP: newFighterHP };
          }
          
          return { ...prev, timeRemaining: remainingSeconds };
        });
      }, 100); // Check every 100ms for smooth updates

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [session.gameState, session.timeRemaining]);

  // Complete a task
  const completeTask = (taskId: string) => {
    setSession(prev => {
      const updatedTasks = prev.tasks.map(task => 
        task.id === taskId ? { ...task, completed: true } : task
      );
      
      const newOpponentHP = Math.max(0, prev.opponentHP - 25);
      playSound('punch');
      
      // Check for victory
      const allTasksComplete = updatedTasks.every(task => task.completed);
      if (allTasksComplete || newOpponentHP <= 0) {
        playSound('victory');
        return {
          ...prev,
          tasks: updatedTasks,
          opponentHP: newOpponentHP,
          gameState: 'victory'
        };
      }
      
      return {
        ...prev,
        tasks: updatedTasks,
        opponentHP: newOpponentHP
      };
    });
  };

  // Pause/Resume game
  const togglePause = () => {
    setSession(prev => ({
      ...prev,
      gameState: prev.gameState === 'fighting' ? 'paused' : 'fighting'
    }));
  };

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start background music on first interaction
  const startMusic = () => {
    if (!musicStarted && audioRef.current['bg-music']) {
      audioRef.current['bg-music'].play().catch(() => {});
      setMusicStarted(true);
    }
  };

  // Redirect if no fighter selected
  if (!session.selectedFighter) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-yellow-400 font-mono text-2xl mb-4">NO FIGHTER SELECTED</h1>
          <button 
            onClick={() => navigate('/fighter-select')}
            className="bg-red-600 text-white font-mono px-6 py-3 border-2 border-red-400 hover:bg-red-500 transition-colors"
          >
            SELECT FIGHTER
          </button>
        </div>
      </div>
    );
  }

  const completedTasks = session.tasks.filter(task => task.completed).length;
  const totalTasks = session.tasks.length;

  return (
    <div 
      className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-black relative overflow-hidden"
      onClick={startMusic}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-20 w-1 h-1 bg-pink-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-40 left-1/4 w-1 h-1 bg-yellow-400 rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 right-10 w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
      </div>
      
      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        
        {/* Header with timer and pause */}
        <div className="flex justify-between items-center p-4 bg-black bg-opacity-60 border-b-2 border-cyan-400">
          <div className="text-yellow-400 font-mono text-lg font-bold">
            ROUND 1 - {completedTasks}/{totalTasks} TASKS
          </div>
          
          <div className="text-center">
            <div className={`font-mono text-4xl font-bold ${session.timeRemaining < 300 ? 'text-red-400 animate-pulse' : 'text-yellow-400'}`}>
              {formatTime(session.timeRemaining)}
            </div>
            <button 
              onClick={togglePause}
              className="mt-2 bg-blue-600 text-white font-mono px-4 py-1 text-sm border-2 border-blue-400 hover:bg-blue-500 transition-colors"
            >
              {session.gameState === 'paused' ? 'RESUME' : 'PAUSE'}
            </button>
          </div>
          
          <div className="text-yellow-400 font-mono text-lg font-bold">
            {session.selectedFighter.name}
          </div>
        </div>

        {/* Combat area */}
        <div className="flex-1 flex items-center justify-between px-8 py-4">
          
          {/* Player fighter */}
          <div className="flex flex-col items-center">
            <div className="mb-4">
              <div className="text-yellow-400 font-mono text-lg font-bold mb-2">{session.selectedFighter.name}</div>
              <div className="w-48 h-4 bg-gray-800 border-2 border-white rounded">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-yellow-500 transition-all duration-500 rounded"
                  style={{ width: `${session.fighterHP}%` }}
                ></div>
              </div>
              <div className="text-white font-mono text-sm mt-1 text-center">{session.fighterHP} HP</div>
            </div>
            
            <div className={`w-48 h-72 bg-gradient-to-b from-cyan-900 to-blue-900 border-2 border-cyan-400 flex items-center justify-center rounded-lg
                           ${session.fighterHP < 30 ? 'animate-pulse' : ''} 
                           ${session.gameState === 'victory' ? 'animate-bounce' : ''}`}>
              <div className="text-cyan-400 font-mono text-xl text-center font-bold">
                {session.selectedFighter.name.split(' ').map(word => word.substring(0, 4)).join('\n')}
              </div>
            </div>
          </div>

          {/* Task list - center */}
          <div className="flex-1 max-w-md mx-8">
            <div className="bg-black bg-opacity-80 border-2 border-yellow-400 p-6 max-h-96 overflow-y-auto rounded-lg">
              <h3 className="text-yellow-400 font-mono text-lg font-bold mb-4 text-center">BATTLE TASKS</h3>
              
              {session.tasks.length === 0 ? (
                <div className="text-white font-mono text-center">NO TASKS LOADED</div>
              ) : (
                <div className="space-y-3">
                  {session.tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-gray-900 border border-gray-600 rounded">
                      <div className="flex-1">
                        <div className={`font-mono text-sm font-bold ${task.completed ? 'text-green-400 line-through' : 'text-white'}`}>
                          {task.name}
                        </div>
                        <div className="text-gray-400 text-xs">{task.estimatedTime} min</div>
                      </div>
                      
                      {!task.completed && session.gameState === 'fighting' && (
                        <button
                          onClick={() => completeTask(task.id)}
                          className="bg-red-600 text-white font-mono px-3 py-1 text-xs border-2 border-red-400 hover:bg-red-500 transition-colors ml-2"
                        >
                          COMPLETE
                        </button>
                      )}
                      
                      {task.completed && (
                        <div className="text-green-400 font-mono text-xs font-bold">✓ DONE</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Opponent fighter */}
          <div className="flex flex-col items-center">
            <div className="mb-4">
              <div className="text-red-400 font-mono text-lg font-bold mb-2">PROCRASTINATION</div>
              <div className="w-48 h-4 bg-gray-800 border-2 border-white rounded">
                <div 
                  className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-500 rounded"
                  style={{ width: `${session.opponentHP}%` }}
                ></div>
              </div>
              <div className="text-white font-mono text-sm mt-1 text-center">{session.opponentHP} HP</div>
            </div>
            
            <div className={`w-48 h-72 bg-gradient-to-b from-red-900 to-black border-2 border-red-500 flex items-center justify-center rounded-lg
                           ${session.opponentHP < 30 ? 'animate-pulse' : ''} 
                           ${session.gameState === 'defeat' ? 'animate-bounce' : ''}`}>
              <div className="text-red-400 font-mono text-2xl text-center font-bold">
                LAZY<br/>MODE
              </div>
            </div>
          </div>
        </div>

        {/* Game state overlay */}
        {session.gameState === 'paused' && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-20">
            <div className="text-center p-8 bg-black bg-opacity-80 border-2 border-yellow-400 rounded-lg">
              <h2 className="text-yellow-400 font-mono text-4xl font-bold mb-4">GAME PAUSED</h2>
              <button 
                onClick={togglePause}
                className="bg-red-600 text-white font-mono px-6 py-3 border-2 border-red-400 hover:bg-red-500 transition-colors"
              >
                RESUME FIGHT
              </button>
            </div>
          </div>
        )}

        {session.gameState === 'victory' && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-20">
            <div className="text-center p-8 bg-black bg-opacity-80 border-2 border-yellow-400 rounded-lg">
              <h2 className="text-yellow-400 font-mono text-6xl font-bold mb-4 animate-pulse">VICTORY!</h2>
              <p className="text-white font-mono text-lg mb-6">All tasks completed! You are the champion!</p>
              <div className="space-x-4">
                <button 
                  onClick={() => navigate('/quick-battle')}
                  className="bg-red-600 text-white font-mono px-6 py-3 border-2 border-red-400 hover:bg-red-500 transition-colors"
                >
                  NEW BATTLE
                </button>
                <button 
                  onClick={() => navigate('/')}
                  className="bg-blue-600 text-white font-mono px-6 py-3 border-2 border-blue-400 hover:bg-blue-500 transition-colors"
                >
                  MAIN MENU
                </button>
              </div>
            </div>
          </div>
        )}

        {session.gameState === 'defeat' && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-20">
            <div className="text-center p-8 bg-black bg-opacity-80 border-2 border-red-400 rounded-lg">
              <h2 className="text-red-400 font-mono text-6xl font-bold mb-4 animate-pulse">DEFEATED!</h2>
              <p className="text-white font-mono text-lg mb-6">Time ran out! Procrastination wins this round.</p>
              <div className="space-x-4">
                <button 
                  onClick={() => navigate('/quick-battle')}
                  className="bg-red-600 text-white font-mono px-6 py-3 border-2 border-red-400 hover:bg-red-500 transition-colors"
                >
                  TRY AGAIN
                </button>
                <button 
                  onClick={() => navigate('/')}
                  className="bg-blue-600 text-white font-mono px-6 py-3 border-2 border-blue-400 hover:bg-blue-500 transition-colors"
                >
                  MAIN MENU
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom status bar */}
        <div className="bg-black bg-opacity-80 p-3 text-center border-t-2 border-cyan-400">
          <div className="text-yellow-400 font-mono text-sm">
            Click anywhere to start background music • Complete tasks to deal damage • Don't let time run out!
          </div>
        </div>
      </div>
    </div>
  );
};

export default FightScreen;