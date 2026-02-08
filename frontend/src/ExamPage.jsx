import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, Clock, AlertCircle, Loader2, Send, BookOpen, GraduationCap } from 'lucide-react';
import Modal from './Modal'; // <-- Import Custom Modal

// CHANGE THIS TO YOUR RENDER URL
const API_URL = 'https://exam-system-api-fmyy.onrender.com'; 

const ExamPage = () => {
    const { examId } = useParams();
    const [step, setStep] = useState('LOADING'); 
    const [examData, setExamData] = useState(null);
    const [studentDetails, setStudentDetails] = useState({ name: '', regNumber: '' });
    const [answers, setAnswers] = useState({});
    const [result, setResult] = useState(null);

    // Modal State
    const [modal, setModal] = useState({ isOpen: false, type: '', title: '', message: '', onConfirm: null });

    useEffect(() => {
        axios.get(`${API_URL}/api/exam/${examId}`)
            .then(res => { setExamData(res.data); setStep('LOGIN'); })
            .catch(err => { console.error(err); setStep('ERROR'); });
    }, [examId]);

    const checkStudentStatus = async () => {
        if (!studentDetails.regNumber || !studentDetails.name) {
            setModal({ isOpen: true, type: 'error', title: 'Missing Info', message: 'Please enter both your Name and Registration Number.' });
            return;
        }
        setStep('CHECKING');
        try {
            const res = await axios.post(`${API_URL}/api/check/${examId}`, { regNumber: studentDetails.regNumber });
            if (res.data.found) {
                if (res.data.graded) { setResult(res.data.score); setStep('RESULT'); } 
                else { setStep('WAITING'); }
            } else { setStep('EXAM'); }
        } catch (err) { console.error(err); setStep('LOGIN'); }
    };

    // --- SUBMIT LOGIC ---
    const handleSubmitClick = () => {
        setModal({
            isOpen: true,
            type: 'confirm',
            title: 'Submit Exam?',
            message: 'Are you sure you want to finish? You cannot undo this action.',
            onConfirm: submitExam 
        });
    };

    const submitExam = async () => {
        setModal({ ...modal, isOpen: false }); 
        try {
            await axios.post(`${API_URL}/api/submit/${examId}`, {
                studentName: studentDetails.name,
                regNumber: studentDetails.regNumber,
                answers: answers
            });
            setStep('WAITING');
        } catch (err) {
            setModal({ isOpen: true, type: 'error', title: 'Submission Failed', message: 'Something went wrong. Please try again.' });
        }
    };

    if (step === 'LOADING' || step === 'CHECKING') return <LoadingScreen text={step === 'CHECKING' ? "Verifying..." : "Loading Exam..."} />;
    if (step === 'ERROR') return <ErrorScreen />;

    return (
        <div style={styles.pageWrapper}>
            <Modal 
                isOpen={modal.isOpen} 
                type={modal.type} 
                title={modal.title} 
                message={modal.message} 
                onClose={() => setModal({...modal, isOpen: false})} 
                onConfirm={modal.onConfirm}
            />

            {/* STEP 1: LOGIN */}
            {step === 'LOGIN' && (
                <div style={styles.glassCard}>
                    <div style={styles.iconGlow}><BookOpen size={40} color="#00f3ff" /></div>
                    <h1 style={styles.title}>{examData?.title}</h1>
                    <p style={styles.subtitle}>Secure Examination Portal</p>
                    
                    <div style={{animation: 'slideUp 0.5s ease'}}>
                        <input style={styles.input} placeholder="Full Name" value={studentDetails.name} onChange={e => setStudentDetails({...studentDetails, name: e.target.value})} />
                        <input style={styles.input} placeholder="Registration Number (e.g., 101)" value={studentDetails.regNumber} onChange={e => setStudentDetails({...studentDetails, regNumber: e.target.value})} />
                        <button style={styles.primaryButton} onClick={checkStudentStatus}>Enter Exam Hall</button>
                    </div>
                </div>
            )}

            {/* STEP 2: EXAM */}
            {step === 'EXAM' && (
                <div style={styles.examContainer}>
                    <header style={styles.examHeader}>
                        <h2 style={{margin: 0, color: 'white', display:'flex', alignItems:'center', gap:10}}>
                             <GraduationCap /> {examData.title}
                        </h2>
                        <div style={styles.badge}>{studentDetails.name}</div>
                    </header>
                    
                    {examData.questions.map((q, index) => (
                        <div key={index} style={{...styles.questionCard, animationDelay: `${index * 0.1}s`}}>
                            <h3 style={styles.questionText}>
                                <span style={styles.qNumber}>Q{index + 1}</span> {q.text} <span style={styles.marksBadge}>({q.maxMarks} Marks)</span>
                            </h3>
                            {q.type === 'MCQ' ? (
                                <div style={styles.optionsGrid}>
                                    {q.options.split(',').map((opt, i) => (
                                        <label key={i} style={styles.optionLabel}>
                                            <input type="radio" name={`question-${index}`} value={opt.trim()} onChange={e => setAnswers({...answers, [index]: e.target.value})} style={{accentColor: '#00f3ff', marginRight: '10px'}} />
                                            {opt.trim()}
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <textarea style={styles.textArea} placeholder="Type your answer here..." rows={4} onChange={e => setAnswers({...answers, [index]: e.target.value})} />
                            )}
                        </div>
                    ))}
                    <button style={styles.submitButton} onClick={handleSubmitClick}>Submit Final Answers <Send size={18} /></button>
                </div>
            )}

            {/* STEP 3: WAITING */}
            {step === 'WAITING' && (
                <div style={styles.glassCard}>
                    <div style={{animation: 'pulse 2s infinite'}}><Clock size={60} color="#bc13fe" style={{marginBottom: 20}} /></div>
                    <h2 style={styles.title}>Submission Received</h2>
                    <p style={styles.subtitle}>Your answers are with the instructor.</p>
                    <button style={styles.secondaryButton} onClick={() => window.location.reload()}>Check Status Again</button>
                </div>
            )}

            {/* STEP 4: RESULT */}
            {step === 'RESULT' && (
                <div style={styles.glassCard}>
                    <div style={styles.scoreCircle}>
                        <h1 style={{fontSize: '3rem', margin: 0, color: 'white', animation: 'fadeIn 1s'}}>{result}</h1>
                        <span style={{fontSize: '0.9rem', color: '#00f3ff'}}>SCORE</span>
                    </div>
                    <h2 style={{...styles.title, color: '#00ff88'}}>Grading Complete</h2>
                </div>
            )}
            
            {/* INJECT ANIMATIONS */}
            <style>{`
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.8; } 100% { transform: scale(1); opacity: 1; } }
            `}</style>
        </div>
    );
};

// --- STYLES ---
const styles = {
    pageWrapper: { minHeight: '100vh', background: '#0a0a0a', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', fontFamily: "'Space Grotesk', sans-serif" },
    
    // Cards
    glassCard: { 
        background: 'rgba(20, 20, 20, 0.8)', 
        border: '1px solid #333', 
        borderRadius: '24px', 
        padding: '50px', 
        maxWidth: '400px', 
        width: '100%', 
        textAlign: 'center',
        boxShadow: '0 0 50px rgba(0, 243, 255, 0.1)',
        animation: 'fadeIn 0.5s ease-out'
    },
    iconGlow: { marginBottom: 20, filter: 'drop-shadow(0 0 10px #00f3ff)' },
    
    title: { color: 'white', marginBottom: '10px', fontSize: '1.5rem', fontWeight: 'bold' },
    subtitle: { color: '#888', marginBottom: '30px' },
    
    input: { width: '100%', padding: '15px', marginBottom: '15px', background: '#111', border: '1px solid #333', borderRadius: '12px', color: 'white', boxSizing: 'border-box', transition: 'border 0.3s', outline: 'none' },
    textArea: { width: '100%', padding: '15px', background: '#111', border: '1px solid #333', borderRadius: '12px', color: 'white', resize: 'vertical', minHeight: '100px', boxSizing: 'border-box', outline: 'none' },
    
    primaryButton: { width: '100%', padding: '15px', background: 'linear-gradient(90deg, #00f3ff, #bc13fe)', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.1rem', transition: 'transform 0.2s', marginTop: '10px' },
    
    // Exam
    examContainer: { maxWidth: '800px', width: '100%', animation: 'fadeIn 0.5s ease-out' },
    examHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', padding: '20px', background: '#141414', borderRadius: '16px', border: '1px solid #333' },
    badge: { background: 'rgba(188, 19, 254, 0.1)', color: '#bc13fe', padding: '5px 15px', borderRadius: '20px', border: '1px solid #bc13fe' },
    
    questionCard: { background: '#141414', border: '1px solid #333', borderRadius: '16px', padding: '30px', marginBottom: '20px', animation: 'slideUp 0.6s ease-out forwards', opacity: 0 },
    questionText: { color: 'white', display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '20px', fontSize: '1.1rem' },
    qNumber: { color: '#00f3ff', fontWeight: 'bold' },
    marksBadge: { fontSize: '0.8rem', color: '#666', marginLeft: 'auto', background: '#222', padding: '2px 8px', borderRadius: '5px' },
    
    optionsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
    optionLabel: { background: '#222', padding: '15px', borderRadius: '10px', color: 'white', cursor: 'pointer', border: '1px solid #333', display: 'flex', alignItems: 'center', transition: 'background 0.2s' },
    
    submitButton: { width: '100%', padding: '18px', background: '#00ff88', color: 'black', border: 'none', borderRadius: '16px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: '10px', fontSize: '1.1rem', marginTop: '20px', transition: 'transform 0.2s' },
    secondaryButton: { marginTop: '20px', background: 'transparent', border: '1px solid #555', color: '#888', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' },
    
    scoreCircle: { width: '150px', height: '150px', borderRadius: '50%', border: '4px solid #00f3ff', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', margin: '0 auto 30px', boxShadow: '0 0 30px rgba(0, 243, 255, 0.2)' }
};

const LoadingScreen = ({ text }) => <div style={{height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#0a0a0a', color: 'white'}}><Loader2 size={50} className="spin" color="#00f3ff" style={{marginBottom: 20}}/><p style={{letterSpacing: 2}}>{text}</p></div>;
const ErrorScreen = () => <div style={{height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#0a0a0a', color: '#ff4444'}}><AlertCircle size={50} style={{marginBottom: 20}}/><p>Exam Not Found</p></div>;

export default ExamPage;