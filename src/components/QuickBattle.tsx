import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';    
import { Plus, Trash2, Clock, GripVertical } from 'lucide-react';

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
  const [breakDuration, setBreakDuration] = useState(5);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  
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
    
    const formattedTasks = tasks.map(task => ({
      id: task.id,
      name: task.title,
      estimatedTime: task.estimated_minutes,
      completed: false
    }));
    
    navigate('/fighter-select', {
      state: { 
        tasks: formattedTasks,
        breakDuration: breakDuration
      }
    });
  };

  // Drag and drop functions
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTask(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (!draggedTask) return;

    const dragIndex = tasks.findIndex(task => task.id === draggedTask);
    if (dragIndex === dropIndex) return;

    const newTasks = [...tasks];
    const [draggedItem] = newTasks.splice(dragIndex, 1);
    newTasks.splice(dropIndex, 0, draggedItem);
    
    setTasks(newTasks);
    setDraggedTask(null);
  };

  const getStatusColor = () => {
    if (totalMinutes === 0) return 'text-accent';
    if (isOptimal) return 'text-primary';
    if (totalMinutes > 25) return 'text-danger';
    if (totalMinutes < 20) return 'text-secondary';
    return 'text-primary';
  };

  const getStatusMessage = () => {
    if (totalMinutes === 0) return 'ADD YOUR FIRST TASK';
    if (totalMinutes > 25) return 'TOO MUCH! REMOVE SOME TASKS';
    if (isOptimal) return 'PERFECT! READY TO BATTLE';
    if (totalMinutes < 20) return `NEED ${20 - totalMinutes} MORE MINUTES`;
    return 'READY TO BATTLE!';
  };

  return (
    <div className="min-h-screen bg-nearBlack text-white font-mono p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Main Title */}
        <div className="text-center mb-8">
          <h1 className="text-primary text-3xl font-bold mb-2" style={{ fontFamily: 'monospace' }}>
            ⚡ QUICK BATTLE SETUP
          </h1>
          <div className="flex items-center justify-center gap-4 text-accent">
            <Clock size={16} />
            <span className="font-bold">{totalMinutes}/25 MINUTES</span>
          </div>
        </div>

        {/* PHASE 1: ADD TASKS */}
        <div className="bg-gradient-to-r from-secondary/20 to-secondary/10 border-2 border-secondary rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-secondary text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">1</div>
            <h2 className="text-secondary font-bold text-lg">ADD YOUR TASKS</h2>
          </div>
          
          <div className="space-y-3">
            <div className="flex gap-3">
              <input
                ref={taskInputRef}
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="What do you need to get done?"
                className="flex-1 bg-nearBlack border-2 border-secondary rounded px-4 py-3 text-white focus:border-primary focus:outline-none"
                maxLength={50}
                disabled={!canAddTask}
              />
              <select
                value={newTaskMinutes}
                onChange={(e) => setNewTaskMinutes(Number(e.target.value))}
                className="bg-nearBlack border-2 border-secondary rounded px-3 py-3 text-white focus:border-primary focus:outline-none"
                disabled={!canAddTask}
              >
                {[5, 10, 15, 20, 25].filter(minutes => minutes <= remainingMinutes).map(minutes => (
                  <option key={minutes} value={minutes}>{minutes}min</option>
                ))}
              </select>
              <button
                onClick={handleAddTask}
                disabled={!newTaskTitle.trim() || !canAddTask}
                className="bg-primary text-nearBlack px-6 py-3 rounded font-bold hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Plus size={16} />
                ADD
              </button>
            </div>
            
            {/* Status Bar */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-white/60 text-sm">BATTLE READINESS:</span>
                <span className={`text-sm font-bold ${getStatusColor()}`}>
                  {getStatusMessage()}
                </span>
              </div>
              <div className="w-full bg-nearBlack border border-secondary rounded-full h-3">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    totalMinutes > 25 ? 'bg-danger' :
                    isOptimal ? 'bg-primary' :
                    totalMinutes >= 20 ? 'bg-primary' :
                    'bg-secondary'
                  }`}
                  style={{ width: `${Math.min((totalMinutes / 25) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* PHASE 2: CHOOSE BREAK TIME */}
        <div className="bg-gradient-to-r from-orangeYellow/20 to-orangeYellow/10 border-2 border-orangeYellow rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-orangeYellow text-nearBlack rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">2</div>
            <h2 className="text-orangeYellow font-bold text-lg">CHOOSE BREAK TIME</h2>
          </div>
          
          <div className="grid grid-cols-6 gap-3">
            {[5, 10, 15, 20, 25, 30].map(duration => (
              <button
                key={duration}
                onClick={() => setBreakDuration(duration)}
                className={`p-3 border-2 font-bold rounded transition-all ${
                  breakDuration === duration
                    ? 'bg-orangeYellow border-orangeYellow text-nearBlack'
                    : 'bg-nearBlack border-orangeYellow/50 text-orangeYellow hover:border-orangeYellow'
                }`}
              >
                {duration}m
              </button>
            ))}
          </div>
        </div>

        {/* PHASE 3: REVIEW & REORDER TASKS */}
        <div className="bg-gradient-to-r from-primary/20 to-primary/10 border-2 border-primary rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary text-nearBlack rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">3</div>
            <h2 className="text-primary font-bold text-lg">REVIEW & REORDER TASKS</h2>
          </div>
          
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-white/60">
              No tasks added yet. Add some tasks above to continue.
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.map((task, index) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  className="bg-nearBlack border border-primary/50 rounded p-3 flex items-center gap-3 hover:border-primary cursor-move transition-all"
                >
                  <GripVertical size={16} className="text-primary/60" />
                  <div className="bg-primary text-nearBlack rounded px-2 py-1 text-xs font-bold min-w-[24px] text-center">
                    {index + 1}
                  </div>
                  <div className="flex-1 text-white">{task.title}</div>
                  <div className="text-primary font-bold text-sm">{task.estimated_minutes}min</div>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-danger hover:text-danger/80 p-1 hover:bg-danger/20 rounded"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* START BATTLE BUTTON */}
        <div className="text-center pt-4">
          <button
            onClick={handleStartBattle}
            disabled={!canStartBattle}
            className={`font-bold text-xl px-8 py-4 rounded-lg border-2 transition-all ${
              canStartBattle
                ? 'bg-primary border-primary text-nearBlack hover:bg-accent hover:border-accent shadow-goldenGlow'
                : 'border-white/30 text-white/30 cursor-not-allowed bg-nearBlack'
            }`}
          >
            {!canStartBattle ? `NEED ${25 - totalMinutes} MORE MINUTES` : 
             '⚔️ CHOOSE YOUR FIGHTER!'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickBattle;