import React from 'react';
import { useGameStore } from '../store/taskStore';   // adjust import if your store lives elsewhere
import RoundCard from './RoundCard';

const BrainDump: React.FC = () => {
  const rounds = useGameStore(s => s.rounds);  // [{id, tasks:[{id,title,estimated}], totalMinutes }]

  return (
    <div className="grid md:grid-cols-4 gap-4 p-4">
      {rounds.map(r => (
        <section key={r.id} className="bg-crtBlue/40 p-3 rounded-lg">
          {/* header */}
          <RoundCard used={r.totalMinutes} />

          {/* task list */}
          <ul className="space-y-1 mt-3">
            {r.tasks.map(t => (
              <li
                key={t.id}
                className="flex justify-between bg-crtBlue/60 px-2 py-1 rounded-sm text-sm font-arcade text-white"
              >
                <span>{t.title}</span>
                <span className="text-neonYel">{t.estimated}m</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
};

export default BrainDump;
