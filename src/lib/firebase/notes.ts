import {
    doc,
    getDoc,
    onSnapshot,
    serverTimestamp,
    setDoc
} from 'firebase/firestore';
import { db } from './config';

export interface Notes {
  content: string;
  updatedAt: Date;
}

// Get notes document reference for a user
const getNotesRef = (userId: string) => doc(db, 'users', userId, 'data', 'notes');

// Get user's notes
export async function getNotes(userId: string): Promise<Notes | null> {
  const notesRef = getNotesRef(userId);
  const docSnap = await getDoc(notesRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      content: data.content || '',
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  }

  return null;
}

// Update notes (auto-save)
export async function updateNotes(userId: string, content: string): Promise<void> {
  const notesRef = getNotesRef(userId);
  
  // Use setDoc with merge to create if doesn't exist
  await setDoc(
    notesRef,
    {
      content,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

// Subscribe to notes for real-time updates
export function subscribeToNotes(
  userId: string,
  callback: (notes: Notes | null) => void
): () => void {
  const notesRef = getNotesRef(userId);

  return onSnapshot(notesRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      callback({
        content: data.content || '',
        updatedAt: data.updatedAt?.toDate() || new Date(),
      });
    } else {
      callback(null);
    }
  });
}
