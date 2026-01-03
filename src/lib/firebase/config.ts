import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration for adri-track
const firebaseConfig = {
  apiKey: "AIzaSyCYTtb8okPtYqjZ6ux1OFgtBdFrS3pG8wE",
  authDomain: "adri-track.firebaseapp.com",
  projectId: "adri-track",
  storageBucket: "adri-track.firebasestorage.app",
  messagingSenderId: "833691593952",
  appId: "1:833691593952:web:9cf6160baa81913bfa3485",
  measurementId: "G-3YKBN7877N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Single user ID (no authentication needed)
export const SINGLE_USER_ID = 'default-user';

export default app;
