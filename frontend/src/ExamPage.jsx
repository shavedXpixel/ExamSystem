import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, Clock, AlertCircle, Loader2, Send, BookOpen, GraduationCap, XCircle, MinusCircle, Download } from 'lucide-react';
import Modal from './Modal';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// CHANGE THIS TO YOUR RENDER URL
const API_URL = 'https://exam-system-dfnl.vercel.app/'; 

const ExamPage = () => {
    const { examId } = useParams();
    const [step, setStep] = useState('LOADING'); 
    const [examData, setExamData] = useState(null);
    const [studentDetails, setStudentDetails] = useState({ name: '', regNumber: '' });
    
    // Exam State
    const [answers, setAnswers] = useState({});
    
    // Result State
    const [resultData, setResultData] = useState(null);

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
                if (res.data.graded) { 
                    setResultData(res.data); 
                    setStep('RESULT'); 
                } 
                else { setStep('WAITING'); }
            } else { setStep('EXAM'); }
        } catch (err) { console.error(err); setStep('LOGIN'); }
    };

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

    // --- PDF DOWNLOAD FUNCTION ---
    const downloadPDF = () => {
        const input = document.getElementById('report-card'); // Select the result card
        
        // Use html2canvas to take a screenshot
        html2canvas(input, { scale: 2, backgroundColor: '#141414' }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${studentDetails.name}_Report.pdf`);
        });
    };

    // Helper to determine card color based on marks
    const getResultColor = (obtained, max) => {
        if (obtained == max) return 'rgba(0, 255, 136, 0.1)'; 
        if (obtained == 0) return 'rgba(255, 68, 68, 0.1)';   
        return 'rgba(255, 187, 0, 0.1)';                      
    };

    const getResultIcon = (obtained, max) => {
        if (obtained == max) return <CheckCircle color="#00ff88" />;
        if (obtained == 0) return <XCircle color="#ff4444" />;
        return <MinusCircle color="#ffbb00" />;
    };

    if (step === 'LOADING' || step === 'CHECKING') return <LoadingScreen text={step === 'CHECKING' ? "Verifying..." : "Loading Exam..."} />;
    if (step === 'ERROR') return <ErrorScreen />;

    return (
        <div style={styles.pageWrapper}>
            <Modal isOpen={modal.isOpen} type={modal.type} title={modal.title} message={modal.message} onClose={() => setModal({...modal, isOpen: false})} onConfirm={modal.onConfirm} />

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
                        <h2 style={{margin: 0, color: 'white', display:'flex', alignItems:'center', gap:10}}><GraduationCap /> {examData.title}</h2>
                        <div style={styles.badge}>{studentDetails.name}</div>
                    </header>
                    {examData.questions.map((q, index) => (
                        <div key={index} style={{...styles.questionCard, animationDelay: `${index * 0.1}s`}}>
                            <h3 style={styles.questionText}><span style={styles.qNumber}>Q{index + 1}</span> {q.text} <span style={styles.marksBadge}>({q.maxMarks} Marks)</span></h3>
                            {q.type === 'MCQ' ? (
                                <div style={styles.optionsGrid}>
                                    {q.options.split(',').map((opt, i) => (
                                        <label key={i} style={styles.optionLabel}>
                                            <input type="radio" name={`question-${index}`} value={opt.trim()} onChange={e => setAnswers({...answers, [index]: e.target.value})} style={{accentColor: '#00f3ff', marginRight: '10px'}} />{opt.trim()}
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

            {/* STEP 4: DETAILED RESULT */}
            {step === 'RESULT' && (
                <div style={{width: '100%', maxWidth: '800px', animation: 'fadeIn 0.5s'}}>
                    
                    {/* THIS DIV "report-card" WILL BE PRINTED TO PDF */}
                    <div id="report-card" style={styles.reportCard}>
                        
                        {/* Total Score Card */}
                        <div style={styles.resultHeaderCard}>
                            <div style={styles.scoreCircle}>
                                <h1 style={{fontSize: '3.5rem', margin: 0, color: 'white'}}>{resultData.score}</h1>
                                <span style={{fontSize: '0.9rem', color: '#00f3ff', letterSpacing: 2}}>TOTAL SCORE</span>
                            </div>
                            <div>
                                <h2 style={{color: 'white', margin: 0}}>Performance Report</h2>
                                <p style={{color: '#888', margin: '5px 0 0'}}>Name: {studentDetails.name || "Student"}</p>
                                <p style={{color: '#888', margin: '2px 0 0'}}>ID: {studentDetails.regNumber}</p>
                                <p style={{color: '#888', margin: '2px 0 0'}}>Exam: {examData.title}</p>
                            </div>
                        </div>

                        {/* Question Breakdown */}
                        {examData.questions.map((q, index) => {
                            const obtainedMark = resultData.marks[index] || 0;
                            const bgColor = getResultColor(obtainedMark, q.maxMarks);
                            const icon = getResultIcon(obtainedMark, q.maxMarks);

                            return (
                                <div key={index} style={{...styles.resultCard, background: bgColor}}>
                                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15}}>
                                        <h3 style={{margin: 0, color: 'white', fontSize: '1.1rem', display: 'flex', gap: 10}}>
                                            <span style={{color: '#aaa'}}>Q{index + 1}:</span> {q.text}
                                        </h3>
                                        <div style={styles.markPill}>
                                            {icon} <span>{obtainedMark} / {q.maxMarks}</span>
                                        </div>
                                    </div>
                                    
                                    <div style={{background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '8px'}}>
                                        <span style={{color: '#888', fontSize: '0.8rem', textTransform: 'uppercase'}}>Your Answer:</span>
                                        <p style={{color: 'white', margin: '5px 0 0'}}>
                                            {resultData.answers[index] || <span style={{fontStyle: 'italic', color: '#666'}}>No Answer</span>}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {/* END OF PRINTABLE AREA */}

                    <div style={styles.resultActions}>
                        <button style={styles.downloadButton} onClick={downloadPDF}>
                            <Download size={18} /> Download Report
                        </button>
                        <button style={styles.secondaryButton} onClick={() => window.location.reload()}>
                            Back to Login
                        </button>
                    </div>
                </div>
            )}

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
    glassCard: { background: 'rgba(20, 20, 20, 0.8)', border: '1px solid #333', borderRadius: '24px', padding: '50px', maxWidth: '400px', width: '100%', textAlign: 'center', boxShadow: '0 0 50px rgba(0, 243, 255, 0.1)', animation: 'fadeIn 0.5s ease-out' },
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
    secondaryButton: { marginTop: '10px', background: 'transparent', border: '1px solid #555', color: '#888', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' },
    
    // Result
    reportCard: { background: '#0a0a0a', padding: '20px' }, // Container for PDF capture
    resultHeaderCard: { background: '#141414', padding: '30px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '30px', marginBottom: '30px', border: '1px solid #333' },
    scoreCircle: { width: '120px', height: '120px', borderRadius: '50%', border: '4px solid #00f3ff', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'rgba(0, 243, 255, 0.05)' },
    resultCard: { border: '1px solid #333', borderRadius: '16px', padding: '25px', marginBottom: '15px', animation: 'slideUp 0.5s ease-out forwards', opacity: 0 },
    markPill: { background: '#000', padding: '5px 15px', borderRadius: '20px', border: '1px solid #333', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold', color: 'white' },
    
    resultActions: { display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' },
    downloadButton: { width: '100%', padding: '15px', background: '#00f3ff', color: 'black', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: '10px' }
};

const LoadingScreen = ({ text }) => <div style={{height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#0a0a0a', color: 'white'}}><Loader2 size={50} className="spin" color="#00f3ff" style={{marginBottom: 20}}/><p style={{letterSpacing: 2}}>{text}</p></div>;
const ErrorScreen = () => <div style={{height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#0a0a0a', color: '#ff4444'}}><AlertCircle size={50} style={{marginBottom: 20}}/><p>Exam Not Found</p></div>;

export default ExamPage;