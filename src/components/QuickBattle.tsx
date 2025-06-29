/* ------------------------------------------------------------------
   PomoChamp :: QUICK-BATTLE  v2.2  (wider column, right-panel alignment)
   ------------------------------------------------------------------ */
import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, GripVertical, Clock } from 'lucide-react';

/* ---------- Types ---------- */
interface Task { id: string; title: string; estimated: number; }

/* ================================================================= */
const QuickBattle: React.FC = () => {
  const nav = useNavigate();

  /* ----- state --------------------------------------------------- */
  const [tasks,  setTasks]  = useState<Task[]>([]);
  const [title,  setTitle]  = useState('');
  const [mins,   setMins]   = useState(5);
  const [breakM, setBreak]  = useState(5);
  const [dragId, setDrag]   = useState<string|null>(null);
  const [hover,  setHover]  = useState<number|null>(null);
  const inputRef            = useRef<HTMLInputElement>(null);

  /* ----- derived -------------------------------------------------- */
  const total  = tasks.reduce((s,t)=>s+t.estimated,0);
  const remain = 25 - total;
  const ready  = total === 25;
  const canAdd = title.trim() !== '' && remain > 0;

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

  /* ----- actions -------------------------------------------------- */
  function addTask(){
    if(!canAdd) return;
    setTasks(x=>[...x,{
      id: crypto.randomUUID(),
      title: title.trim(),
      estimated: mins
    }]);
    setTitle('');
    setMins(remain - mins >= 5 ? mins : Math.max(remain,5));
    setTimeout(()=>inputRef.current?.focus(),0);
  }
  const delTask = (id:string)=>setTasks(x=>x.filter(t=>t.id!==id));

  /* drag-&-drop ---------------------------------------------------- */
  const dragStart=(e:React.DragEvent,id:string)=>{setDrag(id);e.dataTransfer.effectAllowed='move';};
  const onOver=(e:React.DragEvent,ix:number)=>{e.preventDefault();e.stopPropagation();setHover(ix);};
  const onDrop=(e:React.DragEvent,ix:number)=>{
    e.preventDefault(); e.stopPropagation();
    if(!dragId) return;
    const from = tasks.findIndex(t=>t.id===dragId);
    if(from===ix) { setDrag(null); setHover(null); return; }
    const arr=[...tasks]; const [item]=arr.splice(from,1); arr.splice(ix,0,item);
    setTasks(arr); setDrag(null); setHover(null);
  };

  const startBattle = () => ready && nav('/fighter-select',{
    state:{ tasks, breakMinutes:breakM }
  });

  /* ============================== RENDER ========================= */
  return (
    <main className="min-h-screen bg-bezel text-white font-arcade flex justify-center py-10 px-4">
      {/* 2-row grid: title (row1 col-span-2)  |  content (row2) */}
      <div className="grid grid-rows-[auto_1fr] grid-cols-[minmax(0,770px)_300px] gap-x-12 gap-y-10 w-full max-w-7xl">

        {/* -------- TITLE (row 1, col-span 2) -------------------- */}
        <h1
          className="row-start-1 col-span-2 text-5xl md:text-6xl tracking-wide text-primary text-center"
          style={{textShadow:'-3px 3px 0 #07399D, 3px -3px 0 #FF3A08,0 0 12px rgba(255,255,255,.35)'}}
        >
          QUICK&nbsp;BATTLE
        </h1>

        {/* -------- LEFT COLUMN (row 2, col 1) ------------------ */}
        <section className="row-start-2 space-y-10">

          {/* STEP 1 */}
          <div className="bg-crtBlue/40 border-4 border-crtBlue rounded-lg p-6 space-y-4">
            <header className="flex items-center gap-3">
              <span className="w-7 h-7 grid place-content-center bg-primary text-bezel">1</span>
              <h2 className="text-primary whitespace-nowrap">ADD TASKS (25 MIN MAX)</h2>
            </header>

            <p className="text-sm text-accent/80">
              Each task should be 5-25 minutes. Drag to reorder later.
            </p>

            <div className="flex gap-3 items-stretch *:text-sm *:border-2 *:border-crtBlue">
              <input
                ref={inputRef}
                className="flex-1 bg-bezel px-3 focus:border-primary outline-none"
                placeholder="Write epic email, fix bug…"
                value={title}
                onChange={e=>setTitle(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&addTask()}
                disabled={remain<=0}
              />
              <select
                value={mins}
                onChange={e=>setMins(Number(e.target.value))}
                className="w-[6rem] bg-bezel pl-2 pr-1 focus:border-primary outline-none"
                disabled={remain<=0}
              >
                {[5,10,15,20,25].filter(m=>m<=remain).map(m=>
                  <option key={m}>{m} min</option>
                )}
              </select>
              <button
                onClick={addTask}
                disabled={!canAdd}
                className="flex items-center gap-1 bg-primary text-bezel font-bold px-5 border-primary hover:bg-transparent hover:text-primary transition disabled:opacity-40"
              >
                <Plus size={14}/> ADD
              </button>
            </div>

            <div className="flex justify-end text-xs items-center gap-1">
              <Clock size={12}/> {total}/25&nbsp;MIN
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
              <h2 className="text-primary whitespace-nowrap">CHOOSE BREAK TIME</h2>
            </header>

            <p className="text-sm text-accent/80">Finish early? Your break gets longer!</p>

            <div className="grid grid-cols-6 gap-2">
              {[5,10,15,20,25,30].map(b=>(
                <button key={b}
                  onClick={()=>setBreak(b)}
                  className={`px-[0.55rem] border-2 rounded-sm transition
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

        {/* -------- RIGHT COLUMN (row 2, col 2) ----------------- */}
        <div className="row-start-2 flex flex-col gap-8">
          <Review
            tasks={tasks}
            hover={hover}
            dragStart={dragStart}
            dragOver={onOver}
            drop={onDrop}
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
  hover:number|null;
  dragStart:(e:React.DragEvent,id:string)=>void;
  dragOver:(e:React.DragEvent,ix:number)=>void;
  drop:(e:React.DragEvent,ix:number)=>void;
  del:(id:string)=>void;
}> = ({ tasks, hover, dragStart, dragOver, drop, del }) => (
  <div className="bg-bezel/50 border border-crtBlue/50 rounded-lg p-5 space-y-4 w-[300px]">
    <header className="text-primary text-lg whitespace-nowrap">3 • REVIEW&nbsp;&nbsp;&amp;&nbsp;ORDER</header>

    <ul className="space-y-2 max-h-[28rem] overflow-y-auto pr-1">
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
            onDrop={e=>drop(e,i)}
            onDragLeave={e=>e.stopPropagation()}
            className="relative flex items-center gap-2 bg-bezel border border-crtBlue px-3 py-2 rounded-sm cursor-move transition"
        >
          {/* hover bar */}
          {hover===i && <div className="absolute -top-1 left-0 right-0 h-1 bg-neonYel animate-pulse rounded"/>}

          <GripVertical size={14} className="text-crtBlue/60"/>
          <span className="bg-primary text-bezel text-xs px-2 rounded-sm">{i+1}</span>
          <span className="flex-1 truncate">{t.title}</span>
          <span className="text-primary">{t.estimated}m</span>
          <button onClick={()=>del(t.id)} className="text-danger hover:text-danger/80">
            <Trash2 size={14}/>
          </button>
        </li>
      ))}

      {/* ghost row = drop at end */}
      <li
        className="h-4"
        onDragOver={e=>dragOver(e,tasks.length)}
        onDrop={e=>drop(e,tasks.length)}
      >
        {hover===tasks.length &&
          <div className="h-1 bg-neonYel animate-pulse rounded"/>}
      </li>
    </ul>
  </div>
);

/* ---------- Start-battle btn ------------------------------------ */
const StartBtn:React.FC<{ready:boolean;total:number;start:()=>void;className?:string}> =
({ ready,total,start,className='' })=>(
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
