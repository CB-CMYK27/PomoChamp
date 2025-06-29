import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AudioSettings {
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  warningVolume: number;
  eventVolume: number;
  sfxEnabled: boolean;
  musicEnabled: boolean;
  warningEnabled: boolean;
  eventEnabled: boolean;
  currentBGM: string;
  availableBGM: string[];
}

interface AudioStore extends AudioSettings {
  // Volume controls
  setMasterVolume: (volume: number) => void;
  setSfxVolume: (volume: number) => void;
  setMusicVolume: (volume: number) => void;
  setWarningVolume: (volume: number) => void;
  setEventVolume: (volume: number) => void;
  
  // Toggle controls
  toggleSfx: () => void;
  toggleMusic: () => void;
  toggleWarning: () => void;
  toggleEvent: () => void;
  
  // Music controls
  setBGM: (track: string) => void;
  
  // Utility
  getEffectiveVolume: (category: 'sfx' | 'music' | 'warning' | 'event') => number;
  resetToDefaults: () => void;
}

const defaultSettings: AudioSettings = {
  masterVolume: 0.7,
  sfxVolume: 0.8,
  musicVolume: 0.5,
  warningVolume: 0.9,
  eventVolume: 0.8,
  sfxEnabled: true,
  musicEnabled: true,
  warningEnabled: true,
  eventEnabled: true,
  currentBGM: '/sfx/Mercury.wav',
  availableBGM: [
    '/sfx/Mercury.wav',
    '/sfx/BossMain.wav',
    '/sfx/Mars.wav',
    '/sfx/Venus.wav'
  ]
};

export const useAudioStore = create<AudioStore>()(
  persist(
    (set, get) => ({
      ...defaultSettings,
      
      // Volume setters
      setMasterVolume: (volume: number) => set({ masterVolume: Math.max(0, Math.min(1, volume)) }),
      setSfxVolume: (volume: number) => set({ sfxVolume: Math.max(0, Math.min(1, volume)) }),
      setMusicVolume: (volume: number) => set({ musicVolume: Math.max(0, Math.min(1, volume)) }),
      setWarningVolume: (volume: number) => set({ warningVolume: Math.max(0, Math.min(1, volume)) }),
      setEventVolume: (volume: number) => set({ eventVolume: Math.max(0, Math.min(1, volume)) }),
      
      // Toggle functions
      toggleSfx: () => set((state) => ({ sfxEnabled: !state.sfxEnabled })),
      toggleMusic: () => set((state) => ({ musicEnabled: !state.musicEnabled })),
      toggleWarning: () => set((state) => ({ warningEnabled: !state.warningEnabled })),
      toggleEvent: () => set((state) => ({ eventEnabled: !state.eventEnabled })),
      
      // Music control
      setBGM: (track: string) => set({ currentBGM: track }),
      
      // Utility functions
      getEffectiveVolume: (category: 'sfx' | 'music' | 'warning' | 'event') => {
        const state = get();
        const categoryVolume = state[`${category}Volume`];
        const categoryEnabled = state[`${category}Enabled`];
        return categoryEnabled ? state.masterVolume * categoryVolume : 0;
      },
      
      resetToDefaults: () => set(defaultSettings)
    }),
    {
      name: 'pomochamp-audio-settings',
      version: 1
    }
  )
);