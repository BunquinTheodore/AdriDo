import { CalendarDays, Check, Plus, Trash2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { useTasks } from '../context/FirebaseTaskContext';

interface WeeklyCardProps {
  isExpanded: boolean;
  onExpand: () => void;
  onCollapse: () => void;
}

const daysOfWeek = [
  { short: 'Mon', long: 'Monday', motivation: 'Plan your Monday' },
  { short: 'Tue', long: 'Tuesday', motivation: 'Stay on track Tuesday' },
  { short: 'Wed', long: 'Wednesday', motivation: 'Midweek momentum' },
  { short: 'Thu', long: 'Thursday', motivation: 'Almost there Thursday' },
  { short: 'Fri', long: 'Friday', motivation: 'Finish strong Friday' },
  { short: 'Sat', long: 'Saturday', motivation: 'Self-care Saturday' },
  { short: 'Sun', long: 'Sunday', motivation: 'Prep for success Sunday' },
];

export function WeeklyCard({ isExpanded, onExpand, onCollapse }: WeeklyCardProps) {
  const { getTasksForDate, toggleTask, addTask, deleteTask } = useTasks();
  const today = new Date().getDay();
  const todayIndex = today === 0 ? 6 : today - 1; // Adjust Sunday to be last
  const [selectedDay, setSelectedDay] = useState(todayIndex);
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', timeAllocation: '' });

  // Get the start of the current week (Monday)
  const getWeekStart = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust to Monday
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    return monday;
  };

  const weekStart = getWeekStart();

  // Get date for a specific day index (0 = Monday, 6 = Sunday)
  const getDateForDay = (dayIndex: number) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + dayIndex);
    // Use local date formatting to avoid timezone issues
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const selectedDayTasks = getTasksForDate(getDateForDay(selectedDay));

  // Get task counts for each day
  const getDayTaskCount = (dayIndex: number) => {
    const tasks = getTasksForDate(getDateForDay(dayIndex));
    const completed = tasks.filter(t => t.completed).length;
    return { total: tasks.length, completed };
  };

  // Handle adding a new task for the selected day
  const handleAddTask = async () => {
    if (newTask.title.trim()) {
      await addTask({
        title: newTask.title.trim(),
        description: newTask.description.trim(),
        timeAllocation: newTask.timeAllocation.trim(),
        completed: false,
        subtasks: [],
        date: getDateForDay(selectedDay),
      });
      setNewTask({ title: '', description: '', timeAllocation: '' });
      setIsAddingTask(false);
    }
  };

  return (
    <motion.div
      layout
      initial={false}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      onClick={!isExpanded ? onExpand : undefined}
      className={`bg-white rounded-2xl p-6 shadow-[0px_2px_8px_rgba(0,124,195,0.08)] hover:shadow-[0px_4px_16px_rgba(0,124,195,0.12)] transition-shadow duration-300 min-h-[200px] ${
        !isExpanded ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarDays 
            className="w-6 h-6" 
            style={{ 
              color: 'var(--dashboard-primary-blue)',
              opacity: 0.7,
              strokeWidth: 2 
            }} 
          />
          <h3 className="text-xl font-semibold" style={{ color: 'var(--dashboard-text-primary)' }}>
            Weekly
          </h3>
        </div>
        <AnimatePresence>
          {isExpanded && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={(e) => {
                e.stopPropagation();
                onCollapse();
              }}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--dashboard-accent-cyan)] transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" style={{ color: 'var(--dashboard-text-primary)' }} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        {isExpanded ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="space-y-4"
          >
            <div className="grid grid-cols-7 gap-2">
              {daysOfWeek.map((day, index) => {
                const { total, completed } = getDayTaskCount(index);
                return (
                  <motion.button
                    key={day.short}
                    onClick={() => setSelectedDay(index)}
                    onMouseEnter={() => setHoveredDay(index)}
                    onMouseLeave={() => setHoveredDay(null)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative px-2 py-3 rounded-xl border-2 transition-all duration-200"
                    style={{
                      borderColor: selectedDay === index ? 'var(--dashboard-primary-blue)' : 'var(--dashboard-border)',
                      backgroundColor: selectedDay === index ? 'var(--dashboard-primary-blue)' : 'transparent',
                      color: selectedDay === index ? 'white' : 'var(--dashboard-text-primary)',
                    }}
                    aria-label={day.long}
                  >
                    <div className="text-xs font-medium">{day.short}</div>
                    {total > 0 && (
                      <div className="text-xs mt-1 opacity-75">
                        {completed}/{total}
                      </div>
                    )}
                    {index === todayIndex && (
                      <div 
                        className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
                        style={{ backgroundColor: 'var(--dashboard-soft-cyan)' }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              {hoveredDay !== null && (
                <motion.div
                  key={hoveredDay}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="text-center py-2 px-4 rounded-lg"
                  style={{ 
                    backgroundColor: 'var(--dashboard-accent-cyan)',
                    color: 'var(--dashboard-text-primary)',
                  }}
                >
                  <p className="text-sm font-medium">{daysOfWeek[hoveredDay].motivation}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="pt-4 border-t" style={{ borderColor: 'var(--dashboard-border)' }}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold" style={{ color: 'var(--dashboard-text-primary)' }}>
                  {daysOfWeek[selectedDay].long}'s Tasks
                </h4>
                {!isAddingTask && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsAddingTask(true)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      backgroundColor: 'var(--dashboard-accent-cyan)',
                      color: 'var(--dashboard-primary-blue)',
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    Add Task
                  </motion.button>
                )}
              </div>

              {/* Add Task Form */}
              <AnimatePresence>
                {isAddingTask && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 p-3 rounded-lg"
                    style={{ backgroundColor: '#FAFAFA' }}
                  >
                    <input
                      type="text"
                      placeholder="Task title..."
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border text-sm mb-2"
                      style={{
                        borderColor: 'var(--dashboard-border)',
                        color: 'var(--dashboard-text-primary)',
                      }}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newTask.title.trim()) {
                          handleAddTask();
                        } else if (e.key === 'Escape') {
                          setIsAddingTask(false);
                          setNewTask({ title: '', description: '', timeAllocation: '' });
                        }
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Description (optional)"
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border text-sm mb-2"
                      style={{
                        borderColor: 'var(--dashboard-border)',
                        color: 'var(--dashboard-text-primary)',
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Time allocation (e.g., 30 min)"
                      value={newTask.timeAllocation}
                      onChange={(e) => setNewTask({ ...newTask, timeAllocation: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border text-sm mb-3"
                      style={{
                        borderColor: 'var(--dashboard-border)',
                        color: 'var(--dashboard-text-primary)',
                      }}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddTask}
                        disabled={!newTask.title.trim()}
                        className="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-opacity disabled:opacity-50"
                        style={{
                          backgroundColor: 'var(--dashboard-primary-blue)',
                          color: 'white',
                        }}
                      >
                        Add to {daysOfWeek[selectedDay].long}
                      </button>
                      <button
                        onClick={() => {
                          setIsAddingTask(false);
                          setNewTask({ title: '', description: '', timeAllocation: '' });
                        }}
                        className="px-3 py-2 rounded-lg text-sm font-medium"
                        style={{
                          backgroundColor: 'var(--dashboard-border)',
                          color: 'var(--dashboard-text-secondary)',
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {selectedDayTasks.length > 0 ? (
                  selectedDayTasks.map((task) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="group flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <button
                        onClick={() => toggleTask(task.id)}
                        className="relative w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0"
                        style={{
                          borderColor: 'var(--dashboard-primary-blue)',
                          backgroundColor: task.completed ? 'var(--dashboard-primary-blue)' : 'transparent',
                        }}
                      >
                        <AnimatePresence>
                          {task.completed && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                            >
                              <Check className="w-3 h-3 text-white" strokeWidth={3} />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </button>
                      <div className="flex-1 min-w-0">
                        <div
                          className={`font-medium text-sm ${task.completed ? 'line-through opacity-50' : ''}`}
                          style={{ color: 'var(--dashboard-text-primary)' }}
                        >
                          {task.title}
                        </div>
                        {task.description && (
                          <div className="text-xs mt-0.5" style={{ color: 'var(--dashboard-text-secondary)' }}>
                            {task.description}
                          </div>
                        )}
                        {task.subtasks.length > 0 && (
                          <div className="text-xs mt-1" style={{ color: 'var(--dashboard-text-secondary)' }}>
                            {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length} steps completed
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all"
                        aria-label="Delete task"
                        title="Delete task"
                      >
                        <Trash2 className="w-4 h-4" style={{ color: 'var(--dashboard-error)' }} />
                      </button>
                    </motion.div>
                  ))
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 text-center rounded-lg" 
                    style={{ backgroundColor: '#FAFAFA' }}
                  >
                    <p className="text-sm mb-3" style={{ color: 'var(--dashboard-text-secondary)' }}>
                      No tasks for {daysOfWeek[selectedDay].long} yet
                    </p>
                    {!isAddingTask && (
                      <button
                        onClick={() => setIsAddingTask(true)}
                        className="flex items-center gap-1 mx-auto px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        style={{
                          backgroundColor: 'var(--dashboard-primary-blue)',
                          color: 'white',
                        }}
                      >
                        <Plus className="w-4 h-4" />
                        Add First Task
                      </button>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-wrap gap-2"
          >
            {daysOfWeek.map((day, index) => {
              const { total, completed } = getDayTaskCount(index);
              return (
                <div
                  key={day.short}
                  className={`px-3 py-1.5 rounded-lg text-sm ${
                    index === todayIndex ? 'ring-2' : ''
                  }`}
                  style={{
                    backgroundColor: index === todayIndex ? 'var(--dashboard-accent-cyan)' : '#F5F5F5',
                    color: 'var(--dashboard-text-primary)',
                    ringColor: 'var(--dashboard-primary-blue)',
                  }}
                >
                  <div>{day.short}</div>
                  {total > 0 && (
                    <div className="text-xs opacity-60">{completed}/{total}</div>
                  )}
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
