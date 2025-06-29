/* ------------------------------------------------------------------
   PomoChamp :: QUICK-BATTLE v2
   Full component – 2-column layout, colour tweaks, stricter rules
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

/* ---------- Fake side art (optional) ---------- */
const SideArt = () => (
  <div className="hidden xl:flex flex-col items-center gap-6">
    {/* TODO: replace with pixel fighters, VS logo, etc. */}
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
  const [tasks, setTasks]       = useState<Task[]>([]);
  const [title, setTitle]       = useState('');
  const [mins,  setMins]        = useState(5);
  const [breakMins, setBreak]   = useState(5);
  const [dragId, setDragId]     = useState<string | null>(null);
  const inputRef                = useRef<HTMLInputElement>(null);

  /* ----- derived ----- */
  const total = tasks.reduce((s, t) => s + t.estimated, 0);
  const remain = 25 - total;
  const canAdd = remain > 0 && title.trim().length > 0;
  const ready  = total === 25;                         // exact 25 only!

  /* ---------- handlers ---------- */
  function addTask() {
    if (!canAdd) return;
    setTasks(p => [
      ...p,
      { id: crypto.randomUUID(), title: title.trim(), estimated: mins }
    ]);
    setTitle('');
    setMins(remain - mins >= 5 ? mins : remain); // smart default
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function delTask(id: string)  { setTasks(p => p.filter(t => t.id !== id)); }

  /* drag-n-drop */
  function dragStart(e: React.DragEvent, id: string) {
    setDragId(id); e.dataTransfer.effectAllowed = 'move';
  }
  function drop(e: React.DragEvent, idx: number) {
    e.preventDefault();
    if (!dragId) return;
    const from = tasks.findIndex(t => t.id === dragId);
    if (from === idx) return;
    const arr = [...tasks];
    const [item] = arr.splice(from, 1);
    arr.splice(idx, 0, item);
    setTasks(arr); setDragId(null);
  }

  function launchBattle() {
    if (!ready) return;
    nav('/fighter-select', {
      state: {
        tasks: tasks.map(t => ({ ...t, completed: false })),
        breakMinutes: breakMins
      }
    });
  }

  /* ---------- status helpers ---------- */
  const barColour =
    total < 25  ? 'bg-secondary/60'
    : total === 25 ? 'bg-primary'
    : 'bg-danger';

  const status =
    total === 0   ? 'ADD AT LEAST ONE TASK'
    : total  < 25 ? `NEED ${25 - total} MORE MIN`
    : total  > 25 ? 'TOO MANY MINUTES – TRIM'
    : 'PERFECT – LOCK & LOAD!';

  /* ------------------------------------------------------------------ */

  return (
    <main className="min-h-screen bg-bezel text-white font-arcade flex items-start justify-center py-8 px-4">
      {/* ----- GRID ----- */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto] gap-10 w-full max-w-6xl">

        {/* ================= LEFT COLUMN ================= */}
        <section className="w-full space-y-8">

          {/* title */}
          <h1
            className="text-5xl md:text-6xl text-primary text-center drop-shadow-neon"
            style={{
              textShadow:
                '-2px 2px 0 #07399D, 2px -2px 0 #FF3A08, ' +  // faux 3-D
                '0 0 8px rgba(255,255,255,0.3)'
            }}
          >
            QUICK BATTLE
          </h1>

          {/* STEP 1 ----------------------------------- */}
          <div className="bg-crtBlue/40 border-4 border-crtBlue rounded-lg p-5 space-y-4">
            <header className="flex items-center gap-3">
              <span className="bg-primary text-bezel w-7 h-7 grid place-content-center">
                1
              </span>
              <h2 className="text-primary text-lg">ADD TASKS (25 MIN TOTAL)</h2>
            </header>

            <p className="text-sm text-accent/70">
              Each task should be 5-25 minutes. Drag to reorder later.
            </p>

            <div className="flex gap-3">
              <input
                ref={inputRef}
                className="flex-1 bg-bezel border-2 border-crtBlue px-3 py-2 text-sm focus:border-primary outline-none"
                placeholder="Write epic email, fix bug…"
                value={title}
                maxLength={50}
                onChange={e => setTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addTask()}
                disabled={!remain}
              />
              <select
                value={mins}
                onChange={e => setMins(Number(e.target.value))}
                className="bg-bezel border-2 border-crtBlue text-sm px-2 py-2 focus:border-primary outline-none"
                disabled={!remain}
              >
                {[5,10,15,20,25].filter(m => m <= remain).map(m =>
                  <option key={m}>{m}</option>
                )}
              </select>
              <button
                onClick={addTask}
                disabled={!canAdd}
                className="flex items-center gap-1 bg-primary text-bezel font-bold px-4 py-2 border-2 border-primary hover:bg-transparent hover:text-primary transition disabled:opacity-40"
              >
                <Plus size={14}/> ADD
              </button>
            </div>

            {/* progress bar */}
            <div className="text-right text-xs">
              <Clock size={12} className="inline mr-1"/>{total}/25 MIN
            </div>
            <div className="h-3 w-full bg-bezel border border-crtBlue rounded-sm overflow-hidden">
              <div className={`${barColour} h-full`} style={{ width:`${Math.min(total/25*100,100)}%` }}/>
            </div>
            <p className="text-center text-sm text-accent">{status}</p>
          </div>

          {/* STEP 2 ----------------------------------- */}
          <div className="bg-crtBlue/30 border-4 border-crtBlue rounded-lg p-5 space-y-4">
            <header className="flex items-center gap-3">
              <span className="bg-primary text-bezel w-7 h-7 grid place-content-center">
                2
              </span>
              <h2 className="text-primary text-lg">CHOOSE BREAK TIME</h2>
            </header>

            <p className="text-sm text-accent/70">
              Finish early? Your break gets longer!
            </p>

            <div className="grid grid-cols-6 gap-2">
              {[5,10,15,20,25,30].map(bm => (
                <button key={bm}
                  onClick={() => setBreak(bm)}
                  className={`px-2 py-2 border-2 text-sm font-bold rounded-sm transition
                    ${breakMins === bm
                      ? 'bg-primary text-bezel border-primary'
                      : 'border-primary/40 text-primary hover:bg-primary/20'}
                  `}
                >
                  {bm}m
                </
