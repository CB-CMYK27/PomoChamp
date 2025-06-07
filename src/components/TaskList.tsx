import React, { useState, useEffect } from 'react';
import { useTaskStore } from '../store/taskStore';
import { Plus, Trash2, Check } from 'lucide-react';

const TaskList: React.FC = () => {
  const { tasks, fetchTasks, addTask, toggleTask, deleteTask } = useTaskStore();
  const [newTaskTitle, setNewTaskTitle] = useState('');
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
      await addTask(newTaskTitle.trim());
      setNewTaskTitle('');
    }
  };

  return (
    <div className="bg-gray-800 border-4 border-gray-600 p-4 rounded-lg shadow-lg max-h-[400px] w-full overflow-hidden flex flex-col">
      <h2 className="text-white font-bold text-xl mb-3 bg-blue-600 p-2 text-center border-2 border-blue-800">
        MISSION TASKS
      </h2>
      
      {/* Add task form */}
      <form onSubmit={handleAddTask} className="mb-4 flex">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="New task..."
          className="flex-1 px-3 py-2 bg-gray-700 text-white border-2 border-gray-600 rounded-l-md focus:outline-none"
        />
        <button
          type="submit"
          className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-r-md border-2 border-green-700 flex items-center justify-center"
        >
          <Plus size={20} />
        </button>
      </form>
      
      {/* Task list */}
      <div className="overflow-y-auto flex-1">
        {isLoading ? (
          <div className="text-gray-400 text-center p-4">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="text-gray-400 text-center p-4">No tasks yet. Add one to get started!</div>
        ) : (
          <ul className="space-y-2">
            {tasks.map((task) => (
              <li 
                key={task.id} 
                className={`
                  flex items-center justify-between p-2 rounded
                  ${task.completed ? 'bg-gray-700 text-gray-400' : 'bg-gray-700 text-white'}
                  border-l-4 ${task.completed ? 'border-green-500' : 'border-yellow-500'}
                `}
              >
                <span className={`flex-1 ${task.completed ? 'line-through' : ''}`}>
                  {task.title}
                </span>
                <div className="flex space-x-1">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`
                      p-1 rounded 
                      ${task.completed ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}
                      text-white
                    `}
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1 rounded bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TaskList;