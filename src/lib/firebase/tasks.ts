import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where,
    writeBatch
} from 'firebase/firestore';
import { db } from './config';

export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  timeAllocation: string;
  completed: boolean;
  subtasks: Subtask[];
  date: string; // YYYY-MM-DD format
  createdAt: Date;
  updatedAt: Date;
}

// Get tasks collection reference for a user
const getTasksRef = (userId: string) => collection(db, 'users', userId, 'tasks');

// Add a new task
export async function addTask(
  userId: string,
  task: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const tasksRef = getTasksRef(userId);
  const docRef = await addDoc(tasksRef, {
    ...task,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

// Update a task
export async function updateTask(
  userId: string,
  taskId: string,
  updates: Partial<Omit<Task, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  const taskRef = doc(db, 'users', userId, 'tasks', taskId);
  await updateDoc(taskRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

// Delete a task
export async function deleteTask(userId: string, taskId: string): Promise<void> {
  const taskRef = doc(db, 'users', userId, 'tasks', taskId);
  await deleteDoc(taskRef);
}

// Toggle task completion
export async function toggleTaskCompletion(
  userId: string,
  taskId: string,
  completed: boolean
): Promise<void> {
  await updateTask(userId, taskId, { completed });
}

// Toggle subtask completion
export async function toggleSubtaskCompletion(
  userId: string,
  taskId: string,
  subtasks: Subtask[],
  subtaskId: string
): Promise<void> {
  const updatedSubtasks = subtasks.map((st) =>
    st.id === subtaskId ? { ...st, completed: !st.completed } : st
  );
  await updateTask(userId, taskId, { subtasks: updatedSubtasks });
}

// Add a subtask
export async function addSubtask(
  userId: string,
  taskId: string,
  currentSubtasks: Subtask[],
  text: string
): Promise<void> {
  const newSubtask: Subtask = {
    id: `subtask_${Date.now()}`,
    text,
    completed: false,
  };
  await updateTask(userId, taskId, { subtasks: [...currentSubtasks, newSubtask] });
}

// Delete a subtask
export async function deleteSubtask(
  userId: string,
  taskId: string,
  currentSubtasks: Subtask[],
  subtaskId: string
): Promise<void> {
  const updatedSubtasks = currentSubtasks.filter((st) => st.id !== subtaskId);
  await updateTask(userId, taskId, { subtasks: updatedSubtasks });
}

// Get tasks for a specific date
export async function getTasksForDate(userId: string, date: string): Promise<Task[]> {
  const tasksRef = getTasksRef(userId);
  const q = query(tasksRef, where('date', '==', date), orderBy('createdAt', 'asc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      userId: data.userId,
      title: data.title,
      description: data.description || '',
      timeAllocation: data.timeAllocation || '',
      completed: data.completed,
      subtasks: data.subtasks || [],
      date: data.date,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Task;
  });
}

// Subscribe to tasks for real-time updates
export function subscribeToTasks(
  userId: string,
  callback: (tasks: Task[]) => void
): () => void {
  const tasksRef = getTasksRef(userId);
  const q = query(tasksRef, orderBy('createdAt', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        title: data.title,
        description: data.description || '',
        timeAllocation: data.timeAllocation || '',
        completed: data.completed,
        subtasks: data.subtasks || [],
        date: data.date,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Task;
    });
    callback(tasks);
  });
}

// Reset daily tasks (client-side reset)
export async function resetDailyTasks(userId: string, today: string): Promise<void> {
  const tasksRef = getTasksRef(userId);
  const q = query(tasksRef, where('date', '==', today));
  const snapshot = await getDocs(q);

  const batch = writeBatch(db);

  snapshot.docs.forEach((docSnap) => {
    const data = docSnap.data();
    const resetSubtasks = (data.subtasks || []).map((st: Subtask) => ({
      ...st,
      completed: false,
    }));

    batch.update(docSnap.ref, {
      completed: false,
      subtasks: resetSubtasks,
      updatedAt: serverTimestamp(),
    });
  });

  await batch.commit();
}

// Check and perform daily reset if needed
// This function should only reset YESTERDAY's tasks, not today's
export async function checkAndResetDaily(
  userId: string,
  lastResetDate: string
): Promise<boolean> {
  // Use local date to avoid timezone issues
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  if (lastResetDate !== today && lastResetDate !== '') {
    // Only reset tasks from previous days, NOT today
    // The lastResetDate is the date we last performed a reset
    // We don't need to reset anything - completed status should persist
    // This function was incorrectly resetting today's tasks
    
    // Update last reset date in user profile
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      lastResetDate: today,
    }).catch(() => {
      // User doc might not exist, that's okay
    });

    return true; // Date check performed
  }

  return false; // No action needed
}
