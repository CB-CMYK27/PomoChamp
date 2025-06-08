import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Clock, Target } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Round {
  number: number;
  tasks: Task[];
  totalTime: number;
}

interface Task {
  id: string;
  title: string;
  estimated_minutes: number;
  completed: boolean;
  created_at: string;
  user_id: string;
}

// Draggable Task Component
const DraggableTask: React.FC<{ task: Task; onDelete: (id: string) => void }> = ({ task, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-black/40 rounded px-2 py-1 flex items-center gap-2 group border border-white/20 cursor-grab active:cursor-grabbing"
    >
      <span className="text-white text-sm font-mono truncate max-w-[200px]">
        {task.title}
      </span>
      <span className="text-yellow-400 text-xs font-bold">
        {task.estimated_minutes}m
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(task.id);
        }}
        className="text-red-400 hover:text-red-300 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
      >
        ✕
      </button>
    </div>
  );
};

// Droppable Round Component
const DroppableRound: React.FC<{ 
  round: Round; 
  status: string; 
  onDelete: (id: string) => void;
}> = ({ round, status, onDelete }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: round.number.toString(),
  });

  const getRoundColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'border-yellow-400 bg-yellow-400/10';
      case 'overfilled': return 'border-red-500 bg-red-500/10';
      default: return 'border-white/30 bg-white/5';
    }
  };

  return (
    <div 
      ref={setNodeRef}
      className={`border rounded-lg p-3 ${getRoundColor(status)} ${isOver ? 'ring-2 ring-yellow-400' : ''} transition-all`}
    >
      <div className="flex items-center justify-between">
        {/* Left: Round + Tasks */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className={`
            font-mono text-xs px-3 py-1 rounded flex-shrink-0 font-bold
            ${status === 'optimal'
              ? 'bg-yellow-400 text-black' 
              : status === 'overfilled'
              ? 'bg-red-500 text-white'
              : 'bg-white/20 text-white/60'
            }
          `}>
            R{round.number}
          </div>
          
          <div className="flex flex-wrap gap-2 flex-1 min-w-0">
            {round.tasks.length === 0 ? (
              <div className="text-white/40 text-sm italic py-4 px-4 border-2 border-dashed border-white/20 rounded w-full text-center">
                Drop tasks here or auto-organize
              </div>
            ) : (
              <SortableContext items={round.tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                {round.tasks.map((task) => (
                  <DraggableTask key={task.id} task={task} onDelete={onDelete} />
                ))}
              </SortableContext>
            )}
          </div>
        </div>

        {/* Right: Time Info */}
        <div className={`
          font-mono text-sm px-3 py-1 rounded min-w-[70px] text-center flex-shrink-0 font-bold
          ${round.totalTime > 25 ? 'text-red-400' : 'text-white/80'}
        `}>
          {round.totalTime}/25
        </div>
      </div>
    </div>
  );
};

const BrainDump: React.FC = () => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskMinutes, setNewTaskMinutes] = useState(25);
  const [isLoading, setIsLoading] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [rounds, setRounds] = useState<Round[]>([
    { number: 1, tasks: [], totalTime: 0 },
    { number: 2, tasks: [], totalTime: 0 },
    { number: 3, tasks: [], totalTime: 0 },
    { number: 4, tasks: [], totalTime: 0 }
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const taskId = active.id as string;
    const targetRoundNumber = parseInt(over.id as string);
    
    // Move task to target round
    setRounds(prev => {
      // Find the task in any round
      let taskToMove: Task | null = null;
      let sourceRoundNumber: number | null = null;
      
      for (const round of prev) {
        const foundTask = round.tasks.find(task => task.id === taskId);
        if (foundTask) {
          taskToMove = foundTask;
          sourceRoundNumber = round.number;
          break;
        }
      }
      
      if (!taskToMove || sourceRoundNumber === targetRoundNumber) return prev;
      
      // Create new rounds array with task moved
      const newRounds = prev.map(round => {
        if (round.number === sourceRoundNumber) {
          // Remove task from source round
          const newTasks = round.tasks.filter(task => task.id !== taskId);
          return {
            ...round,
            tasks: newTasks,
            totalTime: newTasks.reduce((sum, task) => sum + task.estimated_minutes, 0)
          };
        } else if (round.number === targetRoundNumber) {
          // Add task to target round
          const newTasks = [...round.tasks, taskToMove];
          return {
            ...round,
            tasks: newTasks,
            totalTime: newTasks.reduce((sum, task) => sum + task.estimated_minutes, 0)
          };
        }
        return round;
      });

      return newRounds;
    });

    setManualMode(true); // Switch to manual mode after first drag
  };

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        title: newTaskTitle.trim(),
        estimated_minutes: newTaskMinutes,
        completed: false,
        created_at: new Date().toISOString(),
        user_id: 'demo-user'
      };
      
      setNewTaskTitle('');
      setNewTaskMinutes(25);

      // Add task to rounds (auto-organize or manual placement)
      setRounds(prev => {
        if (manualMode) {
          // In manual mode, add to first available round
          const newRounds = [...prev];
          const targetRound = newRounds.find(round => round.totalTime + newTask.estimated_minutes <= 25) || newRounds[0];
          targetRound.tasks.push(newTask);
          targetRound.totalTime += newTask.estimated_minutes;
          return newRounds;
        } else {
          // Auto-organize all tasks including the new one
          return organizeTasksIntoRounds([...getAllTasks(prev), newTask]);
        }
      });
    }
  };

  const deleteTask = (taskId: string) => {
    setRounds(prev => prev.map(round => ({
      ...round,
      tasks: round.tasks.filter(task => task.id !== taskId),
      totalTime: round.tasks.filter(task => task.id !== taskId).reduce((sum, task) => sum + task.estimated_minutes, 0)
    })));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTask();
    }
  };

  // Helper function to get all tasks from rounds
  const getAllTasks = (rounds: Round[]): Task[] => {
    return rounds.flatMap(round => round.tasks);
  };

  // Auto-organize tasks into rounds using bin-packing algorithm
  const organizeTasksIntoRounds = (tasks: Task[]): Round[] => {
    const newRounds: Round[] = [
      { number: 1, tasks: [], totalTime: 0 },
      { number: 2, tasks: [], totalTime: 0 },
      { number: 3, tasks: [], totalTime: 0 },
      { number: 4, tasks: [], totalTime: 0 }
    ];

    // Sort tasks by time (largest first) for better bin packing
    const sortedTasks = [...tasks].sort((a, b) => (b.estimated_minutes || 0) - (a.estimated_minutes || 0));

    sortedTasks.forEach(task => {
      // Find round with space that would result in closest to 25 minutes
      const availableRounds = newRounds.filter(round => 
        round.totalTime + (task.estimated_minutes || 0) <= 25
      );
      
      let targetRound;
      if (availableRounds.length > 0) {
        // Choose the round that would be most full after adding this task
        targetRound = availableRounds.reduce((prev, current) => 
          prev.totalTime > current.totalTime ? prev : current
        );
      } else {
        // If no rounds have space, put in the emptiest round
        targetRound = newRounds.reduce((prev, current) => 
          prev.totalTime < current.totalTime ? prev : current
        );
      }
      
      targetRound.tasks.push(task);
      targetRound.totalTime += task.estimated_minutes || 0;
    });

    return newRounds;
  };

  // Calculate total minutes across all tasks
  const totalMinutes = rounds.reduce((sum, round) => sum + round.totalTime, 0);
  const canStartTournament = totalMinutes >= 75;
  const isFullTournament = totalMinutes >= 100;
  const allTasks = getAllTasks(rounds);

  const getRoundStatus = (round: Round) => {
    if (round.totalTime === 0) return 'empty';
    if (round.totalTime <= 25) return 'optimal';
    return 'overfilled';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-mono text-xl md:text-2xl text-yellow-400 font-bold">
            BRAIN-DUMP GYM
          </h1>
          <div className="bg-black/50 rounded-lg px-4 py-2 border-2 border-yellow-400 flex items-center gap-2">
            <Clock size={16} className="text-yellow-400" />
            <span className="font-mono text-sm text-yellow-400 font-bold">
              {totalMinutes} MIN TOTAL
            </span>
          </div>
        </div>

        {/* Task Input */}
        <div className="bg-black/30 rounded-lg p-4 border border-blue-700 mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="What needs to get done?"
              className="flex-1 bg-black/50 border border-blue-700 rounded px-3 py-2 text-white font-mono text-sm focus:border-yellow-400 focus:outline-none"
              maxLength={50}
            />
            <select
              value={newTaskMinutes}
              onChange={(e) => setNewTaskMinutes(Number(e.target.value))}
              className="bg-black/50 border border-blue-700 rounded px-3 py-2 text-white font-mono text-sm focus:border-yellow-400 focus:outline-none"
            >
              <option value={5}>5min</option>
              <option value={10}>10min</option>
              <option value={15}>15min</option>
              <option value={20}>20min</option>
              <option value={25}>25min</option>
            </select>
            <button
              onClick={handleAddTask}
              disabled={!newTaskTitle.trim()}
              className="bg-yellow-400 text-black px-4 py-2 rounded font-mono text-sm font-bold hover:bg-yellow-300 disabled:opacity-50 flex items-center gap-2 transition-colors"
            >
              <Plus size={14} />
              ADD
            </button>
          </div>
        </div>

        {/* Tournament Battle Plan */}
        <div className="bg-black/30 rounded-lg border border-blue-700">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-blue-700/50">
            <div className="flex items-center gap-4">
              <h2 className="font-mono text-sm text-yellow-400 font-bold flex items-center gap-2">
                <Target size={16} />
                TOURNAMENT BATTLE PLAN
              </h2>
              <div className="text-white/80 text-xs">
                {allTasks.length} tasks • {totalMinutes}min total
              </div>
            </div>
            <div className="flex gap-1">
              {rounds.map(round => {
                const status = getRoundStatus(round);
                return (
                  <div
                    key={round.number}
                    className={`w-8 h-8 rounded border flex items-center justify-center font-mono text-xs font-bold ${
                      status === 'optimal'
                        ? 'bg-yellow-400 border-yellow-400 text-black' 
                        : status === 'overfilled'
                        ? 'bg-red-500 border-red-500 text-white'
                        : 'border-white/30 text-white/30'
                    }`}
                  >
                    {round.number}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rounds */}
          <div className="p-4">
            {allTasks.length === 0 ? (
              <div className="text-white/60 text-center py-8 font-mono text-sm">
                NO TASKS YET - START BRAIN DUMPING!
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <div className="space-y-3">
                  {rounds.map((round) => {
                    const status = getRoundStatus(round);
                    return (
                      <DroppableRound 
                        key={round.number} 
                        round={round} 
                        status={status}
                        onDelete={deleteTask}
                      />
                    );
                  })}
                </div>
              </DndContext>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-blue-700/50 flex items-center justify-between">
            <div className="text-xs text-white/60">
              💡 {manualMode ? 'Manual mode active - drag tasks between rounds' : 'Tasks auto-organized • Drag to customize'}
            </div>
            <button
              disabled={!canStartTournament}
              className={`font-mono text-sm px-6 py-2 rounded border transition-all font-bold ${
                canStartTournament
                  ? isFullTournament
                    ? 'bg-red-500 border-red-500 text-white hover:bg-red-400'
                    : 'bg-yellow-400 border-yellow-400 text-black hover:bg-yellow-300'
                  : 'border-white/30 text-white/30 cursor-not-allowed'
              }`}
            >
              {!canStartTournament ? `NEED ${75 - totalMinutes}MIN MORE` : 
               isFullTournament ? 'START TOURNAMENT!' : 
               'START (3+ ROUNDS)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrainDump;