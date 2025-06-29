import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';    
import { Plus, Trash2, Clock, Zap, Target } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  estimated_minutes: number;
  completed: boolean;
  created_at: string;
}

const QuickBattle: React.FC = () => {
  const navigate = useNavigate();     
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskMinutes, setNewTaskMinutes] = useState(25);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [breakDuration, setBreakDuration] = useState(5); // Default to 5 minutes
  
  const taskInputRef = useRef<HTMLInputElement>(null);

  const totalMinutes = tasks.reduce((sum, task) => sum + task.estimated_minutes, 0);
  const remainingMinutes = 25 - totalMinutes;
  const canAddTask = remainingMinutes > 0;
  const canStartBattle = totalMinutes >= 20;
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
    if (!canStartBattle) return;
    
    // Convert tasks to the format expected by Fight Screen
    const formattedTasks = tasks.map(task => ({
      id: task.id,
      name: task.title,                    // Convert 'title' to 'name'
      estimatedTime: task.estimated_minutes,  // Convert 'estimated_minutes' to 'estimatedTime'
      completed: false
    }));
    
    navigate('/fighter-select', {
      state: { 
        tasks: formattedTasks,
        breakDuration: breakDuration  // Pass break duration to next screen
      }
    });
  };

  const getStatusColor = () => {
    if (totalMinutes === 0) return 'text-white/60';
    if (isOptimal) return 'text-neonYel';
    if (totalMinutes > 25) return 'text-neonRed';
    if (totalMinutes < 20) return 'text-crtBlue';
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
    <div className="min-h-screen bg-gradient-to-b from-crtBlue to-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-mono text-xl md:text-2xl text-neonYel font-bold">
            ⚡ QUICK BATTLE
          </h1>
          <div className="bg-black/50 rounded-lg px-4 py-2 border-2 border-neonYel flex items-center gap-2">
            <Clock size={16} className="text-neonYel" />
            <span className="font-mono text-sm text-neonYel font-bold">
              {totalMinutes}/25 MIN
            </span>
          </div>
        </div>

        {/* Task Input */}
        <div className="bg-black/30 rounded-lg p-4 border border-crtBlue mb-6">
          <div className="flex gap-3">
            <input
              ref={taskInputRef}
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="What needs to get done in this battle?"
              className="flex-1 bg-black/50 border border-crtBlue rounded px-3 py-2 text-white font-mono text-sm focus:border-neonYel focus:outline-none"
              maxLength={50}
              disabled={!canAddTask}
            />
            <select
              value={newTaskMinutes}
              onChange={(e) => setNewTaskMinutes(Number(e.target.value))}
              className="bg-black/50 border border-crtBlue rounded px-3 py-2 text-white font-mono text-sm focus:border-neonYel focus:outline-none"
              disabled={!canAddTask}
            >
              {[5, 10, 15, 20, 25].filter(minutes => minutes <= remainingMinutes).map(minutes => (
                <option key={minutes} value={minutes}>{minutes}min</option>
              ))}
            </select>
            <button
              onClick={handleAddTask}
              disabled={!newTaskTitle.trim() || !canAddTask}
              className="bg-neonYel text-black px-4 py-2 rounded font-mono text-sm font-bold hover:bg-neonYel/80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              <Plus size={14} />
              ADD
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs text-white/60">BATTLE PREPARATION</span>
              <span className={`font-mono text-xs font-bold ${getStatusColor()}`}>
                {getStatusMessage()}
              </span>
            </div>
            <div className="w-full bg-black/50 rounded-full h-2 border border-white/20">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  totalMinutes > 25 ? 'bg-neonRed' :
                  isOptimal ? 'bg-neonYel' :
                  totalMinutes >= 20 ? 'bg-neonYel' :
                  'bg-crtBlue'
                }`}
                style={{ width: `${Math.min((totalMinutes / 25) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Break Duration Selection */}
        <div className="bg-black/30 rounded-lg p-4 border border-crtBlue mb-6">
          <h3 className="text-crtBlue/80 font-mono text-sm font-bold mb-3 flex items-center gap-2">
            🏖️ CHOOSE YOUR BREAK LENGTH:
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {[5, 10, 15, 20, 25, 30].map(duration => (
              <button
                key={duration}
                onClick={() => setBreakDuration(duration)}
                className={`p-2 border-2 font-mono text-sm transition-colors rounded ${
                  breakDuration === duration
                    ? 'bg-crtBlue border-crtBlue/80 text-white'
                    : 'bg-gray-700 border-gray-500 text-gray-300 hover:border-crtBlue'
                }`}
              >
                {duration} min
              </button>
            ))}
          </div>
          <div className="mt-2 text-xs text-crtBlue/80 font-mono">
            💡 Your break will start automatically after completing all tasks
          </div>
        </div>

        {/* Task List */}
        <div className="bg-black/30 rounded-lg border border-crtBlue mb-6">
          <div className="p-4 border-b border-crtBlue/50">
            <h2 className="font-mono text-sm text-neonYel font-bold flex items-center gap-2">
              <Target size={16} />
              BATTLE TASKS ({tasks.length})
            </h2>
          </div>
          
          <div className="p-4">
            {tasks.length === 0 ? (
              <div className="text-white/60 text-center py-8 font-mono text-sm">
                NO TASKS YET - WHAT WILL YOU BATTLE?
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-black/40 rounded px-3 py-2 flex items-center justify-between border border-white/20"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-white text-sm font-mono truncate max-w-[300px]">
                        {task.title}
                      </span>
                      <span className="text-neonYel text-xs font-bold">
                        {task.estimated_minutes}min
                      </span>
                    </div>
                    
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-neonRed hover:text-neonRed/80 text-xs opacity-60 hover:opacity-100 transition-all px-2 py-1 rounded hover:bg-neonRed/20"
                      title="Delete task"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Start Battle Button */}
        <div className="flex justify-center">
          <button
            onClick={handleStartBattle}
            disabled={!canStartBattle}
            className={`font-mono text-lg px-8 py-4 rounded-lg border-2 transition-all font-bold ${
              canStartBattle
                ? isOptimal
                  ? 'bg-neonYel border-neonYel text-black hover:bg-neonYel/80 shadow-lg shadow-neonYel/20'
                  : 'bg-neonYel border-neonYel text-black hover:bg-neonYel/80'
                : 'border-white/30 text-white/30 cursor-not-allowed'
            }`}
          >
            {!canStartBattle ? `NEED ${25 - totalMinutes}MIN MORE TO START` : 
             'CHOOSE YOUR FIGHTER!'}
          </button>
        </div>

        {/* Helper Text */}
        <div className="text-center mt-4 text-white/60 text-sm font-mono">
          💡 Add tasks totaling 25 minutes for optimal battle experience
        </div>
      </div>
    </div>
  );
};

export default QuickBattle;