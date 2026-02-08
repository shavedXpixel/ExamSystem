import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, Clock, AlertCircle, Loader2, Send, BookOpen } from 'lucide-react';

const API_URL = 'http://localhost:8000'; 

const ExamPage = () => {
    const { examId } = useParams();
    const [step, setStep] = useState('LOADING'); 
    const [examData, setExamData] = useState(null);
    const [studentDetails, setStudentDetails] = useState({ name: '', regNumber: '' });
    const [answers, setAnswers] = useState({});
    const [result, setResult] = useState(null);

    // 1. Fetch Exam Data
    useEffect(() => {
        axios.get(`${API_URL}/api/exam/${examId}`)
            .then(res => {
                setExamData(res.data);
                setStep('LOGIN');
            })
            .catch(err => {
                console.error(err);
                setStep('ERROR');
            });
    }, [examId]);

    // 2. Check Status
    const checkStudentStatus = async () => {
        if (!studentDetails.regNumber || !studentDetails.name) {
            alert("Please fill in all details");
            return;
        }
        setStep('CHECKING');
        
        try {
            const res = await axios.post(`${API_URL}/api/check/${examId}`, {
                regNumber: studentDetails.regNumber
            });
            
            if (res.data.found) {
                if (res.data.graded) {
                    setResult(res.data.score);
                    setStep('RESULT');
                } else {
                    setStep('WAITING');
                }
            } else {
                setStep('EXAM');
            }
        } catch (err) {
            console.error(err);
            setStep('LOGIN'); 
        }
    };

    // 3. Submit Exam
    const submitExam = async () => {
        if (!window.confirm("Submit your exam? You cannot undo this.")) return;
        
        try {
            await axios.post(`${API_URL}/api/submit/${examId}`, {
                studentName: studentDetails.name,
                regNumber: studentDetails.regNumber,
                answers: answers
            });
            setStep('WAITING');
        } catch (err) {
            alert("Submission failed. Try again.");
        }
    };

    // --- RENDERING ---
    if (step === 'LOADING' || step === 'CHECKING') return <LoadingScreen text={step === 'CHECKING' ? "Verifying..." : "Loading Exam..."} />;
    if (step === 'ERROR') return <ErrorScreen />;

    return (
        <div style={styles.pageWrapper}>
            
            {/* STEP 1: LOGIN */}
            {step === 'LOGIN' && (
                <div style={styles.glassCard}>
                    <BookOpen size={40} color="#00f3ff" style={{marginBottom: 20}} />
                    <h1 style={styles.title}>{examData?.title}</h1>
                    <p style={styles.subtitle}>Secure Examination Portal</p>

                    <input 
                        style={styles.input}
                        placeholder="Full Name"
                        value={studentDetails.name}
                        onChange={e => setStudentDetails({...studentDetails, name: e.target.value})}
                    />
                    <input 
                        style={styles.input}
                        placeholder="Registration Number (e.g., 101)"
                        value={studentDetails.regNumber}
                        onChange={e => setStudentDetails({...studentDetails, regNumber: e.target.value})}
                    />
                    
                    <button style={styles.primaryButton} onClick={checkStudentStatus}>
                        Enter Exam Hall
                    </button>
                </div>
            )}

            {/* STEP 2: EXAM */}
            {step === 'EXAM' && (
                <div style={styles.examContainer}>
                    <header style={styles.examHeader}>
                        <h2 style={{margin: 0, color: 'white'}}>{examData.title}</h2>
                        <div style={styles.badge}>{studentDetails.name}</div>
                    </header>

                    {examData.questions.map((q, index) => (
                        <div key={index} style={styles.questionCard}>
                            <h3 style={styles.questionText}>
                                <span style={styles.qNumber}>Q{index + 1}</span> 
                                {q.text} 
                                <span style={styles.marksBadge}>({q.maxMarks} Marks)</span>
                            </h3>

                            {/* CONDITIONAL RENDERING BASED ON TYPE */}
                            {q.type === 'MCQ' ? (
                                <div style={styles.optionsGrid}>
                                    {q.options.split(',').map((opt, i) => (
                                        <label key={i} style={styles.optionLabel}>
                                            <input 
                                                type="radio" 
                                                name={`question-${index}`} 
                                                value={opt.trim()} 
                                                onChange={e => setAnswers({...answers, [index]: e.target.value})}
                                                style={{accentColor: '#00f3ff', marginRight: '10px'}}
                                            />
                                            {opt.trim()}
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <textarea 
                                    style={styles.textArea}
                                    placeholder="Type your answer here..."
                                    rows={4}
                                    onChange={e => setAnswers({...answers, [index]: e.target.value})}
                                />
                            )}
                        </div>
                    ))}

                    <button style={styles.submitButton} onClick={submitExam}>
                        Submit Final Answers <Send size={18} />
                    </button>
                </div>
            )}

            {/* STEP 3: WAITING */}
            {step === 'WAITING' && (
                <div style={styles.glassCard}>
                    <Clock size={60} color="#bc13fe" style={{marginBottom: 20}} />
                    <h2 style={styles.title}>Submission Received</h2>
                    <p style={styles.subtitle}>Your answers are with the instructor.</p>
                    <button style={styles.secondaryButton} onClick={() => window.location.reload()}>
                        Check Status Again
                    </button>
                </div>
            )}

            {/* STEP 4: RESULT */}
            {step === 'RESULT' && (
                <div style={styles.glassCard}>
                    <div style={styles.scoreCircle}>
                        <h1 style={{fontSize: '3rem', margin: 0, color: 'white'}}>{result}</h1>
                        <span style={{fontSize: '0.9rem', color: '#00f3ff'}}>SCORE</span>
                    </div>
                    <h2 style={styles.title}>Grading Complete</h2>
                </div>
            )}

        </div>
    );
};

// --- STYLES ---
const styles = {
    pageWrapper: { minHeight: '100vh', background: '#0a0a0a', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', fontFamily: 'sans-serif' },
    glassCard: { background: '#141414', border: '1px solid #333', borderRadius: '24px', padding: '40px', maxWidth: '400px', width: '100%', textAlign: 'center' },
    title: { color: 'white', marginBottom: '10px' },
    subtitle: { color: '#888', marginBottom: '30px' },
    input: { width: '100%', padding: '15px', marginBottom: '15px', background: '#222', border: '1px solid #444', borderRadius: '12px', color: 'white', boxSizing: 'border-box' },
    textArea: { width: '100%', padding: '15px', background: '#222', border: '1px solid #444', borderRadius: '12px', color: 'white', resize: 'vertical', minHeight: '100px', boxSizing: 'border-box' },
    primaryButton: { width: '100%', padding: '15px', background: '#00f3ff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' },
    examContainer: { maxWidth: '800px', width: '100%' },
    examHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', padding: '20px', background: '#141414', borderRadius: '16px', border: '1px solid #333' },
    badge: { background: 'rgba(0, 243, 255, 0.1)', color: '#00f3ff', padding: '5px 15px', borderRadius: '20px', border: '1px solid #00f3ff' },
    questionCard: { background: '#141414', border: '1px solid #333', borderRadius: '16px', padding: '30px', marginBottom: '20px' },
    questionText: { color: 'white', display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '15px' },
    qNumber: { color: '#00f3ff' },
    marksBadge: { fontSize: '0.8rem', color: '#666', marginLeft: 'auto' },
    optionsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
    optionLabel: { background: '#222', padding: '15px', borderRadius: '8px', color: 'white', cursor: 'pointer', border: '1px solid #333', display: 'flex', alignItems: 'center' },
    submitButton: { width: '100%', padding: '18px', background: 'linear-gradient(90deg, #bc13fe, #7d00ff)', color: 'white', border: 'none', borderRadius: '16px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: '10px' },
    secondaryButton: { marginTop: '20px', background: 'transparent', border: '1px solid #555', color: '#888', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' },
    scoreCircle: { width: '120px', height: '120px', borderRadius: '50%', border: '4px solid #00f3ff', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px' }
};

const LoadingScreen = ({ text }) => <div style={{color: 'white', textAlign: 'center'}}><Loader2 size={40} className="spin" /><p>{text}</p></div>;
const ErrorScreen = () => <div style={{color: 'red', textAlign: 'center'}}><AlertCircle size={40} /><p>Exam Not Found</p></div>;

export default ExamPage;