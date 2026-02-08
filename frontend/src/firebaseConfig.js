import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // <--- NEW IMPORT

const firebaseConfig = {
  // PASTE YOUR KEYS HERE (Keep them the same as before)
  apiKey: "AIzaSyC0xSaCcvbqXplwTs6vCFfuGJOBKxTPH_c",
  authDomain: "examsystem-166ac.firebaseapp.com",
  projectId: "examsystem-166ac",
  storageBucket: "examsystem-166ac.firebasestorage.app",
  messagingSenderId: "983871020375",
  appId: "1:983871020375:web:5b18b0ace5e5d8486cf212"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); // <--- Export the Database