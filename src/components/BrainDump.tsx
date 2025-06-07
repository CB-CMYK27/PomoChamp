import React, { useState, useEffect } from 'react';
import { useTaskStore } from '../store/taskStore';
import { Plus, Trash2, Check } from 'lucide-react';

const BrainDump: React.FC = () => {
  const { tasks, fetchTasks, addTask, toggleTask, deleteTask } = useTaskStore();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskMinutes, setNewTaskMinutes] = useState(25);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTasks = async () => {
      await fetchTasks();
      setIsLoading(false);
    };
    
    loadTasks();
  }, [fetchTasks]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      await addTask(newTaskTitle.trim(), newTaskMinutes);
      setNewTaskTitle('');
      setNewTaskMinutes(25);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-crtBlue to-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="font-arcade text-xl md:text-2xl text-neonYel mb-6">
          BRAIN-DUMP GYM
        </h1>
        
        <div className="bg-black/30 rounded-lg p-4 border border-crtBlue mb-4">
          <form onSubmit={handleAddTask} className="flex gap-3">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="What needs to get done?"
              className="flex-1 bg-black/50 border border-crtBlue rounded px-3 py-2 text-white font-arcade text-sm focus:border-neonYel focus:outline-none"
            />
            <select
              value={newTaskMinutes}
              onChange={(e) => setNewTaskMinutes(Number(e.target.value))}
              className="bg-black/50 border border-crtBlue rounded px-3 py-2 text-white font-arcade text-sm focus:border-neonYel focus:outline-none"
            >
              <option value={5}>5min</option>
              <option value={10}>10min</option>
              <option value={15}>15min</option>
              <option value={20}>20min</option>
              <option value={25}>25min</option>
            </select>
            <button
              type="submit"
              disabled={!newTaskTitle.trim()}
              className="bg-neonYel text-black px-4 py-2 rounded font-arcade text-sm hover:bg-neonYel/80 disabled:opacity-50 flex items-center gap-2"
            >
              <Plus size={14} />
              ADD
            </button>
          </form>
        </div>

        <div className="bg-black/30 rounded-lg border border-crtBlue p-4">
          <h2 className="font-arcade text-sm text-neonYel mb-4">TASKS</h2>
          {isLoading ? (
            <div className="text-white/60 text-center py-4">Loading...</div>
          ) : tasks.length === 0 ? (
            <div className="text-white/60 text-center py-4">No tasks yet</div>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between bg-black/40 rounded px-3 py-2">
                  <span className={`text-white ${task.completed ? 'line-through opacity-60' : ''}`}>
                    {task.title} ({task.estimated_minutes || '?'}min)
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="text-neonYel hover:text-white"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-neonRed hover:text-red-300"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrainDump;