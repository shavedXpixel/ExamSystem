import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TeacherDashboard from './TeacherDashboard';
import ExamPage from './ExamPage';
import GradingDashboard from './GradingDashboard';
import Login from './Login';
import Signup from './Signup';
import About from './About';
import ProfilePage from './ProfilePage';
import HistoryPage from './HistoryPage'; // <-- IMPORT THIS

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/about" element={<About />} />
        
        {/* Protected Routes */}
        <Route path="/" element={<TeacherDashboard />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/history" element={<HistoryPage />} /> {/* <-- NEW ROUTE */}

        {/* Exam Routes */}
        <Route path="/exam/:examId" element={<ExamPage />} />
        <Route path="/grade/:examId" element={<GradingDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;