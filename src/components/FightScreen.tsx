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

interface TaskTimer {
  taskId: string;
  estimatedTime: number; // minutes
  timeRemaining: number; // seconds
  isActive: boolean;
  hasFailed: boolean;
  isInGracePeriod: boolean;
  startTime: number; // when this task timer started (for accuracy)
}

interface GracePeriodState {
  isActive: boolean;
  taskId: string | null;
  timeRemaining: number; // 10 seconds
}

interface FightSession {
  selectedFighter: Fighter;
  opponent: Fighter;
  tasks: Task[];
  timeRemaining: number;
  fighterHP: number;
  opponentHP: number;
  gameState: 'intro' | 'fighting' | 'paused' | 'victory' | 'defeat';
  gameMode: 'quick-battle' | 'tournament';
  currentRound: number;
  stage: string;
  currentTaskIndex: number;
  taskTimers: TaskTimer[];
  failedTasks: string[];
  gracePeriod: GracePeriodState;
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

// Available stages
const AVAILABLE_STAGES = [
  'construction-floor.webp',
  'rooftop.webp',
  'cargo-hold.webp', 
  'alien-hive.webp',
];

// Speech Bubble Component
const SpeechBubble: React.FC<{ text: string; isLeft: boolean }> = ({ text, isLeft }) => (
<div className={`absolute z-40 animate-bounce max-w-xs`}
     style={{ 
       left: isLeft ? '55%' : '15%',  // Player: 30% → 55% (right), Opponent: 70% → 15% (left)
       top: '10%',                    // Both: top-32 → 10% (higher up)
       transform: 'translateX(-50%)'
     }}>
    <div className="bg-white text-black p-4 rounded-lg border-4 border-gray-800 relative font-mono text-sm font-bold shadow-xl">
      "{text}"
      {/* Downward pointing tail */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 
                      border-l-[12px] border-r-[12px] border-t-[15px] 
                      border-l-transparent border-r-transparent border-t-white"></div>
      <div className="absolute left-1/2 transform -translate-x-1/2 w-0 h-0 
                      border-l-[15px] border-r-[15px] border-t-[18px] 
                      border-l-transparent border-r-transparent border-t-gray-800"
           style={{ top: 'calc(100% - 3px)' }}></div>
    </div>
  </div>
);

// Countdown Overlay Component
const CountdownOverlay: React.FC<{ number: number; phase: string }> = ({ number, phase }) => {
  if (phase === 'countdown') {
    return (
      <div className="absolute inset-0 flex items-center justify-center z-50">
        <div className="text-yellow-400 font-mono font-black text-[12rem] 
                        animate-pulse transform transition-transform duration-200 
                        drop-shadow-[0_0_20px_rgba(255,255,0,0.8)]">
          {number}
        </div>
      </div>
    );
  }
  
  if (phase === 'on-task') {
    return (
      <div className="absolute inset-0 flex items-center justify-center z-50">
        <img 
          src="/images/on-task.png" 
          alt="ON TASK!"
          className="max-w-md max-h-64 object-contain transform"
          style={{
            animation: 'growShrink 4s ease-in-out'
          }}
          onError={(e) => {
            // Fallback to text if image doesn't exist
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            // Show text fallback
            const fallback = target.parentElement?.querySelector('.text-fallback') as HTMLElement;
            if (fallback) fallback.style.display = 'block';
          }}
        />
        
        {/* Fallback text if image fails */}
        <div className="text-fallback text-red-400 font-mono font-black text-8xl 
                        transform transition-all duration-1000
                        drop-shadow-[0_0_30px_rgba(255,0,0,0.8)]"
             style={{
               animation: 'growShrink 4s ease-in-out',
               display: 'none'
             }}>
          ON TASK!
        </div>
      </div>
    );
  }
  
  return null;
};

const FightScreen: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<{ [key: string]: HTMLAudioElement }>({});

  // Get data from navigation state
  const { selectedFighter, tasks: initialTasks, gameMode = 'quick-battle', currentRound = 1 } = location.state || {};

  // Intro animation states
  const [introPhase, setIntroPhase] = useState<'intro' | 'player-quip' | 'opponent-quip' | 'countdown' | 'on-task' | 'fighting'>('intro');
  const [countdownNumber, setCountdownNumber] = useState(5);
  const [musicStarted, setMusicStarted] = useState(false);
  const [audioInitialized, setAudioInitialized] = useState(false);
  
  // Skip system
  const introTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [canSkip, setCanSkip] = useState(true);

  // Helper function to get opponent
  const getOpponent = (playerFighter: Fighter, mode: string, round: number): Fighter | null => {
    if (!playerFighter) return null;
    
    if (mode === 'quick-battle') {
      const counterpartId = COUNTERPARTS[playerFighter.id];
      const counterpart = fighters.find((f: any) => f.id === counterpartId);
      return counterpart || null;
    } else {
      const availableOpponents = fighters.filter((f: any) => f.id !== playerFighter.id);
      const opponentIndex = (round - 1) % availableOpponents.length;
      return availableOpponents[opponentIndex] || null;
    }
  };

  // Helper function to get stage
  const getStage = (playerFighter: Fighter, mode: string, round: number): string => {
    if (!playerFighter) return 'construction-floor.webp';
    
    if (mode === 'quick-battle' || round === 1) {
      const stageMapping: { [key: string]: string } = {
        'jack-tower': 'construction-floor.webp',
        'prof-kruber': 'rooftop.webp',
        'ellen-ryker': 'cargo-hold.webp',
        'queen-chroma': 'alien-hive.webp',
        'jawsome': 'ocean-shallows.webp',
        'beach-belle': 'lifeguard-deck.webp',
        'raging-stallion': 'boxing-ring.webp',
        'iron-titan': 'moscow-ring.webp',
        'bond-sterling': 'casino-terrace.webp',
        'dr-whiskers': 'volcano-lair.webp',
        'waves-mcrad': 'construction-floor.webp',
        'gen-buzzkill': 'construction-floor.webp'
      };
      
      const mappedStage = stageMapping[playerFighter.id];
      if (mappedStage && AVAILABLE_STAGES.includes(mappedStage)) {
        return mappedStage;
      }
      
      return 'construction-floor.webp';
    } else {
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
    timeRemaining: 25 * 60,
    fighterHP: 100,
    opponentHP: 100,
    gameState: 'intro',
    gameMode: gameMode,
    currentRound: currentRound,
    stage: stageBackground,
    currentTaskIndex: 0,
    taskTimers: [],
    failedTasks: [],
    gracePeriod: {
      isActive: false,
      taskId: null,
      timeRemaining: 0
    }
  });

  const initializeTaskTimers = (tasks: Task[]): TaskTimer[] => {
    return tasks.map((task, index) => ({
      taskId: task.id,
      estimatedTime: task.estimatedTime,
      timeRemaining: task.estimatedTime * 60,
      isActive: index === 0,
      hasFailed: false,
      isInGracePeriod: false,
      startTime: index === 0 ? Date.now() : 0
    }));
  };

  // Intro Animation Sequence
  useEffect(() => {
    if (session.gameState === 'intro') {
      const sequence = async () => {
        try {
          // Phase 1: Players bounce (2 seconds)
          setIntroPhase('intro');
          await new Promise(resolve => {
            introTimeoutRef.current = setTimeout(resolve, 2000);
          });
          
          // Phase 2: Player quip (2.5 seconds)
          setIntroPhase('player-quip');
          await new Promise(resolve => {
            introTimeoutRef.current = setTimeout(resolve, 2500);
          });
          
          // Phase 3: Opponent quip (2.5 seconds)  
          setIntroPhase('opponent-quip');
          await new Promise(resolve => {
            introTimeoutRef.current = setTimeout(resolve, 2500);
          });
          
          // Phase 4: Countdown 5→1
          setIntroPhase('countdown');
          for (let i = 5; i >= 1; i--) {
            setCountdownNumber(i);
            await new Promise(resolve => {
              introTimeoutRef.current = setTimeout(resolve, 800);
            });
          }
          
          // Phase 5: "ON TASK!" (4 seconds)
          setIntroPhase('on-task');
          await new Promise(resolve => {
            introTimeoutRef.current = setTimeout(resolve, 4000);
          });
          
          // Phase 6: Start fighting!
          setSession(prev => ({ ...prev, gameState: 'fighting' }));
          setIntroPhase('fighting');
          setCanSkip(false);
        } catch (error) {
          // Sequence was interrupted (skipped)
          console.log('🏃 Intro sequence skipped');
        }
      };
      
      sequence();
    }
    
    // Cleanup timeout on unmount
    return () => {
      if (introTimeoutRef.current) {
        clearTimeout(introTimeoutRef.current);
      }
    };
  }, [session.gameState]);

  // Skip intro phase
  const skipIntroPhase = () => {
    if (!canSkip || session.gameState !== 'intro') return;
    
    console.log(`⏭️ Skipping intro phase: ${introPhase}`);
    
    // Cancel current timeout
    if (introTimeoutRef.current) {
      clearTimeout(introTimeoutRef.current);
      introTimeoutRef.current = null;
    }
    
    // Advance to next phase
    switch (introPhase) {
      case 'intro':
        setIntroPhase('player-quip');
        break;
      case 'player-quip':
        setIntroPhase('opponent-quip');
        break;
      case 'opponent-quip':
        setIntroPhase('countdown');
        setCountdownNumber(5);
        break;
      case 'countdown':
        setIntroPhase('on-task');
        break;
      case 'on-task':
        setSession(prev => ({ ...prev, gameState: 'fighting' }));
        setIntroPhase('fighting');
        setCanSkip(false);
        break;
      default:
        break;
    }
  };

  // Audio setup
  useEffect(() => {
    const sounds = ['punch', 'grunt', 'victory'];
    sounds.forEach(sound => {
      audioRef.current[sound] = new Audio(`/sfx/${sound}.wav`);
      audioRef.current[sound].preload = 'auto';
      audioRef.current[sound].volume = 0.7;
    });
    
    audioRef.current['bg-music'] = new Audio('/sfx/fight-music.mp3');
    audioRef.current['bg-music'].loop = true;
    audioRef.current['bg-music'].volume = 0.3;
  }, []);

  // Initialize audio context (required for browser autoplay restrictions)
  const initializeAudio = () => {
    if (!audioInitialized) {
      console.log('🎵 Initializing audio context...');
      
      // Try to play and immediately pause each sound to "unlock" them
      Object.entries(audioRef.current).forEach(([name, audio]) => {
        if (audio && typeof audio.play === 'function') {
          audio.play().then(() => {
            audio.pause();
            audio.currentTime = 0;
            console.log(`✅ Audio unlocked: ${name}`);
          }).catch((error) => {
            console.log(`❌ Audio unlock failed for ${name}:`, error);
          });
        }
      });
      
      setAudioInitialized(true);
    }
  };

  // Play sound effect
  const playSound = (soundName: string) => {
    console.log(`🔊 Attempting to play sound: ${soundName}`);
    
    if (audioRef.current[soundName]) {
      audioRef.current[soundName].currentTime = 0;
      audioRef.current[soundName].play().then(() => {
        console.log(`✅ Successfully played: ${soundName}`);
      }).catch((error) => {
        console.log(`❌ Failed to play ${soundName}:`, error);
        // If audio fails and not initialized, try to initialize
        if (!audioInitialized) {
          initializeAudio();
        }
      });
    } else {
      console.log(`❌ Audio file not found: ${soundName}`);
    }
  };

  // Dual timer logic - session timer + individual task timers
  useEffect(() => {
    if (session.gameState === 'fighting' && session.timeRemaining > 0) {
      // Initialize task timers on first run
      if (session.taskTimers.length === 0 && session.tasks.length > 0) {
        const initialTimers = initializeTaskTimers(session.tasks);
        setSession(prev => ({ ...prev, taskTimers: initialTimers }));
        return;
      }

      const startTime = Date.now();
      const expectedTime = session.timeRemaining * 1000;

      timerRef.current = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, expectedTime - elapsedTime);
        const remainingSeconds = Math.ceil(remainingTime / 1000);

        setSession(prev => {
          // Update main session timer
          if (remainingSeconds <= 0) {
            // Session time expired
            const newFighterHP = Math.max(0, prev.fighterHP - 20);
            playSound('grunt');
            
            if (newFighterHP <= 0) {
              return { ...prev, timeRemaining: 0, fighterHP: 0, gameState: 'defeat' };
            }
            
            return { ...prev, timeRemaining: 0, fighterHP: newFighterHP };
          }

          // Update individual task timers
          const updatedTaskTimers = prev.taskTimers.map((timer, index) => {
            if (!timer.isActive || timer.hasFailed) return timer;

const taskElapsed = Date.now() - timer.startTime;
const totalTaskTime = timer.estimatedTime * 60 * 1000; // total time in milliseconds  
const taskRemaining = Math.max(0, totalTaskTime - taskElapsed);
const taskRemainingSeconds = Math.ceil(taskRemaining / 1000);

            // Check if task time expired
            if (taskRemainingSeconds <= 0 && !timer.isInGracePeriod) {
              // Start grace period
              return {
                ...timer,
                timeRemaining: 0,
                isInGracePeriod: true
              };
            }

            return {
              ...timer,
              timeRemaining: Math.max(0, taskRemainingSeconds)
            };
          });

          return {
            ...prev,
            timeRemaining: remainingSeconds,
            taskTimers: updatedTaskTimers
          };
        });
      }, 100);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [session.gameState, session.timeRemaining, session.taskTimers.length]);

  // Complete a task - ENHANCED WITH TASK TIMER LOGIC
  const completeTask = (taskId: string) => {
    console.log(`⚔️ Completing task: ${taskId}`);
    
    setSession(prev => {
      const updatedTasks = prev.tasks.map(task => 
        task.id === taskId ? { ...task, completed: true } : task
      );
      
      const completedTask = prev.tasks.find(task => task.id === taskId);
      const taskIndex = prev.tasks.findIndex(task => task.id === taskId);
      
      const damagePerTask = completedTask ? completedTask.estimatedTime * 4 : 20;
      const newOpponentHP = Math.max(0, prev.opponentHP - damagePerTask);
      
      console.log(`💥 Dealing ${damagePerTask} damage (${completedTask?.estimatedTime} min task). Opponent HP: ${prev.opponentHP} → ${newOpponentHP}`);
      
      playSound('punch');
      
      const updatedTaskTimers = prev.taskTimers.map((timer, index) => {
        if (timer.taskId === taskId) {
          return { ...timer, isActive: false, isInGracePeriod: false };
        }
        if (index === taskIndex + 1) {
          return { ...timer, isActive: true, startTime: Date.now() };
        }
        return timer;
      });

      const updatedGracePeriod = prev.gracePeriod.taskId === taskId 
        ? { isActive: false, taskId: null, timeRemaining: 0 }
        : prev.gracePeriod;
      
      const allTasksComplete = updatedTasks.every(task => task.completed);
      if (allTasksComplete || newOpponentHP <= 0) {
        console.log('🏆 Victory condition met!');
        playSound('victory');
        return {
          ...prev,
          tasks: updatedTasks,
          opponentHP: newOpponentHP,
          gameState: 'victory',
          taskTimers: updatedTaskTimers,
          gracePeriod: updatedGracePeriod,
          currentTaskIndex: taskIndex + 1
        };
      }
      
      return {
        ...prev,
        tasks: updatedTasks,
        opponentHP: newOpponentHP,
        taskTimers: updatedTaskTimers,
        gracePeriod: updatedGracePeriod,
        currentTaskIndex: taskIndex + 1
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

  // Start background music and initialize audio on first interaction
  const handleFirstInteraction = () => {
    console.log('🎮 First user interaction detected');
    
    // Initialize audio context
    initializeAudio();
    
    // Start background music
    if (!musicStarted && audioRef.current['bg-music']) {
      audioRef.current['bg-music'].play().catch(() => {});
      setMusicStarted(true);
    }
  };

  // Handle clicks during intro (skip) vs fighting (audio)
  const handleScreenClick = () => {
    // During intro: skip to next phase
    if (canSkip && session.gameState === 'intro') {
      skipIntroPhase();
    } else {
      // During fighting: initialize audio
      handleFirstInteraction();
    }
  };

  // Get currently active task
  const getCurrentTask = () => {
    const activeTimer = session.taskTimers.find(timer => timer.isActive);
    if (!activeTimer) return null;
    
    const task = session.tasks.find(task => task.id === activeTimer.taskId);
    return { task, timer: activeTimer };
  };

  // Format time for task timer display
  const formatTaskTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

  // Get fighter animation based on intro phase
  const getFighterAnimation = (isPlayer: boolean) => {
    if (introPhase === 'intro') {
      return 'animate-bounce'; // Both fighters bounce during intro
    }
    if (introPhase === 'player-quip' && isPlayer) {
      return 'animate-pulse'; // Player pulses during their quip
    }
    if (introPhase === 'opponent-quip' && !isPlayer) {
      return 'animate-pulse'; // Opponent pulses during their quip
    }
    if (session.gameState === 'fighting') {
      if (isPlayer && session.fighterHP < 30) return 'animate-pulse';
      if (!isPlayer && session.opponentHP < 30) return 'animate-pulse';
      if (isPlayer && session.gameState === 'victory') return 'animate-bounce';
      if (!isPlayer && session.gameState === 'defeat') return 'animate-bounce';
    }
    return '';
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
      onClick={handleScreenClick}
    >
      {/* Background image */}
      <img 
        src={`/stages/${session.stage}`}
        alt="Stage background"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ zIndex: 0 }}
        onLoad={() => console.log('✅ Background image loaded successfully:', session.stage)}
        onError={(e) => {
          console.log('❌ Background image failed to load:', session.stage);
        }}
      />
      
      {/* Fallback gradient background */}
      <div 
        className="absolute inset-0 w-full h-full bg-gradient-to-b from-purple-900 via-blue-900 to-black"
        style={{ zIndex: -1 }}
      ></div>
      
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black bg-opacity-30" style={{ zIndex: 1 }}></div>
      
      {/* Main content */}
      <div className="relative min-h-screen flex flex-col" style={{ zIndex: 2 }}>
        
        {/* Header with HP bars and timer - only show during fighting */}
        {(session.gameState === 'fighting' || session.gameState === 'paused' || session.gameState === 'victory' || session.gameState === 'defeat') && (
          <div className="flex justify-between items-center p-4 bg-black bg-opacity-60 border-b-2 border-cyan-400">
            <div className="flex flex-col items-center">
              <div className="text-yellow-400 font-mono text-lg font-bold mb-2">{session.selectedFighter.name}</div>
              <div className="w-48 h-4 bg-gray-800 border-2 border-white rounded">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-yellow-500 transition-all duration-500 rounded"
                  style={{ width: `${session.fighterHP}%` }}
                ></div>
              </div>
              <div className="text-white font-mono text-sm mt-1">{Math.round(session.fighterHP)} HP</div>
            </div>
            
            <div className="text-center">
              {/* Main Session Timer */}
              <div className={`font-mono text-4xl font-bold ${session.timeRemaining < 300 ? 'text-red-400 animate-pulse' : 'text-yellow-400'}`}>
                {formatTime(session.timeRemaining)}
              </div>
              
              {/* Current Task Timer */}
              {getCurrentTask() && (
                <div className="mt-2">
                  <div className="text-cyan-400 font-mono text-sm">
                    Task {session.currentTaskIndex + 1}: {getCurrentTask()?.task?.name}
                  </div>
                  <div className={`font-mono text-lg font-bold ${
                    getCurrentTask()?.timer?.timeRemaining <= 30 ? 'text-red-400 animate-pulse' : 'text-cyan-400'
                  }`}>
                    {formatTaskTime(getCurrentTask()?.timer?.timeRemaining || 0)}
                  </div>
                </div>
              )}
              
              <button 
                onClick={togglePause}
                className="mt-2 bg-blue-600 text-white font-mono px-4 py-1 text-sm border-2 border-blue-400 hover:bg-blue-500 transition-colors"
              >
                {session.gameState === 'paused' ? 'RESUME' : 'PAUSE'}
              </button>
            </div>
            
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
              <div className="text-white font-mono text-sm mt-1">{Math.round(session.opponentHP)} HP</div>
            </div>
          </div>
        )}

        {/* Combat area */}
        <div className="flex-1 flex items-center justify-between px-8 py-8"
             style={{ height: 'calc(100vh - 160px)' }}>
          
          {/* Player fighter */}
          <div className="flex flex-col items-center justify-start h-full relative">
            <div className={`w-80 h-[500px] flex flex-col items-center justify-start relative mt-8
                           ${getFighterAnimation(true)}`}>
              <img 
                src={session.selectedFighter.full}
                alt={session.selectedFighter.name}
                className="w-full h-full object-contain object-bottom"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
            
            {/* Player speech bubble */}
            {introPhase === 'player-quip' && (
              <SpeechBubble text={session.selectedFighter.quip} isLeft={true} />
            )}
          </div>

          {/* Task list - center - only show during fighting */}
          {(session.gameState === 'fighting' || session.gameState === 'paused' || session.gameState === 'victory' || session.gameState === 'defeat') && (
            <div className="flex-1 max-w-md mx-8 flex flex-col items-center">
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
                          <div className="text-gray-400 text-xs">{task.estimatedTime} min ({task.estimatedTime * 4} damage)</div>
                        </div>
                        
                        {!task.completed && session.gameState === 'fighting' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              completeTask(task.id);
                            }}
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
          )}

          {/* Opponent fighter */}
          <div className="flex flex-col items-center justify-start h-full relative">
            <div className={`w-80 h-[500px] flex flex-col items-center justify-start relative mt-8
                           ${getFighterAnimation(false)}`}>
              <img 
                src={session.opponent?.full || ''}
                alt={session.opponent?.name || 'No opponent'}
                className="w-full h-full object-contain object-bottom"
                style={{ transform: 'scaleX(-1)' }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
            
            {/* Opponent speech bubble */}
            {introPhase === 'opponent-quip' && session.opponent && (
              <SpeechBubble text={session.opponent.quip} isLeft={false} />
            )}
          </div>
        </div>

        {/* Countdown Overlay */}
        <CountdownOverlay number={countdownNumber} phase={introPhase} />

        {/* Skip hint during intro */}
        {canSkip && session.gameState === 'intro' && (
          <div className="absolute top-4 right-4 z-50">
            <div className="bg-black bg-opacity-80 text-yellow-400 font-mono text-sm px-3 py-2 rounded border border-yellow-400 animate-pulse">
              Click to skip ⏭️
            </div>
          </div>
        )}

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

        {/* Bottom status bar - only show during fighting */}
        {(session.gameState === 'fighting' || session.gameState === 'paused' || session.gameState === 'victory' || session.gameState === 'defeat') && (
          <div className="bg-black bg-opacity-80 p-3 text-center border-t-2 border-cyan-400">
            <div className="text-yellow-400 font-mono text-sm">
              Click anywhere to start audio • Complete tasks to deal damage • Don't let time run out!
            </div>
            <div className="text-cyan-400 font-mono text-xs mt-1">
              Mode: {session.gameMode} | Opponent: {session.opponent?.name || 'Loading...'} | Stage: /stages/{session.stage} | Audio: {audioInitialized ? '✅' : '❌'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FightScreen;