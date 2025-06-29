/* ------------------------------------------------------------------
   PomoChamp :: QUICK-BATTLE  v2.4  (NaN fix + width tune)
   ------------------------------------------------------------------ */
import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, GripVertical, Clock } from 'lucide-react';

interface Task { id: string; title: string; estimated: number; }

const QuickBattle: React.FC = () => {
  const nav = useNavigate();

  /* -------------- state ---------------- */
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [mins,  setMins]  = useState(5);
  const [breakMins, setBreak] = useState(5);

  const [dragId, setDrag]   = useState<string|null>(null);
  const [hoverIx,setHover]  = useState<number|null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  /* -------------- derived -------------- */
  const total  = tasks.reduce((s,t)=>s+t.estimated,0);
  const remain = 25 - total;
  const ready  = total === 25;
  const canAdd = title.trim() !== '' && remain > 0;

  const barColour =
    total < 25 ? 'bg-secondary/60'
    : total === 25 ? 'bg-primary'
    : 'bg-danger';

  const status =
    total === 0  ? 'ADD AT LEAST ONE TASK'
    : total < 25 ? `NEED ${25-total} MORE MIN`
    : total > 25 ? 'TOO MANY MIN – TRIM'
    : 'PERFECT – LOCK & LOAD!';

  /* -------------- handlers ------------- */
  /* ---- NEW addTask ---- */
function addTask() {
  if (!canAdd) return;

  /** Reset the dropdown FIRST so mins won’t be stale */
  setMins(5);

  /** Capture the minutes we just had before React re-renders */
  const minutes = mins;          // ← always correct

  const newTask: Task = {
    id: crypto.randomUUID(),
    title: title.trim(),
    estimated: minutes
  };

  setTasks(prev => [...prev, newTask]);
  setTitle('');
  /* no need to setTimeout focus here, but keep if you like */
}


  const del = (id:string) => setTasks(t => t.filter(x=>x.id!==id));

  /* DnD */
  const dragStart = (e:React.DragEvent,id:string)=>{ setDrag(id); e.dataTransfer.effectAllowed='move'; };
  const dragOver  = (e:React.DragEvent,ix:number)=>{ e.preventDefault(); setHover(ix); };
  const drop      = (e:React.DragEvent,ix:number)=>{
    e.preventDefault();
    if(!dragId) return;
    const from = tasks.findIndex(t=>t.id===dragId);
    if(from===ix) return;
    const arr=[...tasks]; const [item]=arr.splice(from,1); arr.splice(ix,0,item);
    setTasks(arr); setDrag(null); setHover(null);
  };

  const launch = () => ready && nav('/fighter-select',{state:{tasks, breakMinutes:breakMins}});

  /* ---------------------- render ---------------------- */
  return (
    <main className="min-h-screen bg-bezel text-white font-arcade flex justify-center py-10 px-8 lg:px-14">
      <div
        className="grid grid-rows-[auto_1fr] grid-cols-[minmax(0,900px)_minmax(280px,360px)] gap-x-14 gap-y-10 w-full max-w-7xl"
      >
        {/* title */}
        <h1
          className="row-start-1 col-span-2 text-6xl text-primary text-center"
          style={{textShadow:'-3px 3px 0 #07399D, 3px -3px 0 #FF3A08, 0 0 12px rgba(255,255,255,.35)'}}
        >
          QUICK&nbsp;BATTLE
        </h1>

        {/* LEFT COLUMN */}
        <section className="row-start-2 space-y-10">

          {/* STEP 1 */}
          <div className="bg-crtBlue/40 border-4 border-crtBlue rounded-lg p-6 space-y-4">
            <header className="flex items-center gap-3">
              <span className="w-7 h-7 grid place-content-center bg-primary text-bezel">1</span>
              <h2 className="text-primary">ADD TASKS (25 MIN MAX)</h2>
            </header>

            <p className="text-sm text-accent/80">
              Each task should be 5-25 minutes. Drag to reorder later.
            </p>

            <div className="flex gap-3 items-stretch">
              <input
                ref={inputRef}
                className="flex-1 bg-bezel border-2 border-crtBlue px-3 text-sm focus:border-primary outline-none"
                placeholder="Write epic email, fix bug…"
                value={title}
                onChange={e=>setTitle(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&addTask()}
              />

              <select
                value={mins}
                onChange={e=>setMins(Number(e.target.value))}
                className="w-[6.5rem] bg-bezel border-2 border-crtBlue text-sm pl-2 focus:border-primary outline-none"
                disabled={remain<=0}
              >
                {[5,10,15,20,25].filter(m=>m<=remain).map(m=>(
                  <option key={m} value={m}>{m} m</option>
                ))}
              </select>

              <button
                onClick={addTask}
                disabled={!canAdd}
                className="flex items-center gap-1 bg-primary text-bezel font-bold px-5 border-2 border-primary hover:bg-transparent hover:text-primary transition disabled:opacity-40"
              >
                <Plus size={14}/> ADD
              </button>
            </div>

            {/* progress & status */}
            <div className="flex justify-end items-center gap-1 text-xs">
              <Clock size={12}/> {total}/25 MIN
            </div>
            <div className="h-2 bg-bezel border border-crtBlue rounded overflow-hidden">
              <div className={`${barColour} h-full`} style={{width:`${Math.min(total/25*100,100)}%`}}/>
            </div>
            <p className="text-center text-accent text-sm">{status}</p>
          </div>

          {/* STEP 2 */}
          <div className="bg-crtBlue/30 border-4 border-crtBlue rounded-lg p-6 space-y-4">
            <header className="flex items-center gap-3">
              <span className="w-7 h-7 grid place-content-center bg-primary text-bezel">2</span>
              <h2 className="text-primary">CHOOSE BREAK TIME</h2>
            </header>

            <p className="text-sm text-accent/80">
              Finish early? Your break gets longer!
            </p>

            <div className="grid grid-cols-6 gap-2">
              {[5,10,15,20,25,30].map(b=>(
                <button key={b}
                  onClick={()=>setBreak(b)}
                  className={`px-[0.55rem] border-2 rounded-sm transition
                    ${breakMins===b
                      ? 'bg-primary text-bezel border-primary shadow-goldenGlow'
                      : 'border-primary/40 text-primary hover:bg-primary/20'}`}
                >
                  {b}m
                </button>
              ))}
            </div>
          </div>

          {/* Start button on mobile */}
        
        </section>

        {/* RIGHT COLUMN */}
        <div className="row-start-2 flex flex-col gap-8 h-full">


          <Review
            tasks={tasks}
            hoverIx={hoverIx}
            dragStart={dragStart}
            dragOver={dragOver}
            drop={drop}
            del={del}
          />

          <Start ready={ready} total={total} launch={launch}/>
        </div>
      </div>
    </main>
  );
};

/* -------- Review list -------- */
const Review:React.FC<{
  tasks:Task[];
  hoverIx:number|null;
  dragStart:(e:React.DragEvent,id:string)=>void;
  dragOver:(e:React.DragEvent,ix:number)=>void;
  drop:(e:React.DragEvent,ix:number)=>void;
  del:(id:string)=>void;
}> = ({ tasks, hoverIx, dragStart, dragOver, drop, del }) => (
  <div className="bg-bezel/50 border-4 border-crtBlue rounded-lg p-5 space-y-4 w-full">
    <header className="flex items-center gap-3 whitespace-nowrap">
      <span className="w-7 h-7 grid place-content-center bg-primary text-bezel">3</span>
      <h3 className="text-primary">REVIEW & ORDER</h3>
    </header>

    <ul className="space-y-2 max-h-[28rem] overflow-y-auto pr-1">
      {tasks.length===0 && (
        <li className="text-xs text-accent/70 text-center">
          Tasks show up here as you add them ↑
        </li>
      )}

      {tasks.map((t,i)=>(
        <li
  key={t.id}
  draggable
  /* ----- drag events ----- */
  onDragStart={e => { dragStart(e, t.id); }}            // start dragging
  onDragEnter={e => { e.preventDefault(); setHover(i); }}// record hover index
  onDragOver={e => e.preventDefault()}                  // allow drop
  onDragLeave={() => setHover(null)}                    // clear when leaving
  onDrop={e => drop(e, i)}                              // drop handler
  /* ----- styling (adds yellow outline when hover) ----- */
  className={
    `flex items-center gap-2 bg-bezel border border-crtBlue
     px-3 py-2 rounded-sm cursor-move hover:border-primary transition
     ${hoverIx === i ? 'border-neonYel shadow-goldenGlow' : ''}`
  }
>
  {/* 6-dot handle in YELLOW so it’s obvious */}
  <GripVertical size={14} className="text-neonYel" />

  {/* task title (slightly smaller so longer text fits) */}
  <span className="flex-1 text-sm overflow-hidden line-clamp-2 leading-tight">
    {t.title}
  </span>

  {/* minutes */}
  <span className="text-primary text-sm">{t.estimated}m</span>

  {/* trash icon (still stops drag) */}
  <button
    onClick={e => { e.stopPropagation(); del(t.id); }}
    className="text-danger hover:text-danger/80"
  >
    <Trash2 size={14} />
  </button>
</li>


      ))}

      {/* drop-after-last ghost slot */}
<li
  onDragEnter={e => { e.preventDefault(); setHover(tasks.length); }}
  onDragOver={e => e.preventDefault()}
  onDrop={e => drop(e, tasks.length)}
  className="h-4"
>
  {hoverIx === tasks.length && (
    <div className="h-1 bg-neonYel animate-pulse rounded" />
  )}
</li>

    </ul>
  </div>
);

/* -------- Start button -------- */
const Start:React.FC<{ready:boolean;total:number;launch:()=>void;className?:string}> =
({ ready,total,launch,className='' })=>(
  <div className={`text-center ${className}`}>
    <button
      onClick={launch}
      disabled={!ready}
      className={`w-full font-bold text-lg px-8 py-4 border-4 rounded-sm transition
        ${ready
          ? 'bg-primary text-bezel border-primary hover:bg-transparent hover:text-primary shadow-goldenGlow'
          : 'border-crtBlue text-accent/40 cursor-not-allowed bg-transparent animate-pulse'}`}
    >
      {ready ? 'CHOOSE YOUR FIGHTER' : `${25 - total} MIN STILL NEEDED`}

    </button>
  </div>
);

export default QuickBattle;
