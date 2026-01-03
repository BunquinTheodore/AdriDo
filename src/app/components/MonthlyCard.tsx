import { Calendar, Check, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { useTasks } from '../context/FirebaseTaskContext';

interface MonthlyCardProps {
  isExpanded: boolean;
  onExpand: () => void;
  onCollapse: () => void;
}

export function MonthlyCard({ isExpanded, onExpand, onCollapse }: MonthlyCardProps) {
  const { getDayCompletion, getTasksForDate, toggleTask } = useTasks();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<number | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();
  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;
  const todayDate = isCurrentMonth ? today.getDate() : null;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = () => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1; // Adjust so Monday is 0
    
    const days: (number | null)[] = [];
    
    // Add empty slots for days before the month starts
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  const days = getDaysInMonth();

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  };

  const handleDateClick = (day: number) => {
    setSelectedDate(selectedDate === day ? null : day);
  };

  const getDateString = (day: number) => {
    // Use local date formatting to avoid timezone issues
    const y = year;
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const selectedDateString = selectedDate ? getDateString(selectedDate) : '';
  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDateString) : [];

  // Get completion stats for the month
  const getMonthStats = () => {
    const stats = { total: 0, completed: 0 };
    for (let i = 1; i <= new Date(year, month + 1, 0).getDate(); i++) {
      const dateStr = getDateString(i);
      const tasks = getTasksForDate(dateStr);
      if (tasks.length > 0) {
        stats.total++;
        if (tasks.every(t => t.completed)) {
          stats.completed++;
        }
      }
    }
    return stats;
  };

  const monthStats = getMonthStats();

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
          <Calendar 
            className="w-6 h-6" 
            style={{ 
              color: 'var(--dashboard-primary-blue)',
              opacity: 0.7,
              strokeWidth: 2 
            }} 
          />
          <h3 className="text-xl font-semibold" style={{ color: 'var(--dashboard-text-primary)' }}>
            Monthly
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
          >
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={previousMonth}
                className="p-2 hover:bg-[var(--dashboard-accent-cyan)] rounded-lg transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-5 h-5" style={{ color: 'var(--dashboard-text-primary)' }} />
              </button>
              <div className="text-center">
                <h4 className="font-semibold" style={{ color: 'var(--dashboard-text-primary)' }}>
                  {monthNames[month]} {year}
                </h4>
                {monthStats.total > 0 && (
                  <p className="text-xs mt-1" style={{ color: 'var(--dashboard-text-secondary)' }}>
                    {monthStats.completed} of {monthStats.total} days completed
                  </p>
                )}
              </div>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-[var(--dashboard-accent-cyan)] rounded-lg transition-colors"
                aria-label="Next month"
              >
                <ChevronRight className="w-5 h-5" style={{ color: 'var(--dashboard-text-primary)' }} />
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div 
                  key={day} 
                  className="text-center text-xs font-medium py-2"
                  style={{ color: 'var(--dashboard-text-secondary)' }}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                const dayStatus = day ? getDayCompletion(getDateString(day)) : null;
                return (
                  <motion.button
                    key={index}
                    onClick={() => day && handleDateClick(day)}
                    disabled={day === null}
                    whileHover={day ? { scale: 1.05 } : {}}
                    whileTap={day ? { scale: 0.95 } : {}}
                    className={`relative aspect-square rounded-lg flex items-center justify-center text-sm transition-all ${
                      day === null ? 'invisible' : 'cursor-pointer'
                    }`}
                    style={{
                      backgroundColor: 
                        day === todayDate 
                          ? 'var(--dashboard-accent-cyan)' 
                          : selectedDate === day
                          ? 'var(--dashboard-primary-blue)'
                          : 'transparent',
                      color: selectedDate === day ? 'white' : 'var(--dashboard-text-primary)',
                      border: day === todayDate ? '2px solid var(--dashboard-primary-blue)' : 'none',
                    }}
                    title={day ? `View tasks for ${monthNames[month]} ${day}` : ''}
                  >
                    {day}
                    {day && dayStatus && (
                      <div 
                        className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor: 
                            dayStatus === 'success' 
                              ? 'var(--dashboard-success)' 
                              : 'var(--dashboard-error)',
                        }}
                      >
                        {dayStatus === 'success' ? (
                          <Check className="w-2 h-2 text-white" strokeWidth={3} />
                        ) : (
                          <X className="w-2 h-2 text-white" strokeWidth={3} />
                        )}
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Selected Date Details */}
            <AnimatePresence mode="wait">
              {selectedDate && (
                <motion.div
                  key={selectedDate}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-4 pt-4 border-t overflow-hidden"
                  style={{ borderColor: 'var(--dashboard-border)' }}
                >
                  <h5 className="font-semibold mb-2" style={{ color: 'var(--dashboard-text-primary)' }}>
                    {monthNames[month]} {selectedDate}, {year}
                  </h5>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {selectedDateTasks.length > 0 ? (
                      selectedDateTasks.map((task) => (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
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
                            {task.timeAllocation && (
                              <div className="text-xs mt-0.5" style={{ color: 'var(--dashboard-text-secondary)' }}>
                                {task.timeAllocation}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="p-3 rounded-lg" style={{ backgroundColor: '#FAFAFA' }}>
                        <p className="text-sm italic" style={{ color: 'var(--dashboard-text-secondary)' }}>
                          No tasks yet. Start planning!
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <div className="text-2xl font-semibold mb-1" style={{ color: 'var(--dashboard-text-primary)' }}>
              {monthNames[month]}
            </div>
            <div className="text-sm mb-2" style={{ color: 'var(--dashboard-text-secondary)' }}>
              {year}
            </div>
            {monthStats.total > 0 && (
              <div className="text-xs mb-3" style={{ color: 'var(--dashboard-text-secondary)' }}>
                {monthStats.completed}/{monthStats.total} days completed
              </div>
            )}
            <div className="flex justify-center gap-1">
              {[...Array(7)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full"
                  style={{ 
                    backgroundColor: i < Math.min(3, monthStats.completed) 
                      ? 'var(--dashboard-soft-cyan)' 
                      : 'var(--dashboard-border)',
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
