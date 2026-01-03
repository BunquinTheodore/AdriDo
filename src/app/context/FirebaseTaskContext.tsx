import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import {
    checkAndResetDaily,
    addSubtask as firebaseAddSubtask,
    addTask as firebaseAddTask,
    deleteSubtask as firebaseDeleteSubtask,
    deleteTask as firebaseDeleteTask,
    updateTask as firebaseUpdateTask,
    SINGLE_USER_ID,
    subscribeToTasks,
    toggleTaskCompletion,
    updateStreak,
    type Subtask,
    type Task,
} from '../../lib/firebase';

// Re-export types for component usage
export type { Subtask };

export interface DailyTask {
  id: string;
  title: string;
  description: string;
  timeAllocation: string;
  completed: boolean;
  subtasks: Subtask[];
  date: string; // YYYY-MM-DD format
}

interface TaskContextType {
  tasks: DailyTask[];
  loading: boolean;
  addTask: (task: Omit<DailyTask, 'id'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<DailyTask>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  addSubtask: (taskId: string, text: string) => Promise<void>;
  deleteSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  getTasksForDate: (date: string) => DailyTask[];
  getTasksForWeek: (startDate: Date) => DailyTask[];
  getTasksForMonth: (year: number, month: number) => DailyTask[];
  getDayCompletion: (date: string) => 'success' | 'failed' | null;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

// Get stored last reset date from localStorage
const getStoredLastResetDate = (): string => {
  return localStorage.getItem('lastResetDate') || '';
};

const setStoredLastResetDate = (date: string) => {
  localStorage.setItem('lastResetDate', date);
};

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper to get local date string
  const getLocalDateString = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // Check for daily reset on mount
  useEffect(() => {
    const performDailyReset = async () => {
      const lastResetDate = getStoredLastResetDate();
      const today = getLocalDateString(new Date());
      
      if (lastResetDate !== today) {
        await checkAndResetDaily(SINGLE_USER_ID, lastResetDate);
        setStoredLastResetDate(today);
      }
    };
    
    performDailyReset();
  }, []);

  // Subscribe to tasks
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToTasks(SINGLE_USER_ID, (firebaseTasks: Task[]) => {
      const mappedTasks: DailyTask[] = firebaseTasks.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        timeAllocation: t.timeAllocation,
        completed: t.completed,
        subtasks: t.subtasks,
        date: t.date,
      }));
      setTasks(mappedTasks);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addTask = async (task: Omit<DailyTask, 'id'>) => {
    await firebaseAddTask(SINGLE_USER_ID, task);
  };

  const updateTaskHandler = async (id: string, updates: Partial<DailyTask>) => {
    await firebaseUpdateTask(SINGLE_USER_ID, id, updates);
  };

  const deleteTaskHandler = async (id: string) => {
    await firebaseDeleteTask(SINGLE_USER_ID, id);
  };

  const toggleTask = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    await toggleTaskCompletion(SINGLE_USER_ID, id, !task.completed);

    // Update streak after toggling
    await updateStreak(SINGLE_USER_ID);
  };

  const toggleSubtask = async (taskId: string, subtaskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedSubtasks = task.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    await firebaseUpdateTask(SINGLE_USER_ID, taskId, { subtasks: updatedSubtasks });
  };

  const addSubtaskHandler = async (taskId: string, text: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    await firebaseAddSubtask(SINGLE_USER_ID, taskId, task.subtasks, text);
  };

  const deleteSubtaskHandler = async (taskId: string, subtaskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    await firebaseDeleteSubtask(SINGLE_USER_ID, taskId, task.subtasks, subtaskId);
  };

  const getTasksForDate = (date: string) => {
    return tasks.filter((task) => task.date === date);
  };

  const getTasksForWeek = (startDate: Date) => {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);

    return tasks.filter((task) => {
      const taskDate = new Date(task.date);
      return taskDate >= startDate && taskDate <= endDate;
    });
  };

  const getTasksForMonth = (year: number, month: number) => {
    return tasks.filter((task) => {
      const taskDate = new Date(task.date);
      return taskDate.getFullYear() === year && taskDate.getMonth() === month;
    });
  };

  const getDayCompletion = (date: string): 'success' | 'failed' | null => {
    const dayTasks = getTasksForDate(date);
    if (dayTasks.length === 0) return null;

    const allCompleted = dayTasks.every((task) => task.completed);
    const anyCompleted = dayTasks.some((task) => task.completed);

    if (allCompleted) return 'success';
    if (anyCompleted) return 'failed'; // Partial completion
    return 'failed';
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        addTask,
        updateTask: updateTaskHandler,
        deleteTask: deleteTaskHandler,
        toggleTask,
        toggleSubtask,
        addSubtask: addSubtaskHandler,
        deleteSubtask: deleteSubtaskHandler,
        getTasksForDate,
        getTasksForWeek,
        getTasksForMonth,
        getDayCompletion,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}
