import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import fighters from '../data/fighters.json';

interface Fighter {
  id: string;
  name: string;
  portrait: string;
  full: string;
  quip: string;
  stageBg: string;
}

interface Task {
  id: string;
  name: string;
  estimatedTime: number;
  completed: boolean;
}

interface FightSession {
  selectedFighter: Fighter;
  opponent: Fighter;
  tasks: Task[];
  timeRemaining: number;
  fighterHP: number;
  opponentHP: number;
  gameState: 'fighting' | 'paused' | 'victory' | 'defeat';
  gameMode: 'quick-battle' | 'tournament';
  currentRound: number;
  stage: string;
}

// Character counterpart mappings
const COUNTERPARTS: { [key: string]: string } = {
  'jack-tower': 'prof-kruber',
  'prof-kruber': 'jack-tower',
  'jawsome': 'beach-belle',
  'beach-belle': 'jawsome',
  'ellen-ryker': 'queen-chroma',
  'queen-chroma': 'ellen-ryker',
  'raging-stallion': 'iron-titan',
  'iron-titan': 'raging-stallion',
  'bond-sterling': 'dr-whiskers',
  'dr-whiskers': 'bond-sterling',
  'waves-mcrad': 'gen-buzzkill',
  'gen-buzzkill': 'waves-mcrad'
};

// Available stages (using your existing stage files)
const AVAILABLE_STAGES = [
  'rooftop.png',
  'ocean-shallows.png', 
  'volcano-lair.png',
  'beach-pier.png',
  'moscow-ring.png'
];

