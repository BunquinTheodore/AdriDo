import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './config';
import { getTasksForDate } from './tasks';

export interface StreakData {
  streakCount: number;
  longestStreak: number;
  lastCompletedDate: string | null;
}

// Get user's streak data
export async function getStreakData(userId: string): Promise<StreakData> {
  const userRef = doc(db, 'users', userId);
  const docSnap = await getDoc(userRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      streakCount: data.streakCount || 0,
      longestStreak: data.longestStreak || 0,
      lastCompletedDate: data.lastCompletedDate || null,
    };
  }

  return {
    streakCount: 0,
    longestStreak: 0,
    lastCompletedDate: null,
  };
}

// Update streak when all daily tasks are completed
export async function updateStreak(userId: string): Promise<StreakData> {
  const today = new Date().toISOString().split('T')[0];
  const todayTasks = await getTasksForDate(userId, today);

  // Check if all tasks are completed
  const allCompleted = todayTasks.length > 0 && todayTasks.every((t) => t.completed);

  const userRef = doc(db, 'users', userId);
  const currentStreak = await getStreakData(userId);

  if (allCompleted) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newStreakCount = currentStreak.streakCount;

    if (currentStreak.lastCompletedDate === today) {
      // Already counted today
      return currentStreak;
    } else if (currentStreak.lastCompletedDate === yesterdayStr) {
      // Continuing streak
      newStreakCount = currentStreak.streakCount + 1;
    } else {
      // Starting new streak
      newStreakCount = 1;
    }

    const newLongestStreak = Math.max(newStreakCount, currentStreak.longestStreak);

    await updateDoc(userRef, {
      streakCount: newStreakCount,
      longestStreak: newLongestStreak,
      lastCompletedDate: today,
    });

    return {
      streakCount: newStreakCount,
      longestStreak: newLongestStreak,
      lastCompletedDate: today,
    };
  } else {
    // Check if streak should be broken
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (
      currentStreak.lastCompletedDate &&
      currentStreak.lastCompletedDate < yesterdayStr
    ) {
      // Streak is broken
      await updateDoc(userRef, {
        streakCount: 0,
      });

      return {
        ...currentStreak,
        streakCount: 0,
      };
    }
  }

  return currentStreak;
}

// Calculate streak from task history (for display purposes)
export async function calculateCurrentStreak(userId: string): Promise<number> {
  const streak = await getStreakData(userId);
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // Check if streak is still valid
  if (
    streak.lastCompletedDate === today ||
    streak.lastCompletedDate === yesterdayStr
  ) {
    return streak.streakCount;
  }

  return 0;
}
