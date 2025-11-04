import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
// Replace with your own Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyD9LsAmW1h6vmKQDOwCRRvACXGLIISdGh0",
  authDomain: "expenses-4e1fa.firebaseapp.com",
  projectId: "expenses-4e1fa",
  storageBucket: "expenses-4e1fa.firebasestorage.app",
  messagingSenderId: "30160522861",
  appId: "1:30160522861:web:6c4041fef052c8f1d0f964",
  measurementId: "G-Z9WVRP8KV8"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;

