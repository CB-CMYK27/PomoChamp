/* ------------------------------------------------------------------
   PomoChamp :: QUICK-BATTLE (v2-wide / hover-bar / typography-fixes)
   ------------------------------------------------------------------ */
import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, GripVertical, Clock, Timer } from 'lucide-react';

/* ---------- Types ------------------------------------------------ */
interface Task { id: string; title: string; estimated: number; }

/* ---------- Optional side art ----------------------------------- */
const SideArt = () => (
  <div className="hidden xl:flex flex-col items-center gap-6">
    <div className="w-44 h-44 bg-[url('/fighters/f1.png')] bg-contain bg-no-repeat" />
    <p className="text-xs text-accent/80 text-center max-w-[10rem] leading-snug">
      Ready up!<br />Select your fighter<br />on the next screen.
    </p>
  </div>
);

/* ================================================================= */
const QuickBattle: React.FC = () => {
  const nav = useNavigate();

  /* ----- state --------------------------------------------------- */
  const [tasks,   setTasks]  = useState<Task[]>([]);
  const [title,   setTitle]  = useState('');
  const [mins,    setMins]   = useState(5);
  const [breakM,  setBreak]  = useState(5);
  const [dragId,  setDrag]   = useState<string|null>(null);
  const [hoverIx,setHover]   = useState<number|null>(null);
  const inputRef             = useRef<HTMLInputElement>(null);

  /* ----- derived -------------------------------------------------- */
  const total  = tasks.reduce((s,t)=>s+t.estimated,0);
  const remain = 25 - total;
  const canAdd = title.trim() !== '' && remain > 0;
  const ready  = total === 25;

  /* ----- helpers -------------------------------------------------- */
  const barColour =
    total < 25 ? 'bg-secondary/60'
    : total === 25 ? 'bg-primary' : 'bg-danger';

  const status =
    total === 0   ? 'ADD AT LEAST ONE TASK'
    : total  < 25 ? `NEED ${25-total} MORE MIN`
    : total  > 25 ? 'TOO MANY MIN – TRIM' : 'PERFECT – LOCK & LOAD!';

  /* ----- actions -------------------------------------------------- */
  function addTask() {
    if (!canAdd) return;
    setTasks(x => [...x,{ id:crypto.randomUUID(), title:title.trim(), estimated:mins }]);
    setTitle('');
    setMins(remain - mins >= 5 ? mins : Math.max(remain,5));
    setTimeout(()=>inputRef.current?.focus(),0);
  }
  const delTask = (id:string)=>setTasks(t=>t.filter(x=>x.id!==id));

  /* drag-n-drop */
  function dragStart(e:React.DragEvent,id:string){
    setDrag(id); e.dataTransfer.effectAllowed='move';
  }
  function dragOver(e:React.DragEvent,ix:number){
    e.preventDefault(); setHover(ix);
  }
  function drop(e:React.DragEvent,ix:number){
    e.preventDefault();
    if(!dragId){ setHover(null); return;}
    const from = tasks.findIndex(t=>t.id===dragId);
    const arr=[...tasks]; const [item]=arr.splice(from,1);
    arr.splice(ix,0,item); setTasks(arr);
    setDrag(null); setHover(null);
  }
  /* allow drop after last by treating UL as zone */
  function dropEnd(e:React.DragEvent){
    if(!dragId){return;}
    e.preventDefault();
    if(hoverIx!==tasks.length){
      const arr=[...tasks];
      const from = arr.findIndex(t=>t.id===dragId);
      const [item]=arr.splice(from,1);
      arr.push(item); setTasks(arr);
    }
    setDrag(null); setHover(null);
  }

  const startBattle = () => ready && nav('/fighter-select',{ state:{ tasks, breakMinutes:breakM }});

  /* ============================ UI =============================== */
  return (
    <main className="min-h-screen bg-bezel text-white font-arcade flex justify-center py-10 px-4">
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-10 w-full max-w-7xl">

        {/* -------- LEFT ------------------------------------------ */}
        <section className="space-y-10">

          <h1
            className="text-5xl md:text-6xl tracking-wide text-primary text-center"
            style={{ textShadow:
              '-3px 3px 0 #07399D, 3px -3px 0 #FF3A08, 0 0 12px rgba(255,255,255,.35)' }}
          >
            QUICK&nbsp;BATTLE
          </h1>

          {/* STEP-1 ------------------------------------------------ */}
          <div className="bg-crtBlue/40 border-4 border-crtBlue rounded-lg p-6 space-y-4">
            <header className="flex items-center gap-3">
              <span className="w-7 h-7 grid place-content-center bg-primary text-bezel">1</span>
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
                value={ title }
                onChange={e=>setTitle(e.target.value)}
                onKeyDown={e=>e.key==='Enter' && addTask()}
                disabled={remain<=0}
              />

              <div className="relative">
                <select
                  value={mins}
                  onChange={e=>setMins(Number(e.target.value))}
                  className="bg-bezel border-2 border-crtBlue text-sm pl-6 pr-2 py-[0.55rem] focus:border-primary outline-none"
                  disabled={remain<=0}
                >
                  {[5,10,15,20,25].filter(m=>m<=remain).map(m=>
                    <option key={m}>{m} min</option>
                  )}
                </select>
                <Timer size={14} className="absolute left-1 top-1/2 -translate-y-1/2 text-accent/50"/>
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
              <Clock size={12}/> {total}/25&nbsp;MIN
            </div>

            <div className="h-2 bg-bezel border border-crtBlue rounded overflow-hidden">
              <div className={`${barColour} h-full`} style={{ width:`${Math.min(total/25*100,100)}%` }}/>
            </div>

            <p className="text-center text-accent text-sm">{status}</p>
          </div>

          {/* STEP-2 ------------------------------------------------ */}
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
                  className={`px-[0.6rem] py-2 text-sm border-2 rounded-sm transition
                    ${breakM===b
                      ? 'bg-primary text-bezel border-primary shadow-goldenGlow'
                      : 'border-primary/40 text-primary hover:bg-primary/20'}`}
                >
                  {b}m
                </button>
              ))}
            </div>
          </div>

          {/* mobile start btn */}
          <StartBtn ready={ready} total={total} start={startBattle} className="xl:hidden"/>
        </section>

        {/* -------- RIGHT ----------------------------------------- */}
        <div className="hidden xl:flex flex-col gap-8">
          <SideArt/>
          <Review
            tasks={tasks}
            hoverIx={hoverIx}
            dragStart={dragStart}
            dragOver={dragOver}
            dragLeave={()=>setHover(null)}
            drop={drop}
            dropEnd={dropEnd}
            del={delTask}
          />
          <StartBtn ready={ready} total={total} start={startBattle}/>
        </div>
      </div>
    </main>
  );
};

