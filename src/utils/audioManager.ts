import { useAudioStore } from '../store/audioStore';
import fightersData from '../data/fighters.json';

interface AudioElement {
  audio: HTMLAudioElement;
  isLoading: boolean;
}

interface SoundTimingConfig {
  minInterval: number; // Minimum time between plays in milliseconds
  maxConcurrent: number; // Maximum concurrent instances
}

interface SoundRuntimeState {
  lastPlayed: number;
  activeCount: number;
}

interface SoundSequence {
  sounds: Array<{
    category: string;
    fighterId?: string;
    isPlayer?: boolean;
    delay?: number; // Delay before playing this sound in ms
  }>;
  onComplete?: () => void;
}

// Supported audio file extensions (in order of preference)
const SUPPORTED_AUDIO_EXTENSIONS = ['.flac', '.wav', '.ogg', '.mp3'];

class AudioManager {
  private audioElements: Map<string, AudioElement> = new Map();
  private loadedSoundMap: Map<string, string> = new Map(); // Maps basePath to fullPath
  private soundTimings: Map<string, SoundTimingConfig> = new Map();
  private soundRuntimeState: Map<string, SoundRuntimeState> = new Map();
  private initialized = false;
  private sequenceQueue: SoundSequence[] = [];
  private isPlayingSequence = false;
  
  // Web Audio API properties for BGM
  private audioContext: AudioContext | null = null;
  private currentBGMSource: AudioBufferSourceNode | null = null;
  private bgmGainNode: GainNode | null = null;
  private bgmBuffer: AudioBuffer | null = null;
  private currentBGMPath: string | null = null;
  private bgmBufferCache: Map<string, AudioBuffer> = new Map();
  
  constructor() {
    this.setupSoundTimings();
    this.preloadAllSounds();
  }
  
  private setupSoundTimings() {
    // Configure timing rules for different sound categories
    this.soundTimings.set('punch', { minInterval: 200, maxConcurrent: 1 });
    this.soundTimings.set('grunt', { minInterval: 300, maxConcurrent: 1 });
    this.soundTimings.set('death', { minInterval: 500, maxConcurrent: 1 });
    this.soundTimings.set('timer-warning', { minInterval: 1000, maxConcurrent: 1 });
    this.soundTimings.set('round-victory', { minInterval: 500, maxConcurrent: 1 });
    this.soundTimings.set('player-death', { minInterval: 500, maxConcurrent: 1 });
  }
  