const FightScreen: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<{ [key: string]: HTMLAudioElement }>({});

  // Get data from navigation state
  const { selectedFighter, tasks: initialTasks, gameMode = 'quick-battle', currentRound = 1 } = location.state || {};

  // Helper function to get opponent
  const getOpponent = (playerFighter: Fighter, mode: string, round: number): Fighter | null => {
    if (!playerFighter) return null;
    
    if (mode === 'quick-battle') {
      // Quick Battle: Fight counterpart
      const counterpartId = COUNTERPARTS[playerFighter.id];
      const counterpart = fighters.find((f: any) => f.id === counterpartId);
      return counterpart || null;
    } else {
      // Tournament: Random opponent (different each round)
      const availableOpponents = fighters.filter((f: any) => f.id !== playerFighter.id);
      const opponentIndex = (round - 1) % availableOpponents.length;
      return availableOpponents[opponentIndex] || null;
    }
  };

  // Helper function to get stage
  const getStage = (playerFighter: Fighter, mode: string, round: number): string => {
    if (!playerFighter) return AVAILABLE_STAGES[0];
    
    if (mode === 'quick-battle' || round === 1) {
      // Quick Battle or Tournament Round 1: Use player's stage (if available)
      const stageMapping: { [key: string]: string } = {
        'jack-tower': 'rooftop.png',
        'prof-kruber': 'rooftop.png',
        'jawsome': 'ocean-shallows.png',
        'beach-belle': 'ocean-shallows.png',
        'ellen-ryker': 'volcano-lair.png',
        'queen-chroma': 'volcano-lair.png',
        'raging-stallion': 'moscow-ring.png',
        'iron-titan': 'moscow-ring.png',
        'bond-sterling': 'volcano-lair.png',
        'dr-whiskers': 'volcano-lair.png',
        'waves-mcrad': 'beach-pier.png',
        'gen-buzzkill': 'beach-pier.png'
      };
      
      const mappedStage = stageMapping[playerFighter.id];
      if (mappedStage && AVAILABLE_STAGES.includes(mappedStage)) {
        return mappedStage;
      }
      
      // Fallback to first available stage
      return AVAILABLE_STAGES[0];
    } else {
      // Tournament later rounds: Random stage
      const stageIndex = (round - 1) % AVAILABLE_STAGES.length;
      return AVAILABLE_STAGES[stageIndex];
    }
  };

  const opponent = selectedFighter ? getOpponent(selectedFighter, gameMode, currentRound) : null;
  const stageBackground = selectedFighter ? getStage(selectedFighter, gameMode, currentRound) : AVAILABLE_STAGES[0];

  const [session, setSession] = useState<FightSession>({
    selectedFighter: selectedFighter || null,
    opponent: opponent,
    tasks: initialTasks?.map((task: any, index: number) => ({
      ...task,
      id: task.id || `task-${index}`,
      completed: false
    })) || [],
    timeRemaining: 25 * 60, // 25 minutes in seconds
    fighterHP: 100,
    opponentHP: 100,
    gameState: 'fighting',
    gameMode: gameMode,
    currentRound: currentRound,
    stage: stageBackground
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
      }, 100);

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
      className="min-h-screen relative overflow-hidden"
      onClick={startMusic}
    >
      {/* Background image */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url('/stages/${session.stage}')`,
          zIndex: 0
        }}
      ></div>
      
      {/* Lighter dark overlay for readability */}
      <div className="absolute inset-0 bg-black bg-opacity-30" style={{ zIndex: 1 }}></div>
      
      {/* Main content */}
      <div className="relative min-h-screen flex flex-col" style={{ zIndex: 2 }}>
        
        {/* Header with HP bars and timer */}
        <div className="flex justify-between items-center p-4 bg-black bg-opacity-60 border-b-2 border-cyan-400">
          {/* Left - Player HP Bar */}
          <div className="flex flex-col items-center">
            <div className="text-yellow-400 font-mono text-lg font-bold mb-2">{session.selectedFighter.name}</div>
            <div className="w-48 h-4 bg-gray-800 border-2 border-white rounded">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-yellow-500 transition-all duration-500 rounded"
                style={{ width: `${session.fighterHP}%` }}
              ></div>
            </div>
            <div className="text-white font-mono text-sm mt-1">{session.fighterHP} HP</div>
          </div>
          
          {/* Center - Timer */}
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
          
          {/* Right - Opponent HP Bar */}
          <div className="flex flex-col items-center">
            <div className="text-red-400 font-mono text-lg font-bold mb-2">
              {session.opponent ? session.opponent.name : 'PROCRASTINATION'}
            </div>
            <div className="w-48 h-4 bg-gray-800 border-2 border-white rounded">
              <div 
                className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-500 rounded"
                style={{ width: `${session.opponentHP}%` }}
              ></div>
            </div>
            <div className="text-white font-mono text-sm mt-1">{session.opponentHP} HP</div>
          </div>
        </div>

        {/* Combat area */}
        <div className="flex-1 flex items-center justify-between px-8 py-8"
             style={{ height: 'calc(100vh - 160px)' }}>
          
          {/* Player fighter */}
          <div className="flex flex-col items-center justify-center h-full">
            <div className={`w-72 h-96 flex flex-col items-center justify-center relative
                           ${session.fighterHP < 30 ? 'animate-pulse' : ''} 
                           ${session.gameState === 'victory' ? 'animate-bounce' : ''}`}>
              <img 
                src={session.selectedFighter.full}
                alt={session.selectedFighter.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              <div className="absolute bottom-0 text-cyan-400 font-mono text-sm text-center bg-black bg-opacity-80 px-3 py-2 rounded max-w-full">
                "{session.selectedFighter.quip}"
              </div>
            </div>
          </div>

          {/* Task list - center */}
          <div className="flex-1 max-w-md mx-8 flex flex-col items-center">
            {/* Quick Battle Title */}
            <h2 className="text-red-400 font-mono text-2xl font-bold mb-4">
              {session.gameMode === 'tournament' ? `ROUND ${session.currentRound}` : 'QUICK BATTLE'}
            </h2>
            
            <div className="bg-black bg-opacity-80 border-2 border-yellow-400 p-6 max-h-96 overflow-y-auto rounded-lg w-full">
              <h3 className="text-yellow-400 font-mono text-lg font-bold mb-4 text-center">
                BATTLE TASKS ({completedTasks}/{totalTasks})
              </h3>
              
              {session.tasks.length === 0 ? (
                <div className="text-white font-mono text-center">
                  <div className="mb-2">NO TASKS LOADED</div>
                  <div className="text-xs text-gray-400">Go to Quick Battle → Add tasks → Fighter Select → Fight</div>
                </div>
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

          {/* Opponent fighter - EXACT SAME SIZE AS PLAYER */}
          <div className="flex flex-col items-center justify-center h-full">
            <div className={`w-72 h-96 flex flex-col items-center justify-center relative
                           ${session.opponentHP < 30 ? 'animate-pulse' : ''} 
                           ${session.gameState === 'defeat' ? 'animate-bounce' : ''}`}>
              {session.opponent ? (
                <>
                  <img 
                    src={session.opponent.full}
                    alt={session.opponent.name}
                    className="w-full h-full object-contain"
                    style={{ transform: 'scaleX(-1)' }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <div className="absolute bottom-0 text-red-400 font-mono text-sm text-center bg-black bg-opacity-80 px-3 py-2 rounded max-w-full">
                    "{session.opponent.quip}"
                  </div>
                </>
              ) : (
                <div className="w-full h-full bg-gradient-to-b from-red-900 to-black border-2 border-red-500 flex items-center justify-center rounded-lg">
                  <div className="text-red-400 font-mono text-xl text-center font-bold">
                    LAZY<br/>MODE
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Game state overlays */}
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
              <p className="text-white font-mono text-lg mb-6">
                {session.opponent ? `You defeated ${session.opponent.name}!` : 'All tasks completed!'}
              </p>
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
              <p className="text-white font-mono text-lg mb-6">
                {session.opponent ? `${session.opponent.name} wins this round!` : 'Time ran out!'}
              </p>
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
          <div className="text-cyan-400 font-mono text-xs mt-1">
            Mode: {session.gameMode} | Opponent: {session.opponent?.name || 'Loading...'} | Stage: ./stages/{session.stage}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FightScreen;