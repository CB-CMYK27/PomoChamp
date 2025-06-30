import { create } from 'zustand';

interface GameState {
  fighterId: string | null;
  fightScreenGameState: string;
  _togglePauseFunction: (() => void) | null;
  setFighter: (id: string) => void;
  setFightScreenGameState: (state: string) => void;
  registerTogglePause: (toggleFn: () => void) => void;
  triggerTogglePause: () => void;
  clearFightScreenData: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  fighterId: null,
  fightScreenGameState: '',
  _togglePauseFunction: null,
  
  setFighter: (id) => set({ fighterId: id }),
  
  setFightScreenGameState: (state) => set({ fightScreenGameState: state }),
  
  registerTogglePause: (toggleFn) => set({ _togglePauseFunction: toggleFn }),
  
  triggerTogglePause: () => {
    const { _togglePauseFunction } = get();
    if (_togglePauseFunction) {
      _togglePauseFunction();
    }
  },
  
  clearFightScreenData: () => set({ 
    fightScreenGameState: '', 
    _togglePauseFunction: null 
  })
}));