import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import fighters from '../data/fighters.json';
import BreakScreen from './BreakScreen';
import HealthBarThin from './HealthBarThin';
import { audioManager } from '../utils/audioManager';
import {
createGameSession,
updateGameSession,
addTaskToSession,
updateTaskStatus,
getCurrentUser,
updateUserStats,
updateLeaderboard
} from '../services/supabase';

// TEST MODE SPEED MULTIPLIER - Change this value to speed up timers for testing
const TEST_MODE_SPEED_MULTIPLIER = 40; // Set to 1 for normal speed, 60 for 60x speed, etc.

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
title: string;
estimatedTime: number;
completed: boolean;
}

interface TaskTimer {
taskId: string;
estimatedTime: number;
timeRemaining: number; // Always in seconds (integer)
status: 'active' | 'pending' | 'completed' | 'failed';
hasPlayedWarning?: boolean; // for 30-sec warning
damageApplied?: boolean; // prevent duplicate damage
}

interface FightSession {
selectedFighter: Fighter;
opponent: Fighter;
tasks: Task[];
timeRemaining: number; // Always in seconds (integer)
fighterHP: number;
opponentHP: number;
gameState: 'intro' | 'fighting' | 'paused' | 'victory' | 'defeat' | 'draw'; // Added 'draw' state
gameMode: 'quick-battle' | 'tournament';
currentRound: number;
stage: string;
currentTaskIndex: number;
taskTimers: TaskTimer[];
failedTasks: string[];
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

// Available stages - Updated to include all character-specific stages
const AVAILABLE_STAGES = [
'construction-floor.webp',
'rooftop.webp',
'cargo-hold.webp',
'alien-hive.webp',
'boxing-ring.webp',
'moscow-ring.webp',
'casino-terrace.webp',
'volcano-lair.webp',
'lifeguard-deck.webp',
'ocean-shallows.webp',
'coastal-skatepark.webp',
'army-base.webp'
];

/* ───────── Speech bubble (pixel-art, grows outward) ───────── */

type BubbleSide = 'left' | 'right';

const SpeechBubble: React.FC<{ text: string; side: BubbleSide }> = ({ text, side }) => {
/* size rules */
const baseW = 320;
const growAfter = 40;
const pxPerChar = 8;
const maxW = 480;

const extra = Math.max(0, text.length - growAfter)  *pxPerChar;
const bubbleW = Math.min(baseW + extra, maxW);
const bubbleH = Math.round(bubbleW*  0.5);
const textMaxW = bubbleW - 80; // 40 px padding either side

/* keep the tail fixed:                                          *
- player (left)  → anchor LEFT edge (constant 100 px)          *
- opponent (right) → anchor RIGHT edge (constant -400 px)      */
  const xOffset =
  side === 'left'
  ? 120                            // fixed anchor
  : -420 - (bubbleW - baseW);      // shift left as width grows

return (
<div
className="absolute z-40 pointer-events-none"
style={{ top: '-5%', left: '50%', transform: `translateX(${xOffset}px)` }}
>
<div
className="relative flex items-center justify-center"
style={{
width: bubbleW,
height: bubbleH,
backgroundImage: "url('/images/pixel-speech-bubble.png')",
backgroundSize: '100% 100%',
backgroundRepeat: 'no-repeat',
imageRendering: 'pixelated',
transform: side === 'right' ? 'scaleX(-1)' : undefined,
}}
>
<span
className={`font-mono font-bold leading-snug text-black text-base                       px-6 pt-2 pb-6 text-center whitespace-pre-wrap break-words ${                         side === 'right' ? 'scale-x-[-1]' : ''                       }`}
style={{ maxWidth: textMaxW }}
>
{text}
</span>
</div>
</div>
);
};

// Countdown Overlay Component
const CountdownOverlay: React.FC<{ number: number; phase: string }> = ({ number, phase }) => {
if (phase === 'countdown') {
return (
<div className="absolute inset-0 flex items-center justify-center z-50">
<div className="text-neonYel font-mono font-black text-[12rem]
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
    <div className="text-fallback text-neonRed font-mono font-black text-8xl 
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
const lastTickRef = useRef<number>(Date.now()); // Track last tick time for accurate timing

// Get data from navigation state - FIXED: Extract breakDuration properly
const { selectedFighter, tasks: initialTasks, gameMode = 'quick-battle', currentRound = 1, breakDuration = 5 } = location.state || {};

// Break screen state management
const [showBreakScreen, setShowBreakScreen] = useState(false);
const [currentBreakDuration, setCurrentBreakDuration] = useState(breakDuration); // FIXED: Initialize with passed breakDuration

// Intro animation states
const [introPhase, setIntroPhase] = useState<'intro' | 'player-quip' | 'opponent-quip' | 'countdown' | 'on-task' | 'fighting'>('intro');
const [countdownNumber, setCountdownNumber] = useState(5);
const [musicStarted, setMusicStarted] = useState(false);
const [audioInitialized, setAudioInitialized] = useState(false);
const [canSkip, setCanSkip] = useState(true);

// Database integration states
const [currentUser, setCurrentUser] = useState<any>(null);
const [gameSessionId, setGameSessionId] = useState<string | null>(null);
const [isInitializingSession, setIsInitializingSession] = useState(false);

// Skip system using useRef to avoid re-renders
const introTimeoutRef = useRef<NodeJS.Timeout | null>(null);
const currentResolveRef = useRef<(() => void) | null>(null);
const skipCountdownRef = useRef(false);

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

// Helper function to get stage - UPDATED WITH CORRECT MAPPINGS
const getStage = (playerFighter: Fighter, mode: string, round: number): string => {
if (!playerFighter) return 'construction-floor.webp';

if (mode === 'quick-battle' || round === 1) {
  const stageMapping: { [key: string]: string } = {
    // Heroes
    'jack-tower': 'construction-floor.webp',
    'ellen-ryker': 'cargo-hold.webp',
    'raging-stallion': 'boxing-ring.webp',
    'beach-belle': 'lifeguard-deck.webp',
    'bond-sterling': 'casino-terrace.webp',
    'waves-mcrad': 'coastal-skatepark.webp',
    
    // Villains
    'prof-kruber': 'rooftop.webp',
    'queen-chroma': 'alien-hive.webp',
    'iron-titan': 'moscow-ring.webp',
    'dr-whiskers': 'volcano-lair.webp',
    'jawsome': 'ocean-shallows.webp',
    'gen-buzzkill': 'army-base.webp'
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
failedTasks: []
});

// FIXED: Set break duration from location state on component mount
useEffect(() => {
if (breakDuration) {
setCurrentBreakDuration(breakDuration);
console.log(`🏖️ Break duration set to: ${breakDuration} minutes`);
}
}, [breakDuration]);

// Break screen callback functions
const handleBreakComplete = () => {
// User wants to start another pomodoro
navigate('/quick-battle');
};

const handleSkipBreak = () => {
// FIXED: User wants to skip break and go back to quick battle
navigate('/quick-battle');
};

// Watch for game state changes to trigger break screen
useEffect(() => {
if (session.gameState === 'victory' || session.gameState === 'defeat' || session.gameState === 'draw') {
// Delay showing break screen to allow victory/defeat/draw state to be processed
const timer = setTimeout(() => {
setShowBreakScreen(true);
}, 2000); // 2 second delay to show victory/defeat/draw briefly

  return () => clearTimeout(timer);
}

}, [session.gameState]);

const initializeTaskTimers = (tasks: Task[]): TaskTimer[] => {
return tasks.map((task, index) => ({
taskId: task.id,
estimatedTime: task.estimatedTime,
timeRemaining: task.estimatedTime * 60, // Convert to seconds (integer)
status: index === 0 ? 'active' : 'pending'
}));
};

// Load current user on component mount
useEffect(() => {
const loadUser = async () => {
try {
const user = await getCurrentUser();
setCurrentUser(user);
console.log('👤 Current user loaded:', user);
} catch (error) {
console.error('Error loading user:', error);
}
};

loadUser();

}, []);

// Create game session when transitioning from intro to fighting
useEffect(() => {
const createSession = async () => {
if (session.gameState === 'fighting' && !gameSessionId && !isInitializingSession && currentUser) {
setIsInitializingSession(true);

    try {
      console.log('🎮 Creating game session for user:', currentUser.user_id);
      
      const sessionData = await createGameSession({
        user_id: currentUser.user_id,
        fighter_id: session.selectedFighter.id,
        session_type: session.gameMode === 'tournament' ? 'tournament' : 'standard'
      });
      
      if (sessionData) {
        setGameSessionId(sessionData.session_id);
        console.log('✅ Game session created with ID:', sessionData.session_id);
        
        // Add tasks to the session and update task IDs with database UUIDs
        const updatedTasks = [];
        for (let i = 0; i < session.tasks.length; i++) {
          const task = session.tasks[i];
          const dbTask = await addTaskToSession({
            title: task.title,
            estimated_minutes: task.estimatedTime,
            user_id: currentUser.user_id,
            session_id: sessionData.session_id,
            round_number: session.currentRound
          });
          
          if (dbTask) {
            // Update the task with the database-generated UUID
            updatedTasks.push({
              ...task,
              id: dbTask.task_id // Use the UUID from database
            });
          } else {
            updatedTasks.push(task);
          }
        }
        
        // Update session with tasks that have proper database UUIDs
        setSession(prev => {
          const newSession = {
            ...prev,
            tasks: updatedTasks
          };
          
          // Re-initialize task timers with updated task IDs
          const newTaskTimers = initializeTaskTimers(updatedTasks);
          newSession.taskTimers = newTaskTimers;
          
          return newSession;
        });
        
        console.log('✅ All tasks added to session with database UUIDs');
      }
    } catch (error) {
      console.error('Error creating game session:', error);
    } finally {
      setIsInitializingSession(false);
    }
  }
};

createSession();

}, [session.gameState, gameSessionId, isInitializingSession, currentUser, session.selectedFighter, session.tasks, session.gameMode, session.currentRound]);

// Update game session when game ends
useEffect(() => {
const updateSession = async () => {
if ((session.gameState === 'victory' || session.gameState === 'defeat' || session.gameState === 'draw') && gameSessionId && currentUser) {
try {
console.log('🎮 Updating game session on game end');

      // Calculate final score
      const completedTasks = session.tasks.filter(task => task.completed);
      const totalScore = completedTasks.reduce((sum, task) => sum + (task.estimatedTime * 4), 0);
      
      // Update game session
      await updateGameSession(gameSessionId, {
        total_score: totalScore,
        rounds_completed: 1,
        tournament_won: session.gameState === 'victory',
        ended_at: new Date().toISOString()
      });
      
      // Update user stats
      const newTotalScore = (currentUser.total_score || 0) + totalScore;
      const newTournamentsWon = (currentUser.tournaments_won || 0) + (session.gameState === 'victory' ? 1 : 0);
      
      await updateUserStats(currentUser.user_id, {
        total_score: newTotalScore,
        tournaments_won: newTournamentsWon
      });
      
      // Update leaderboard if we have a good score
      if (totalScore > 0) {
        await updateLeaderboard({
          user_id: currentUser.user_id,
          username: currentUser.username || 'PLR',
          score: totalScore
        });
      }
      
      console.log('✅ Game session and user stats updated');
    } catch (error) {
      console.error('Error updating game session:', error);
    }
  }
};

updateSession();

}, [session.gameState, gameSessionId, currentUser, session.tasks]);

// Intro Animation Sequence
useEffect(() => {
if (session.gameState === 'intro') {
const sequence = async () => {
try {
// Phase 1: Players bounce (2 seconds)
setIntroPhase('intro');
await new Promise(resolve => {
currentResolveRef.current = resolve;
introTimeoutRef.current = setTimeout(resolve, 2000);
});

      // Phase 2: Player quip (2.5 seconds)
      setIntroPhase('player-quip');
      await new Promise(resolve => {
        currentResolveRef.current = resolve;
        introTimeoutRef.current = setTimeout(resolve, 2500);
      });
      
      // Phase 3: Opponent quip (2.5 seconds)  
      setIntroPhase('opponent-quip');
      await new Promise(resolve => {
        currentResolveRef.current = resolve;
        introTimeoutRef.current = setTimeout(resolve, 2500);
      });
      
      // Phase 4: Countdown 5→1 (UPDATED WITH SKIP LOGIC)
      setIntroPhase('countdown');
      for (let i = 5; i >= 1; i--) {
        // Check if skip was requested at the beginning of each iteration
        if (skipCountdownRef.current) {
          console.log('🏃 Skip requested during countdown, breaking loop');
          break;
        }
        
        setCountdownNumber(i);
        
        await new Promise(resolve => {
          currentResolveRef.current = resolve;
          const timeout = setTimeout(resolve, 800);
          introTimeoutRef.current = timeout;
        });
      }
      
      // If skip was requested during countdown, jump directly to on-task
      if (skipCountdownRef.current) {
        console.log('🏃 Skipping directly to ON TASK phase');
        skipCountdownRef.current = false; // Reset skip flag
      }
      
      // Phase 5: "ON TASK!" (4 seconds)
      setIntroPhase('on-task');
      await new Promise(resolve => {
        currentResolveRef.current = resolve;
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

// Initialize audio context and start background music on first interaction
const handleFirstInteraction = async () => {
if (!audioInitialized) {
console.log('🎮 First user interaction detected - initializing audio');

  try {
    // Initialize audio manager
    await audioManager.initialize();
    setAudioInitialized(true);
    
    // Start background music if not already started
    if (!musicStarted) {
      audioManager.playBGM();
      setMusicStarted(true);
    }
    
    console.log('✅ Audio system initialized and BGM started');
  } catch (error) {
    console.error('❌ Failed to initialize audio:', error);
  }
}

};

// FIXED: Dual timer logic with proper integer handling and pause/resume
useEffect(() => {
// Only run timers when game state is 'fighting' AND we have time remaining
if (session.gameState === 'fighting' && session.timeRemaining > 0) {
// Initialize task timers on first run
if (session.taskTimers.length === 0 && session.tasks.length > 0) {
const initialTimers = initializeTaskTimers(session.tasks);
setSession(prev => ({ ...prev, taskTimers: initialTimers }));
return;
}

  // Reset last tick time when starting/resuming
  lastTickRef.current = Date.now();

  timerRef.current = setInterval(() => {
    const now = Date.now();
    const elapsedRealTime = now - lastTickRef.current; // Real milliseconds since last tick
    
    // Convert to simulated seconds and round to avoid floating point issues
    const simulatedElapsedSeconds = Math.round((elapsedRealTime * TEST_MODE_SPEED_MULTIPLIER) / 1000);
    
    // Update last tick time for next iteration
    lastTickRef.current = now;

    // Skip update if no time has elapsed (prevents unnecessary re-renders)
    if (simulatedElapsedSeconds <= 0) return;

    setSession(prev => {
      // CRITICAL: Check if game is still in fighting state before updating
      if (prev.gameState !== 'fighting') {
        console.log('🛑 Timer stopped - game no longer in fighting state');
        return prev; // Don't update if not fighting
      }

      // Update main session timer by subtracting elapsed time (ensure integer)
      const newSessionTimeRemaining = Math.max(0, prev.timeRemaining - simulatedElapsedSeconds);

      // FIXED: Check for session timeout and determine outcome based on HP comparison
      if (newSessionTimeRemaining <= 0) {
        console.log('⏰ Session timer expired - determining outcome based on HP');
        
        let gameOutcome: 'victory' | 'defeat' | 'draw';
        
        if (prev.fighterHP > prev.opponentHP) {
          gameOutcome = 'victory';
          console.log(`🏆 Victory! Player HP: ${prev.fighterHP}, Opponent HP: ${prev.opponentHP}`);
        } else if (prev.fighterHP < prev.opponentHP) {
          gameOutcome = 'defeat';
          console.log(`💀 Defeat! Player HP: ${prev.fighterHP}, Opponent HP: ${prev.opponentHP}`);
        } else {
          gameOutcome = 'draw';
          console.log(`🤝 Draw! Both fighters have ${prev.fighterHP} HP`);
        }
        
        // Play appropriate audio sequence
        if (prev.opponent) {
          if (gameOutcome === 'victory') {
            audioManager.playEventSound('victory');
          } else {
            audioManager.playEventSound('defeat');
          }
        }
        
        return { 
          ...prev, 
          timeRemaining: 0, 
          gameState: gameOutcome
        };
      }

      // Update individual task timers by subtracting elapsed time (ensure integers)
      const updatedTaskTimers = prev.taskTimers.map((timer, index) => {
        if (timer.status !== 'active') return timer;

        const newTaskTimeRemaining = timer.timeRemaining - simulatedElapsedSeconds;

        // 30-second warning (only once, using range to avoid duplicates)
        if (newTaskTimeRemaining <= 30 && newTaskTimeRemaining > 25 && !timer.hasPlayedWarning) {
          console.log(`⚠️ 30-second warning for task: ${timer.taskId}`);
          audioManager.playWarningSound();
          return {
            ...timer,
            timeRemaining: newTaskTimeRemaining,
            hasPlayedWarning: true
          };
        }

        // Timer hits zero - apply damage immediately (only once)
        if (newTaskTimeRemaining <= 0 && timer.timeRemaining > 0 && !timer.damageApplied) {
          console.log(`💥 Task timer expired: ${timer.taskId} - Applying damage`);
          
          // Play task timer expired sequence (opponent attacks player)
          if (prev.opponent) {
            audioManager.playTaskTimerExpiredSequence(
              prev.opponent.id,
              prev.selectedFighter.id,
              false // Don't kill player on single task failure
            );
          }
          
          // Mark as damage applied to prevent duplicates
          return {
            ...timer,
            timeRemaining: newTaskTimeRemaining,
            damageApplied: true
          };
        }

        return {
          ...timer,
          timeRemaining: newTaskTimeRemaining // Can be negative (overtime)
        };
      });

      // Calculate damage from newly expired timers (only once)
      let totalDamage = 0;
      const updatedTaskTimersWithDamage = updatedTaskTimers.map(timer => {
        if (timer.damageApplied && timer.timeRemaining <= 0) {
          const damage = timer.estimatedTime * 4;
          totalDamage += damage;
          console.log(`💥 Applying ${damage} damage from task: ${timer.taskId} (one time only)`);
          
          // Clear damage flag after applying damage once
          return { ...timer, damageApplied: false };
        }
        return timer;
      });

      // Apply damage to fighter HP
      const newFighterHP = totalDamage > 0 ? Math.max(0, prev.fighterHP - totalDamage) : prev.fighterHP;

      if (totalDamage > 0) {
        console.log(`💔 Total damage: ${totalDamage}, Fighter HP: ${prev.fighterHP} → ${newFighterHP}`);
      }

      // FIXED: Check if fighter HP dropped to zero and set defeat state
      if (newFighterHP <= 0) {
        console.log('💀 Fighter HP reached zero - setting defeat state');
        
        // Play death sequence if not already playing session timeout
        if (prev.opponent && newSessionTimeRemaining > 0) {
          audioManager.playSessionTimeoutSequence(
            prev.opponent.id,
            prev.selectedFighter.id,
            true // Player dies from HP loss
          );
        }
        
        return {
          ...prev,
          timeRemaining: newSessionTimeRemaining,
          taskTimers: updatedTaskTimersWithDamage,
          fighterHP: 0,
          gameState: 'defeat' // FIXED: Set defeat when HP reaches zero
        };
      }

      return {
        ...prev,
        timeRemaining: newSessionTimeRemaining,
        taskTimers: updatedTaskTimersWithDamage,
        fighterHP: newFighterHP
      };
    });
  }, 100);

  return () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };
} else {
  // FIXED: Clear timer when not fighting or when time is up
  if (timerRef.current) {
    clearInterval(timerRef.current);
    timerRef.current = null;
    console.log('🛑 Timer cleared - game paused or time expired');
  }
}

}, [session.gameState, session.timeRemaining > 0, session.taskTimers.length > 0]); // FIXED: Better dependency array

// Complete a task - ENHANCED WITH DATABASE INTEGRATION AND ACTUAL TIME TRACKING
const completeTask = async (taskId: string) => {
console.log(`⚔️ Completing task: ${taskId}`);

setSession(prev => {
  // Check if task can be completed (must be active)
  const taskTimer = prev.taskTimers.find(timer => timer.taskId === taskId);
  if (!taskTimer || taskTimer.status !== 'active') {
    console.log(`❌ Cannot complete task ${taskId} - not active`);
    return prev;
  }
  
  // Calculate actual time taken for the task
  const estimatedTimeInSeconds = taskTimer.estimatedTime * 60;
  const timeRemainingInSeconds = taskTimer.timeRemaining;
  
  // If timeRemaining is positive, task was completed early
  // If timeRemaining is negative, task went into overtime
  const actualTimeInSeconds = estimatedTimeInSeconds - timeRemainingInSeconds;
  const actualMinutes = Math.round(actualTimeInSeconds / 60); // Round to nearest whole number for integer
  
  console.log(`⏱️ Task completion time analysis:
    - Estimated: ${taskTimer.estimatedTime} minutes (${estimatedTimeInSeconds}s)
    - Time remaining: ${timeRemainingInSeconds}s
    - Actual time taken: ${actualMinutes} minutes (${actualTimeInSeconds}s)
    - ${timeRemainingInSeconds < 0 ? 'OVERTIME' : 'COMPLETED EARLY'}`);
  
  const updatedTasks = prev.tasks.map(task => 
    task.id === taskId ? { ...task, completed: true } : task
  );
  
  const completedTask = prev.tasks.find(task => task.id === taskId);
  const taskIndex = prev.tasks.findIndex(task => task.id === taskId);
  
  const damagePerTask = completedTask ? completedTask.estimatedTime * 4 : 20;
  const newOpponentHP = Math.max(0, prev.opponentHP - damagePerTask);
  
  console.log(`💥 Dealing ${damagePerTask} damage (${completedTask?.estimatedTime} min task). Opponent HP: ${prev.opponentHP} → ${newOpponentHP}`);
  
  // Play damage sequence: player attacks opponent
  if (prev.opponent) {
    audioManager.playDamageSequence(
      prev.selectedFighter.id,
      prev.opponent.id,
      true, // player is attacker
      newOpponentHP <= 0 // is killing blow
    );
  }
  
  // Update task status in database with actual time taken
  if (gameSessionId && completedTask) {
    updateTaskStatus(taskId, {
      completed: true,
      points_earned: damagePerTask,
      actual_minutes: actualMinutes // Pass the calculated actual time as integer
    }).catch(error => console.error('Error updating completed task:', error));
  }
  
  const updatedTaskTimers = prev.taskTimers.map((timer, index) => {
    if (timer.taskId === taskId) {
      return { ...timer, status: 'completed' as const };
    }
    // Activate next pending task
    if (timer.status === 'pending' && index === taskIndex + 1) {
      return { ...timer, status: 'active' as const };
    }
    return timer;
  });
  
  // FIXED: Only declare victory if opponent HP reaches zero
  if (newOpponentHP <= 0) {
    console.log('🏆 Victory condition met - opponent HP reached zero!');
    audioManager.playEventSound('victory');
    return {
      ...prev,
      tasks: updatedTasks,
      opponentHP: newOpponentHP,
      gameState: 'victory',
      taskTimers: updatedTaskTimers,
      currentTaskIndex: taskIndex + 1
    };
  }
  
  // Continue fighting if opponent still has HP
  return {
    ...prev,
    tasks: updatedTasks,
    opponentHP: newOpponentHP,
    taskTimers: updatedTaskTimers,
    currentTaskIndex: taskIndex + 1
  };
});

};

// FIXED: Pause/Resume game - simplified to just toggle game state
const togglePause = () => {
setSession(prev => {
const newGameState = prev.gameState === 'fighting' ? 'paused' : 'fighting';

  console.log(newGameState === 'fighting' ? '▶️ Game resumed' : '⏸️ Game paused');
  
  return {
    ...prev,
    gameState: newGameState
  };
});

};

// Format time display - ensures integers only
const formatTime = (seconds: number) => {
const roundedSeconds = Math.round(seconds); // Ensure integer
const mins = Math.floor(roundedSeconds / 60);
const secs = roundedSeconds % 60;
return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Skip intro phase - UPDATED LOGIC
const skipIntroPhase = () => {
if (!canSkip || session.gameState !== 'intro') return;

console.log(`⏭️ Skipping intro phase: ${introPhase}`);

// Special handling for countdown phase - set skip flag instead of resolving
if (introPhase === 'countdown') {
  console.log('🏃 Setting skip flag for countdown');
  skipCountdownRef.current = true;
  // Also resolve current promise to advance the sequence
  if (currentResolveRef.current) {
    currentResolveRef.current();
    currentResolveRef.current = null;
  }
  return;
}

// For other phases, resolve current Promise immediately to advance sequence
if (currentResolveRef.current) {
  currentResolveRef.current();
  currentResolveRef.current = null;
}

};

const handleScreenClick = () => {
if (canSkip && session.gameState === 'intro') {
skipIntroPhase();
} else {
handleFirstInteraction();
}
};

const formatTaskTime = (seconds: number) => {
// Ensure integer and handle negative (overtime) values
const roundedSeconds = Math.round(seconds);
const absSeconds = Math.abs(roundedSeconds);
const mins = Math.floor(absSeconds / 60);
const secs = absSeconds % 60;
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

const completedTasks = session.tasks.filter(task => task.completed).length;
const totalTasks = session.tasks.length;

// Show break screen if requested
if (showBreakScreen) {
return (
<BreakScreen
breakDuration={currentBreakDuration}
onBreakComplete={handleBreakComplete}
onSkipBreak={handleSkipBreak}
/>
);
}

// Redirect if no fighter selected
if (!session.selectedFighter) {
return (
<div className="min-h-screen bg-gradient-to-b from-crtBlue to-black flex items-center justify-center">
<div className="text-center">
<h1 className="text-neonYel font-mono text-2xl mb-4">NO FIGHTER SELECTED</h1>
<button
onClick={() => navigate('/fighter-select')}
className="bg-neonRed text-white font-mono px-6 py-3 border-2 border-neonRed/80 hover:bg-neonRed/80 transition-colors"
>
SELECT FIGHTER
</button>
</div>
</div>
);
}

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
    className="absolute inset-0 w-full h-full bg-gradient-to-b from-purple-900 via-crtBlue to-black"
    style={{ zIndex: -1 }}
  ></div>
  
  {/* Dark overlay for readability */}
  <div className="absolute inset-0 bg-black bg-opacity-30" style={{ zIndex: 1 }}></div>
  
  {/* Main content */}
  <div className="relative min-h-screen flex flex-col" style={{ zIndex: 2 }}>
    
    {/* Header - now just the timer */}
    {(session.gameState === 'fighting' || session.gameState === 'paused' || session.gameState === 'victory' || session.gameState === 'defeat' || session.gameState === 'draw') && (
      <div className="flex justify-center items-center p-4 bg-black bg-opacity-60 border-b-2 border-cyan-400">
        <div className="text-center">
          {/* Main Session Timer */}
          <div className={`font-mono text-4xl font-bold ${session.timeRemaining < 300 ? 'text-neonRed animate-pulse' : 'text-neonYel'}`}>
            {formatTime(session.timeRemaining)}
          </div>
          
          <button 
            onClick={togglePause}
            className="mt-2 bg-crtBlue text-white font-mono px-4 py-1 text-sm border-2 border-crtBlue/80 hover:bg-crtBlue/80 transition-colors"
          >
            {session.gameState === 'paused' ? 'RESUME' : 'PAUSE'}
          </button>
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
        
        {/* Player HP bar */}
        <HealthBarThin percent={session.fighterHP} />
        
        {/* Player speech bubble */}
        {introPhase === 'player-quip' && (
          <SpeechBubble text={session.selectedFighter.quip} side="left" />
        )}
      </div>

      {/* Task list - center - only show during fighting */}
      {(session.gameState === 'fighting' || session.gameState === 'paused' || session.gameState === 'victory' || session.gameState === 'defeat' || session.gameState === 'draw') && (
        <div className="flex-1 max-w-md mx-8 flex flex-col items-center">
          {/* Only show the h2 for tournament mode */}
          {session.gameMode === 'tournament' && (
            <h2 className="text-neonRed font-mono text-2xl font-bold mb-4">
              ROUND {session.currentRound}
            </h2>
          )}
          
          <div className="bg-black bg-opacity-80 border-2 border-neonYel p-6 max-h-96 overflow-y-auto rounded-lg w-full">
            <h3 className="text-neonYel font-mono text-lg font-bold mb-4 text-center">
              BATTLE TASKS ({completedTasks}/{totalTasks})
            </h3>
            
            {session.tasks.length === 0 ? (
              <div className="text-white font-mono text-center">
                <div className="mb-2">NO TASKS LOADED</div>
                <div className="text-xs text-gray-400">Go to Quick Battle → Add tasks → Fighter Select → Fight</div>
              </div>
            ) : (
              <div className="space-y-3">
                {session.tasks.map((task) => {
                  const taskTimer = session.taskTimers.find(timer => timer.taskId === task.id);
                  const isFailed = session.failedTasks.includes(task.id);
                  const isActive = taskTimer?.status === 'active';
                  
                  return (
                    <div key={task.id} className={`flex flex-col p-3 bg-gray-900 border rounded ${
                      isActive ? 'border-neonYel bg-neonYel/10' : 'border-gray-600'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className={`font-mono text-sm font-bold break-words ${
                            task.completed ? 'text-green-400 line-through' : 
                            isFailed ? 'text-neonRed line-through' :
                            'text-white'
                          }`}>
                            {task.title}
                            {isFailed && ' (FAILED)'}
                          </div>
                          
                          {/* Inline Task Timer - Digital Clock Style */}
                          {isActive && taskTimer && !task.completed && !isFailed && (
                            <div className="mt-2 flex items-center gap-2">
                              <div className="bg-black border-2 border-cyan-400 px-3 py-1 rounded">
                                <div className={`font-mono text-lg font-bold ${
                                  taskTimer.timeRemaining <= 0 ? 'text-neonRed animate-pulse' : 
                                  taskTimer.timeRemaining <= 30 ? 'text-neonYel animate-pulse' : 'text-cyan-400'
                                }`}>
                                  {formatTaskTime(taskTimer.timeRemaining)}
                                </div>
                              </div>
                              <div className="text-cyan-400 text-xs font-mono">
                                ACTIVE
                              </div>
                              {/* Show paused indicator */}
                              {session.gameState === 'paused' && (
                                <div className="text-yellow-400 text-xs font-mono animate-pulse">
                                  PAUSED
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {!task.completed && !isFailed && session.gameState === 'fighting' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              completeTask(task.id);
                            }}
                            disabled={!isActive}
                            className={`font-mono px-3 py-1 text-xs border-2 transition-colors ml-2 flex-shrink-0 ${
                              isActive 
                                ? 'bg-neonRed text-white border-neonRed/80 hover:bg-neonRed/80' 
                                : 'bg-gray-600 text-gray-400 border-gray-500 cursor-not-allowed'
                            }`}
                          >
                            COMPLETE
                          </button>
                        )}
                        
                        {task.completed && (
                          <div className="text-green-400 font-mono text-xs font-bold flex-shrink-0">✓ DONE</div>
                        )}
                        
                        {isFailed && (
                          <div className="text-neonRed font-mono text-xs font-bold flex-shrink-0">✗ FAILED</div>
                        )}
                      </div>
                    </div>
                  );
                })}
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
        
        {/* Opponent HP bar */}
        <HealthBarThin percent={session.opponentHP} />
        
        {/* Opponent speech bubble */}
        {introPhase === 'opponent-quip' && session.opponent && (
          <SpeechBubble text={session.opponent.quip} side="right" />
        )}
      </div>
    </div>

    {/* Countdown Overlay */}
    <CountdownOverlay number={countdownNumber} phase={introPhase} />

    {/* Skip hint during intro */}
    {canSkip && session.gameState === 'intro' && (
      <div className="absolute top-4 right-4 z-50">
        <div className="bg-black bg-opacity-80 text-neonYel font-mono text-sm px-3 py-2 rounded border border-neonYel animate-pulse">
          Click to skip ⏭️
        </div>
      </div>
    )}

    {/* Test Mode Indicator */}
    {TEST_MODE_SPEED_MULTIPLIER > 1 && (
      <div className="absolute top-4 left-4 z-50">
        <div className="bg-neonRed text-white font-mono text-sm px-3 py-2 rounded border border-neonRed/80 font-bold">
          🚀 TEST MODE: {TEST_MODE_SPEED_MULTIPLIER}x SPEED
        </div>
      </div>
    )}

    {/* Game state overlays */}
    {session.gameState === 'paused' && (
      <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-20">
        <div className="text-center p-8 bg-black bg-opacity-80 border-2 border-neonYel rounded-lg">
          <h2 className="text-neonYel font-mono text-4xl font-bold mb-4">GAME PAUSED</h2>
          <p className="text-white font-mono text-lg mb-6">
            All timers are paused. Click Resume to continue.
          </p>
          <button 
            onClick={togglePause}
            className="bg-neonRed text-white font-mono px-6 py-3 border-2 border-neonRed/80 hover:bg-neonRed/80 transition-colors"
          >
            RESUME FIGHT
          </button>
        </div>
      </div>
    )}

    {session.gameState === 'victory' && (
      <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-20">
        <div className="text-center p-8 bg-black bg-opacity-80 border-2 border-neonYel rounded-lg">
          <h2 className="text-neonYel font-mono text-6xl font-bold mb-4 animate-pulse">VICTORY!</h2>
          <p className="text-white font-mono text-lg mb-6">
            {session.opponent ? `You defeated ${session.opponent.name}!` : 'All tasks completed!'}
          </p>
          <div className="text-cyan-400 font-mono text-sm">
            🏖️ Preparing your {currentBreakDuration} minute break...
          </div>
        </div>
      </div>
    )}

    {session.gameState === 'defeat' && (
      <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-20">
        <div className="text-center p-8 bg-black bg-opacity-80 border-2 border-neonRed rounded-lg">
          <h2 className="text-neonRed font-mono text-6xl font-bold mb-4 animate-pulse">DEFEATED!</h2>
          <p className="text-white font-mono text-lg mb-6">
            {session.opponent ? `${session.opponent.name} wins this round!` : 'Time ran out!'}
          </p>
          <div className="text-cyan-400 font-mono text-sm">
            🏖️ Take a {currentBreakDuration} minute break and try again...
          </div>
        </div>
      </div>
    )}

    {/* FIXED: Add draw state overlay */}
    {session.gameState === 'draw' && (
      <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-20">
        <div className="text-center p-8 bg-black bg-opacity-80 border-2 border-neonYel rounded-lg">
          <h2 className="text-neonYel font-mono text-6xl font-bold mb-4 animate-pulse">DRAW!</h2>
          <p className="text-white font-mono text-lg mb-6">
            Both fighters have equal HP! It's a tie!
          </p>
          <div className="text-cyan-400 font-mono text-sm">
            🏖️ Take a {currentBreakDuration} minute break and consider it a learning experience...
          </div>
        </div>
      </div>
    )}

    {/* Bottom status bar - only show during fighting */}
    {(session.gameState === 'fighting' || session.gameState === 'paused' || session.gameState === 'victory' || session.gameState === 'defeat' || session.gameState === 'draw') && (
      <div className="bg-black bg-opacity-80 p-3 text-center border-t-2 border-cyan-400">
        <div className="text-neonYel font-mono text-sm">
          Click anywhere to start audio • Complete tasks to deal damage • Don't let task timers run out!
        </div>
        <div className="text-cyan-400 font-mono text-xs mt-1">
          Mode: {session.gameMode} | Opponent: {session.opponent?.name || 'Loading...'} | Stage: /stages/{session.stage} | 
          Session: {gameSessionId ? '✅' : '❌'} | User: {currentUser?.username || 'Guest'} | Break: {currentBreakDuration}min
          {session.gameState === 'paused' && ' | ⏸️ PAUSED'}
        </div>
      </div>
    )}
  </div>
</div>

);
};

export default FightScreen;