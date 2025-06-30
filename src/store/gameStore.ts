import { create } from 'zustand';

interface GameState {
  fighterId: string | null;
  fightScreenTimeRemaining: number;
  fightScreenGameState: string;
  _togglePauseFunction: (() => void) | null;
  setFighter: (id: string) => void;
  setFightScreenTimeRemaining: (time: number) => void;
  setFightScreenGameState: (state: string) => void;
  registerTogglePause: (toggleFn: () => void) => void;
  triggerTogglePause: () => void;
  clearFightScreenData: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  fighterId: null,
  fightScreenTimeRemaining: 0,
  fightScreenGameState: '',
  _togglePauseFunction: null,
  
  setFighter: (id) => set({ fighterId: id }),
  
  setFightScreenTimeRemaining: (time) => set({ fightScreenTimeRemaining: time }),
  
  setFightScreenGameState: (state) => set({ fightScreenGameState: state }),
  
  registerTogglePause: (toggleFn) => set({ _togglePauseFunction: toggleFn }),
  
  triggerTogglePause: () => {
    const { _togglePauseFunction } = get();
    if (_togglePauseFunction) {
      _togglePauseFunction();
    }
  },
  
  clearFightScreenData: () => set({ 
    fightScreenTimeRemaining: 0, 
    fightScreenGameState: '', 
    _togglePauseFunction: null 
  })
}));