import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudioStore } from '../store/audioStore';
import { audioManager } from '../utils/audioManager';
import { Volume2, VolumeX, Music, Zap, AlertTriangle, ArrowLeft, RotateCcw, Play, Square } from 'lucide-react';
import SpinalTapModal from './SpinalTapModal';

/* ───── Steel Frame Component (copied from ModeSelect.tsx) ──── */
const SteelFrame: React.FC<
  React.PropsWithChildren<{ disabled?: boolean; className?: string }>
> = ({ disabled, className = '', children }) => (
  <div
    className={`relative p-4 ${className}`}
    style={{
      background: '#4a5568',                // dark grey outer border
      boxShadow:
        'inset 0 0 4px #000, 0 0 6px rgba(255,255,255,.3)', // bevel
    }}
  >
    {/* Inner lighter grey border with rivets */}
    <div 
      className="relative w-full h-full p-3" // Added padding to make light grey visible
      style={{
        background: '#a0aec0',              // lighter grey inner border
        border: '2px solid #4a5568'         // reduced border to show more light grey
      }}
    >
      {/* 8 rivets (small circles) positioned ON the light grey frame */}
      {[
        'top-3 left-3',                              // positioned on light grey frame
        'top-3 left-1/2 -translate-x-1/2',          // top center on frame
        'top-3 right-3',                             // positioned on light grey frame
        'top-1/2 -translate-y-1/2 left-3',          // middle left on frame
        'top-1/2 -translate-y-1/2 right-3',         // middle right on frame
        'bottom-3 left-3',                           // positioned on light grey frame
        'bottom-3 left-1/2 -translate-x-1/2',       // bottom center on frame
        'bottom-3 right-3',                          // positioned on light grey frame
      ].map((pos, i) => (
        <span
          key={i}
          className={`absolute ${pos.replace('middle', 'top-1/2 -translate-y-1/2')}
                      w-3 h-3 bg-gray-700 rounded-full
                      shadow-[inset_0_1px_1px_#fff4,0_0_3px_#0009]`}
        />
      ))}

      {/* Black card content area */}
      <div 
        className="w-full h-full p-6"
        style={{
          background: '#0D0D0F'              // black inner screen
        }}
      >
        {/* content */}
        <div className="h-full">{children}</div>
      </div>
    </div>
  </div>
);

