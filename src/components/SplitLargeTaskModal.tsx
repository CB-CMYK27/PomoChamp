import React, { useState } from 'react';
import { useGameStore } from '../store/taskStore';

const MAX_TOURNAMENT_MINUTES = 100;   // 4 × 25

const SplitLargeTaskModal: React.FC<{onClose:()=>void}> = ({ onClose }) => {
  const addTasks = useGameStore(s => s.addSplitTasks);

  const [title,  setTitle]  = useState('');
  const [total,  setTotal]  = useState(60);   // minutes
  const [steps,  setSteps]  = useState<string[]>(['']);

  // ---------- helpers ----------
  const addStep = () => setSteps([...steps, '']);

  const handleStepChange = (i:number,val:string) => {
    const copy = [...steps];
    copy[i] = val;
    setSteps(copy);
  };

  const handleSubmit = () => {
    if (total > MAX_TOURNAMENT_MINUTES) {
      alert(
        `Whoa! ${total} minutes is more than one 4-round tournament can handle.\n\n` +
        'Trim the scope to a max of 100 min you want to tackle TODAY, ' +
        'and leave the rest for tomorrow’s tournament!'
      );
      return;
    }

    // build task array = equal split OR use manual steps
    const perStep = Math.ceil(total / steps.length);
    const tasks   = steps.map((s,i)=>({
      title : s || `Step ${i+1}`,
      estimated: perStep
    }));

    addTasks(tasks);
    onClose();
  };

  // ---------- UI ----------
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-full max-w-md bg-crtBlue p-6 rounded-lg space-y-4">
        <h2 className="text-neonYel font-arcade text-xl text-center">
          SPLIT LARGE TASK
        </h2>

        {/* main task */}
        <label className="block font-arcade text-white text-xs mb-1">
          MAIN TASK NAME:
        </label>
        <input
          value={title}
          onChange={e=>setTitle(e.target.value)}
          className="w-full bg-bezel text-white px-2 py-1 border border-neonYel outline-none"
        />

        {/* total time */}
        <label className="block font-arcade text-white text-xs mt-3 mb-1">
          ESTIMATED TOTAL TIME (min):
        </label>
        <input
          type="number"
          min={5}
          max={300}
          step={5}
          value={total}
          onChange={e=>setTotal(Number(e.target.value))}
          className="w-full bg-bezel text-white px-2 py-1 border border-neonYel outline-none"
        />

        {/* steps */}
        <label className="block font-arcade text-white text-xs mt-3 mb-1">
          BREAK INTO STEPS (25 min max each):
        </label>
        {steps.map((st,idx)=>(
          <input
            key={idx}
            value={st}
            placeholder={`Step ${idx+1}`}
            onChange={e=>handleStepChange(idx,e.target.value)}
            className="w-full bg-crtBlue/60 mb-1 text-white px-2 py-1 outline-none"
          />
        ))}
        <button
          onClick={addStep}
          className="w-full bg-crtBlue/40 text-neonYel font-arcade py-1 hover:bg-crtBlue/60"
        >
          + ADD ANOTHER STEP
        </button>

        {/* actions */}
        <div className="flex justify-between pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 font-arcade text-white hover:bg-gray-700"
          >CANCEL</button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-neonYel text-bezel font-arcade hover:shadow-neon"
          >CREATE TASKS</button>
        </div>
      </div>
    </div>
  );
};

export default SplitLargeTaskModal;
