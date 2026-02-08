import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TeacherDashboard from './TeacherDashboard';
import ExamPage from './ExamPage';
import GradingDashboard from './GradingDashboard'; // <-- Import the new page

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. Teacher creates the exam here */}
        <Route path="/" element={<TeacherDashboard />} />

        {/* 2. Student takes the exam here */}
        <Route path="/exam/:examId" element={<ExamPage />} />

        {/* 3. Teacher grades the exam here */}
        <Route path="/grade/:examId" element={<GradingDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;