import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
    updateNotes as firebaseUpdateNotes,
    type Notes,
    SINGLE_USER_ID,
    subscribeToNotes,
} from '../../lib/firebase';

interface NotesContextType {
  notes: string;
  loading: boolean;
  saving: boolean;
  updateNotes: (content: string) => void;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);
  const lastLocalUpdateRef = useRef<number>(0);

  // Subscribe to notes - but only update if user isn't actively typing
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToNotes(SINGLE_USER_ID, (notesData: Notes | null) => {
      // Don't overwrite local state if user is actively typing (within last 2 seconds)
      const timeSinceLastUpdate = Date.now() - lastLocalUpdateRef.current;
      if (isTypingRef.current || timeSinceLastUpdate < 2000) {
        setLoading(false);
        return;
      }
      
      if (notesData) {
        setNotes(notesData.content);
      } else {
        setNotes('');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Debounced save function
  const updateNotes = useCallback(
    (content: string) => {
      // Mark as typing
      isTypingRef.current = true;
      lastLocalUpdateRef.current = Date.now();
      
      // Update local state immediately
      setNotes(content);

      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Set new timeout for auto-save (1 second debounce for smoother typing)
      saveTimeoutRef.current = setTimeout(async () => {
        setSaving(true);
        try {
          await firebaseUpdateNotes(SINGLE_USER_ID, content);
        } catch (error) {
          console.error('Error saving notes:', error);
        } finally {
          setSaving(false);
          // Allow remote updates after save completes + small buffer
          setTimeout(() => {
            isTypingRef.current = false;
          }, 500);
        }
      }, 1000);
    },
    []
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <NotesContext.Provider
      value={{
        notes,
        loading,
        saving,
        updateNotes,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
}