  private async initializeAudioContext(): Promise<void> {
    if (this.audioContext) return;
    
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Resume context if it's suspended (required by some browsers)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      console.log('🎵 [WEB_AUDIO] AudioContext initialized successfully');
    } catch (error) {
      console.error('❌ [WEB_AUDIO] Failed to initialize AudioContext:', error);
      throw error;
    }
  }
  
  private async loadAudioBuffer(url: string): Promise<AudioBuffer> {
    // Check cache first
    if (this.bgmBufferCache.has(url)) {
      console.log(`🗂️ [WEB_AUDIO] Using cached buffer for: ${url}`);
      return this.bgmBufferCache.get(url)!;
    }
    
    if (!this.audioContext) {
      throw new Error('AudioContext not initialized');
    }
    
    console.log(`📥 [WEB_AUDIO] Loading audio buffer: ${url}`);
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      // Cache the buffer
      this.bgmBufferCache.set(url, audioBuffer);
      console.log(`✅ [WEB_AUDIO] Successfully loaded and cached buffer: ${url}`);
      
      return audioBuffer;
    } catch (error) {
      console.error(`❌ [WEB_AUDIO] Failed to load audio buffer: ${url}`, error);
      throw error;
    }
  }
  
  private async preloadSound(basePath: string): Promise<void> {
    console.log(`🎵 [PRELOAD] Attempting to preload sound: ${basePath}`);
    
    for (const extension of SUPPORTED_AUDIO_EXTENSIONS) {
      const fullPath = basePath + extension;
      
      try {
        const audio = new Audio(fullPath);
        audio.preload = 'auto';
        audio.volume = 0.7;
        
        // Wait for the audio to be ready
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Timeout'));
          }, 3000); // 3 second timeout
          
          audio.addEventListener('canplaythrough', () => {
            clearTimeout(timeout);
            resolve();
          });
          
          audio.addEventListener('error', () => {
            clearTimeout(timeout);
            reject(new Error('Load failed'));
          });
        });
        
        // Successfully loaded - store the mapping and audio element
        this.loadedSoundMap.set(basePath, fullPath);
        
        const element: AudioElement = {
          audio,
          isLoading: false
        };
        
        this.audioElements.set(fullPath, element);
        console.log(`✅ [PRELOAD] Successfully preloaded: ${basePath} -> ${fullPath}`);
        return;
        
      } catch (error) {
        console.log(`❌ [PRELOAD] Failed to load ${fullPath}: ${error}`);
        continue; // Try next extension
      }
    }
    
    console.warn(`⚠️ [PRELOAD] Could not find any supported audio file for: ${basePath}`);
  }
  
  private async preloadAllSounds(): Promise<void> {
    console.log('🎵 [PRELOAD] Starting to preload all sounds...');
    
    // Generic sound base paths
    const genericSounds = [
      '/sfx/timer-warning',
      '/sfx/round-victory',
      '/sfx/player-grunt',
      '/sfx/opponent-grunt',
      '/sfx/player-punch',
      '/sfx/opponent-punch',
      '/sfx/player-death',
      '/sfx/opponent-death'
    ];
    
    // Character-specific sound base paths
    const characterSounds: string[] = [];
    fightersData.forEach(fighter => {
      characterSounds.push(
        `/fighters/${fighter.id}/grunt`,
        `/fighters/${fighter.id}/punch`,
        `/fighters/${fighter.id}/death`
      );
    });
    
    // Preload all sounds
    const allSounds = [...genericSounds, ...characterSounds];
    const preloadPromises = allSounds.map(basePath => this.preloadSound(basePath));
    
    await Promise.allSettled(preloadPromises);
    console.log(`✅ [PRELOAD] Preloading complete. Loaded ${this.loadedSoundMap.size} sounds.`);
  }
  
  private getCharacterSoundBasePath(soundCategory: 'grunt' | 'punch' | 'death', fighterId: string): string {
    return `/fighters/${fighterId}/${soundCategory}`;
  }
  
  private getGenericSoundBasePath(soundCategory: 'grunt' | 'punch' | 'death', isPlayer: boolean): string {
    switch (soundCategory) {
      case 'grunt':
        return isPlayer ? '/sfx/player-grunt' : '/sfx/opponent-grunt';
      case 'punch':
        return isPlayer ? '/sfx/player-punch' : '/sfx/opponent-punch';
      case 'death':
        return isPlayer ? '/sfx/player-death' : '/sfx/opponent-death';
      default:
        return '/sfx/player-punch';
    }
  }
  
  private canPlaySound(soundCategory: string): boolean {
    const timing = this.soundTimings.get(soundCategory);
    if (!timing) {
      console.log(`🔍 [TIMING] No timing config for soundCategory: ${soundCategory} - allowing play`);
      return true;
    }
    
    const runtimeState = this.soundRuntimeState.get(soundCategory);
    if (!runtimeState) {
      console.log(`🔍 [TIMING] No runtime state for soundCategory: ${soundCategory} - allowing play`);
      return true;
    }
    
    const now = Date.now();
    const timeSinceLastPlay = now - runtimeState.lastPlayed;
    
    if (timeSinceLastPlay < timing.minInterval) {
      console.log(`🚫 [TIMING] Sound ${soundCategory} blocked by minInterval: ${timeSinceLastPlay}ms < ${timing.minInterval}ms`);
      return false;
    }
    
    if (runtimeState.activeCount >= timing.maxConcurrent) {
      console.log(`🚫 [TIMING] Sound ${soundCategory} blocked by maxConcurrent: ${runtimeState.activeCount} >= ${timing.maxConcurrent}`);
      return false;
    }
    
    console.log(`✅ [TIMING] Sound ${soundCategory} allowed to play: timeSince=${timeSinceLastPlay}ms, concurrent=${runtimeState.activeCount}/${timing.maxConcurrent}`);
    return true;
  }
  
  private updateSoundRuntimeState(soundCategory: string, audio: HTMLAudioElement) {
    // Initialize runtime state if it doesn't exist
    if (!this.soundRuntimeState.has(soundCategory)) {
      this.soundRuntimeState.set(soundCategory, { lastPlayed: 0, activeCount: 0 });
    }
    
    const runtimeState = this.soundRuntimeState.get(soundCategory)!;
    
    // Update last played time and increment active count
    runtimeState.lastPlayed = Date.now();
    runtimeState.activeCount++;
    
    console.log(`📝 [RUNTIME] Updated runtime state for ${soundCategory}: lastPlayed=${runtimeState.lastPlayed}, activeCount=${runtimeState.activeCount}`);
    
    // Add ended event listener to decrement active count
    audio.addEventListener('ended', () => {
      runtimeState.activeCount = Math.max(0, runtimeState.activeCount - 1);
      console.log(`🗑️ [RUNTIME] Decremented active count for ${soundCategory}: activeCount=${runtimeState.activeCount}`);
    }, { once: true });
  }
  
  public async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      // Initialize Web Audio API context
      await this.initializeAudioContext();
      
      // Try to unlock audio context by playing and immediately pausing sounds
      const unlockPromises = Array.from(this.audioElements.values()).map(async (element) => {
        try {
          await element.audio.play();
          element.audio.pause();
          element.audio.currentTime = 0;
        } catch (error) {
          // Ignore errors during unlock attempt
        }
      });
      
      await Promise.allSettled(unlockPromises);
      this.initialized = true;
      console.log('🎵 [INIT] Audio Manager initialized successfully');
    } catch (error) {
      console.warn('⚠️ [INIT] Audio initialization failed:', error);
    }
  }
  
  public playSfx(soundCategory: string, fighterId?: string, isPlayer: boolean = true, onEndedCallback?: () => void): void {
    console.log(`🎯 [PLAY] playSfx called with: soundCategory="${soundCategory}", fighterId="${fighterId}", isPlayer=${isPlayer}`);
    
    const audioStore = useAudioStore.getState();
    const effectiveVolume = audioStore.getEffectiveVolume('sfx');
    
    if (effectiveVolume === 0) {
      console.log(`🔇 [PLAY] SFX volume is 0, skipping sound: ${soundCategory}`);
      if (onEndedCallback) onEndedCallback();
      return;
    }
    
    // Check timing constraints using sound category
    if (!this.canPlaySound(soundCategory)) {
      console.log(`🔇 [PLAY] Sound ${soundCategory} blocked by timing constraints`);
      if (onEndedCallback) onEndedCallback();
      return;
    }
    
    let basePath: string;
    
    // Determine base path based on category
    if (fighterId && (soundCategory === 'grunt' || soundCategory === 'punch' || soundCategory === 'death')) {
      // Try character-specific sound first
      const characterBasePath = this.getCharacterSoundBasePath(soundCategory as 'grunt' | 'punch' | 'death', fighterId);
      const genericBasePath = this.getGenericSoundBasePath(soundCategory as 'grunt' | 'punch' | 'death', isPlayer);
      
      // Check if character-specific sound exists in our loaded map
      if (this.loadedSoundMap.has(characterBasePath)) {
        basePath = characterBasePath;
        console.log(`🎭 [PLAY] Using character-specific sound: ${basePath}`);
      } else {
        // Fallback to generic sound
        basePath = genericBasePath;
        console.log(`🎭 [PLAY] Character sound not found, using generic: ${basePath}`);
      }
    } else {
      // Direct sound category (like timer-warning, round-victory, etc.)
      basePath = `/sfx/${soundCategory}`;
      console.log(`🎭 [PLAY] Using direct sound category: ${basePath}`);
    }
    
    // Get the full path from our loaded sound map
    const fullPath = this.loadedSoundMap.get(basePath);
    if (!fullPath) {
      console.warn(`⚠️ [PLAY] Sound not found in loaded map: ${basePath}`);
      if (onEndedCallback) onEndedCallback();
      return;
    }
    
    console.log(`🗂️ [PLAY] Resolved fullPath: ${basePath} -> ${fullPath}`);
    
    // Get audio element
    const element = this.audioElements.get(fullPath);
    if (!element || element.isLoading) {
      console.warn(`⚠️ [PLAY] Audio not ready: ${fullPath}, element exists: ${!!element}, isLoading: ${element?.isLoading}`);
      if (onEndedCallback) onEndedCallback();
      return;
    }
    
    try {
      const audio = element.audio.cloneNode() as HTMLAudioElement;
      audio.volume = effectiveVolume;
      audio.currentTime = 0;
      
      console.log(`🔊 [PLAY] About to play audio: soundCategory="${soundCategory}", fullPath="${fullPath}", volume=${effectiveVolume}`);
      
      // Add ended callback if provided
      if (onEndedCallback) {
        audio.addEventListener('ended', () => {
          console.log(`🏁 [PLAY] Audio ended callback triggered for: ${soundCategory}`);
          onEndedCallback();
        }, { once: true });
      }
      
      audio.play().then(() => {
        console.log(`✅ [PLAY] Successfully started playing: soundCategory="${soundCategory}", fullPath="${fullPath}"`);
        // Update runtime state after successful play
        this.updateSoundRuntimeState(soundCategory, audio);
      }).catch((error) => {
        console.error(`❌ [PLAY] Failed to play sound: fullPath="${fullPath}", error:`, error);
        if (onEndedCallback) onEndedCallback();
      });
    } catch (error) {
      console.error(`❌ [PLAY] Error creating/playing audio: fullPath="${fullPath}", error:`, error);
      if (onEndedCallback) onEndedCallback();
    }
  }
  
  // Play damage sequence with proper timing
  public playDamageSequence(
    attackerFighterId: string,
    defenderFighterId: string,
    attackerIsPlayer: boolean,
    isKillingBlow: boolean = false
  ): void {
    console.log(`⚔️ [SEQUENCE] Playing damage sequence: ${attackerFighterId} attacks ${defenderFighterId} (killing blow: ${isKillingBlow})`);
    
    // Step 1: Play attacker's punch sound
    this.playSfx('punch', attackerFighterId, attackerIsPlayer, () => {
      console.log(`🥊 [SEQUENCE] Attacker punch ended, waiting 200ms for defender grunt`);
      // Step 2: After punch ends, wait 200ms then play defender's grunt
      setTimeout(() => {
        this.playSfx('grunt', defenderFighterId, !attackerIsPlayer, () => {
          console.log(`😵 [SEQUENCE] Defender grunt ended, isKillingBlow: ${isKillingBlow}`);
          // Step 3: If it's a killing blow, wait 400ms then play defender's death sound
          if (isKillingBlow) {
            console.log(`💀 [SEQUENCE] Waiting 400ms for death sound`);
            setTimeout(() => {
              this.playSfx('death', defenderFighterId, !attackerIsPlayer);
            }, 400);
          }
        });
      }, 200);
    });
  }
  
  // Play session timeout sequence (opponent attacks player)
  public playSessionTimeoutSequence(
    opponentFighterId: string,
    playerFighterId: string,
    playerDies: boolean = false
  ): void {
    console.log(`⏰ [SEQUENCE] Playing session timeout sequence: ${opponentFighterId} attacks ${playerFighterId} (player dies: ${playerDies})`);
    
    // Opponent punch -> Player grunt -> (optional) Player death
    this.playDamageSequence(opponentFighterId, playerFighterId, false, playerDies);
  }
  
  // Play task timer expired sequence (opponent attacks player)
  public playTaskTimerExpiredSequence(
    opponentFighterId: string,
    playerFighterId: string,
    playerDies: boolean = false
  ): void {
    console.log(`⏱️ [SEQUENCE] Playing task timer expired sequence: ${opponentFighterId} attacks ${playerFighterId} (player dies: ${playerDies})`);
    
    // Opponent punch -> Player grunt -> (optional) Player death
    this.playDamageSequence(opponentFighterId, playerFighterId, false, playerDies);
  }
  
  public async playBGM(trackPath?: string): Promise<void> {
    const audioStore = useAudioStore.getState();
    const effectiveVolume = audioStore.getEffectiveVolume('music');
    
    if (effectiveVolume === 0) {
      console.log('🔇 [BGM] Music volume is 0, not playing BGM');
      return;
    }
    
    const track = trackPath || audioStore.currentBGM;
    
    // Don't restart if the same track is already playing
    if (this.currentBGMPath === track && this.currentBGMSource) {
      console.log(`🎵 [BGM] Track already playing: ${track}`);
      return;
    }
    
    // Stop current BGM if playing
    this.stopBGM();
    
    try {
      // Initialize audio context if needed
      if (!this.audioContext) {
        await this.initializeAudioContext();
      }
      
      if (!this.audioContext) {
        throw new Error('Failed to initialize AudioContext');
      }
      
      console.log(`🎵 [BGM] Loading and playing: ${track}`);
      
      // Load the audio buffer
      const audioBuffer = await this.loadAudioBuffer(track);
      
      // Create gain node for volume control
      this.bgmGainNode = this.audioContext.createGain();
      this.bgmGainNode.gain.value = effectiveVolume;
      this.bgmGainNode.connect(this.audioContext.destination);
      
      // Create and configure source node
      this.currentBGMSource = this.audioContext.createBufferSource();
      this.currentBGMSource.buffer = audioBuffer;
      this.currentBGMSource.loop = true; // Enable seamless looping
      this.currentBGMSource.connect(this.bgmGainNode);
      
      // Store current track path
      this.currentBGMPath = track;
      
      // Start playback
      this.currentBGMSource.start(0);
      
      console.log(`✅ [BGM] Successfully started playing: ${track} (gapless loop enabled)`);
      
      // Handle source ending (shouldn't happen with loop=true, but just in case)
      this.currentBGMSource.addEventListener('ended', () => {
        console.log('🔄 [BGM] Source ended unexpectedly, cleaning up');
        this.currentBGMSource = null;
        this.bgmGainNode = null;
        this.currentBGMPath = null;
      });
      
    } catch (error) {
      console.error(`❌ [BGM] Failed to play BGM: ${track}`, error);
      this.currentBGMSource = null;
      this.bgmGainNode = null;
      this.currentBGMPath = null;
    }
  }
  
  public stopBGM(): void {
    if (this.currentBGMSource) {
      try {
        this.currentBGMSource.stop();
        this.currentBGMSource.disconnect();
      } catch (error) {
        // Source might already be stopped, ignore error
        console.log('🔇 [BGM] Source already stopped or disconnected');
      }
      this.currentBGMSource = null;
    }
    
    if (this.bgmGainNode) {
      try {
        this.bgmGainNode.disconnect();
      } catch (error) {
        // Gain node might already be disconnected, ignore error
        console.log('🔇 [BGM] Gain node already disconnected');
      }
      this.bgmGainNode = null;
    }
    
    this.currentBGMPath = null;
    console.log('🔇 [BGM] BGM stopped and cleaned up');
  }
  
  public playWarningSound(): void {
    const audioStore = useAudioStore.getState();
    const effectiveVolume = audioStore.getEffectiveVolume('warning');
    
    if (effectiveVolume === 0) return;
    
    this.playSfx('timer-warning');
  }
  
  public playEventSound(eventType: 'victory' | 'defeat'): void {
    const audioStore = useAudioStore.getState();
    const effectiveVolume = audioStore.getEffectiveVolume('event');
    
    if (effectiveVolume === 0) return;
    
    // Stop BGM for event sounds
    this.stopBGM();
    
    // Map event types to sound files
    const soundMap = {
      'victory': 'round-victory',
      'defeat': 'player-death'
    };
    
    this.playSfx(soundMap[eventType], undefined, true, () => {
      // Restart BGM after event sound (after 1 second)
      setTimeout(() => {
        this.playBGM();
      }, 1000);
    });
  }
  
  public updateVolumes(): void {
    const audioStore = useAudioStore.getState();
    
    // Update BGM volume using Web Audio API gain node
    if (this.bgmGainNode) {
      const newVolume = audioStore.getEffectiveVolume('music');
      this.bgmGainNode.gain.value = newVolume;
      console.log(`🔊 [BGM] Volume updated to: ${newVolume}`);
    }
    
    console.log('🔊 Audio volumes updated');
  }
  
  public preloadCharacterSounds(fighterId: string): void {
    // This method is now redundant since all sounds are preloaded in constructor
    // But keeping it for compatibility
    console.log(`🎵 Character sounds for ${fighterId} already preloaded`);
  }
  
  // Test sound method for development
  public playTestSound(basePath: string): void {
    console.log(`🧪 [TEST] Playing test sound: ${basePath}`);
    
    // Check if the base path is already loaded
    const fullPath = this.loadedSoundMap.get(basePath);
    if (fullPath) {
      const element = this.audioElements.get(fullPath);
      if (element && !element.isLoading) {
        try {
          const audio = element.audio.cloneNode() as HTMLAudioElement;
          audio.volume = 0.7;
          audio.play().then(() => {
            console.log(`✅ [TEST] Test sound played successfully: ${basePath} -> ${fullPath}`);
          }).catch((error) => {
            console.error(`❌ [TEST] Failed to play test sound: ${basePath}`, error);
          });
          return;
        } catch (error) {
          console.error(`❌ [TEST] Error creating test audio: ${basePath}`, error);
        }
      }
    }
    
    // If not preloaded, try to load it on the fly for testing
    this.tryLoadTestSound(basePath);
  }
  
  private async tryLoadTestSound(basePath: string): Promise<void> {
    console.log(`🔍 [TEST] Attempting to load test sound on-the-fly: ${basePath}`);
    
    for (const extension of SUPPORTED_AUDIO_EXTENSIONS) {
      const fullPath = basePath + extension;
      
      try {
        const audio = new Audio(fullPath);
        audio.volume = 0.7;
        
        await audio.play();
        console.log(`✅ [TEST] Test sound played successfully: ${basePath} -> ${fullPath}`);
        return;
        
      } catch (error) {
        console.log(`❌ [TEST] Failed to load test sound ${fullPath}: ${error}`);
        continue; // Try next extension
      }
    }
    
    console.error(`❌ [TEST] Could not find any supported audio file for test: ${basePath}`);
  }
  
  // Stop all SFX method for development
  public stopAllSfx(): void {
    console.log('🛑 [STOP] Stopping all SFX sounds');
    
    // Reset all runtime states
    this.soundRuntimeState.forEach((state, category) => {
      state.activeCount = 0;
      console.log(`🔇 [STOP] Reset runtime state for: ${category}`);
    });
    
    console.log('✅ [STOP] All SFX sounds stopped and runtime states reset');
  }
  
  public cleanup(): void {
    this.stopBGM();
    this.soundRuntimeState.clear();
    
    // Clean up Web Audio API resources
    if (this.audioContext) {
      this.audioContext.close().then(() => {
        console.log('🧹 [CLEANUP] AudioContext closed');
      }).catch((error) => {
        console.warn('⚠️ [CLEANUP] Error closing AudioContext:', error);
      });
      this.audioContext = null;
    }
    
    // Clear buffer cache
    this.bgmBufferCache.clear();
    
    console.log('🧹 Audio Manager cleaned up');
  }
}

// Create singleton instance
export const audioManager = new AudioManager();

// Subscribe to audio store changes to update volumes
useAudioStore.subscribe((state, prevState) => {
  // Check if any volume or enabled setting changed
  const volumeChanged = 
    state.masterVolume !== prevState.masterVolume ||
    state.sfxVolume !== prevState.sfxVolume ||
    state.musicVolume !== prevState.musicVolume ||
    state.warningVolume !== prevState.warningVolume ||
    state.eventVolume !== prevState.eventVolume ||
    state.sfxEnabled !== prevState.sfxEnabled ||
    state.musicEnabled !== prevState.musicEnabled ||
    state.warningEnabled !== prevState.warningEnabled ||
    state.eventEnabled !== prevState.eventEnabled;
  
  if (volumeChanged) {
    audioManager.updateVolumes();
  }
  
  // Handle BGM changes
  if (state.currentBGM !== prevState.currentBGM) {
    audioManager.playBGM(state.currentBGM);
  }
  
  // Handle music enable/disable
  if (state.musicEnabled !== prevState.musicEnabled) {
    if (state.musicEnabled) {
      audioManager.playBGM();
    } else {
      audioManager.stopBGM();
    }
  }
});

export default audioManager;