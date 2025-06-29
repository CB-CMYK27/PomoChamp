import { create } from 'zustand';
import { TimerState } from '../types';

interface TimerStore extends TimerState {
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  switchMode: () => void;
  tick: () => void;
  setWorkTime: (minutes: number) => void;
  setBreakTime: (minutes: number) => void;
}

// Default times in seconds
const DEFAULT_WORK_TIME = 25 * 60;
const DEFAULT_BREAK_TIME = 5 * 60;

export const useTimerStore = create<TimerStore>((set) => ({
  isRunning: false,
  mode: 'work',
  timeLeft: DEFAULT_WORK_TIME,
  totalTime: DEFAULT_WORK_TIME,
  progress: 0,
  
  startTimer: () => set({ isRunning: true }),
  
  pauseTimer: () => set({ isRunning: false }),
  
  resetTimer: () => set((state) => {
    const newTotalTime = state.mode === 'work' ? DEFAULT_WORK_TIME : DEFAULT_BREAK_TIME;
    return {
      timeLeft: newTotalTime,
      totalTime: newTotalTime,
      progress: 0,
      isRunning: false
    };
  }),
  
  switchMode: () => set((state) => {
    const newMode = state.mode === 'work' ? 'break' : 'work';
    const newTotalTime = newMode === 'work' ? DEFAULT_WORK_TIME : DEFAULT_BREAK_TIME;
    return {
      mode: newMode,
      timeLeft: newTotalTime,
      totalTime: newTotalTime,
      progress: 0,
      isRunning: false
    };
  }),
  
  tick: () => set((state) => {
    if (!state.isRunning || state.timeLeft <= 0) return state;
    
    const newTimeLeft = state.timeLeft - 1;
    const newProgress = 1 - newTimeLeft / state.totalTime;
    
    return {
      timeLeft: newTimeLeft,
      progress: newProgress
    };
  }),
  
  setWorkTime: (minutes: number) => set((state) => {
    const seconds = minutes * 60;
    if (state.mode === 'work') {
      return {
        totalTime: seconds,
        timeLeft: seconds,
        progress: 0
      };
    }
    return state;
  }),
  
  setBreakTime: (minutes: number) => set((state) => {
    const seconds = minutes * 60;
    if (state.mode === 'break') {
      return {
        totalTime: seconds,
        timeLeft: seconds,
        progress: 0
      };
    }
    return state;
  })
}));