import React, { useState } from 'react';
import { Modal } from './UI'; // or your modal component

interface Props { onClose: () => void; }
export default function SplitLargeTaskModal({ onClose }: Props) {
  const [totalMinutes, setTotalMinutes] = useState(60);
  const [steps, setSteps] = useState<string[]>([]);
  
  function addStep() {
    setSteps([...steps, '']);
  }
  function updateStep(i: number, val: string) {
    const arr = [...steps]; arr[i] = val; setSteps(arr);
  }
  function handleCreate() {
    // Reject if >100 minutes
    if (totalMinutes > 100) {
      alert(
        "Whoa! That's too big for one tournament (4 rounds max = 100 minutes)."
      );
      return;
    }
    // Build new tasks capped at 25 min each
    const perStep = Math.ceil(totalMinutes / steps.length);
    const newTasks = steps.map((text, idx) => ({
      id: `split-${idx}-${Date.now()}`,
      title: text,
      estimatedMinutes: Math.min(25, perStep),
      roundNumber: idx + 1
    }));
    // Insert into your store
    useTaskStore.getState().addSplitTasks(newTasks);
    onClose();
  }

  return (
    <Modal onClose={onClose} title="Split Large Task">
      <div className="space-y-4">
        <label>Main task total time (minutes)</label>
        <input
          type="number"
          value={totalMinutes}
          onChange={e => setTotalMinutes(Number(e.target.value))}
          className="w-full p-2 border"
        />
        <label>Break into steps (each ≤ 25 min)</label>
        {steps.map((step, i) => (
          <input
            key={i}
            type="text"
            value={step}
            onChange={e => updateStep(i, e.target.value)}
            placeholder="Step description"
            className="w-full p-2 border"
          />
        ))}
        <button onClick={addStep} className="underline">+ Add another step</button>
        <div className="flex justify-end space-x-2 pt-4">
          <button onClick={onClose} className="px-4 py-2">Cancel</button>
          <button onClick={handleCreate} className="px-4 py-2 bg-neonYel">Create Tasks</button>
        </div>
      </div>
    </Modal>
  );
}