import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Volume2, VolumeX, Settings, ArrowLeft, Home, Award, Play, Pause } from 'lucide-react';
import { useAudioStore } from '../store/audioStore';
import { useGameStore } from '../store/gameStore';

const HamburgerMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);
  
  const {
    musicEnabled,
    sfxEnabled,
    warningEnabled,
    eventEnabled,
    toggleMusic,
    toggleSfx,
    toggleAlerts
  } = useAudioStore();
  
  const {
    fightScreenGameState,
    triggerTogglePause
  } = useGameStore();
  
  // Check if alerts are enabled (both warning and event sounds)
  const alertsEnabled = warningEnabled && eventEnabled;
  
  // Check if we're in a fight screen state that should show pause button
  const showFightControls = fightScreenGameState && 
    ['fighting', 'paused', 'victory', 'defeat', 'draw'].includes(fightScreenGameState);
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  
  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);
  
  const handleNavigation = (path: string) => {
    // Special handling for audio settings navigation from fight screen
    if (path === '/settings/audio' && fightScreenGameState === 'fighting') {
      console.log('🎵 Navigating to audio settings from fight screen - pausing game');
      triggerTogglePause(); // Pause the game before navigating
    }
    
    setIsOpen(false);
    navigate(path);
  };
  
  const handleGoBack = () => {
    setIsOpen(false);
    navigate(-1);
  };
  
  const handleTogglePause = () => {
    triggerTogglePause();
  };
  
  // Don't show "Main Screen" button on the attract screen
  const showMainScreenButton = location.pathname !== '/';
  
  // Toggle component for audio settings
  const AudioToggle: React.FC<{
    label: string;
    enabled: boolean;
    onToggle: () => void;
    icon: React.ReactNode;
  }> = ({ label, enabled, onToggle, icon }) => (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        {icon}
        <span className="font-mono text-sm font-bold text-white">{label}</span>
      </div>
      <button
        onClick={onToggle}
        className={`relative w-12 h-6 rounded-full border-2 transition-colors ${
          enabled 
            ? 'bg-neonYel border-neonYel' 
            : 'bg-gray-600 border-gray-500'
        }`}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
  
  return (
    <div className="fixed top-4 right-4 z-50" ref={menuRef}>
      {/* Fight Controls Container - Pause Button */}
      <div className="flex items-center gap-3 mb-3">
        {/* Pause/Resume Button - only show during fight - NOW RED */}
        {showFightControls && (
          <button
            onClick={handleTogglePause}
            className="w-12 h-12 bg-neonRed hover:bg-neonRed/80 rounded-lg border-2 border-neonRed/80 flex items-center justify-center transition-colors"
          >
            {fightScreenGameState === 'paused' ? (
              <Play size={20} className="text-white" />
            ) : (
              <Pause size={20} className="text-white" />
            )}
          </button>
        )}
        
        {/* Hamburger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-12 bg-crtBlue hover:bg-crtBlue/80 rounded-lg border-2 border-crtBlue/80 flex items-center justify-center transition-colors"
        >
          {isOpen ? (
            <X size={24} className="text-white" />
          ) : (
            <Menu size={24} className="text-white" />
          )}
        </button>
      </div>
      
      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-14 right-0 w-64 bg-black/95 border-2 border-crtBlue rounded-lg p-4 shadow-lg">
          {/* Audio Toggles Section */}
          <div className="mb-4 pb-4 border-b border-gray-600">
            <h3 className="text-neonYel font-mono text-xs font-bold mb-3 uppercase tracking-wider">
              Audio Controls
            </h3>
            
            <AudioToggle
              label="Music"
              enabled={musicEnabled}
              onToggle={toggleMusic}
              icon={musicEnabled ? <Volume2 size={16} className="text-neonYel" /> : <VolumeX size={16} className="text-gray-400" />}
            />
            
            <AudioToggle
              label="SFX"
              enabled={sfxEnabled}
              onToggle={toggleSfx}
              icon={sfxEnabled ? <Volume2 size={16} className="text-neonYel" /> : <VolumeX size={16} className="text-gray-400" />}
            />
            
            <AudioToggle
              label="Alerts"
              enabled={alertsEnabled}
              onToggle={toggleAlerts}
              icon={alertsEnabled ? <Volume2 size={16} className="text-neonYel" /> : <VolumeX size={16} className="text-gray-400" />}
            />
          </div>
          
          {/* Navigation Section */}
          <div className="space-y-2">
            <button
              onClick={() => handleNavigation('/settings/audio')}
              className="w-full flex items-center gap-3 px-3 py-2 text-left font-mono text-sm text-white hover:bg-crtBlue/20 rounded transition-colors"
            >
              <Settings size={16} className="text-neonYel" />
              Audio Settings
            </button>
            
            <button
              onClick={handleGoBack}
              className="w-full flex items-center gap-3 px-3 py-2 text-left font-mono text-sm text-white hover:bg-crtBlue/20 rounded transition-colors"
            >
              <ArrowLeft size={16} className="text-neonYel" />
              Go Back
            </button>
            
            {showMainScreenButton && (
              <button
                onClick={() => handleNavigation('/')}
                className="w-full flex items-center gap-3 px-3 py-2 text-left font-mono text-sm text-white hover:bg-crtBlue/20 rounded transition-colors"
              >
                <Home size={16} className="text-neonYel" />
                Main Screen
              </button>
            )}
            
            <button
              onClick={() => handleNavigation('/credits')}
              className="w-full flex items-center gap-3 px-3 py-2 text-left font-mono text-sm text-white hover:bg-crtBlue/20 rounded transition-colors"
            >
              <Award size={16} className="text-neonYel" />
              Credits
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HamburgerMenu;