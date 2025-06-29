export interface Task {
  id: string;
  title: string;
  completed: boolean;
  created_at: string;
  user_id: string;
}

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  username: string;
  score: number;
  created_at: string;
}

export interface TimerState {
  isRunning: boolean;
  mode: 'work' | 'break';
  timeLeft: number;
  totalTime: number;
  progress: number;
}

export interface FighterState {
  health: number;
  isAttacking: boolean;
  isHit: boolean;
  isVictorious: boolean;
}