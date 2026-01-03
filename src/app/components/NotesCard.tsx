import { Cloud, PencilLine, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef } from 'react';
import { useNotes } from '../context/NotesContext';

interface NotesCardProps {
  isExpanded: boolean;
  onExpand: () => void;
  onCollapse: () => void;
}

export function NotesCard({ isExpanded, onExpand, onCollapse }: NotesCardProps) {
  const { notes, saving, updateNotes } = useNotes();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const maxChars = 1000;

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [notes]);

  // Handle bullet formatting
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const cursorPosition = e.currentTarget.selectionStart;
      const textBeforeCursor = notes.substring(0, cursorPosition);
      const textAfterCursor = notes.substring(cursorPosition);
      
      // Add bullet point for new line
      const newText = textBeforeCursor + '\n• ' + textAfterCursor;
      updateNotes(newText);
      
      // Set cursor position after the bullet
      setTimeout(() => {
        if (textareaRef.current) {
          const newPosition = cursorPosition + 3; // \n + • + space
          textareaRef.current.selectionStart = newPosition;
          textareaRef.current.selectionEnd = newPosition;
        }
      }, 0);
    }
  };

  // Initialize with bullet if empty and focused
  const handleFocus = () => {
    if (!notes) {
      updateNotes('• ');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxChars) {
      updateNotes(value);
    }
  };

  return (
    <motion.div
      layout
      initial={false}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      onClick={!isExpanded ? onExpand : undefined}
      className={`bg-white rounded-2xl p-6 shadow-[0px_2px_8px_rgba(0,124,195,0.08)] hover:shadow-[0px_4px_16px_rgba(0,124,195,0.12)] transition-shadow duration-300 min-h-[280px] ${
        !isExpanded ? 'cursor-pointer' : ''
      }`}
      style={{
        gridColumn: 'span 1',
        gridRow: 'span 1',
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <PencilLine 
            className="w-6 h-6" 
            style={{ 
              color: 'var(--dashboard-primary-blue)',
              opacity: 0.7,
              strokeWidth: 2 
            }} 
          />
          <h3 className="text-xl font-semibold" style={{ color: 'var(--dashboard-text-primary)' }}>
            Notes
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
            className="relative"
          >
            <textarea
              ref={textareaRef}
              value={notes}
              onChange={handleChange}
              placeholder="Write your thoughts here..."
              className="w-full min-h-[200px] resize-none border-none outline-none focus:ring-2 focus:ring-[var(--dashboard-primary-blue)] rounded-lg p-3 transition-all"
              style={{
                color: 'var(--dashboard-text-primary)',
                backgroundColor: '#FAFAFA',
              }}
              maxLength={maxChars}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
            />
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                {saving ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-1"
                  >
                    <Cloud className="w-4 h-4" style={{ color: 'var(--dashboard-primary-blue)' }} />
                    <span className="text-xs" style={{ color: 'var(--dashboard-text-secondary)' }}>
                      Saving...
                    </span>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-1"
                  >
                    <Cloud className="w-4 h-4" style={{ color: 'var(--dashboard-success)' }} />
                    <span className="text-xs" style={{ color: 'var(--dashboard-text-secondary)' }}>
                      Saved
                    </span>
                  </motion.div>
                )}
              </div>
              <span className="text-sm" style={{ color: 'var(--dashboard-text-secondary)' }}>
                {notes.length}/{maxChars}
              </span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-base whitespace-pre-line"
            style={{ color: 'var(--dashboard-text-secondary)' }}
          >
            {notes || '• Click to add notes...'}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}