// Updated design draft for QuickBattle based on retro 16-bit SNES pixel-art aesthetic
// - Fonts: Pixel/monospace style
// - Shadows, colors, and borders inspired by CRT/fighting game UI
// - Minor UI elements stylized with arcade glow and gradients
// Tailwind CSS is used with utility classes and custom className for effects

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Clock, GripVertical } from 'lucide-react';

// [...] (the same logic/state/hooks remain unchanged)

return (
  <div className="min-h-screen bg-[#1a1a1a] text-[#f8f8f2] font-retro p-6">
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Retro Header */}
      <div className="text-center mb-10">
        <h1 className="text-[28px] text-yellow-300 font-bold tracking-wide mb-2 drop-shadow-md">
          ⚡ QUICK BATTLE SETUP
        </h1>
        <div className="flex items-center justify-center gap-2 text-[#ff6ec7]">
          <Clock size={18} className="animate-pulse" />
          <span className="tracking-widest font-semibold">
            {totalMinutes}/25 MINUTES
          </span>
        </div>
      </div>

      {/* Task Input Zone */}
      <div className="bg-[#262626] border-2 border-[#33cc99] rounded-lg p-5 shadow-inner">
        <h2 className="text-[#33cc99] font-bold mb-4 flex items-center gap-2">
          <span className="bg-[#33cc99] text-black rounded-full w-6 h-6 text-center text-sm">1</span>
          ADD TASKS
        </h2>

        <div className="flex flex-col sm:flex-row gap-3 mb-3">
          <input
            ref={taskInputRef}
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your task..."
            className="flex-1 px-4 py-2 bg-[#111] border border-[#33cc99] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#ffcc00]"
            maxLength={50}
          />
          <select
            value={newTaskMinutes}
            onChange={(e) => setNewTaskMinutes(Number(e.target.value))}
            className="bg-[#111] border border-[#33cc99] text-white px-2 py-2 rounded-md"
          >
            {[5, 10, 15, 20, 25].filter(m => m <= remainingMinutes).map(m => (
              <option key={m} value={m}>{m}min</option>
            ))}
          </select>
          <button
            onClick={handleAddTask}
            className="bg-yellow-300 text-black font-bold px-4 py-2 rounded-md hover:bg-pink-400 flex items-center gap-1"
          >
            <Plus size={14} /> ADD
          </button>
        </div>

        <div className="text-sm text-white/60 flex justify-between">
          <span>STATUS:</span>
          <span className={`${getStatusColor()} font-bold`}>{getStatusMessage()}</span>
        </div>

        <div className="w-full bg-[#333] mt-2 rounded-full h-3">
          <div className={`h-full rounded-full ${
            totalMinutes > 25 ? 'bg-red-600' : isOptimal ? 'bg-green-400' : 'bg-yellow-400'
          }`} style={{ width: `${Math.min((totalMinutes / 25) * 100, 100)}%` }} />
        </div>
      </div>

      {/* Break Time Selector */}
      <div className="bg-[#332211] border-2 border-orange-400 rounded-lg p-5">
        <h2 className="text-orange-400 font-bold mb-3 flex items-center gap-2">
          <span className="bg-orange-400 text-black rounded-full w-6 h-6 text-center text-sm">2</span>
          CHOOSE BREAK TIME
        </h2>

        <div className="grid grid-cols-6 gap-2">
          {[5, 10, 15, 20, 25, 30].map((m) => (
            <button
              key={m}
              onClick={() => setBreakDuration(m)}
              className={`px-2 py-1 rounded-md text-xs font-bold border-2 transition-all ${
                breakDuration === m
                  ? 'bg-orange-400 text-black border-orange-400'
                  : 'text-orange-400 border-orange-300 hover:border-orange-500'
              }`}
            >
              {m}m
            </button>
          ))}
        </div>
      </div>

      {/* Review & Reorder */}
      <div className="bg-[#1f1f1f] border-2 border-[#ffcc00] rounded-lg p-5">
        <h2 className="text-[#ffcc00] font-bold mb-3 flex items-center gap-2">
          <span className="bg-[#ffcc00] text-black rounded-full w-6 h-6 text-center text-sm">3</span>
          REORDER TASKS
        </h2>

        {tasks.length === 0 ? (
          <p className="text-center text-white/50 italic">No tasks yet.</p>
        ) : (
          <div className="space-y-2">
            {tasks.map((task, idx) => (
              <div
                key={task.id}
                draggable
                onDragStart={(e) => handleDragStart(e, task.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, idx)}
                className="flex items-center gap-2 p-3 border border-yellow-400 rounded bg-[#0d0d0d] hover:border-yellow-300 cursor-move"
              >
                <GripVertical size={14} className="text-yellow-400" />
                <span className="text-xs font-bold bg-yellow-300 text-black px-2 py-1 rounded">
                  {idx + 1}
                </span>
                <span className="flex-1">{task.title}</span>
                <span className="text-yellow-300 text-sm font-bold">{task.estimated_minutes}min</span>
                <button onClick={() => deleteTask(task.id)}>
                  <Trash2 size={14} className="text-red-500" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Battle Button */}
      <div className="text-center">
        <button
          onClick={handleStartBattle}
          disabled={!canStartBattle}
          className={`mt-6 px-6 py-4 text-xl font-bold rounded-lg border-2 shadow-md transition-all ${
            canStartBattle
              ? 'bg-green-400 border-green-300 text-black hover:bg-green-300'
              : 'bg-[#111] border-white/20 text-white/30 cursor-not-allowed'
          }`}
        >
          {canStartBattle ? '⚔️ CHOOSE YOUR FIGHTER' : `NEED ${25 - totalMinutes} MIN`}
        </button>
      </div>
    </div>
  </div>
);

// Note: Assumes a retro font like 'Press Start 2P' or 'VT323' is loaded via Tailwind config or CDN
