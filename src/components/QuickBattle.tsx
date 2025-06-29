/* ------------------------------------------------------------------
   16-bit QUICK BATTLE  –  full component (drop-in replacement)
   ------------------------------------------------------------------ */

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Clock, GripVertical } from 'lucide-react';

/* ---------- Types ---------- */
interface Task {
  id: string;
  title: string;
  estimated_minutes: number;
  completed: boolean;
  created_at: string;
}

/* ---------- Component ---------- */
const QuickBattle: React.FC = () => {
  const navigate          = useNavigate();
  const taskInputRef       = useRef<HTMLInputElement>(null);

  /* ----------------- Local state ----------------- */
  const [newTaskTitle,   setNewTaskTitle]   = useState('');
  const [newTaskMinutes, setNewTaskMinutes] = useState(25);
  const [tasks,          setTasks]          = useState<Task[]>([]);
  const [breakDuration,  setBreakDuration]  = useState(5);
  const [draggedTask,    setDraggedTask]    = useState<string | null>(null);

  /* ----------------- Derived values ----------------- */
  const totalMinutes      = tasks.reduce((s, t) => s + t.estimated_minutes, 0);
  const remainingMinutes  = 25 - totalMinutes;
  const canAddTask        = remainingMinutes > 0;
  const canStartBattle    = totalMinutes >= 20;
  const isOptimal         = totalMinutes >= 23 && totalMinutes <= 25;

  /* ---------- Helpers ---------- */
  const handleAddTask = () => {
    if (!newTaskTitle.trim() || !canAddTask) return;

    const adjusted = Math.min(newTaskMinutes, remainingMinutes);
    const newTask: Task = {
      id: `task_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      title: newTaskTitle.trim(),
      estimated_minutes: adjusted,
      completed: false,
      created_at: new Date().toISOString()
    };

    setTasks(p => [...p, newTask]);
    setNewTaskTitle('');
    setNewTaskMinutes(Math.min(25, remainingMinutes - adjusted || 25));
    setTimeout(() => taskInputRef.current?.focus(), 0);
  };

  const deleteTask = (id: string) =>
    setTasks(p => p.filter(t => t.id !== id));

  const handleKeyPress = (e: React.KeyboardEvent) =>
    e.key === 'Enter' && handleAddTask();

  const handleStartBattle = () => {
    if (!canStartBattle) return;

    const formatted = tasks.map(t => ({
      id: t.id,
      name: t.title,
      estimatedTime: t.estimated_minutes,
      completed: false
    }));

    navigate('/fighter-select', {
      state: { tasks: formatted, breakDuration }
    });
  };

  /* ---------- Drag-and-drop ---------- */
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTask(id);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); e.dataTransfer.dropEffect = 'move';
  };
  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (!draggedTask) return;

    const dragIdx = tasks.findIndex(t => t.id === draggedTask);
    if (dragIdx === dropIndex) return;

    const newArr = [...tasks];
    const [item] = newArr.splice(dragIdx, 1);
    newArr.splice(dropIndex, 0, item);
    setTasks(newArr);
    setDraggedTask(null);
  };

  /* ---------- Status helpers ---------- */
  const statusColor = () => {
    if (totalMinutes === 0) return 'text-neonYel';
    if (isOptimal)          return 'text-neonYel';
    if (totalMinutes > 25)  return 'text-neonRed';
    if (totalMinutes < 20)  return 'text-crtBlue';
    return 'text-neonYel';
  };
  const statusMsg = () => {
    if (totalMinutes === 0)        return 'INSERT YOUR FIRST TASK';
    if (totalMinutes > 25)         return 'OVERLOAD! DIAL IT BACK';
    if (isOptimal)                 return 'READY – FIGHT!';
    if (totalMinutes < 20)         return `NEED ${20 - totalMinutes} MORE MINS`;
    return 'LOCKED & LOADED';
  };

  /* ---------------------------------------------------------------- */

  return (
    <div className="min-h-screen bg-bezel text-white font-arcade flex flex-col items-center py-8 px-4">
      {/* ---------- CRT Bezel Header ---------- */}
      <h1 className="text-neonYel text-4xl md:text-5xl mb-8 drop-shadow-neon">
        QUICK BATTLE
      </h1>

      {/* Main card */}
      <div className="w-full max-w-3xl bg-crtBlue/40 border-4 border-crtBlue rounded-lg p-5 md:p-8 space-y-8">

        {/* ===== ❶ ADD TASKS ===== */}
        <section>
          <header className="flex items-center gap-3 mb-4">
            <span className="bg-neonYel text-bezel w-7 h-7 flex items-center justify-center rounded-sm">
              1
            </span>
            <h2 className="text-neonYel text-xl">ADD TASKS (25 MIN MAX)</h2>
          </header>

          <div className="flex gap-3 mb-3">
            <input
              ref={taskInputRef}
              className="flex-1 bg-bezel border-2 border-crtBlue px-3 py-2 text-sm focus:border-neonYel outline-none"
              placeholder="Write epic email, fix bug, etc."
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              onKeyDown={handleKeyPress}
              maxLength={50}
              disabled={!canAddTask}
            />
            <select
              value={newTaskMinutes}
              onChange={e => setNewTaskMinutes(Number(e.target.value))}
              disabled={!canAddTask}
              className="bg-bezel border-2 border-crtBlue px-2 py-2 text-sm focus:border-neonYel outline-none"
            >
              {[5,10,15,20,25]
                .filter(m => m <= remainingMinutes)
                .map(m => <option key={m}>{m}</option>)}
            </select>
            <button
              onClick={handleAddTask}
              disabled={!newTaskTitle.trim() || !canAddTask}
              className="flex items-center gap-1 bg-neonYel text-bezel font-bold px-4 py-2 border-2 border-neonYel hover:bg-transparent hover:text-neonYel transition disabled:opacity-40"
            >
              <Plus size={14} /> ADD
            </button>
          </div>

          {/* Status bar */}
          <div className="text-right text-xs mb-1">
            <Clock className="inline mr-1" size={12} />
            {totalMinutes}/25 MIN
          </div>
          <div className="h-3 w-full bg-bezel border border-crtBlue rounded-sm overflow-hidden mb-2">
            <div
              className={
                `h-full ${ totalMinutes > 25
                  ? 'bg-neonRed'
                  : isOptimal
                  ? 'bg-neonYel'
                  : totalMinutes >= 20
                  ? 'bg-neonYel/60'
                  : 'bg-crtBlue/70'
                }`
              }
              style={{ width: `${Math.min(totalMinutes / 25 * 100, 100)}%` }}
            />
          </div>
          <p className={`text-center text-sm ${statusColor()}`}>
            {statusMsg()}
          </p>
        </section>

        {/* ===== ❷ BREAK TIME ===== */}
        <section>
          <header className="flex items-center gap-3 mb-4">
            <span className="bg-neonYel text-bezel w-7 h-7 flex items-center justify-center rounded-sm">
              2
            </span>
            <h2 className="text-neonYel text-xl">CHOOSE BREAK TIME</h2>
          </header>
          <div className="grid grid-cols-6 gap-2">
            {[5,10,15,20,25,30].map(n => (
              <button
                key={n}
                onClick={() => setBreakDuration(n)}
                className={
                  `px-2 py-2 border-2 font-bold text-sm rounded-sm transition-all
                  ${breakDuration === n
                    ? 'bg-neonYel text-bezel border-neonYel'
                    : 'bg-bezel border-neonYel/40 text-neonYel hover:bg-neonYel/20'}`
                }
              >
                {n}m
              </button>
            ))}
          </div>
        </section>

        {/* ===== ❸ REVIEW / REORDER ===== */}
        <section>
          <header className="flex items-center gap-3 mb-4">
            <span className="bg-neonYel text-bezel w-7 h-7 flex items-center justify-center rounded-sm">
              3
            </span>
            <h2 className="text-neonYel text-xl">REVIEW & ORDER</h2>
          </header>

          {tasks.length === 0 ? (
            <p className="text-center text-white/60 py-4">
              No tasks yet. Add some above!
            </p>
          ) : (
            <ul className="space-y-2">
              {tasks.map((t, idx) => (
                <li
                  key={t.id}
                  draggable
                  onDragStart={e => handleDragStart(e, t.id)}
                  onDragOver={handleDragOver}
                  onDrop={e => handleDrop(e, idx)}
                  className="flex items-center gap-2 bg-bezel border border-crtBlue/60 px-3 py-2 rounded-sm cursor-move hover:border-neonYel transition"
                >
                  <GripVertical size={14} className="text-crtBlue/60" />
                  <span className="bg-neonYel text-bezel text-xs px-2 rounded-sm">
                    {idx + 1}
                  </span>
                  <span className="flex-1">{t.title}</span>
                  <span className="text-neonYel">{t.estimated_minutes}m</span>
                  <button
                    onClick={() => deleteTask(t.id)}
                    className="text-neonRed hover:text-neonRed/80"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* =====  START  ===== */}
        <div className="text-center">
          <button
            onClick={handleStartBattle}
            disabled={!canStartBattle}
            className={
              `inline-block font-bold text-lg px-8 py-3 border-4 rounded-sm transition-all
               ${canStartBattle
                 ? 'bg-neonYel text-bezel border-neonYel hover:bg-transparent hover:text-neonYel'
                 : 'border-crtBlue text-crtBlue/60 cursor-not-allowed'}`
            }
          >
            {canStartBattle ? '⚔︎  CHOOSE YOUR FIGHTER' 
                            : `ADD ${20 - totalMinutes} MORE MINS`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickBattle;
