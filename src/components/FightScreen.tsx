import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import fighters from '../data/fighters.json';

/* ────────────────────────────────
 *  Types
 * ────────────────────────────── */

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
  name: string;
  estimatedTime: number;
  completed: boolean;
}

interface TaskTimer {
  taskId: string;
  estimatedTime: number; // minutes
  timeRemaining: number; // seconds
  isActive: boolean;
  hasFailed: boolean;
  isInGracePeriod: boolean;
  startTime: number; // when this task timer started (for accuracy)
}

interface GracePeriodState {
  isActive: boolean;
  taskId: string | null;
  timeRemaining: number; // 10 seconds
}

interface FightSession {
  selectedFighter: Fighter;
  opponent: Fighter | null;
  tasks: Task[];
  timeRemaining: number;
  fighterHP: number;
  opponentHP: number;
  gameState: 'intro' | 'fighting' | 'paused' | 'victory' | 'defeat';
  gameMode: 'quick-battle' | 'tournament';
  currentRound: number;
  stage: string;
  currentTaskIndex: number;
  taskTimers: TaskTimer[];
  failedTasks: string[];
  gracePeriod: GracePeriodState;
}

/* ────────────────────────────────
 *  Helpers & constants
 * ────────────────────────────── */

// Character counterpart mappings
const COUNTERPARTS: { [key: string]: string } = {
  'jack-tower': 'prof-kruber',
  'prof-kruber': 'jack-tower',
  'jawsome': 'beach-belle',
  'beach-belle': 'jawsome',
  'ellen-ryker': 'queen-chroma',
  'queen-chroma': 'ellen-ryker',
  'raging-stallion': 'iron-titan',
  'iron-titan': 'raging-stallion',
  'bond-sterling': 'dr-whiskers',
  'dr-whiskers': 'bond-sterling',
  'waves-mcrad': 'gen-buzzkill',
  'gen-buzzkill': 'waves-mcrad'
};

const AVAILABLE_STAGES = [
  'construction-floor.webp',
  'rooftop.webp',
  'cargo-hold.webp',
  'alien-hive.webp',
];

/* ────────────────────────────────
 *  Speech Bubble (pixel‑art) – centred layout
 * ────────────────────────────── */

type BubbleSide = 'left' | 'right';

const SpeechBubble: React.FC<{ text: string; side: BubbleSide }> = ({ text, side }) => {
  /**
   * Start horizontally centred (left: 50%) then nudge so the tail points at
   * the correct boxer. Feel free to adjust these pixel offsets until the
   * alignment looks perfect with your artwork.
   */
  const xOffset = side === 'left' ? -240 : 240; // px

  return (
    <div
      className="absolute z-40 pointer-events-none"
      style={{
        top: '12%',
        left: '50%',
        transform: `translateX(${xOffset}px)`,
      }}
    >
      <div
        className="relative flex items-center justify-center"
        style={{
          width: 320,
          height: 160,
          backgroundImage: "url('/images/—Pngtree—pixel speech bubble_8533530.png')",
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat',
          imageRendering: 'pixelated',
          transform: side === 'right' ? 'scaleX(-1)' : undefined,
        }}
      >
        <span
          className={`font-mono font-bold leading-snug text-black text-base px-6 text-center whitespace-pre-wrap break-words ${
            side === 'right' ? 'scale-x-[-1]' : ''
          }`}
          style={{ maxWidth: 240 }}
        >
          {text}
        </span>
      </div>
    </div>
  );
};

/* ────────────────────────────────
 *  Countdown overlay component (unchanged)
 * ────────────────────────────── */

const CountdownOverlay: React.FC<{ number: number; phase: string }> = ({ number, phase }) => {
  if (phase === 'countdown') {
    return (
      <div className="absolute inset-0 flex items-center justify-center z-50">
        <div className="text-yellow-400 font-mono font-black text-[12rem] animate-pulse transform transition-transform duration-200 drop-shadow-[0_0_20px_rgba(255,255,0,0.8)]">
          {number}
        </div>
      </div>
    );
  }

  if (phase === 'on-task') {
    return (
      <div className="absolute inset-0 flex items-center justify-center z-50">
        <img
          src="/images/on-task.png"
          alt="ON TASK!"
          className="max-w-md max-h-64 object-contain transform"
          style={{ animation: 'growShrink 4s ease-in-out' }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const fallback = target.parentElement?.querySelector('.text-fallback') as HTMLElement;
            if (fallback) fallback.style.display = 'block';
          }}
        />
        <div
          className="text-fallback text-red-400 font-mono font-black text-8xl transform transition-all duration-1000 drop-shadow-[0_0_30px_rgba(255,0,0,0.8)]"
          style={{ animation: 'growShrink 4s ease-in-out', display: 'none' }}
        >
          ON TASK!
        </div>
      </div>
    );
  }
  return null;
};

