import create from 'zustand';

interface GameState {
  fighterId: string | null;
  setFighter: (id: string) => void;
}

export const useGameStore = create<GameState>((set) => ({
  fighterId: null,
  setFighter: (id) => set({ fighterId: id })
}));
