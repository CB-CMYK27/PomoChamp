import { create } from 'zustand';

// Define the complete FightSession interface in the store
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
  gameState: 'intro' | 'fighting' | 'paused' | 'victory' | 'defeat' | 'draw';
  gameMode: 'quick-battle' | 'tournament';
  currentRound: number;
  stage: string;
  currentTaskIndex: number;
  taskTimers: TaskTimer[];
  failedTasks: string[];
}

interface GameState {
  fighterId: string | null;
  fightScreenGameState: string;
  currentFightSession: FightSession | null;
  _togglePauseFunction: (() => void) | null;
  setFighter: (id: string) => void;
  setFightScreenGameState: (state: string) => void;
  setCurrentFightSession: (session: FightSession) => void;
  updateFightSession: (updates: Partial<FightSession>) => void;
  registerTogglePause: (toggleFn: () => void) => void;
  triggerTogglePause: () => void;
  clearFightScreenData: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  fighterId: null,
  fightScreenGameState: '',
  currentFightSession: null,
  _togglePauseFunction: null,
  
  setFighter: (id) => set({ fighterId: id }),
  
  setFightScreenGameState: (state) => set({ fightScreenGameState: state }),
  
  setCurrentFightSession: (session) => {
    console.log('🎮 [STORE] Setting current fight session:', session);
    set({ currentFightSession: session });
  },
  
  updateFightSession: (updates) => {
    const { currentFightSession } = get();
    if (currentFightSession) {
      const updatedSession = { ...currentFightSession, ...updates };
      console.log('🎮 [STORE] Updating fight session:', updates);
      set({ currentFightSession: updatedSession });
    }
  },
  
  registerTogglePause: (toggleFn) => set({ _togglePauseFunction: toggleFn }),
  
  triggerTogglePause: () => {
    const { _togglePauseFunction } = get();
    if (_togglePauseFunction) {
      _togglePauseFunction();
    }
  },
  
  clearFightScreenData: () => {
    console.log('🎮 [STORE] Clearing fight screen data');
    set({ 
      fightScreenGameState: '', 
      currentFightSession: null,
      _togglePauseFunction: null 
    });
  }
}));