/* ------------------------------------------------------------------
   PomoChamp :: QUICK-BATTLE  (v2-wide / drag-indicator / UX-tweaks – fixed)
   ------------------------------------------------------------------ */
import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, GripVertical, Clock, Ruler } from 'lucide-react';

/* ---------- Types ------------------------------------------------ */
interface Task {
  id: string;
  title: string;
  estimated: number;           // minutes
}

/* ---------- Optional side art (swap later) ----------------------- */
const SideArt: React.FC = () => (
  <div className="hidden xl:flex flex-col items-center gap-6">
    <div className="w-44 h-44 bg-[url('/fighters/f1.png')] bg-contain bg-no-repeat" />
    <p className="text-xs text-accent/80 text-center max-w-[10rem] leading-tight">
      Ready up!<br />Select your fighter<br />on the next screen.
    </p>
  </div>
);

/* ================================================================= */
const QuickBattle: React.FC = () => {
  const nav = useNavigate();

  /* ----- state --------------------------------------------------- */
  const [tasks,     setTasks]  = useState<Task[]>([]);
  const [title,     setTitle]  = useState('');
  const [mins,      setMins]   = useState(5);
  const [breakMin,  setBreak]  = useState(5);
  const [dragId,    setDrag]   = useState<string|null>(null);
  const [hoverIx,   setHover]  = useState<number|null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  /* ----- derived -------------------------------------------------- */
  const total  = tasks.reduce((s,t)=>s+t.estimated,0);
  const remain = 25 - total;
  const canAdd = title.trim() !== '' && remain > 0;
  const ready  = total === 25;               // **exactly** 25

  /* ----- helpers -------------------------------------------------- */
  const barColour =
    total < 25 ? 'bg-secondary/60'
    : total === 25 ? 'bg-primary'
    : 'bg-danger';

  const status =
    total === 0   ? 'ADD AT LEAST ONE TASK'
    : total  < 25 ? `NEED ${25-total} MORE MIN`
    : total  > 25 ? 'TOO MANY MIN – TRIM'
    : 'PERFECT – LOCK & LOAD!';

  /* ----- CRUD ----------------------------------------------------- */
  function addTask() {
    if (!canAdd) return;
    setTasks(p => [
      ...p,
      { id: crypto.randomUUID(), title: title.trim(), estimated: mins }
    ]);
    setTitle('');
    setMins(remain - mins >= 5 ? mins : Math.max(remain,5));
    setTimeout(() => inputRef.current?.focus(), 0);
  }
  const delTask = (id:string) => setTasks(t => t.filter(x => x.id !== id));

  /* ----- Drag & drop --------------------------------------------- */
  function dragStart(e:React.DragEvent,id:string){
    setDrag(id); e.dataTransfer.effectAllowed = 'move';
  }
  function dragOver(e:React.DragEvent,ix:number){
    e.preventDefault(); setHover(ix);
  }
  function dragLeave(){ setHover(null); }
  function drop(e:React.DragEvent,ix:number){
    e.preventDefault();
    if(!dragId){return;}
    const from = tasks.findIndex(t=>t.id===dragId);
    if(from===ix){ setHover(null); return; }
    const arr=[...tasks];
    const [item] = arr.splice(from,1);
    arr.splice(ix,0,item);
    setTasks(arr);
    setDrag(null); setHover(null);
  }

  /* ----- launch battle ------------------------------------------- */
  function startBattle(){
    if(!ready) return;
    nav('/fighter-select',{ state:{ tasks, breakMinutes: breakMin }});
  }

  /* ============================ RENDER =========================== */
  return (
    <main className="min-h-screen bg-bezel text-white font-arcade flex justify-center py-10 px-4">
      <div className="grid grid-cols-1 xl:grid-cols-[680px_auto] gap-10 w-full max-w-7xl">

        {/* -------- LEFT (main) ------------------------------------ */}
        <section className="space-y-10">

          {/* title */}
          <h1 className="text-5xl md:text-6xl text-primary text-center drop-shadow-neon">
            QUICK&nbsp;BATTLE
          </h1>

          {/* STEP 1 ------------------------------------------------ */}
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
                className="flex-1 bg-bezel border-2 border-crtBlue px-3 py-2 text-sm focus:border-primary outline-none"
                placeholder="Write epic email, fix bug…"
                value={title}
                onChange={e=>setTitle(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&addTask()}
                disabled={remain<=0}
                maxLength={60}
              />

              <div className="relative">
                <select
                  value={mins}
                  onChange={e=>setMins(Number(e.target.value))}
                  className="bg-bezel border-2 border-crtBlue text-sm pl-6 pr-2 py-[0.55rem] focus:border-primary outline-none"
                  disabled={remain<=0}
                >
                  { [5,10,15,20,25]
                      .filter(m=>m<=remain)
                      .map(m=><option key={m} value={m}>{m} min</option>) }
                </select>
                <Ruler size={14} className="absolute left-1 top-1/2 -translate-y-1/2 text-accent/50"/>
              </div>

              <button
                onClick={addTask}
                disabled={!canAdd}
                className="flex items-center gap-1 bg-primary text-bezel font-bold px-4 py-2 border-2 border-primary hover:bg-transparent hover:text-primary transition disabled:opacity-40"
              >
                <Plus size={14}/> ADD
              </button>
            </div>

            <div className="flex justify-end text-xs items-center gap-1">
              <Clock size={12}/> {total}/25 MIN
            </div>

            <div className="h-2 bg-bezel border border-crtBlue rounded overflow-hidden">
              <div className={`${barColour} h-full`} style={{width:`${Math.min(total/25*100,100)}%`}} />
            </div>
            <p className="text-center text-accent text-sm">{status}</p>
          </div>

          {/* STEP 2 ------------------------------------------------ */}
          <div className="bg-crtBlue/30 border-4 border-crtBlue rounded-lg p-6 space-y-4 text-left">
            <header className="flex items-center gap-3">
              <span className="bg-primary text-bezel w-7 h-7 grid place-content-center">2</span>
              <h2 className="text-primary">CHOOSE BREAK TIME</h2>
            </header>

            <p className="text-sm text-accent/80">
              Finish early? Your break gets longer!
            </p>

            <div className="grid grid-cols-6 gap-2">
              {[5,10,15,20,25,30].map(b=>(
                <button key={b}
                  onClick={()=>setBreak(b)}
                  className={`px-2 py-2 text-sm border-2 rounded-sm transition
                    ${breakMin===b
                      ? 'bg-primary text-bezel border-primary'
                      : 'border-primary/40 text-primary hover:bg-primary/20'}`}
                >
                  {b}m
                </button>
              ))}
            </div>
          </div>

          {/* mobile START button */}
          <Starter ready={ready} total={total} onStart={startBattle} className="xl:hidden"/>
        </section>

        {/* -------- RIGHT (desktop) -------------------------------- */}
        <div className="hidden xl:flex flex-col gap-8">
          <SideArt/>

          <Review
            tasks={tasks}
            dragStart={dragStart}
            dragOver={dragOver}
            dragLeave={dragLeave}
            drop={drop}
            hoverIx={hoverIx}
            delTask={delTask}
          />

          <Starter ready={ready} total={total} onStart={startBattle}/>
        </div>
      </div>
    </main>
  );
};

/* ---------- Review list ------------------------------------------- */
const Review:React.FC<{
  tasks:Task[];
  hoverIx:number|null;
  dragStart:(e:React.DragEvent,id:string)=>void;
  dragOver:(e:React.DragEvent,ix:number)=>void;
  dragLeave:()=>void;
  drop:(e:React.DragEvent,ix:number)=>void;
  delTask:(id:string)=>void;
}> = ({ tasks, hoverIx, dragStart, dragOver, dragLeave, drop, delTask }) => (
  <div className="bg-bezel/50 border border-crtBlue/50 rounded-lg p-5 space-y-4 w-[280px]">
    <header className="text-primary text-lg">3 • REVIEW & ORDER</header>

    {tasks.length===0 ? (
      <p className="text-xs text-accent/70 text-center">
        Tasks show up here as you add them ↑
      </p>
    ):(
      <ul className="space-y-2 max-h-[28rem] overflow-y-auto pr-1">
        {tasks.map((t,i)=>(
          <li key={t.id}
              draggable
              onDragStart={e=>dragStart(e,t.id)}
              onDragOver={e=>dragOver(e,i)}
              onDragLeave={dragLeave}
              onDrop={e=>drop(e,i)}
              className="relative flex items-center gap-2 bg-bezel border border-crtBlue px-3 py-2 rounded-sm cursor-move transition"
          >
            {hoverIx===i && (
              <div className="absolute -top-1 left-0 right-0 h-1 bg-neonYel rounded-full animate-pulse"/>
            )}

            <GripVertical size={14} className="text-crtBlue/60"/>
            <span className="bg-primary text-bezel text-xs px-2 rounded-sm">{i+1}</span>
            <span className="flex-1 truncate">{t.title}</span>
            <span className="text-primary">{t.estimated}m</span>
            <button onClick={()=>delTask(t.id)} className="text-danger hover:text-danger/80">
              <Trash2 size={14}/>
            </button>
          </li>
        ))}
      </ul>
    )}
  </div>
);

/* ---------- Start button ----------------------------------------- */
const Starter:React.FC<{
  ready:boolean; total:number; onStart:()=>void; className?:string;
}> = ({ ready,total,onStart,className='' }) => (
  <div className={`text-center ${className}`}>
    <button
      onClick={onStart}
      disabled={!ready}
      className={`w-full font-bold text-lg px-8 py-4 border-4 rounded-sm transition
        ${ready
          ? 'bg-primary text-bezel border-primary hover:bg-transparent hover:text-primary shadow-goldenGlow'
          : 'border-crtBlue text-accent/40 cursor-not-allowed bg-transparent'}`}
    >
      {ready ? '⚔︎  CHOOSE YOUR FIGHTER' : `${25-total} MIN STILL NEEDED`}
    </button>
  </div>
);

export default QuickBattle;