const AudioSettings: React.FC = () => {
  const navigate = useNavigate();
  const [testSoundPath, setTestSoundPath] = useState('/sfx/timer-warning');
  const [showSpinalTapModal, setShowSpinalTapModal] = useState(false);
  
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
    toggleAlerts,
    setBGM,
    resetToDefaults
  } = useAudioStore();

  // Check if alerts are enabled (both warning and event sounds)
  const alertsEnabled = warningEnabled && eventEnabled;

  const VolumeSlider: React.FC<{
    label: string;
    icon: React.ReactNode;
    value: number;
    enabled: boolean;
    onChange: (value: number) => void;
    onToggle: () => void;
    color: string;
  }> = ({ label, icon, value, enabled, onChange, onToggle, color }) => (
    <div className={`bg-bezel/50 rounded-lg p-4 border-2 ${enabled ? color : 'border-gray-600'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon}
          <span className={`font-arcade text-sm font-bold ${enabled ? 'text-white' : 'text-gray-500'}`}>
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
        <span className="text-xs text-gray-400 w-8">0</span>
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
                ? `linear-gradient(to right, ${color.includes('neonYel') ? '#FFC300' : color.includes('crtBlue') ? '#07399D' : color.includes('neonRed') ? '#FE1C06' : color.includes('orange') ? '#FF7300' : '#10b981'} 0%, ${color.includes('neonYel') ? '#FFC300' : color.includes('crtBlue') ? '#07399D' : color.includes('neonRed') ? '#FE1C06' : color.includes('orange') ? '#FF7300' : '#10b981'} ${value * 100}%, #374151 ${value * 100}%, #374151 100%)`
                : '#1f2937'
            }}
          />
        </div>
        <span className="text-xs text-gray-400 w-10 text-right">
          {Math.round(value * 11)}
        </span>
      </div>
    </div>
  );

  const getBGMDisplayName = (path: string) => {
    const filename = path.split('/').pop()?.replace('.wav', '') || '';
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

  // Handle synchronized alerts volume change
  const handleAlertsVolumeChange = (value: number) => {
    setWarningVolume(value);
    setEventVolume(value);
  };

  // Spinal Tap Easter Egg - Turn everything to 11!
  const handleSpinalTapClick = () => {
    console.log('🎸 SPINAL TAP EASTER EGG ACTIVATED - TURNING EVERYTHING TO 11!');
    
    // Set all volumes to maximum (1.0 = 11 on our scale)
    setMasterVolume(1.0);
    setSfxVolume(1.0);
    setMusicVolume(1.0);
    setWarningVolume(1.0);
    setEventVolume(1.0);
    
    // Also enable all audio categories if they're disabled
    if (!sfxEnabled) toggleSfx();
    if (!musicEnabled) toggleMusic();
    if (!warningEnabled) toggleWarning();
    if (!eventEnabled) toggleEvent();
    
    // Show the modal
    setShowSpinalTapModal(true);
  };

  const handleCloseSpinalTapModal = () => {
    setShowSpinalTapModal(false);
  };

  return (
    <>
      <div className="min-h-screen bg-bezel font-arcade text-white flex justify-center py-10 px-8 lg:px-14">
        <div className="w-full max-w-6xl space-y-10">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="bg-crtBlue hover:bg-crtBlue/80 text-white p-2 rounded-lg border-2 border-crtBlue/80 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 
                className="text-primary text-xl md:text-2xl font-bold"
                style={{
                  textShadow: '-3px 3px #07399D, 3px -3px #FE1C06, 0 0 12px rgba(255,255,255,.4)'
                }}
              >
                🔊 AUDIO SETTINGS
              </h1>
            </div>
            
            <button
              onClick={resetToDefaults}
              className="bg-neonRed hover:bg-neonRed/80 text-white px-4 py-2 rounded-lg border-2 border-neonRed/80 font-arcade text-sm font-bold transition-colors flex items-center gap-2"
            >
              <RotateCcw size={16} />
              RESET
            </button>
          </div>

          {/* Master Volume Section */}
          <SteelFrame>
            <div className="space-y-4">
              <h2 className="text-primary font-arcade text-lg font-bold mb-4">MASTER CONTROLS</h2>
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
          </SteelFrame>

          {/* Sound Categories Section */}
          <SteelFrame>
            <div className="space-y-4">
              <h2 className="text-primary font-arcade text-lg font-bold mb-4">SOUND CATEGORIES</h2>
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
                
                <div className="md:col-span-2">
                  <VolumeSlider
                    label="ALERTS"
                    icon={<AlertTriangle size={20} className={alertsEnabled ? 'text-orange-400' : 'text-gray-500'} />}
                    value={warningVolume}
                    enabled={alertsEnabled}
                    onChange={handleAlertsVolumeChange}
                    onToggle={toggleAlerts}
                    color="border-orange-400"
                  />
                </div>
              </div>
            </div>
          </SteelFrame>

          {/* Background Music Selection Section */}
          <SteelFrame>
            <div className="space-y-4">
              <h2 className="text-primary font-arcade text-lg font-bold mb-4">BACKGROUND MUSIC</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableBGM.map((track) => (
                  <button
                    key={track}
                    onClick={() => setBGM(track)}
                    className={`p-3 rounded-lg border-2 font-arcade text-sm font-bold transition-colors ${
                      currentBGM === track
                        ? 'bg-green-400 text-black border-green-400'
                        : 'bg-bezel/50 text-white border-gray-500 hover:border-green-400'
                    }`}
                  >
                    {getBGMDisplayName(track)}
                  </button>
                ))}
              </div>
            </div>
          </SteelFrame>

          {/* Development Test Section - Only visible in development */}
          {import.meta.env.DEV && (
            <SteelFrame>
              <div className="space-y-4">
                <h2 className="text-neonRed font-arcade text-lg font-bold mb-4">🧪 DEVELOPMENT TESTING</h2>
                <div className="mb-4">
                  <label className="block text-white font-arcade text-sm font-bold mb-2">
                    Test Sound Base Path (without extension):
                  </label>
                  <input
                    type="text"
                    value={testSoundPath}
                    onChange={(e) => setTestSoundPath(e.target.value)}
                    placeholder="/sfx/timer-warning"
                    className="w-full bg-bezel border-2 border-crtBlue rounded px-3 py-2 text-white font-mono text-sm focus:border-neonYel focus:outline-none"
                  />
                  <div className="text-gray-400 font-mono text-xs mt-1">
                    Examples: /sfx/timer-warning, /sfx/player-punch, /sfx/round-victory, /sfx/fighters/jack-tower/grunt
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={handlePlayTestSound}
                    className="bg-neonRed hover:bg-neonRed/80 text-white px-4 py-2 rounded-lg border-2 border-neonRed/80 font-arcade text-sm font-bold transition-colors flex items-center gap-2"
                  >
                    <Play size={16} />
                    PLAY TEST SOUND
                  </button>
                  
                  <button
                    onClick={handleStopAllSounds}
                    className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg border-2 border-gray-400 font-arcade text-sm font-bold transition-colors flex items-center gap-2"
                  >
                    <Square size={16} />
                    STOP ALL SFX
                  </button>
                </div>
                
                <div className="mt-3 text-neonYel font-arcade text-xs">
                  ⚠️ This section is only visible in development mode<br/>
                  🎵 Audio system automatically detects .flac, .wav, .ogg, .mp3 extensions
                </div>
              </div>
            </SteelFrame>
          )}

          {/* Audio Info Section */}
          <SteelFrame>
            <div className="space-y-4">
              <h3 className="text-white font-arcade text-sm font-bold mb-2">AUDIO SYSTEM INFO</h3>
              <div className="text-gray-400 font-mono text-xs space-y-1">
                <div>• Flexible audio format support (.flac, .wav, .ogg, .mp3)</div>
                <div>• Character-specific punch and grunt sounds with fallbacks</div>
                <div>• Dynamic volume mixing and timing controls</div>
                <div>• Settings automatically saved to browser storage</div>
                <div>• Sound timing prevents audio overlap and clashing</div>
                <div>• Volume goes to 11 (because it's one louder)</div>
                {import.meta.env.DEV && (
                  <div className="text-neonRed">• Development test tools enabled</div>
                )}
              </div>
            </div>
          </SteelFrame>

          {/* Spinal Tap Easter Egg */}
          <div className="text-center">
            <img 
              src="/images/spinal-tap.png" 
              alt="Spinal Tap Easter Egg"
              onClick={handleSpinalTapClick}
              className="mx-auto cursor-pointer hover:scale-105 transition-transform duration-200 max-w-xs opacity-80 hover:opacity-100"
              title="These go to eleven..."
            />
          </div>

          {/* Test Sounds Section */}
          <div className="text-center">
            <div className="text-gray-400 font-arcade text-sm mb-4">
              💡 Start a battle to test your audio settings!
            </div>
            <button
              onClick={() => navigate('/quick-battle')}
              className="bg-neonYel text-black px-6 py-3 rounded-lg font-arcade text-lg font-bold hover:bg-neonYel/80 transition-colors border-2 border-neonYel"
            >
              START QUICK BATTLE
            </button>
          </div>
        </div>
      </div>

      {/* Spinal Tap Modal */}
      {showSpinalTapModal && (
        <SpinalTapModal onClose={handleCloseSpinalTapModal} />
      )}
    </>
  );
};

export default AudioSettings;