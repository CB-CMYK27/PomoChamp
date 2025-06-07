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
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [largeTaskTitle, setLargeTaskTitle] = useState('');
  const [largeTaskMinutes, setLargeTaskMinutes] = useState(30);
  const [splitTasks, setSplitTasks] = useState<string[]>(['', '']);

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
    // Add each non-empty split task
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

  const removeTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

  const totalMinutes = tasks.reduce((sum, task) => sum + task.estimatedMinutes, 0);
  const canStartTournament = totalMinutes >= 75; // Minimum 3 rounds, but encourage 4
  const isFullTournament = totalMinutes >= 100; // Ideal 4 full rounds
  const targetRounds = 4; // Always 4 rounds for a complete tournament

  // Auto-organize tasks into 4 equal rounds (25 min each)
  const organizeTasksIntoRounds = () => {
    const rounds = [
      { number: 1, tasks: [], totalTime: 0 },
      { number: 2, tasks: [], totalTime: 0 },
      { number: 3, tasks: [], totalTime: 0 },
      { number: 4, tasks: [], totalTime: 0 } // Normal 4th round initially
    ];

    // Sort tasks by duration (longest first for better packing)
    const sortedTasks = [...tasks].sort((a, b) => b.estimatedMinutes - a.estimatedMinutes);

    // Distribute tasks evenly across 4 rounds using round-robin with optimization
    sortedTasks.forEach(task => {
      // Find the round with the least total time that can still fit this task
      const availableRounds = rounds.filter(round => 
        round.totalTime + task.estimatedMinutes <= 25
      );
      
      if (availableRounds.length > 0) {
        // Pick the round with the least time (to balance rounds)
        const targetRound = availableRounds.reduce((prev, current) => 
          prev.totalTime < current.totalTime ? prev : current
        );
        
        targetRound.tasks.push(task);
        targetRound.totalTime += task.estimatedMinutes;
      } else {
        // If no round can fit it exactly, put it in the round with most space
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
          
          {/* Split Large Task Button */}
          <div className="mt-4 text-center">
            <button
              onClick={openSplitModal}
              className="bg-neonRed text-white px-4 py-2 rounded font-arcade text-xs hover:bg-neonRed/80 transition-colors"
            >
              SPLIT LARGE TASK (25+ MIN)
            </button>
            <p className="text-white/60 text-xs mt-2">
              Tasks over 25 minutes need to be split into multiple Pomodoro sessions
            </p>
          </div>
        </div>

        {/* Tournament Rounds Visualization */}
        <div className="bg-black/30 rounded-lg p-6 border border-crtBlue mb-6">
          <h2 className="font-arcade text-lg text-neonYel mb-4 flex items-center gap-2">
            <Target size={20} />
            TOURNAMENT ROUNDS ({tasks.length} tasks total)
          </h2>
          
          {tasks.length === 0 ? (
            <div className="text-white/60 text-center py-8 font-arcade text-sm">
              NO TASKS YET - START BRAIN DUMPING!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {rounds.map((round) => (
                <div 
                  key={round.number}
                  className={`
                    border-2 rounded-lg p-4 min-h-[200px]
                    ${round.totalTime > 0 
                      ? round.totalTime <= 25
                        ? 'border-neonYel bg-neonYel/10' 
                        : 'border-neonRed bg-neonRed/10'
                      : 'border-white/30 bg-white/5'
                    }
                  `}
                >
                  {/* Round Header */}
                  <div className="text-center mb-3">
                    <div className={`
                      font-arcade text-sm px-2 py-1 rounded
                      ${round.totalTime > 0 
                        ? round.totalTime <= 25
                          ? 'bg-neonYel text-black' 
                          : 'bg-neonRed text-white'
                        : 'bg-white/20 text-white/60'
                      }
                    `}>
                      ROUND {round.number}
                    </div>
                    <div className={`
                      text-xs mt-1
                      ${round.totalTime > 25 ? 'text-neonRed' : 'text-white/80'}
                    `}>
                      {round.totalTime}min / 25min
                    </div>
                  </div>

                  {/* Round Tasks */}
                  <div className="space-y-2">
                    {round.tasks.length === 0 ? (
                      <div className="text-white/40 text-xs text-center py-4">
                        Empty round
                      </div>
                    ) : (
                      round.tasks.map((task, taskIndex) => (
                        <div
                          key={task.id}
                          className="bg-black/50 rounded p-2 border border-white/20"
                        >
                          <div className="text-white font-arcade text-xs mb-1">
                            {task.title}
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-neonYel text-xs">{task.estimatedMinutes}min</span>
                            <button
                              onClick={() => removeTask(task.id)}
                              className="text-neonRed hover:text-red-300 text-xs opacity-60 hover:opacity-100"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Round Status */}
                  {round.totalTime > 25 && (
                    <div className="mt-2 text-neonRed text-xs text-center font-arcade">
                      OVER TIME!
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Tournament Info */}
          {tasks.length > 0 && (
            <div className="mt-4 text-center">
              <div className="text-white/80 text-xs mb-2">
                <strong>Tournament Structure:</strong> 4 rounds × 25 minutes = Complete session
              </div>
              <div className="text-neonYel text-xs">
                💡 After Round 3, you'll have the option to convert Round 4 to a "Grudge Match" for any failed tasks
              </div>
              {rounds.some(round => round.totalTime > 25) && (
                <div className="text-neonRed text-xs mt-2 font-arcade">
                  ⚠️ Some rounds are over 25 minutes - consider splitting tasks
                </div>
              )}
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
                <div className="text-crtBlue font-arcade text-2xl">
                  {rounds.filter(r => r.tasks.length > 0).length}
                </div>
                <div className="text-white/80 text-xs">FILLED ROUNDS</div>
              </div>
              <div className="text-center">
                <div className="text-neonYel font-arcade text-2xl">
                  {Math.round(totalMinutes / 25 * 100)}%
                </div>
                <div className="text-white/80 text-xs">EFFICIENCY</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {rounds.map(round => (
                <div
                  key={round.number}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-arcade text-xs ${
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
          
          {totalMinutes < 100 && (
            <div className="mt-4 text-center">
              <div className="text-neonRed font-arcade text-sm">
                NEED {100 - totalMinutes} MORE MINUTES FOR FULL TOURNAMENT
              </div>
              <div className="text-white/60 text-xs mt-1">
                Target: 4 rounds × 25 minutes = 100 minutes total
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
                ? isFullTournament
                  ? 'bg-neonRed border-neonRed text-white hover:shadow-neon hover:scale-105'
                  : 'bg-neonYel border-neonYel text-black hover:shadow-neon hover:scale-105'
                : 'border-white/30 text-white/30 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-3">
              <Zap size={24} />
              {!canStartTournament ? 'NEED MORE TASKS' : 
               isFullTournament ? 'READY TO FIGHT!' : 
               'START TOURNAMENT (3+ ROUNDS)'}
            </div>
          </button>
          
          {canStartTournament && !isFullTournament && (
            <div className="mt-2 text-neonYel text-xs">
              Add {100 - totalMinutes} more minutes for full 4-round experience
            </div>
          )}
        </div>

        {/* Quick Tips */}
        <div className="mt-8 text-center text-white/60 text-xs max-w-2xl mx-auto">
          <p className="mb-2">💡 <strong>PRO TIPS:</strong></p>
          <p>• Don't overthink estimates - just guess quickly</p>
          <p>• Target 100 minutes total (4 complete rounds)</p>
          <p>• For larger projects, use "Split Large Task" to break them down</p>
          <p>• After Round 3, you can choose Grudge Match for failed tasks</p>
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

export default BrainDumpSlice1;