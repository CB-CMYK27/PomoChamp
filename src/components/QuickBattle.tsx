/* --------------------------------------------------------------------------
   QUICK BATTLE  –  single-file replacement
   -------------------------------------------------------------------------- */
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, GripVertical } from 'lucide-react';

/* TYPES ------------------------------------------------------------------ */
interface Task {
  id: string;
  title: string;
  estimated: number;
}

/* COMPONENT -------------------------------------------------------------- */
const QuickBattle: React.FC = () => {
  const navigate = useNavigate();

  /* ------- local state -------------------------------------------------- */
  const [tasks, setTasks]       = useState<Task[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newMin,   setNewMin]   = useState(5);
  const [breakMin, setBreakMin] = useState(5);
  const [dragID,   setDragID]   = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  /* ------- computed helpers -------------------------------------------- */
  const total = tasks.reduce((s, t) => s + t.estimated, 0);
  const remain = 25 - total;
  const canAdd  = newTitle.trim() !== '' && remain > 0;
  const canGo   = total === 25;          // ⬅️ exact 25 min rule
  const barPct  = (total / 25) * 100;

  /* ------- handlers ----------------------------------------------------- */
  function addTask() {
    if (!canAdd) return;
    const t: Task = {
      id: `t-${Date.now()}`,
      title: newTitle.trim(),
      estimated: Math.min(newMin, remain)
    };
    setTasks([...tasks, t]);
    setNewTitle('');
    setNewMin(Math.min(25, remain - t.estimated) || 5);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function delTask(id: string) {
    setTasks(tasks.filter(t => t.id !== id));
  }

  function start() {
    if (!canGo) return;
    navigate('/fighter-select', { state: { tasks, breakMin } });
  }

  /* ------- drag-and-drop ----------------------------------------------- */
  function dragStart(e: React.DragEvent, id: string) {
    setDragID(id); e.dataTransfer.effectAllowed = 'move';
  }
  function dragOver(e: React.DragEvent) { e.preventDefault(); }
  function drop(e: React.DragEvent, idx: number) {
    e.preventDefault();
    if (!dragID) return;
    const from = tasks.findIndex(t => t.id === dragID);
    if (from === idx) return;
    const arr = [...tasks];
    const [item] = arr.splice(from, 1);
    arr.splice(idx, 0, item);
    setTasks(arr);
    setDragID(null);
  }

  /* RENDER =============================================================== */
  return (
    <main className="min-h-screen bg-bezel text-white font-arcade flex flex-col items-center py-8 px-4">
      {/* centred giant title */}
      <h1 className="text-neonYel text-6xl tracking-widest mb-8 text-center">
        QUICK&nbsp;BATTLE
      </h1>

      {/* two-column wrapper (stacks on < xl) */}
      <div className="grid grid-cols-1 xl:grid-cols-[600px_280px] gap-8 items-start">
        {/* ---------------- LEFT COLUMN (steps 1-2) ----------------------- */}
        <section className="space-y-8">
          {/* STEP 1 – add tasks */}
          <div className="bg-crtBlue/90 border-2 border-neonYel p-6 rounded">
            <header className="flex items-center gap-3 mb-4">
              <div className="bg-neonYel text-bezel w-7 h-7 flex items-center justify-center rounded-sm">1</div>
              <h2 className="text-neonYel tracking-wide">
                ADD TASKS (25 MIN MAX)
              </h2>
            </header>

            <p className="text-accent text-sm mb-3">
              Each task should be&nbsp;5-25&nbsp;minutes. Drag to reorder later.
            </p>

            {/* input row */}
            <div className="flex gap-2 mb-2">
              <input
                ref={inputRef}
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addTask()}
                placeholder="Write epic email, fix bug..."
                className="flex-1 bg-bezel border border-accent px-3 py-2"
                maxLength={60}
              />
              <select
                value={newMin}
                onChange={e => setNewMin(Number(e.target.value))}
                className="bg-bezel border border-accent px-2"
              >
                {[5,10,15,20,25].filter(m => m<=remain).map(m=>(
                  <option key={m}>{m}</option>
                ))}
              </select>
              <button
                onClick={addTask}
                disabled={!canAdd}
                className="bg-goldenYellow px-4 font-bold disabled:opacity-40"
              >+ADD</button>
            </div>

            {/* meter & status */}
            <div className="h-1 bg-accent mb-1">
              <div className="h-full bg-neonYel" style={{width:`${barPct}%`}}/>
            </div>
            <div className="text-center text-neonYel text-sm font-bold">
              {canGo ? 'PERFECT – LOCK & LOAD!' : `NEED ${25-total} MORE MIN`}
            </div>
          </div>

          {/* STEP 2 – break time */}
          <div className="bg-crtBlue/90 border-2 border-accent p-6 rounded">
            <header className="flex items-center gap-3 mb-4">
              <div className="bg-accent text-bezel w-7 h-7 flex items-center justify-center rounded-sm">2</div>
              <h2 className="text-accent tracking-wide">CHOOSE BREAK TIME</h2>
            </header>

            <p className="text-accent text-sm mb-4">
              Finish early? Your break gets longer!
            </p>

            <div className="grid grid-cols-6 gap-2">
              {[5,10,15,20,25,30].map(bm=>(
                <button key={bm}
                  onClick={()=>setBreakMin(bm)}
                  className={`border px-1 py-2 ${breakMin===bm?'bg-neonYel text-bezel':'border-accent'}`}
                >{bm}m</button>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- RIGHT COLUMN (step 3) ------------------------ */}
        <aside className="space-y-4">
          {/* VS sprites */}
          <div className="flex items-center justify-center gap-3">
            <img src="/fighters/f1.png" alt="fighter1" className="w-16 h-16"/>
            <span className="text-neonYel text-4xl">VS</span>
            <img src="/fighters/f2.png" alt="fighter2" className="w-16 h-16"/>
          </div>

          <div className="bg-crtBlue/90 border-2 border-primary p-4 rounded max-h-[60vh] overflow-y-auto">
            <h3 className="text-primary mb-3 tracking-wide">
              3&nbsp;•&nbsp;REVIEW&nbsp;&amp;&nbsp;ORDER
            </h3>

            {tasks.length === 0 && (
              <p className="text-accent text-center py-6">No tasks yet</p>
            )}

            {tasks.map((t,i)=>(
              <div key={t.id}
                   draggable
                   onDragStart={e=>dragStart(e,t.id)}
                   onDragOver={dragOver}
                   onDrop={e=>drop(e,i)}
                   className="flex items-center gap-2 border border-primary mb-1 px-2 py-1 cursor-move">
                <GripVertical size={12} className="text-primary/60"/>
                <span className="bg-primary text-bezel text-xs px-1">{i+1}</span>
                <span className="flex-1 truncate">{t.title}</span>
                <span className="text-primary">{t.estimated}m</span>
                <button onClick={()=>delTask(t.id)} className="text-neonRed">
                  <Trash2 size={12}/>
                </button>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* start button */}
      <button
        onClick={start}
        disabled={!canGo}
        className={`mt-10 px-10 py-4 text-2xl font-bold border-2 ${
          canGo
          ? 'bg-neonYel text-bezel border-neonYel hover:bg-goldenYellow'
          : 'border-accent text-accent opacity-40 cursor-not-allowed'
        }`}
      >
        ⚔︎ CHOOSE YOUR FIGHTER
      </button>
    </main>
  );
};

export default QuickBattle;
