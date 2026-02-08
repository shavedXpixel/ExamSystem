import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { User, CheckCircle, XCircle, Save } from 'lucide-react';

const API_URL = 'https://exam-system-api-fmyy.onrender.com'; 
// (Make sure there is NO slash at the end!)

const GradingDashboard = () => {
    const { examId } = useParams(); // Get Exam ID from URL
    const [submissions, setSubmissions] = useState([]);
    const [examData, setExamData] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [marks, setMarks] = useState({}); // Stores marks for the selected student

    // 1. Load Exam & Submissions
    useEffect(() => {
        // Fetch Exam Questions
        axios.get(`${API_URL}/api/exam/${examId}`).then(res => setExamData(res.data));

        // Fetch Student Submissions (We need to add this route to backend!)
        axios.get(`${API_URL}/api/submissions/${examId}`).then(res => setSubmissions(res.data));
    }, [examId]);

    // 2. Select a Student to Grade
    const openStudent = (sub) => {
        setSelectedStudent(sub);
        // Pre-fill marks if already graded, otherwise 0
        const initialMarks = {};
        examData.questions.forEach((q, i) => {
            initialMarks[i] = sub.marks?.[i] || 0;
        });
        setMarks(initialMarks);
    };

    // 3. Save Grades
    const submitGrade = async () => {
        const totalScore = Object.values(marks).reduce((a, b) => a + Number(b), 0);
        
        await axios.post(`${API_URL}/api/grade/${selectedStudent.id}`, {
            examId,
            marks,
            totalScore
        });
        
        alert(`Graded! Total Score: ${totalScore}`);
        window.location.reload(); // Refresh to show "Graded" status
    };

    if (!examData) return <div style={{color:'white', padding: 20}}>Loading...</div>;

    return (
        <div style={styles.container}>
            {/* LEFT SIDE: LIST OF STUDENTS */}
            <div style={styles.sidebar}>
                <h2 style={{color: '#00f3ff'}}>Submissions</h2>
                {submissions.length === 0 && <p style={{color:'#666'}}>No submissions yet.</p>}
                
                {submissions.map(sub => (
                    <div 
                        key={sub.id} 
                        onClick={() => openStudent(sub)}
                        style={{
                            ...styles.studentCard, 
                            borderLeft: sub.isGraded ? '4px solid #00ff88' : '4px solid #ff4444',
                            background: selectedStudent?.id === sub.id ? '#333' : '#1a1a1a'
                        }}
                    >
                        <div style={{fontWeight: 'bold'}}>{sub.studentName}</div>
                        <div style={{fontSize: '0.8rem', color: '#888'}}>Reg: {sub.regNumber}</div>
                        {sub.isGraded && <div style={{color: '#00ff88', fontSize: '0.8rem'}}>Score: {sub.score}</div>}
                    </div>
                ))}
            </div>

            {/* RIGHT SIDE: GRADING PANEL */}
            <div style={styles.mainPanel}>
                {!selectedStudent ? (
                    <div style={{textAlign:'center', marginTop: 100, color: '#666'}}>
                        Select a student to start grading
                    </div>
                ) : (
                    <div>
                        <h1 style={{borderBottom: '1px solid #333', paddingBottom: 10}}>
                            Grading: <span style={{color: '#bc13fe'}}>{selectedStudent.studentName}</span>
                        </h1>

                        {examData.questions.map((q, index) => (
                            <div key={index} style={styles.questionBox}>
                                <div style={{display:'flex', justifyContent:'space-between'}}>
                                    <h3 style={{margin:0}}>Q{index+1}: {q.text} <span style={{fontSize:'0.8rem', color:'#666'}}>({q.maxMarks} Marks)</span></h3>
                                    <input 
                                        type="number" 
                                        style={styles.markInput}
                                        value={marks[index]}
                                        onChange={(e) => setMarks({...marks, [index]: e.target.value})}
                                        max={q.maxMarks}
                                    />
                                </div>

                                <div style={styles.answerBox}>
                                    <span style={{color: '#888', fontSize: '0.9rem'}}>Student Answer:</span>
                                    <p style={{marginTop: 5, color: '#fff'}}>
                                        {selectedStudent.answers[index] || <span style={{color:'red'}}>No Answer</span>}
                                    </p>
                                </div>
                                
                                {/* Helper for MCQ */}
                                {q.type === 'MCQ' && (
                                    <div style={{fontSize: '0.9rem', color: '#00f3ff'}}>
                                        Options: {q.options}
                                    </div>
                                )}
                            </div>
                        ))}

                        <button onClick={submitGrade} style={styles.gradeButton}>
                            <Save size={18} /> Release Result
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: { display: 'flex', height: '100vh', background: '#0a0a0a', color: 'white', fontFamily: 'sans-serif' },
    sidebar: { width: '300px', borderRight: '1px solid #333', padding: '20px', overflowY: 'auto' },
    mainPanel: { flex: 1, padding: '40px', overflowY: 'auto' },
    studentCard: { padding: '15px', marginBottom: '10px', background: '#1a1a1a', cursor: 'pointer', borderRadius: '5px' },
    questionBox: { background: '#141414', padding: '20px', marginBottom: '20px', borderRadius: '10px', border: '1px solid #333' },
    answerBox: { background: '#222', padding: '15px', marginTop: '10px', borderRadius: '5px', borderLeft: '2px solid #00f3ff' },
    markInput: { background: '#000', border: '1px solid #00f3ff', color: '#00f3ff', padding: '5px', width: '50px', textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold' },
    gradeButton: { padding: '15px 30px', background: '#00f3ff', color: 'black', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px' }
};

export default GradingDashboard;