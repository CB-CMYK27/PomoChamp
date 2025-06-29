/* ------------------------------------------------------------------
   PomoChamp :: QUICK-BATTLE v2-fixed
   ------------------------------------------------------------------ */

import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Clock, GripVertical } from 'lucide-react';

/* ---------- Types ---------- */
interface Task {
  id: string;
  title: string;
  estimated: number;
}

/* ---------- Fake side art (swap later) ---------- */
const SideArt = () => (
  <div className="hidden xl:flex flex-col items-center gap-6">
    <div className="w-44 h-44 bg-[url('/fighters/placeholder.png')] bg-contain bg-no-repeat" />
    <p className="text-xs text-accent/80 text-center max-w-[10rem]">
      Ready up!<br />Select your fighter<br />on the next screen.
    </p>
  </div>
);

/* ---------- Main component ---------- */
const QuickBattle: React.FC = () => {
  const nav = useNavigate();

  /* ----- state ----- */
  const [tasks, setTasks]     = useState<Task[]>([]);
  const [title, setTitle]     = useState('');
  const [mins, setMins]       = useState(5);
  const [breakMins, setBreak] = useState(5);
  const [dragId, setDragId]   = useState<string | null>(null);
  const inputRef              = useRef<HTMLInputElement>(null);

  /* ----- derived ----- */
  const total  = tasks.reduce((s, t) => s + t.estimated, 0);
  const remain = 25 - total;
  const canAdd = remain > 0 && title.trim().length > 0;
  const ready  = total === 25;                // **must** be exactly 25

  /* ---------- handlers ---------- */
  function addTask() {
    if (!canAdd) return;
    setTasks(p => [
      ...p,
      { id: crypto.randomUUID(), title: title.trim(), estimated: mins }
    ]);
    setTitle('');
    setMins(remain - mins >= 5 ? mins : remain);
    setTimeout(() => inputRef.current?
