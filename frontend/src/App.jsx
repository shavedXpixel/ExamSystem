import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TeacherDashboard from './TeacherDashboard';
import ExamPage from './ExamPage';
import GradingDashboard from './GradingDashboard';
import Login from './Login';
import Signup from './Signup';
import About from './About'; // <-- New Import

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- Authentication Routes --- */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/about" element={<About />} /> {/* <-- The New Premium About Page */}

        {/* --- Protected Route (Teacher Dashboard) --- */}
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