import { create } from 'zustand';
import { Task } from '../types';
import { fetchTasks, addTask, updateTask, deleteTask } from '../services/supabase';
import { supabase } from '../services/supabase';

interface TaskStore {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
  addTask: (title: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  getCompletedCount: () => number;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,
  
  fetchTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const tasks = await fetchTasks();
      set({ tasks, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch tasks', 
        isLoading: false 
      });
    }
  },
  
  addTask: async (title: string) => {
    set({ isLoading: true, error: null });
    try {
      // Get the current user (anonymous or authenticated)
      const { data: { user } } = await supabase.auth.getUser();
      
      const newTask = await addTask({
        title,
        completed: false,
        user_id: user?.id || null  // Use actual user ID or null
      });
      
      if (newTask) {
        set((state) => ({ 
          tasks: [newTask, ...state.tasks],
          isLoading: false 
        }));
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add task', 
        isLoading: false 
      });
    }
  },
  
  toggleTask: async (id: string) => {
    const task = get().tasks.find(t => t.id === id);
    if (!task) return;
    
    // Optimistic update
    set((state) => ({
      tasks: state.tasks.map(t => 
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    }));
    
    try {
      await updateTask(id, { completed: !task.completed });
    } catch (error) {
      // Revert on error
      set((state) => ({
        tasks: state.tasks.map(t => 
          t.id === id ? { ...t, completed: task.completed } : t
        ),
        error: error instanceof Error ? error.message : 'Failed to update task'
      }));
    }
  },
  
  deleteTask: async (id: string) => {
    // Optimistic delete
    const previousTasks = get().tasks;
    
    set((state) => ({
      tasks: state.tasks.filter(t => t.id !== id)
    }));
    
    try {
      const success = await deleteTask(id);
      if (!success) throw new Error('Failed to delete task');
    } catch (error) {
      // Revert on error
      set({ 
        tasks: previousTasks,
        error: error instanceof Error ? error.message : 'Failed to delete task'
      });
    }
  },
  
  getCompletedCount: () => {
    return get().tasks.filter(task => task.completed).length;
  }
}));