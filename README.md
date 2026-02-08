# 🎓 Premium Exam System

A modern Online Examination Platform built with React, Node.js, and Firebase.
Designed with a premium glassmorphism UI, smooth animations, and secure exam workflows.

License: MIT
Frontend: React + Vite
Backend: Node + Express
Database: Firebase Firestore

--------------------------------------------------

FEATURES

Teachers:
- Secure login with Firebase Authentication
- Create exams (MCQ + text questions)
- Add custom subjects and marks
- Grade student submissions
- Manage profile details

Students:
- No login required (Exam ID access)
- Real-time submission status
- Animated exam interface
- Detailed scorecard with breakdown

System:
- Responsive UI (desktop + mobile)
- Glassmorphism design with animations
- Keep-alive backend for free hosting

--------------------------------------------------

TECH STACK

Frontend: React, Vite, React Router, Axios, Lucide Icons
Backend: Node.js, Express.js
Database/Auth: Firebase Firestore & Firebase Auth
Hosting: Render, Netlify, Vercel

--------------------------------------------------

INSTALLATION

1) Clone Repository

git clone https://github.com/yourusername/exam-system.git
cd exam-system

2) Backend Setup

cd backend
npm install
node server.js

Server runs on port 8000 by default.

3) Frontend Setup

cd frontend
npm install
npm run dev

--------------------------------------------------

FIREBASE CONFIG

Create file: frontend/src/firebaseConfig.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

--------------------------------------------------

PROJECT STRUCTURE

exam-system/
  backend/
    server.js
  frontend/
    src/
      App.jsx
      ExamPage.jsx
      TeacherDashboard.jsx
      GradingDashboard.jsx

--------------------------------------------------

LICENSE

MIT License

--------------------------------------------------

Made with ❤️ by Priyansu Dash
