// Firebase configuration and app
export { SINGLE_USER_ID, db } from './config';

// Tasks
export {
    addSubtask, addTask, checkAndResetDaily, deleteSubtask, deleteTask, getTasksForDate, resetDailyTasks, subscribeToTasks, toggleSubtaskCompletion, toggleTaskCompletion, updateTask, type Subtask, type Task
} from './tasks';

// Notes
export {
    getNotes, subscribeToNotes, updateNotes, type Notes
} from './notes';

// Streak
export {
    calculateCurrentStreak, getStreakData,
    updateStreak, type StreakData
} from './streak';

