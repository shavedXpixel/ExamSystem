import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TeacherDashboard from './TeacherDashboard';
import ExamPage from './ExamPage';
import GradingDashboard from './GradingDashboard';
import Login from './Login';
import Signup from './Signup';
import About from './About';
import ProfilePage from './ProfilePage'; // <-- Import the new Profile Page

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- Authentication Routes --- */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/about" element={<About />} />
        
        {/* --- Protected Teacher Routes --- */}
        <Route path="/" element={<TeacherDashboard />} />
        <Route path="/profile" element={<ProfilePage />} /> {/* <-- New Route for Editing Profile */}

        {/* --- Student Routes (Public) --- */}
        <Route path="/exam/:examId" element={<ExamPage />} />

        {/* --- Grading Routes (Teacher) --- */}
        <Route path="/grade/:examId" element={<GradingDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;