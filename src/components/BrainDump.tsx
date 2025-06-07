// src/components/BrainDump.tsx
import React, { useState } from 'react';
import { useTaskStore } from '../store/taskStore';
import RoundCard from './RoundCard';
import SplitLargeTaskModal from './SplitLargeTaskModal';

export interface Round {
  id: string;
  tasks: { id: string; title: string; estimatedMinutes: number }[];
  totalMinutes: number;
}

const BrainDump: React.FC = () => {
  // up to 4 rounds auto‑batched by your store
  const rounds = useTaskStore(s => s.rounds as Round[]);

  // local state for opening split‑modal
  const [showSplit, setShowSplit] = useState(false);

  return (
    <div className="p-4 grid md:grid-cols-4 gap-4">
      {rounds.map(r => (
        <section
          key={r.id}
          className="bg-crtBlue/40 p-3 rounded-lg flex flex-col"
        >
          {/* header + status */}
          <div className="flex justify-between items-center">
            <RoundCard usedMinutes={r.totalMinutes} />
            <span
              className={
                'font-arcade text-lg ' +
                (r.totalMinutes < 25 ? 'text-red-500' : 'text-green-500')
              }
            >
              {r.totalMinutes}/25
            </span>
          </div>

          {/* task list */}
          <ul className="mt-3 space-y-1 flex-1">
            {r.tasks.map(t => (
              <li
                key={t.id}
                className="flex justify-between bg-crtBlue/60 px-2 py-1 rounded-sm text-sm text-white font-arcade"
              >
                <span>• {t.title}</span>
                <span>({t.estimatedMinutes} min)</span>
              </li>
            ))}
          </ul>

          {/* split action when needed */}
          {r.totalMinutes === 0 && (
            <button
              onClick={() => setShowSplit(true)}
              className="mt-3 px-2 py-1 bg-neonYel text-black font-bold rounded"
            >
              Split Large Task
            </button>
          )}
        </section>
      ))}

      {/* modal */}
      {showSplit && <SplitLargeTaskModal onClose={() => setShowSplit(false)} />}
    </div>
  );
};

export default BrainDump;