/* ---------- Review list ----------------------------------------- */
const Review:React.FC<{
  tasks:Task[];
  hoverIx:number|null;
  dragStart:(e:React.DragEvent,id:string)=>void;
  dragOver:(e:React.DragEvent,ix:number)=>void;
  dragLeave:()=>void;
  drop:(e:React.DragEvent,ix:number)=>void;
  dropEnd:(e:React.DragEvent)=>void;
  del:(id:string)=>void;
}> = ({ tasks, hoverIx, dragStart, dragOver, dragLeave, drop, dropEnd, del }) => (
  <div className="bg-bezel/50 border border-crtBlue/50 rounded-lg p-5 space-y-4 w-[320px]">
    <header className="text-primary text-lg">3 • REVIEW &amp; ORDER</header>

    <ul
      className="space-y-2 max-h-[28rem] overflow-y-auto pr-1"
      onDragOver={e=>dragOver(e,tasks.length)}   /* container drop-zone */
      onDrop={dropEnd}
    >
      {tasks.length===0 && (
        <li className="text-xs text-accent/70 text-center">
          Tasks show up here as you add them ↑
        </li>
      )}
      {tasks.map((t,i)=>(
        <li key={t.id}
            draggable
            onDragStart={e=>dragStart(e,t.id)}
            onDragOver={e=>dragOver(e,i)}
            onDragLeave={dragLeave}
            onDrop={e=>drop(e,i)}
            className="relative flex items-center gap-2 bg-bezel border border-crtBlue px-3 py-2 rounded-sm cursor-move transition"
        >
          {/* neon hover indicator */}
          {hoverIx===i &&
            <div className="absolute -top-1 left-0 right-0 h-1 bg-neonYel rounded-full animate-pulse"/>}

          <GripVertical size={14} className="text-crtBlue/60"/>
          <span className="bg-primary text-bezel text-xs px-2 rounded-sm">{i+1}</span>
          <span className="flex-1 truncate">{t.title}</span>
          <span className="text-primary">{t.estimated}m</span>
          <button onClick={()=>del(t.id)} className="text-danger hover:text-danger/80">
            <Trash2 size={14}/>
          </button>
        </li>
      ))}
      {/* drop indicator after last */}
      {hoverIx===tasks.length &&
        <li className="h-1 bg-neonYel rounded-full animate-pulse mx-1"/>}
    </ul>
  </div>
);

/* ---------- Start button --------------------------------------- */
const StartBtn:React.FC<{ready:boolean;total:number;start:()=>void;className?:string}> =
({ ready,total,start,className='' }) => (
  <div className={`text-center ${className}`}>
    <button
      onClick={start}
      disabled={!ready}
      className={`w-full font-bold text-lg px-8 py-4 border-4 rounded-sm transition
        ${ready
          ? 'bg-primary text-bezel border-primary hover:bg-transparent hover:text-primary shadow-goldenGlow'
          : 'border-crtBlue text-accent/40 cursor-not-allowed bg-transparent animate-pulse'}`}
    >
      {ready ? '⚔︎  CHOOSE YOUR FIGHTER' : `${25-total} MIN STILL NEEDED`}
    </button>
  </div>
);

export default QuickBattle;
