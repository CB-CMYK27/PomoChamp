import React, { useState, useEffect } from 'react';
import { Plus, Clock, Target, Zap } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  estimatedMinutes: number;
  createdAt: Date;
}

const BrainDumpSlice1: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskMinutes, setNewTaskMinutes] = useState(25);
  const [timeRemaining, setTimeRemaining] = useState(10 * 60); // 10 minutes in seconds
  const [isTimerActive, setIsTimerActive] = useState(false);

  // 10-minute brain-dump timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isTimerActive, timeRemaining]);

  // Auto-start timer when component mounts
  useEffect(() => {
    setIsTimerActive(true);
  }, []);

  const addTask = () => {
    if (newTaskTitle.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        title: newTaskTitle.trim(),
        estimatedMinutes: newTaskMinutes,
        createdAt: new Date()
      };
      
      setTasks(prev => [...prev, newTask]);
      setNewTaskTitle('');
      setNewTaskMinutes(25); // Reset to default
    }
  };

  const removeTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

  const totalMinutes = tasks.reduce((sum, task) => sum + task.estimatedMinutes, 0);
  const canStartTournament = totalMinutes >= 75; // Minimum for 3 rounds
  const estimatedRounds = Math.ceil(totalMinutes / 25);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const timeStyle = timeRemaining <= 60 ? 'text-neonRed animate-pulse' : 'text-neonYel';

  return (
    <div className="min-h-screen bg-gradient-to-b from-crtBlue to-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header with Timer */}
        <div className="text-center mb-8">
          <h1 className="font-arcade text-2xl md:text-4xl text-neonYel mb-4">
            BRAIN-DUMP GYM
          </h1>
          <div className="bg-black/50 rounded-lg p-4 border-2 border-neonYel inline-block">
            <div className="flex items-center gap-3 justify-center">
              <Clock className="text-neonYel" />
              <span className={`font-arcade text-xl ${timeStyle}`}>
                {formatTime(timeRemaining)}
              </span>
              <span className="text-white text-sm">
                {timeRemaining > 0 ? 'TIME LEFT' : 'TIME UP!'}
              </span>
            </div>
          </div>
          <p className="text-white/80 mt-3 max-w-2xl mx-auto">
            Dump all your tasks before the timer runs out. Don't overthink it—just brain dump everything!
          </p>
        </div>

        {/* Task Input */}
        <div className="bg-black/30 rounded-lg p-6 border border-crtBlue mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="What needs to get done?"
                className="w-full bg-black/50 border-2 border-crtBlue rounded px-4 py-3 text-white font-arcade text-sm focus:border-neonYel focus:outline-none"
                maxLength={100}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-white font-arcade text-xs">MINS:</span>
              <select
                value={newTaskMinutes}
                onChange={(e) => setNewTaskMinutes(Number(e.target.value))}
                className="bg-black/50 border-2 border-crtBlue rounded px-3 py-3 text-white font-arcade text-sm focus:border-neonYel focus:outline-none"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
                <option value={25}>25</option>
                <option value={30}>30</option>
                <option value={45}>45</option>
                <option value={60}>60</option>
                <option value={90}>90</option>
              </select>
            </div>
            
            <button
              onClick={addTask}
              disabled={!newTaskTitle.trim()}
              className="bg-neonYel text-black px-6 py-3 rounded font-arcade text-sm hover:bg-neonYel/80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Plus size={16} />
              ADD
            </button>
          </div>
        </div>

        {/* Tasks List */}
        <div className="bg-black/30 rounded-lg p-6 border border-crtBlue mb-6">
          <h2 className="font-arcade text-lg text-neonYel mb-4 flex items-center gap-2">
            <Target size={20} />
            BATTLE PLAN ({tasks.length} tasks)
          </h2>
          
          {tasks.length === 0 ? (
            <div className="text-white/60 text-center py-8 font-arcade text-sm">
              NO TASKS YET - START BRAIN DUMPING!
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {tasks.map((task, index) => (
                <div
                  key={task.id}
                  className="bg-black/50 rounded border border-crtBlue/50 p-3 flex items-center justify-between group hover:border-neonYel transition-colors"
                >
                  <div className="flex-1">
                    <span className="text-white font-arcade text-sm">
                      {index + 1}. {task.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-neonYel font-arcade text-xs">
                      {task.estimatedMinutes}min
                    </span>
                    <button
                      onClick={() => removeTask(task.id)}
                      className="text-neonRed hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity font-arcade text-xs"
                    >
                      DEL
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tournament Status */}
        <div className="bg-black/30 rounded-lg p-6 border border-crtBlue mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-neonYel font-arcade text-2xl">{totalMinutes}</div>
                <div className="text-white/80 text-xs">TOTAL MINS</div>
              </div>
              <div className="text-center">
                <div className="text-crtBlue font-arcade text-2xl">{estimatedRounds}</div>
                <div className="text-white/80 text-xs">EST ROUNDS</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map(round => (
                <div
                  key={round}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center font-arcade text-xs ${
                    round <= estimatedRounds 
                      ? 'bg-neonYel border-neonYel text-black' 
                      : 'border-white/30 text-white/30'
                  }`}
                >
                  {round}
                </div>
              ))}
            </div>
          </div>
          
          {totalMinutes < 75 && (
            <div className="mt-4 text-center">
              <div className="text-neonRed font-arcade text-sm">
                NEED {75 - totalMinutes} MORE MINUTES FOR TOURNAMENT
              </div>
              <div className="text-white/60 text-xs mt-1">
                Minimum 3 rounds required (75 minutes total)
              </div>
            </div>
          )}
        </div>

        {/* Ready to Fight Button */}
        <div className="text-center">
          <button
            disabled={!canStartTournament}
            className={`font-arcade text-lg px-8 py-4 rounded-lg border-2 transition-all ${
              canStartTournament
                ? 'bg-neonRed border-neonRed text-white hover:shadow-neon hover:scale-105'
                : 'border-white/30 text-white/30 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-3">
              <Zap size={24} />
              {canStartTournament ? 'READY TO FIGHT!' : 'NEED MORE TASKS'}
            </div>
          </button>
        </div>

        {/* Quick Tips */}
        <div className="mt-8 text-center text-white/60 text-xs max-w-2xl mx-auto">
          <p className="mb-2">💡 <strong>PRO TIPS:</strong></p>
          <p>• Don't overthink estimates - just guess quickly</p>
          <p>• Include small tasks (5-10min) and big ones (30-60min)</p>
          <p>• The auto-batcher will organize everything into perfect 25min rounds</p>
        </div>
      </div>
    </div>
  );
};

export default BrainDumpSlice1;