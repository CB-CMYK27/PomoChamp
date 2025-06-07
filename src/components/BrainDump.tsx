import React, { useState, useEffect } from 'react';
import { Plus, Clock, Target, Zap } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  estimatedMinutes: number;
  createdAt: Date;
}

const CompactBrainDump: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskMinutes, setNewTaskMinutes] = useState(25);
  const [timeRemaining, setTimeRemaining] = useState(10 * 60);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [largeTaskTitle, setLargeTaskTitle] = useState('');
  const [largeTaskMinutes, setLargeTaskMinutes] = useState(30);
  const [splitTasks, setSplitTasks] = useState<string[]>(['', '']);

  // Timer logic (same as before)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && timeRemaining > 0) {
      interval = setInterval(() => setTimeRemaining(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeRemaining]);

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
      setNewTaskMinutes(25);
    }
  };

  const removeTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') addTask();
  };

  // Split task functions (same as before)
  const openSplitModal = () => {
    setShowSplitModal(true);
    setLargeTaskTitle('');
    setLargeTaskMinutes(30);
    setSplitTasks(['', '']);
  };

  const addSplitTask = (taskText: string, index: number) => {
    const newSplitTasks = [...splitTasks];
    newSplitTasks[index] = taskText;
    setSplitTasks(newSplitTasks);
  };

  const saveSplitTasks = () => {
    splitTasks.forEach((taskText, index) => {
      if (taskText.trim()) {
        const newTask: Task = {
          id: `${Date.now()}-${index}`,
          title: `${largeTaskTitle} (Part ${index + 1}): ${taskText.trim()}`,
          estimatedMinutes: 25,
          createdAt: new Date()
        };
        setTasks(prev => [...prev, newTask]);
      }
    });
    setShowSplitModal(false);
  };

  const addMoreSplitTasks = () => {
    setSplitTasks([...splitTasks, '']);
  };

  // Tournament organization
  const totalMinutes = tasks.reduce((sum, task) => sum + task.estimatedMinutes, 0);
  const canStartTournament = totalMinutes >= 75;
  const isFullTournament = totalMinutes >= 100;

  const organizeTasksIntoRounds = () => {
    const rounds = [
      { number: 1, tasks: [], totalTime: 0 },
      { number: 2, tasks: [], totalTime: 0 },
      { number: 3, tasks: [], totalTime: 0 },
      { number: 4, tasks: [], totalTime: 0 }
    ];

    const sortedTasks = [...tasks].sort((a, b) => b.estimatedMinutes - a.estimatedMinutes);

    sortedTasks.forEach(task => {
      const availableRounds = rounds.filter(round => 
        round.totalTime + task.estimatedMinutes <= 25
      );
      
      if (availableRounds.length > 0) {
        const targetRound = availableRounds.reduce((prev, current) => 
          prev.totalTime < current.totalTime ? prev : current
        );
        targetRound.tasks.push(task);
        targetRound.totalTime += task.estimatedMinutes;
      } else {
        const targetRound = rounds.reduce((prev, current) => 
          prev.totalTime < current.totalTime ? prev : current
        );
        targetRound.tasks.push(task);
        targetRound.totalTime += task.estimatedMinutes;
      }
    });

    return rounds;
  };

  const rounds = organizeTasksIntoRounds();
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const timeStyle = timeRemaining <= 60 ? 'text-neonRed animate-pulse' : 'text-neonYel';

  return (
    <div className="min-h-screen bg-gradient-to-b from-crtBlue to-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Compact Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-arcade text-xl md:text-2xl text-neonYel">
            BRAIN-DUMP GYM
          </h1>
          <div className="bg-black/50 rounded-lg px-4 py-2 border-2 border-neonYel flex items-center gap-2">
            <Clock size={16} className="text-neonYel" />
            <span className={`font-arcade text-sm ${timeStyle}`}>
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>

        {/* Compact Input Row */}
        <div className="bg-black/30 rounded-lg p-4 border border-crtBlue mb-4">
          <div className="flex gap-3 items-center">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="What needs to get done?"
              className="flex-1 bg-black/50 border border-crtBlue rounded px-3 py-2 text-white font-arcade text-sm focus:border-neonYel focus:outline-none"
              maxLength={50}
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
              onClick={addTask}
              disabled={!newTaskTitle.trim()}
              className="bg-neonYel text-black px-4 py-2 rounded font-arcade text-sm hover:bg-neonYel/80 disabled:opacity-50 flex items-center gap-2"
            >
              <Plus size={14} />
              ADD
            </button>
            <button
              onClick={openSplitModal}
              className="bg-neonRed text-white px-3 py-2 rounded font-arcade text-xs hover:bg-neonRed/80"
            >
              SPLIT 25+
            </button>
          </div>
        </div>

        {/* Compact Tournament Battle Plan */}
        <div className="bg-black/30 rounded-lg border border-crtBlue">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-crtBlue/50">
            <div className="flex items-center gap-4">
              <h2 className="font-arcade text-sm text-neonYel flex items-center gap-2">
                <Target size={16} />
                TOURNAMENT BATTLE PLAN
              </h2>
              <div className="text-white/80 text-xs">
                {tasks.length} tasks • {totalMinutes}min total
              </div>
            </div>
            <div className="flex gap-1">
              {rounds.map(round => (
                <div
                  key={round.number}
                  className={`w-6 h-6 rounded border flex items-center justify-center font-arcade text-xs ${
                    round.tasks.length > 0
                      ? round.totalTime <= 25
                        ? 'bg-neonYel border-neonYel text-black' 
                        : 'bg-neonRed border-neonRed text-white'
                      : 'border-white/30 text-white/30'
                  }`}
                >
                  {round.number}
                </div>
              ))}
            </div>
          </div>

          {/* Rounds - Compact Table Style */}
          <div className="p-4">
            {tasks.length === 0 ? (
              <div className="text-white/60 text-center py-8 font-arcade text-sm">
                NO TASKS YET - START BRAIN DUMPING!
              </div>
            ) : (
              <div className="space-y-3">
                {rounds.map((round) => (
                  <div 
                    key={round.number}
                    className={`
                      border rounded-lg p-3
                      ${round.totalTime > 0 
                        ? round.totalTime <= 25
                          ? 'border-neonYel/50 bg-neonYel/5' 
                          : 'border-neonRed/50 bg-neonRed/5'
                        : 'border-white/20 bg-white/5'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      {/* Left: Round + Tasks */}
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className={`
                          font-arcade text-xs px-2 py-1 rounded flex-shrink-0
                          ${round.totalTime > 0 
                            ? round.totalTime <= 25
                              ? 'bg-neonYel text-black' 
                              : 'bg-neonRed text-white'
                            : 'bg-white/20 text-white/60'
                          }
                        `}>
                          R{round.number}
                        </div>
                        
                        <div className="flex flex-wrap gap-2 flex-1 min-w-0">
                          {round.tasks.length === 0 ? (
                            <span className="text-white/40 text-sm italic">Empty round</span>
                          ) : (
                            round.tasks.map((task) => (
                              <div
                                key={task.id}
                                className="bg-black/40 rounded px-2 py-1 flex items-center gap-2 group"
                              >
                                <span className="text-white text-sm font-arcade truncate max-w-[200px]">
                                  {task.title}
                                </span>
                                <button
                                  onClick={() => removeTask(task.id)}
                                  className="text-neonRed hover:text-red-300 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  ✕
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Right: Time Info */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          {round.tasks.map((task) => (
                            <div key={task.id} className="text-neonYel text-xs font-arcade">
                              {task.estimatedMinutes}m
                            </div>
                          ))}
                        </div>
                        <div className={`
                          font-arcade text-sm px-2 py-1 rounded min-w-[60px] text-center
                          ${round.totalTime > 25 ? 'text-neonRed' : 'text-white/80'}
                        `}>
                          {round.totalTime}/25
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-crtBlue/50 flex items-center justify-between">
            <div className="text-xs text-white/60">
              💡 After Round 3, you can convert Round 4 to Grudge Match for failed tasks
            </div>
            <button
              disabled={!canStartTournament}
              className={`font-arcade text-sm px-6 py-2 rounded border transition-all ${
                canStartTournament
                  ? isFullTournament
                    ? 'bg-neonRed border-neonRed text-white hover:shadow-neon'
                    : 'bg-neonYel border-neonYel text-black hover:shadow-neon'
                  : 'border-white/30 text-white/30 cursor-not-allowed'
              }`}
            >
              {!canStartTournament ? `NEED ${75 - totalMinutes}MIN MORE` : 
               isFullTournament ? 'START TOURNAMENT!' : 
               'START (3+ ROUNDS)'}
            </button>
          </div>
        </div>

        {/* Split Task Modal */}
        {showSplitModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-crtBlue border-4 border-neonYel rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <h2 className="font-arcade text-xl text-neonYel mb-4 text-center">
                SPLIT LARGE TASK
              </h2>
              
              <div className="mb-4">
                <label className="text-white font-arcade text-sm block mb-2">
                  MAIN TASK NAME:
                </label>
                <input
                  type="text"
                  value={largeTaskTitle}
                  onChange={(e) => setLargeTaskTitle(e.target.value)}
                  placeholder="e.g., Write blog post, Clean garage..."
                  className="w-full bg-black/50 border-2 border-neonYel rounded px-4 py-3 text-white font-arcade text-sm focus:outline-none"
                />
              </div>

              <div className="mb-4">
                <label className="text-white font-arcade text-sm block mb-2">
                  ESTIMATED TOTAL TIME:
                </label>
                <select
                  value={largeTaskMinutes}
                  onChange={(e) => setLargeTaskMinutes(Number(e.target.value))}
                  className="bg-black/50 border-2 border-neonYel rounded px-4 py-3 text-white font-arcade text-sm focus:outline-none"
                >
                  <option value={30}>30 min</option>
                  <option value={45}>45 min</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                  <option value={180}>3 hours</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="text-white font-arcade text-sm block mb-2">
                  BREAK INTO STEPS (each will be 25min max):
                </label>
                {splitTasks.map((task, index) => (
                  <input
                    key={index}
                    type="text"
                    value={task}
                    onChange={(e) => addSplitTask(e.target.value, index)}
                    placeholder={`Step ${index + 1}: What specific part?`}
                    className="w-full bg-black/50 border-2 border-white/30 rounded px-4 py-2 text-white font-arcade text-xs mb-2 focus:border-neonYel focus:outline-none"
                  />
                ))}
                
                <button
                  onClick={addMoreSplitTasks}
                  className="bg-white/20 text-white px-4 py-2 rounded font-arcade text-xs hover:bg-white/30 transition-colors"
                >
                  + ADD ANOTHER STEP
                </button>
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setShowSplitModal(false)}
                  className="bg-gray-600 text-white px-6 py-3 rounded font-arcade text-sm hover:bg-gray-700"
                >
                  CANCEL
                </button>
                <button
                  onClick={saveSplitTasks}
                  disabled={!largeTaskTitle.trim() || !splitTasks.some(task => task.trim())}
                  className="bg-neonYel text-black px-6 py-3 rounded font-arcade text-sm hover:bg-neonYel/80 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  CREATE TASKS
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompactBrainDump;