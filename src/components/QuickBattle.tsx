import React, { useState, useRef } from 'react';
import { Plus, Trash2, Clock, Zap, Target } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  estimated_minutes: number;
  completed: boolean;
  created_at: string;
}

const QuickBattle: React.FC = () => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskMinutes, setNewTaskMinutes] = useState(25);
  const [tasks, setTasks] = useState<Task[]>([]);
  
  // Ref for auto-focusing input after task creation
  const taskInputRef = useRef<HTMLInputElement>(null);

  // Calculate total minutes
  const totalMinutes = tasks.reduce((sum, task) => sum + task.estimated_minutes, 0);
  const remainingMinutes = 25 - totalMinutes;
  const canAddTask = remainingMinutes > 0;
  const canStartBattle = totalMinutes >= 20; // Allow 20-25 minutes
  const isOptimal = totalMinutes >= 23 && totalMinutes <= 25;

  const handleAddTask = () => {
    if (newTaskTitle.trim() && canAddTask) {
      const adjustedMinutes = Math.min(newTaskMinutes, remainingMinutes);
      
      const newTask: Task = {
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: newTaskTitle.trim(),
        estimated_minutes: adjustedMinutes,
        completed: false,
        created_at: new Date().toISOString()
      };
      
      setTasks(prev => [...prev, newTask]);
      setNewTaskTitle('');
      setNewTaskMinutes(Math.min(25, remainingMinutes - adjustedMinutes || 25));

      // Focus back to input for rapid task entry
      setTimeout(() => {
        taskInputRef.current?.focus();
      }, 0);
    }
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTask();
    }
  };

  const handleStartBattle = () => {
    console.log('Starting battle with tasks:', tasks);
    // TODO: Navigate to fighter selection
    alert('Fighter selection coming next!');
  };

  const getStatusColor = () => {
    if (totalMinutes === 0) return 'text-white/60';
    if (isOptimal) return 'text-neonYel';
    if (totalMinutes > 25) return 'text-neonRed';
    if (totalMinutes < 20) return 'text-neonBlue';
    return 'text-neonYel';
  };

  const getStatusMessage = () => {
    if (totalMinutes === 0) return 'ADD TASKS TO BEGIN';
    if (totalMinutes > 25) return 'OVER LIMIT!';
    if (isOptimal) return 'BATTLE READY!';
    if (totalMinutes < 20) return `NEED ${20 - totalMinutes}MIN MORE`;
    return 'BATTLE READY!';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #4C1D95 100%)' }}>
      <div className="w-full max-w-6xl">
        
        {/* Header - Landscape Optimized */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-arcade text-neonYel text-3xl md:text-4xl flex items-center gap-4 uppercase">
            <Zap size={32} className="text-neonYel" />
            QUICK BATTLE
          </h1>
          <div className="bg-black/50 rounded border-2 border-neonYel px-6 py-3 flex items-center gap-3">
            <Clock size={20} className="text-neonYel" />
            <span className={`font-arcade text-lg ${getStatusColor()}`}>
              {totalMinutes}/25
            </span>
          </div>
        </div>

        {/* Main Layout - Landscape Gaming Style */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Side - Task Input */}
          <div className="space-y-6">
            
            {/* Task Input Card */}
            <div className="bg-white/10 rounded border-2 border-crtBlue p-6">
              <h2 className="font-arcade text-neonYel text-lg mb-4 uppercase">BATTLE PREP</h2>
              
              <div className="space-y-4">
                <input
                  ref={taskInputRef}
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="What needs to get done?"
                  className="w-full bg-black/50 border-2 border-crtBlue rounded px-4 py-3 text-white font-arcade text-sm focus:border-neonYel focus:outline-none"
                  maxLength={50}
                  disabled={!canAddTask}
                />
                
                <div className="flex gap-3">
                  <select
                    value={newTaskMinutes}
                    onChange={(e) => setNewTaskMinutes(Number(e.target.value))}
                    className="bg-black/50 border-2 border-crtBlue rounded px-4 py-3 text-white font-arcade text-sm focus:border-neonYel focus:outline-none flex-1"
                    disabled={!canAddTask}
                  >
                    {[5, 10, 15, 20, 25].filter(minutes => minutes <= remainingMinutes).map(minutes => (
                      <option key={minutes} value={minutes}>{minutes}MIN</option>
                    ))}
                  </select>
                  
                  <button
                    onClick={handleAddTask}
                    disabled={!newTaskTitle.trim() || !canAddTask}
                    className="bg-neonRed text-black px-6 py-3 rounded font-arcade text-sm hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors shadow-neon"
                  >
                    <Plus size={16} />
                    ADD
                  </button>
                </div>
              </div>
            </div>

            {/* Progress Status */}
            <div className="bg-black/30 rounded border-2 border-crtBlue p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-arcade text-white/80 text-xs uppercase">BATTLE STATUS</span>
                <span className={`font-arcade text-sm ${getStatusColor()}`}>
                  {getStatusMessage()}
                </span>
              </div>
              <div className="w-full bg-black/50 rounded-full h-3 border border-white/20">
                <div 
                  className={`h-3 rounded-full transition-all duration-300 ${
                    totalMinutes > 25 ? 'bg-neonRed shadow-neon' :
                    isOptimal ? 'bg-neonYel shadow-neon' :
                    totalMinutes >= 20 ? 'bg-neonYel shadow-neon' :
                    'bg-neonBlue'
                  }`}
                  style={{ width: `${Math.min((totalMinutes / 25) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Right Side - Task List & Action */}
          <div className="space-y-6">
            
            {/* Task List */}
            <div className="bg-white/10 rounded border-2 border-crtBlue p-6 min-h-[300px]">
              <h2 className="font-arcade text-neonYel text-lg mb-4 uppercase flex items-center gap-2">
                <Target size={20} />
                BATTLE PLAN ({tasks.length})
              </h2>
              
              {tasks.length === 0 ? (
                <div className="text-white/60 text-center py-12 font-arcade text-sm">
                  NO TASKS YET<br />WHAT WILL YOU BATTLE?
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-black/40 rounded px-4 py-3 flex items-center justify-between border border-white/20"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-white font-arcade text-sm truncate">
                          {task.title}
                        </span>
                        <span className="text-neonYel font-arcade text-xs bg-neonYel/20 px-2 py-1 rounded">
                          {task.estimated_minutes}M
                        </span>
                      </div>
                      
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-neonRed hover:text-red-300 opacity-70 hover:opacity-100 transition-all px-2 py-1 rounded hover:bg-neonRed/20"
                        title="Delete task"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Start Battle Action */}
            <div className="text-center">
              <button
                onClick={handleStartBattle}
                disabled={!canStartBattle}
                className={`font-arcade text-xl px-8 py-4 rounded border-2 transition-all ${
                  canStartBattle
                    ? isOptimal
                      ? 'bg-neonYel border-neonYel text-black hover:bg-yellow-300 shadow-neon'
                      : 'bg-neonYel border-neonYel text-black hover:bg-yellow-300 shadow-neon'
                    : 'border-white/30 text-white/30 cursor-not-allowed bg-black/20'
                }`}
              >
                {!canStartBattle ? `NEED ${20 - totalMinutes}MIN MORE` : 'CHOOSE FIGHTER!'}
              </button>
              
              {canStartBattle && (
                <div className="text-neonYel font-arcade text-xs mt-2 opacity-80">
                  READY FOR COMBAT!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Helper Text */}
        <div className="text-center mt-6 text-white/60 font-arcade text-xs">
          💡 ADD 20-25 MINUTES OF TASKS FOR OPTIMAL BATTLE
        </div>
      </div>
    </div>
  );
};

export default QuickBattle;
