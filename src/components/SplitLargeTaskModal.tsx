// src/components/SplitLargeTaskModal.tsx
import React, { useState } from 'react'
import { Modal } from './UI' // swap in your modal component

interface Props {
  onClose(): void
}

export default function SplitLargeTaskModal({ onClose }: Props) {
  const [totalMinutes, setTotalMinutes] = useState(60)
  const [steps, setSteps] = useState<string[]>([''])

  function addStep() {
    setSteps(prev => [...prev, ''])
  }

  function updateStep(idx: number, val: string) {
    const copy = [...steps]
    copy[idx] = val
    setSteps(copy)
  }

  function handleCreate() {
    // 1) Enforce max 4×25 = 100min
    if (totalMinutes > 100) {
      alert(
        "Whoa! That's too big for one tournament (4 rounds max = 100 minutes).\n" +
        "What's the most important part you can realistically finish in 100 minutes?"
      )
      return
    }

    // 2) Build sub-tasks capped at 25min each
    const perRound = Math.ceil(totalMinutes / steps.length)
    if (perRound > 25) {
      alert(
        `Your steps still exceed 25 min per round (you’d need ${perRound} min). ` +
        `Try adding more steps or reducing total time.`
      )
      return
    }

    // 3) TODO: dispatch these new tasks into your store
    // e.g.: useTaskStore.getState().addSplitTasks(steps, totalMinutes)

    onClose()
  }

  return (
    <Modal title="Split Large Task" onClose={onClose}>
      <div className="space-y-4 p-4">
        <label className="block font-arcade">Total time (minutes)</label>
        <input
          type="number"
          value={totalMinutes}
          onChange={e => setTotalMinutes(Number(e.target.value))}
          className="w-full p-2 border rounded"
        />

        <label className="block font-arcade">Break into steps (≤ 25 min each)</label>
        {steps.map((step, i) => (
          <input
            key={i}
            type="text"
            value={step}
            onChange={e => updateStep(i, e.target.value)}
            placeholder="Step description"
            className="w-full p-2 border rounded mb-1"
          />
        ))}

        <button
          onClick={addStep}
          className="underline font-arcade"
        >
          + Add another step
        </button>

        <div className="flex justify-end space-x-2 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-white rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-neonYel text-black font-bold rounded"
          >
            Create Tasks
          </button>
        </div>
      </div>
    </Modal>
  )
}
