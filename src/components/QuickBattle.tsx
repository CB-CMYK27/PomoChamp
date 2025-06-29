/* ------------------------------------------------------------------
   PomoChamp :: QUICK-BATTLE   (v2-wide + drag-indicator + UX tweaks)
   ------------------------------------------------------------------ */
import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, GripVertical, Clock, Ruler } from 'lucide-react';

/* ---------- Types --------------------------------------------------- */
interface Task {
  id: string;
  title: string;
  estimated: number;             // minutes
}

/* ---------- Optional side art -------------------------------------- */
const SideArt: React.FC = () => (
  <div className="hidden xl:flex flex-col items-center gap-6">
    <div className="w-44 h-44 bg-[url('/fighters/f1.png')] bg-contain bg-no-repeat" />
    <p className="text-xs text-accent/80 text-center max-w-[10rem] leading-tight">
      Ready up!<br />Select your fighter<br />on the next screen.
    </p>
  </div>
);

/* ========== COMPONENT ============================================== */
const QuickBattle: React.FC = () => {
  const nav = useNavigate();

  /* ----- local state ------------------------------------------------ */
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [mins,  setMins]  = useState(5);
  const [breakMin, setBreak] = useState(5);

  const [dragId,  setDrag]  = useState<string | null>(null);
  const [hoverIx, setHover] = useState<number | null>(null); // drop-bar

  const inputRef = useRef<HTMLInputElement>(null);

  /* ----- derived ---------------------------------------------------- */
  const total   = tasks.reduce((s, t) => s + t.estimated, 0);
  const remain  = 25 - total;
  const canAdd  = title.trim() && remain > 0;
  const ready   = total === 25;

  /* ----- CRUD ------------------------------------------------------- */
  const addTask = () => {
    if (!canAdd) return;
    setTasks(p => [...p, {
      id: crypto.randomUUID(),
      title: title.trim(),
      estimated: mins
    }]);
    setTitle('');
    // new default minutes
    setMins(remain - mins >= 5 ? mins : Math.max(remain,5));
    setTimeout(() => inputRef.current?.focus(), 0);
  };
  const delTask = (id:string) => setTasks(t => t.filter(x => x.id !== id));

  /* ----- drag’n’drop ----------------------------------------------- */
  function onDragStart(e:React.DragEvent,id:string){
    setDrag(id); e.dataTransfer.effectAllowed='move';
  }
  function onDragOver(e:React.DragEvent, ix:number){
    e.preventDefault(); setHover(ix);
  }
  function onDragLeave(){ setHover(null); }
  function onDrop(e:React.DragEvent, ix:number){
    e.preventDefault(); if(!dragId){return;}
    const from = tasks.findIndex(t => t.id === dragId);
    if(from===ix){ setHover(null); return; }
    const arr=[...tasks]; const [item]=arr.splice(from,1); arr.splice(ix,0,item);
    setTasks(arr); setDrag(null); setHover(null);
  }

  /* ----- launch battle --------------------------------------------- */
  const start = () => {
    if(!ready) return;
    nav('/fighter-select',{ state:{ tasks, breakMinutes: breakMin }});
  };

  /* ----- helpers ---------------------------------------------------- */
  const barColour =
    total < 25 ? 'bg-secondary/60'
    : total === 25 ? 'bg-primary'
    : 'bg-danger';

  const status =
    total === 0   ? 'ADD AT LEAST ONE TASK'
    : total  < 25 ? `NEED ${25-total} MORE MIN`
    : total  > 25 ? 'TOO MANY MIN – TRIM'
    : 'PERFECT – LOCK & LOAD!';

  /* ============================== RENDER ============================ */
  return (
    <main className="min-h-screen bg-bezel text-white font-arcade flex justify-center py-10 px-4">
      <div className="grid grid-cols-1 xl:grid-cols-[680px_auto] gap-10 items-start w-full max-w-7xl">

        {/* ----------------- LEFT big column -------------------------- */}
        <section className="space-y-10 w-full">

          {/* title */}
          <h1 className="text-5xl md:text-6xl text-primary text-center drop-shadow-neon">
            QUICK&nbsp;BATTLE
          </h1>

          {/* STEP 1 -------------------------------------------------- */}
          <div className="bg-crtBlue/40 border-4 border-crtBlue rounded-lg p-6 space-y-4 text-left">
            <header className="flex items-center gap-3">
              <span className="bg-primary text-bezel w-7 h-7 grid place-content-center">1</span>
              <h2 className="text-primary">ADD TASKS (25 MIN MAX)</h2>
            </header>

            <p className="text-sm text-accent/80">
              Each task should be 5-25 minutes. Drag to reorder later.
            </p>

            <div className="flex gap-3">
              <input
                ref={inputRef}
