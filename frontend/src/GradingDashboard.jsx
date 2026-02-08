import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { User, CheckCircle, XCircle, Save, Award, Search, ArrowRight } from 'lucide-react';
import Modal from './Modal'; // <-- Import Custom Modal

// CHANGE THIS TO YOUR RENDER URL
const API_URL = 'https://exam-system-api-fmyy.onrender.com';

const GradingDashboard = () => {
    const { examId } = useParams();
    const [submissions, setSubmissions] = useState([]);
    const [examData, setExamData] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [marks, setMarks] = useState({});
    
    // Modal State
    const [modal, setModal] = useState({ isOpen: false, type: '', title: '', message: '' });

    useEffect(() => {
        axios.get(`${API_URL}/api/exam/${examId}`).then(res => setExamData(res.data));
        axios.get(`${API_URL}/api/submissions/${examId}`).then(res => setSubmissions(res.data));
    }, [examId]);

    const openStudent = (sub) => {
        setSelectedStudent(sub);
        const initialMarks = {};
        examData.questions.forEach((q, i) => { initialMarks[i] = sub.marks?.[i] || 0; });
        setMarks(initialMarks);
    };

    const submitGrade = async () => {
        const totalScore = Object.values(marks).reduce((a, b) => a + Number(b), 0);
        
        try {
            await axios.post(`${API_URL}/api/grade/${selectedStudent.id}`, {
                examId, marks, totalScore
            });
            
            // Show Success Modal
            setModal({
                isOpen: true,
                type: 'success',
                title: 'Result Released! 📢',
                message: `${selectedStudent.studentName} has scored ${totalScore} marks. They can now check their result.`
            });

        } catch (error) {
            setModal({ isOpen: true, type: 'error', title: 'Error', message: 'Failed to save grade.' });
        }
    };

    const handleModalClose = () => {
        setModal({ ...modal, isOpen: false });
        if (modal.type === 'success') window.location.reload();
    };

    if (!examData) return <div style={{color:'white', padding: 20}}>Loading...</div>;

    return (
        <div style={styles.container}>
            <Modal isOpen={modal.isOpen} type={modal.type} title={modal.title} message={modal.message} onClose={handleModalClose} />

            {/* LEFT SIDEBAR: LIST OF STUDENTS */}
            <div style={styles.sidebar}>
                <div style={styles.sidebarHeader}>
                    <h2 style={{margin: 0, color: 'white', display:'flex', alignItems:'center', gap:10}}>
                        <Award color="#00f3ff" /> Submissions
                    </h2>
                    <p style={{color:'#666', fontSize:'0.9rem', marginTop: 5}}>{submissions.length} Students Submitted</p>
                </div>
                
                <div style={styles.studentList}>
                    {submissions.length === 0 && <p style={{color:'#666', padding: 20}}>No submissions yet.</p>}
                    {submissions.map((sub, index) => (
                        <div 
                            key={sub.id} 
                            onClick={() => openStudent(sub)} 
                            style={{
                                ...styles.studentCard, 
                                borderLeft: sub.isGraded ? '4px solid #00ff88' : '4px solid #ff4444',
                                background: selectedStudent?.id === sub.id ? 'rgba(0, 243, 255, 0.1)' : 'rgba(255,255,255,0.03)',
                                animationDelay: `${index * 0.1}s`
                            }}
                            className="student-card"
                        >
                            <div style={{fontWeight: 'bold', color: 'white'}}>{sub.studentName}</div>
                            <div style={{fontSize: '0.8rem', color: '#888'}}>Reg: {sub.regNumber}</div>
                            {sub.isGraded ? (
                                <div style={styles.scoreBadge}><CheckCircle size={12}/> Score: {sub.score}</div>
                            ) : (
                                <div style={styles.pendingBadge}>Pending</div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* RIGHT MAIN PANEL: GRADING */}
            <div style={styles.mainPanel}>
                {!selectedStudent ? (
                    <div style={styles.emptyState}>
                        <ArrowRight size={40} color="#333" />
                        <p>Select a student from the sidebar to start grading.</p>
                    </div>
                ) : (
                    <div style={{animation: 'fadeIn 0.5s ease-out'}}>
                        <div style={styles.gradingHeader}>
                            <h1 style={{margin:0}}>Grading: <span style={{color: '#bc13fe'}}>{selectedStudent.studentName}</span></h1>
                            <div style={{background:'#111', padding:'5px 15px', borderRadius:'20px', border:'1px solid #333', color:'#888'}}>
                                Reg: {selectedStudent.regNumber}
                            </div>
                        </div>

                        {examData.questions.map((q, index) => (
                            <div key={index} style={{...styles.questionBox, animationDelay: `${index * 0.1}s`}}>
                                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                                    <h3 style={{margin:0, color:'#ddd', maxWidth:'80%'}}>
                                        <span style={{color:'#00f3ff'}}>Q{index+1}:</span> {q.text} 
                                        <span style={{fontSize:'0.8rem', color:'#666', marginLeft: 10}}>({q.maxMarks} Marks)</span>
                                    </h3>
                                    <input 
                                        type="number" 
                                        style={styles.markInput} 
                                        value={marks[index]} 
                                        onChange={(e) => setMarks({...marks, [index]: e.target.value})} 
                                        max={q.maxMarks} 
                                    />
                                </div>

                                <div style={styles.answerBox}>
                                    <span style={{color: '#888', fontSize: '0.8rem', textTransform:'uppercase', letterSpacing:1}}>Student Answer:</span>
                                    <p style={{marginTop: 10, color: '#fff', fontSize:'1.1rem'}}>
                                        {selectedStudent.answers[index] || <span style={{color:'#ff4444', fontStyle:'italic'}}>No Answer Provided</span>}
                                    </p>
                                </div>

                                {q.type === 'MCQ' && (
                                    <div style={{fontSize: '0.9rem', color: '#00f3ff', marginTop: 10, background:'rgba(0, 243, 255, 0.05)', padding: '5px 10px', borderRadius: 5, display:'inline-block'}}>
                                        Correct Options: {q.options}
                                    </div>
                                )}
                            </div>
                        ))}

                        <div style={styles.footer}>
                            <button onClick={submitGrade} style={styles.gradeButton}>
                                <Save size={18} /> Release Result & Score
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
            {/* INJECT ANIMATIONS */}
            <style>{`
                @keyframes slideIn { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .student-card:hover { transform: translateX(5px); background: rgba(255,255,255,0.08) !important; }
            `}</style>
        </div>
    );
};

const styles = {
    container: { display: 'flex', height: '100vh', background: '#050505', color: 'white', fontFamily: "'Space Grotesk', sans-serif", overflow: 'hidden' },
    
    // Sidebar
    sidebar: { width: '320px', background: '#0a0a0a', borderRight: '1px solid #222', display: 'flex', flexDirection: 'column' },
    sidebarHeader: { padding: '30px', borderBottom: '1px solid #222', background: '#0f0f0f' },
    studentList: { flex: 1, overflowY: 'auto', padding: '20px' },
    
    studentCard: { 
        padding: '20px', 
        marginBottom: '10px', 
        borderRadius: '12px', 
        cursor: 'pointer', 
        transition: 'all 0.2s',
        animation: 'slideIn 0.5s ease-out forwards',
        opacity: 0,
        position: 'relative'
    },
    scoreBadge: { color: '#00ff88', fontSize: '0.8rem', marginTop: 5, display: 'flex', alignItems: 'center', gap: 5 },
    pendingBadge: { color: '#ff4444', fontSize: '0.8rem', marginTop: 5, fontStyle: 'italic' },

    // Main Panel
    mainPanel: { flex: 1, padding: '50px', overflowY: 'auto', background: 'radial-gradient(circle at top right, #1a0b2e 0%, #050505 40%)' },
    emptyState: { height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#444', gap: 20 },
    
    gradingHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '1px solid #222', paddingBottom: '20px' },
    
    questionBox: { 
        background: 'rgba(20, 20, 20, 0.6)', 
        backdropFilter: 'blur(10px)',
        border: '1px solid #333', 
        padding: '30px', 
        marginBottom: '25px', 
        borderRadius: '16px',
        animation: 'fadeIn 0.5s ease-out forwards',
        opacity: 0,
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
    },
    answerBox: { background: 'rgba(0,0,0,0.3)', padding: '20px', marginTop: '15px', borderRadius: '12px', borderLeft: '3px solid #bc13fe' },
    markInput: { 
        background: '#000', 
        border: '1px solid #00f3ff', 
        color: '#00f3ff', 
        padding: '10px', 
        width: '70px', 
        textAlign: 'center', 
        fontSize: '1.5rem', 
        fontWeight: 'bold', 
        borderRadius: '8px',
        outline: 'none'
    },
    
    footer: { marginTop: '40px', paddingBottom: '50px' },
    gradeButton: { 
        padding: '18px 40px', 
        background: 'linear-gradient(90deg, #00f3ff, #bc13fe)', 
        color: 'white', 
        border: 'none', 
        borderRadius: '12px', 
        cursor: 'pointer', 
        fontWeight: 'bold', 
        fontSize: '1.1rem', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '10px', 
        boxShadow: '0 0 20px rgba(188, 19, 254, 0.4)',
        transition: 'transform 0.2s',
        float: 'right'
    }
};

export default GradingDashboard;