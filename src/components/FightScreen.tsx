import React, { useEffect, useRef, useState } from 'react';
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
  timeRemaining: number; // seconds remaining in grace period
}

interface FightSession {
  selectedFighter: Fighter | null;
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
 *  Static data
 * ────────────────────────────── */

const COUNTERPARTS: Record<string, string> = {
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
  'gen-buzzkill': 'waves-mcrad',
};

const AVAILABLE_STAGES = [
  'construction-floor.webp',
  'rooftop.webp',
  'cargo-hold.webp',
  'alien-hive.webp',
];

/* ────────────────────────────────
 *  Speech bubble
 * ────────────────────────────── */

type BubbleSide = 'left' | 'right';

const SpeechBubble: React.FC<{ text: string; side: BubbleSide }> = ({ text, side }) => {
  // nudge horizontally so tail lines up with the fighter
  const xOffset = side === 'left' ? -240 : 240; // tweak to taste

  return (
    <div
      className="absolute z-40 pointer-events-none"
      style={{ top: '12%', left: '50%', transform: `translateX(${xOffset}px)` }}
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
 *  Countdown overlay
 * ────────────────────────────── */

const CountdownOverlay: React.FC<{ number: number; phase: string }> = ({ number, phase }) => {
  if (phase === 'countdown') {
    return (
      <div className="absolute inset-0 flex items-center justify-center z-50">
        <div className="text-yellow-400 font-mono font-black text-[12rem] animate-pulse drop-shadow-[0_0_20px_rgba(255,255,0,0.8)]">
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
          className="max-w-md max-h-64 object-contain"
          style={{ animation: 'growShrink 4s ease-in-out' }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const fallback = target.parentElement?.querySelector('.text-fallback') as HTMLElement;
            if (fallback) fallback.style.display = 'block';
          }}
        />
        <div
          className="text-fallback text-red-400 font-mono font-black text-8xl drop-shadow-[0_0_30px_rgba(255,0,0,0.8)]"
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
 *  FightScreen component
 * ────────────────────────────── */

const FightScreen: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<Record<string, HTMLAudioElement>>({});

  /* state pulled from router */
  const {
    selectedFighter,
    tasks: initialTasks,
    gameMode = 'quick-battle',
    currentRound = 1,
  } = location.state || {};

  /* ═════════ Intro animation phase control ═════════ */
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

  /* ═════════ Helpers ═════════ */
  const getOpponent = (player: Fighter, mode: string, round: number): Fighter | null => {
    if (!player) return null;
    if (mode === 'quick-battle') {
      const counterpartId = COUNTERPARTS[player.id];
      return fighters.find((f) => f.id === counterpartId) || null;
    }
    const pool = fighters.filter((f) => f.id !== player.id);
    return pool[(round - 1) % pool.length] || null;
  };

  const getStage = (player: Fighter, mode: string, round: number): string => {
    if (!player) return 'construction-floor.webp';
    if (mode === 'quick-battle' || round === 1) {
      const mapping: Record<string, string> = {
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
      const mapped = mapping[player.id];
      return AVAILABLE_STAGES.includes(mapped) ? mapped : 'construction-floor.webp';
    }
    return AVAILABLE_STAGES[(round - 1) % AVAILABLE_STAGES.length];
  };

  const opponent = selectedFighter ? getOpponent(selectedFighter, gameMode, currentRound) : null;
  const stageBackground = selectedFighter ? getStage(selectedFighter, gameMode, currentRound) : AVAILABLE_STAGES[0];

  /* ═════════ Global session state ═════════ */
  const [session, setSession] = useState<FightSession>({
    selectedFighter: selectedFighter || null,
    opponent,
    tasks:
      initialTasks?.map((task: any, idx: number) => ({
        ...task,
        id: task.id || `task-${idx}`,
        completed: false,
      })) || [],
    timeRemaining: 25 * 60,
    fighterHP: 100,
    opponentHP: 100,
    gameState: 'intro',
    gameMode,
    currentRound,
    stage: stageBackground,
    currentTaskIndex: 0,
    taskTimers: [],
    failedTasks: [],
    gracePeriod: { isActive: false, taskId: null, timeRemaining: 0 },
  });

  /* ═════════ Intro animation sequence ═════════ */
  useEffect(() => {
    if (session.gameState !== 'intro') return;

    const seq = async () => {
      try {
        // phase 1: bounce
        setIntroPhase('intro');
        await new Promise((r) => {
          currentResolveRef.current = r;
          introTimeoutRef.current = setTimeout(r, 2000);
        });

        // phase 2: player quip
        setIntroPhase('player-quip');
        await new Promise((r) => {
          currentResolveRef.current = r;
          introTimeoutRef.current = setTimeout(r, 2500);
        });

        // phase 3: opponent quip
        setIntroPhase('opponent-quip');
        await new Promise((r) => {
          currentResolveRef.current = r;
          introTimeoutRef.current = setTimeout(r, 2500);
        });

        // phase 4: countdown 5‒1
        setIntroPhase('countdown');
        for (let i = 5; i >= 1; i--) {
          if (skipCountdownRef.current) break;
          setCountdownNumber(i);
          await new Promise((r) => {
            currentResolveRef.current = r;
            introTimeoutRef.current = setTimeout(r, 800);
          });
        }

        // phase 5: on task
        setIntroPhase('on-task');
        await new Promise((r) => {
          currentResolveRef.current = r;
          introTimeoutRef.current = setTimeout(r, 4000);
        });

        // phase 6: fight!
        setSession((prev) => ({ ...prev, gameState: 'fighting' }));
        setIntroPhase('fighting');
        setCanSkip(false);
      } catch {
        /* skipped */
      }
    };

    seq();

    return () => {
      if (introTimeoutRef.current) clearTimeout(introTimeoutRef.current);
    };
  }, [session.gameState]);

  /* ═════════ Audio helpers (unchanged) ═════════ */
  useEffect(() => {
    const sounds = ['punch', 'grunt', 'victory'];
    sounds.forEach((s) => {
      audioRef.current[s] = new Audio(`/sfx/${s}.wav`);
      audioRef.current[s].preload = 'auto';
      audioRef.current[s].volume = 0.7;
    });
    audioRef.current['bg-music'] = new Audio('/
      </div>
    </div>
  );
};                    

export default FightScreen;   
                             
