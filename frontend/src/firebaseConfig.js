// frontend/src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  // PASTE YOUR KEYS HERE FROM FIREBASE CONSOLE
  apiKey: "AIzaSyC0xSaCcvbqXplwTs6vCFfuGJOBKxTPH_c",
  authDomain: "examsystem-166ac.firebaseapp.com",
  projectId: "examsystem-166ac",
  storageBucket: "examsystem-166ac.firebasestorage.app",
  messagingSenderId: "983871020375",
  appId: "1:983871020375:web:5b18b0ace5e5d8486cf212"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);