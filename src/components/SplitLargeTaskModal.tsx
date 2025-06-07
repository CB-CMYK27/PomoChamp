// src/components/SplitLargeTaskModal.tsx
import React, { useState } from 'react'

interface Props {
  onClose(): void
}

export default function SplitLargeTaskModal({ onClose }: Props) {
  const [totalMinutes, setTotalMinutes] = useState(60)
  const [steps, setSteps]         = useState<string[]>([''])

  function addStep() {
    setSteps(prev => [...prev, ''])
  }

  function updateStep(idx: number, val: string) {
    const arr = [...steps]
    arr[idx]  = val
    setSteps(arr)
  }

  function handleCreate() {
    // 1) Enforce 4×25=100min cap
    if (totalMinutes > 100) {
      alert(
        "Whoa!  " +
        "That's too big for one tournament (4 rounds max = 100 minutes).\n\n" +
        "What's the most important part you can realistically finish today?"
      )
      return
    }
    // 2) Enforce each step ≤25min
    const perStep = Math.ceil(totalMinutes / steps.length)
    if (perStep > 25) {
      alert(
        `Each step still exceeds 25 min (you'd need ${perStep} min).` +
        `\n\nTry adding more steps or reducing total time.`
      )
      return
    }

    // 3) TODO: dispatch into your store, e.g.
    // useTaskStore.getState().addSplitTasks( steps.map((title, i) => ({
    //   title,
    //   estimated: Math.min(25, perStep),
    //   roundNumber: i + 1
    // })) )

    onClose()
  }

  return (
    // Full‐screen backdrop
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
      onClick={onClose}
    >
      {/* Modal panel */}
      <div
        className="bg-crtBlue p-6 rounded-lg w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="font-arcade text-neonYel text-xl mb-4">
          Split Large Task
        </h2>

        <label className="block font-arcade mb-1">Total time (minutes)</label>
        <input
          type="number"
          value={totalMinutes}
          onChange={e => setTotalMinutes(Number(e.target.value))}
          className="w-full p-2 mb-4 bg-black bg-opacity-20 rounded border border-gray-700"
        />

        <label className="block font-arcade mb-1">
          Break into steps (≤ 25 min each)
        </label>
        {steps.map((step, i) => (
          <input
            key={i}
            type="text"
            placeholder="Step description"
            value={step}
            onChange={e => updateStep(i, e.target.value)}
            className="w-full p-2 mb-2 bg-black bg-opacity-20 rounded border border-gray-700"
          />
        ))}

        <button
          onClick={addStep}
          className="font-arcade underline mb-4"
        >
          + Add another step
        </button>

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 rounded font-arcade"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-neonYel rounded font-arcade"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  )
}
