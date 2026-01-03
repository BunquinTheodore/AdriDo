import { Check, CheckCircle, ChevronDown, ChevronUp, Circle, Clock, GripVertical, Plus, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { useTasks } from '../context/FirebaseTaskContext';

interface DailyCardProps {
  isExpanded: boolean;
  onExpand: () => void;
  onCollapse: () => void;
}

export function DailyCard({ isExpanded, onExpand, onCollapse }: DailyCardProps) {
  const { 
    tasks, 
    toggleTask, 
    toggleSubtask, 
    deleteTask, 
    addTask,
    addSubtask,
    deleteSubtask,
    getTasksForDate 
  } = useTasks();
  
  // Use local date formatting to avoid timezone issues
  const todayDate = new Date();
  const today = `${todayDate.getFullYear()}-${String(todayDate.getMonth() + 1).padStart(2, '0')}-${String(todayDate.getDate()).padStart(2, '0')}`;
  const todayTasks = getTasksForDate(today);
  
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    timeAllocation: '',
  });
  const [newSubtaskText, setNewSubtaskText] = useState<{ [key: string]: string }>({});

  const handleAddTask = () => {
    if (newTask.title.trim()) {
      addTask({
        ...newTask,
        completed: false,
        subtasks: [],
        date: today,
      });
      setNewTask({ title: '', description: '', timeAllocation: '' });
      setIsAddingTask(false);
    }
  };

  const handleAddSubtask = (taskId: string) => {
    const text = newSubtaskText[taskId];
    if (text?.trim()) {
      addSubtask(taskId, text);
      setNewSubtaskText({ ...newSubtaskText, [taskId]: '' });
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
          <CheckCircle 
            className="w-6 h-6" 
            style={{ 
              color: 'var(--dashboard-primary-blue)',
              opacity: 0.7,
              strokeWidth: 2 
            }} 
          />
          <h3 className="text-xl font-semibold" style={{ color: 'var(--dashboard-text-primary)' }}>
            Daily
          </h3>
          <span className="text-xs px-2 py-1 rounded-full" style={{ 
            backgroundColor: 'var(--dashboard-accent-cyan)',
            color: 'var(--dashboard-text-secondary)' 
          }}>
            Resets daily
          </span>
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
            className="space-y-3 max-h-[500px] overflow-y-auto pr-2"
          >
            {todayTasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="border rounded-lg p-3"
                style={{ borderColor: 'var(--dashboard-border)' }}
              >
                <div className="flex items-start gap-3 group">
                  <GripVertical 
                    className="w-4 h-4 mt-1 cursor-grab opacity-40 hover:opacity-70 transition-opacity flex-shrink-0" 
                    style={{ color: 'var(--dashboard-text-secondary)' }}
                  />
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="relative w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center transition-all duration-400 flex-shrink-0"
                    style={{
                      borderColor: 'var(--dashboard-primary-blue)',
                      backgroundColor: task.completed ? 'var(--dashboard-primary-blue)' : 'transparent',
                    }}
                    aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
                  >
                    <AnimatePresence>
                      {task.completed && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: [1, 1.2, 1] }}
                          exit={{ scale: 0 }}
                          transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                        >
                          <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4
                        className={`font-medium transition-all ${
                          task.completed ? 'line-through opacity-50' : ''
                        }`}
                        style={{ color: 'var(--dashboard-text-primary)' }}
                      >
                        {task.title}
                      </h4>
                      <button
                        onClick={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
                        aria-label="Toggle details"
                      >
                        {expandedTaskId === task.id ? (
                          <ChevronUp className="w-4 h-4" style={{ color: 'var(--dashboard-text-secondary)' }} />
                        ) : (
                          <ChevronDown className="w-4 h-4" style={{ color: 'var(--dashboard-text-secondary)' }} />
                        )}
                      </button>
                    </div>
                    
                    {task.timeAllocation && (
                      <div className="flex items-center gap-1 mt-1 text-xs" style={{ color: 'var(--dashboard-text-secondary)' }}>
                        <Clock className="w-3 h-3" />
                        <span>{task.timeAllocation}</span>
                      </div>
                    )}
                    
                    <AnimatePresence>
                      {expandedTaskId === task.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-2 space-y-2 overflow-hidden"
                        >
                          {task.description && (
                            <p className="text-sm" style={{ color: 'var(--dashboard-text-secondary)' }}>
                              {task.description}
                            </p>
                          )}
                          
                          {/* Subtasks */}
                          {task.subtasks.length > 0 && (
                            <div className="ml-4 border-l-2 pl-3 space-y-2" style={{ borderColor: 'var(--dashboard-border)' }}>
                              {task.subtasks.map((subtask) => (
                                <div key={subtask.id} className="flex items-center gap-2 group/subtask">
                                  <button
                                    onClick={() => toggleSubtask(task.id, subtask.id)}
                                    className="w-4 h-4 rounded border-2 flex items-center justify-center transition-all flex-shrink-0"
                                    style={{
                                      borderColor: 'var(--dashboard-primary-blue)',
                                      backgroundColor: subtask.completed ? 'var(--dashboard-primary-blue)' : 'transparent',
                                    }}
                                  >
                                    <AnimatePresence>
                                      {subtask.completed && (
                                        <motion.div
                                          initial={{ scale: 0 }}
                                          animate={{ scale: 1 }}
                                          exit={{ scale: 0 }}
                                        >
                                          <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </button>
                                  <span
                                    className={`text-sm flex-1 ${subtask.completed ? 'line-through opacity-50' : ''}`}
                                    style={{ color: 'var(--dashboard-text-primary)' }}
                                  >
                                    {subtask.text}
                                  </span>
                                  <button
                                    onClick={() => deleteSubtask(task.id, subtask.id)}
                                    className="opacity-0 group-hover/subtask:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded"
                                    aria-label="Delete subtask"
                                  >
                                    <X className="w-3 h-3" style={{ color: 'var(--dashboard-error)' }} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Add Subtask */}
                          <div className="ml-4 flex items-center gap-2">
                            <Plus className="w-4 h-4" style={{ color: 'var(--dashboard-primary-blue)' }} />
                            <input
                              type="text"
                              value={newSubtaskText[task.id] || ''}
                              onChange={(e) => setNewSubtaskText({ ...newSubtaskText, [task.id]: e.target.value })}
                              onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask(task.id)}
                              placeholder="Add a step…"
                              className="flex-1 text-sm outline-none border-none bg-transparent placeholder-italic"
                              style={{ 
                                color: 'var(--dashboard-text-primary)',
                                caretColor: 'var(--dashboard-primary-blue)',
                              }}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded flex-shrink-0"
                    aria-label="Delete task"
                  >
                    <X className="w-4 h-4" style={{ color: 'var(--dashboard-error)' }} />
                  </button>
                </div>
              </motion.div>
            ))}
            
            {/* Add New Task */}
            {isAddingTask ? (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-2 border-dashed rounded-lg p-3 space-y-2"
                style={{ borderColor: 'var(--dashboard-primary-blue)' }}
              >
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Task title"
                  className="w-full font-medium outline-none border-none bg-transparent"
                  style={{ color: 'var(--dashboard-text-primary)' }}
                  autoFocus
                />
                <input
                  type="text"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Description (optional)"
                  className="w-full text-sm outline-none border-none bg-transparent"
                  style={{ color: 'var(--dashboard-text-secondary)' }}
                />
                <input
                  type="text"
                  value={newTask.timeAllocation}
                  onChange={(e) => setNewTask({ ...newTask, timeAllocation: e.target.value })}
                  placeholder="Time (e.g., 30 min)"
                  className="w-full text-sm outline-none border-none bg-transparent"
                  style={{ color: 'var(--dashboard-text-secondary)' }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddTask}
                    className="px-3 py-1 rounded-lg text-sm transition-colors"
                    style={{
                      backgroundColor: 'var(--dashboard-primary-blue)',
                      color: 'white',
                    }}
                  >
                    Add Task
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingTask(false);
                      setNewTask({ title: '', description: '', timeAllocation: '' });
                    }}
                    className="px-3 py-1 rounded-lg text-sm transition-colors"
                    style={{
                      backgroundColor: '#F5F5F5',
                      color: 'var(--dashboard-text-primary)',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            ) : (
              <button
                onClick={() => setIsAddingTask(true)}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed rounded-lg transition-colors hover:bg-[var(--dashboard-accent-cyan)]"
                style={{ borderColor: 'var(--dashboard-border)' }}
              >
                <Plus className="w-5 h-5" style={{ color: 'var(--dashboard-primary-blue)' }} />
                <span style={{ color: 'var(--dashboard-text-primary)' }}>Add task</span>
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            {todayTasks.slice(0, 3).map((task) => (
              <div key={task.id} className="flex items-center gap-2">
                <Circle 
                  className={`w-4 h-4 flex-shrink-0 ${task.completed ? 'fill-[var(--dashboard-primary-blue)]' : ''}`}
                  style={{ 
                    color: 'var(--dashboard-primary-blue)',
                    strokeWidth: 2 
                  }} 
                />
                <span
                  className={`text-sm truncate ${task.completed ? 'line-through opacity-50' : ''}`}
                  style={{ color: 'var(--dashboard-text-primary)' }}
                >
                  {task.title}
                </span>
              </div>
            ))}
            {todayTasks.length > 3 && (
              <div className="text-sm italic" style={{ color: 'var(--dashboard-text-secondary)' }}>
                +{todayTasks.length - 3} more tasks
              </div>
            )}
            {todayTasks.length === 0 && (
              <div className="text-sm italic text-center py-4" style={{ color: 'var(--dashboard-text-secondary)' }}>
                No tasks yet. Click to add!
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