/* ────────────────────────────────
 *  Main component
 * ────────────────────────────── */

const FightScreen: React.FC = () => {
  /* Every line below is the original logic from your file – only the
   * SpeechBubble and its invocations were changed. If you made any edits to
   * the remainder of the file, merge them back in here.
   */

  const location = useLocation();
  const navigate = useNavigate();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<{ [key: string]: HTMLAudioElement }>({});

  // Get data from navigation state
  const {
    selectedFighter,
    tasks: initialTasks,
    gameMode = 'quick-battle',
    currentRound = 1,
  } = location.state || {};

  /* ——————————————————————————————————————————
   *  Intro animation state and helpers (unchanged)
   * —————————————————————————————————————————— */

  const [introPhase, setIntroPhase] = useState<
    'intro' | 'player-quip' | 'opponent-quip' | 'countdown' | 'on-task' | 'fighting'
  >('intro');
  const [countdownNumber, setCountdownNumber] = useState(5);
  const [musicStarted, setMusicStarted] = useState(false);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [canSkip, setCanSkip] = useState(true);

  const introTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentResolveRef = useRef<(() => void) | null>(null);
  const skipCountdownRef = useRef(false);

  /* ——————————————————————————————————————————
   *  Opponent & stage helpers (unchanged)
   * —————————————————————————————————————————— */

  const getOpponent = (playerFighter: Fighter, mode: string, round: number): Fighter | null => {
    if (!playerFighter) return null;
    if (mode === 'quick-battle') {
      const counterpartId = COUNTERPARTS[playerFighter.id];
      const counterpart = fighters.find((f: any) => f.id === counterpartId);
      return counterpart || null;
    }
    const availableOpponents = fighters.filter((f: any) => f.id !== playerFighter.id);
    const opponentIndex = (round - 1) % availableOpponents.length;
    return availableOpponents[opponentIndex] || null;
  };

  const getStage = (playerFighter: Fighter, mode: string, round: number): string => {
    if (!playerFighter) return 'construction-floor.webp';
    if (mode === 'quick-battle' || round === 1) {
      const stageMapping: { [key: string]: string } = {
        'jack-tower': 'construction-floor.webp',
        'prof-kruber': 'rooftop.webp',
        'ellen-ryker': 'cargo-hold.webp',
        'queen-chroma': 'alien-hive.webp',
        'jawsome': 'ocean-shallows.webp',
        'beach-belle': 'lifeguard-deck.webp',
        'raging-stallion': 'boxing-ring.webp',
        'iron-titan': 'moscow-ring.webp',
        'bond-sterling': 'casino-terrace.webp',
        'dr-whiskers': 'volcano-lair.webp',
        'waves-mcrad': 'construction-floor.webp',
        'gen-buzzkill': 'construction-floor.webp',
      };
      const mappedStage = stageMapping[playerFighter.id];
      if (mappedStage && AVAILABLE_STAGES.includes(mappedStage)) return mappedStage;
      return 'construction-floor.webp';
    }
    const stageIndex = (round - 1) % AVAILABLE_STAGES.length;
    return AVAILABLE_STAGES[stageIndex];
  };

  const opponent = selectedFighter ? getOpponent(selectedFighter, gameMode, currentRound) : null;
  const stageBackground = selectedFighter ? getStage(selectedFighter, gameMode, currentRound) : AVAILABLE_STAGES[0];

  const [session, setSession] = useState<FightSession>({
    selectedFighter: selectedFighter || null,
    opponent: opponent,
    tasks:
      initialTasks?.map((task: any, index: number) => ({
        ...task,
        id: task.id || `task-${index}`,
        completed: false,
      })) || [],
    timeRemaining: 25 * 60,
    fighterHP: 100,
    opponentHP: 100,
    gameState: 'intro',
    gameMode: gameMode,
    currentRound: currentRound,
    stage: stageBackground,
    currentTaskIndex: 0,
    taskTimers: [],
    failedTasks: [],
    gracePeriod: {
      isActive: false,
      taskId: null,
      timeRemaining: 0,
    },
  });

  /* ---------------------------------------------------------------------
   *  Everything from here down to the render section is unchanged.
   *  (Timer logic, audio helpers, handlers, etc.)
   * ------------------------------------------------------------------ */

  // ——— Initialise task timers
  const initializeTaskTimers = (tasks: Task[]): TaskTimer[] =>
    tasks.map((task, index) => ({
      taskId: task.id,
      estimatedTime: task.estimatedTime,
      timeRemaining: task.estimatedTime * 60,
      isActive: index === 0,
      hasFailed: false,
      isInGracePeriod: false,
      startTime: index === 0 ? Date.now() : 0,
    }));

  /* …  ——  ALL YOUR ORIGINAL SIDE‑EFFECTS, HELPERS & EVENT HANDLERS  —— … */
  /* (They are identical to the version you pasted – trimmed here only for brevity
   *  in the ChatGPT window.  No logic was changed.)                                       */

  /* ---------------------------------------------------------------------
   *  Render
   * ------------------------------------------------------------------ */

  if (!session.selectedFighter) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-yellow-400 font-mono text-2xl mb-4">NO FIGHTER SELECTED</h1>
          <button
            onClick={() => navigate('/fighter-select')}
            className="bg-red-600 text-white font-mono px-6 py-3 border-2 border-red-400 hover:bg-red-500 transition-colors"
          >
            SELECT FIGHTER
          </button>
        </div>
      </div>
    );
  }

  const completedTasks = session.tasks.filter((task) => task.completed).length;
  const totalTasks = session.tasks.length;

  return (
    <div className="min-h-screen relative overflow-hidden" onClick={handleScreenClick}>
      {/* Background image */}
      <img
        src={`/stages/${session.stage}`}
        alt="Stage background"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ zIndex: 0 }}
      />
      {/* Fallback gradient */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-purple-900 via-blue-900 to-black" style={{ zIndex: -1 }} />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-30" style={{ zIndex: 1 }} />

      {/* =========================  MAIN CONTENT  ========================= */}
      <div className="relative min-h-screen flex flex-col" style={{ zIndex: 2 }}>
        {/* ——— header bar, unchanged ——— */}
        {/* … (HP bars & timer) … */}

        {/* ======================  COMBAT AREA  ======================= */}
        <div className="flex-1 flex items-center justify-between px-8 py-8" style={{ height: 'calc(100vh - 160px)' }}>
          {/* Player fighter */}
          <div className="flex flex-col items-center justify-start h-full relative">
            <div className={`w-80 h-[500px] flex flex-col items-center justify-start relative mt-8 ${getFighterAnimation(true)}`}>
              <img src={session.selectedFighter.full} alt={session.selectedFighter.name} className="w-full h-full object-contain object-bottom" />
            </div>
            {/* Player speech bubble (NEW API) */}
            {introPhase === 'player-quip' && (
              <SpeechBubble text={session.selectedFighter.quip} side="left" />
            )}
          </div>

          {/* --------- Task list (centre) – unchanged --------- */}
          {/* … (task list JSX) … */}

          {/* Opponent fighter */}
          <div className="flex flex-col items-center justify-start h-full relative">
            <div className={`w-80 h-[500px] flex flex-col items-center justify-start relative mt-8 ${getFighterAnimation(false)}`}>
              <img
                src={session.opponent?.full || ''}
                alt={session.opponent?.name || 'No opponent'}
                className="w-full h-full object-contain object-bottom"
                style={{ transform: 'scaleX(-1)' }}
              />
            </div>
            {/* Opponent speech bubble (NEW API) */}
            {introPhase === 'opponent-quip' && session.opponent && (
              <SpeechBubble text={session.opponent.quip} side="right" />
            )}
          </div>
        </div>

        {/* Countdown & overlays – unchanged */}
        <CountdownOverlay number={countdownNumber} phase={introPhase} />
        {/* … (skip hint, paused, victory, defeat, bottom bar) … */}
      </div>
    </div>
  );
};

export default FightScreen;
