import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TeacherDashboard from './TeacherDashboard';
import ExamPage from './ExamPage';
import GradingDashboard from './GradingDashboard';
import Login from './Login';   // <-- New Import
import Signup from './Signup'; // <-- New Import

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- Authentication Routes --- */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* --- Protected Route (Teacher Dashboard) --- */}
        {/* The Dashboard component checks if you are logged in. */}
        {/* If not, it redirects you to /login automatically. */}
        <Route path="/" element={<TeacherDashboard />} />

        {/* --- Student Routes (Public) --- */}
        <Route path="/exam/:examId" element={<ExamPage />} />

        {/* --- Grading Routes (Teacher) --- */}
        <Route path="/grade/:examId" element={<GradingDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;