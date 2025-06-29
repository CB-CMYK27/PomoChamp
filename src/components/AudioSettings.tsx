import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudioStore } from '../store/audioStore';
import { audioManager } from '../utils/audioManager';
import { Volume2, VolumeX, Music, Zap, AlertTriangle, Trophy, ArrowLeft, RotateCcw, Play, Square } from 'lucide-react';

const AudioSettings: React.FC = () => {
  const navigate = useNavigate();
  const [testSoundPath, setTestSoundPath] = useState('/sfx/timer-warning');
  
  const {
    masterVolume,
    sfxVolume,
    musicVolume,
    warningVolume,
    eventVolume,
    sfxEnabled,
    musicEnabled,
    warningEnabled,
    eventEnabled,
    currentBGM,
    availableBGM,
    setMasterVolume,
    setSfxVolume,
    setMusicVolume,
    setWarningVolume,
    setEventVolume,
    toggleSfx,
    toggleMusic,
    toggleWarning,
    toggleEvent,
    setBGM,
    resetToDefaults
  } = useAudioStore();

  const VolumeSlider: React.FC<{
    label: string;
    icon: React.ReactNode;
    value: number;
    enabled: boolean;
    onChange: (value: number) => void;
    onToggle: () => void;
    color: string;
  }> = ({ label, icon, value, enabled, onChange, onToggle, color }) => (
    <div className={`bg-black/40 rounded-lg p-4 border-2 ${enabled ? color : 'border-gray-600'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon}
          <span className={`font-mono text-sm font-bold ${enabled ? 'text-white' : 'text-gray-500'}`}>
            {label}
          </span>
        </div>
        <button
          onClick={onToggle}
          className={`p-2 rounded transition-colors ${
            enabled 
              ? `${color.replace('border-', 'bg-')} text-white` 
              : 'bg-gray-600 text-gray-400'
          }`}
        >
          {enabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
      </div>
      
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-400 w-8">0%</span>
        <div className="flex-1 relative">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            disabled={!enabled}
            className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
              enabled ? 'bg-gray-700' : 'bg-gray-800'
            }`}
            style={{
              background: enabled 
                ? `linear-gradient(to right, ${color.includes('neonYel') ? '#FFC300' : color.includes('crtBlue') ? '#07399D' : color.includes('neonRed') ? '#FE1C06' : '#10b981'} 0%, ${color.includes('neonYel') ? '#FFC300' : color.includes('crtBlue') ? '#07399D' : color.includes('neonRed') ? '#FE1C06' : '#10b981'} ${value * 100}%, #374151 ${value * 100}%, #374151 100%)`
                : '#1f2937'
            }}
          />
        </div>
        <span className="text-xs text-gray-400 w-10 text-right">
          {Math.round(value * 100)}%
        </span>
      </div>
    </div>
  );

  const getBGMDisplayName = (path: string) => {
    const filename = path.split('/').pop()?.replace('.mp3', '') || '';
    return filename.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const handlePlayTestSound = () => {
    audioManager.playTestSound(testSoundPath);
  };

  const handleStopAllSounds = () => {
    audioManager.stopAllSfx();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-crtBlue to-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/mode')}
              className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg border-2 border-gray-500 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="font-mono text-xl md:text-2xl text-neonYel font-bold">
              🔊 AUDIO SETTINGS
            </h1>
          </div>
          
          <button
            onClick={resetToDefaults}
            className="bg-neonRed hover:bg-neonRed/80 text-white px-4 py-2 rounded-lg border-2 border-neonRed/80 font-mono text-sm font-bold transition-colors flex items-center gap-2"
          >
            <RotateCcw size={16} />
            RESET
          </button>
        </div>

        {/* Master Volume */}
        <div className="mb-6">
          <h2 className="text-neonYel font-mono text-lg font-bold mb-4">MASTER CONTROLS</h2>
          <VolumeSlider
            label="MASTER VOLUME"
            icon={<Volume2 size={20} className="text-neonYel" />}
            value={masterVolume}
            enabled={true}
            onChange={setMasterVolume}
            onToggle={() => {}} // Master volume can't be disabled
            color="border-neonYel"
          />
        </div>

        {/* Sound Categories */}
        <div className="mb-6">
          <h2 className="text-neonYel font-mono text-lg font-bold mb-4">SOUND CATEGORIES</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <VolumeSlider
              label="SOUND EFFECTS"
              icon={<Zap size={20} className={sfxEnabled ? 'text-crtBlue' : 'text-gray-500'} />}
              value={sfxVolume}
              enabled={sfxEnabled}
              onChange={setSfxVolume}
              onToggle={toggleSfx}
              color="border-crtBlue"
            />
            
            <VolumeSlider
              label="BACKGROUND MUSIC"
              icon={<Music size={20} className={musicEnabled ? 'text-green-400' : 'text-gray-500'} />}
              value={musicVolume}
              enabled={musicEnabled}
              onChange={setMusicVolume}
              onToggle={toggleMusic}
              color="border-green-400"
            />
            
            <VolumeSlider
              label="WARNING SOUNDS"
              icon={<AlertTriangle size={20} className={warningEnabled ? 'text-orange-400' : 'text-gray-500'} />}
              value={warningVolume}
              enabled={warningEnabled}
              onChange={setWarningVolume}
              onToggle={toggleWarning}
              color="border-orange-400"
            />
            
            <VolumeSlider
              label="EVENT SOUNDS"
              icon={<Trophy size={20} className={eventEnabled ? 'text-purple-400' : 'text-gray-500'} />}
              value={eventVolume}
              enabled={eventEnabled}
              onChange={setEventVolume}
              onToggle={toggleEvent}
              color="border-purple-400"
            />
          </div>
        </div>

        {/* Background Music Selection */}
        <div className="mb-6">
          <h2 className="text-neonYel font-mono text-lg font-bold mb-4">BACKGROUND MUSIC</h2>
          <div className="bg-black/40 rounded-lg p-4 border-2 border-green-400">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableBGM.map((track) => (
                <button
                  key={track}
                  onClick={() => setBGM(track)}
                  className={`p-3 rounded-lg border-2 font-mono text-sm font-bold transition-colors ${
                    currentBGM === track
                      ? 'bg-green-400 text-black border-green-400'
                      : 'bg-gray-700 text-white border-gray-500 hover:border-green-400'
                  }`}
                >
                  {getBGMDisplayName(track)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Development Test Section - Only visible in development */}
        {import.meta.env.DEV && (
          <div className="mb-6">
            <h2 className="text-neonRed font-mono text-lg font-bold mb-4">🧪 DEVELOPMENT TESTING</h2>
            <div className="bg-black/40 rounded-lg p-4 border-2 border-neonRed">
              <div className="mb-4">
                <label className="block text-white font-mono text-sm font-bold mb-2">
                  Test Sound Base Path (without extension):
                </label>
                <input
                  type="text"
                  value={testSoundPath}
                  onChange={(e) => setTestSoundPath(e.target.value)}
                  placeholder="/sfx/timer-warning"
                  className="w-full bg-gray-700 text-white border-2 border-gray-500 rounded px-3 py-2 font-mono text-sm focus:border-neonRed focus:outline-none"
                />
                <div className="text-gray-400 font-mono text-xs mt-1">
                  Examples: /sfx/timer-warning, /sfx/player-punch, /sfx/round-victory, /sfx/fighters/jack-tower/grunt
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handlePlayTestSound}
                  className="bg-neonRed hover:bg-neonRed/80 text-white px-4 py-2 rounded-lg border-2 border-neonRed/80 font-mono text-sm font-bold transition-colors flex items-center gap-2"
                >
                  <Play size={16} />
                  PLAY TEST SOUND
                </button>
                
                <button
                  onClick={handleStopAllSounds}
                  className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg border-2 border-gray-400 font-mono text-sm font-bold transition-colors flex items-center gap-2"
                >
                  <Square size={16} />
                  STOP ALL SFX
                </button>
              </div>
              
              <div className="mt-3 text-neonYel font-mono text-xs">
                ⚠️ This section is only visible in development mode<br/>
                🎵 Audio system automatically detects .flac, .wav, .ogg, .mp3 extensions
              </div>
            </div>
          </div>
        )}

        {/* Audio Info */}
        <div className="bg-black/40 rounded-lg p-4 border-2 border-gray-600">
          <h3 className="text-white font-mono text-sm font-bold mb-2">AUDIO SYSTEM INFO</h3>
          <div className="text-gray-400 font-mono text-xs space-y-1">
            <div>• Flexible audio format support (.flac, .wav, .ogg, .mp3)</div>
            <div>• Character-specific punch and grunt sounds with fallbacks</div>
            <div>• Dynamic volume mixing and timing controls</div>
            <div>• Settings automatically saved to browser storage</div>
            <div>• Sound timing prevents audio overlap and clashing</div>
            {import.meta.env.DEV && (
              <div className="text-neonRed">• Development test tools enabled</div>
            )}
          </div>
        </div>

        {/* Test Sounds */}
        <div className="mt-6 text-center">
          <div className="text-gray-400 font-mono text-sm mb-4">
            💡 Start a battle to test your audio settings!
          </div>
          <button
            onClick={() => navigate('/quick-battle')}
            className="bg-neonYel text-black px-6 py-3 rounded-lg font-mono text-lg font-bold hover:bg-neonYel/80 transition-colors"
          >
            START QUICK BATTLE
          </button>
        </div>
      </div>
    </div>
  );
};

export default AudioSettings;