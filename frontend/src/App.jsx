import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ExamPage from './ExamPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route for taking the exam */}
        <Route path="/exam/:examId" element={<ExamPage />} />

        {/* Default Home Page */}
        <Route path="/" element={
          <div style={{padding: '50px', textAlign: 'center', fontFamily: 'Arial'}}>
            <h1>Exam System Running!</h1>
            <p>To take an exam, you need a link from your teacher.</p>
            <p style={{color: '#666'}}>Example: /exam/YOUR-UUID-HERE</p>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;