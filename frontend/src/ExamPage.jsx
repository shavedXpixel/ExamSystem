import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Clock, AlertCircle, Loader2, Send, BookOpen } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const ExamPage = () => {
    const { examId } = useParams();
    const [step, setStep] = useState('LOADING_EXAM'); 
    const [examData, setExamData] = useState(null);
    const [studentDetails, setStudentDetails] = useState({ name: '', reg_number: '' });
    const [answers, setAnswers] = useState({});
    const [result, setResult] = useState(null);

    // --- FETCH EXAM DATA ---
    useEffect(() => {
        axios.get(`${API_URL}/api/exam/${examId}/`)
            .then(res => {
                setExamData(res.data);
                setStep('LOGIN');
            })
            .catch(err => {
                console.error(err);
                setStep('ERROR');
            });
    }, [examId]);

    // --- ACTIONS ---
    const checkStudentStatus = async () => {
        if (!studentDetails.reg_number || !studentDetails.name) {
            alert("Please fill in all details");
            return;
        }
        setStep('CHECKING');
        
        // Artificial delay for "premium" feel
        await new Promise(r => setTimeout(r, 800));

        try {
            const res = await axios.post(`${API_URL}/api/check/${examId}/`, {
                reg_number: studentDetails.reg_number
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
            alert("Network Error");
            setStep('LOGIN');
        }
    };

    const submitExam = async () => {
        if (!window.confirm("Submit your exam? You cannot undo this.")) return;
        
        try {
            await axios.post(`${API_URL}/api/submit/${examId}/`, {
                ...studentDetails,
                answers
            });
            setStep('WAITING');
        } catch (err) {
            alert("Submission failed.");
        }
    };

    // --- ANIMATION VARIANTS ---
    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
        exit: { opacity: 0, y: -50, transition: { duration: 0.4 } }
    };

    const questionVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: (i) => ({ 
            opacity: 1, 
            x: 0, 
            transition: { delay: i * 0.1, duration: 0.5 } 
        })
    };

    // --- RENDER HELPERS ---
    if (step === 'LOADING_EXAM' || step === 'CHECKING') return <LoadingScreen text={step === 'CHECKING' ? "Verifying Student..." : "Loading Exam Environment..."} />;
    if (step === 'ERROR') return <ErrorScreen />;

    return (
        <div style={styles.pageWrapper}>
            <AnimatePresence mode="wait">
                
                {/* STEP 1: LOGIN */}
                {step === 'LOGIN' && (
                    <motion.div 
                        key="login"
                        variants={containerVariants}
                        initial="hidden" animate="visible" exit="exit"
                        style={styles.glassCard}
                    >
                        <div style={styles.header}>
                            <BookOpen size={40} color="#00f3ff" />
                            <h1 style={styles.title}>{examData?.title}</h1>
                            <p style={styles.subtitle}>Secure Examination Portal</p>
                        </div>

                        <div style={styles.inputGroup}>
                            <input 
                                style={styles.input}
                                placeholder="Full Name"
                                value={studentDetails.name}
                                onChange={e => setStudentDetails({...studentDetails, name: e.target.value})}
                            />
                            <input 
                                style={styles.input}
                                placeholder="Registration Number"
                                value={studentDetails.reg_number}
                                onChange={e => setStudentDetails({...studentDetails, reg_number: e.target.value})}
                            />
                        </div>

                        <motion.button 
                            whileHover={{ scale: 1.05, boxShadow: "0px 0px 20px rgba(0, 243, 255, 0.4)" }}
                            whileTap={{ scale: 0.95 }}
                            style={styles.primaryButton}
                            onClick={checkStudentStatus}
                        >
                            Enter Exam Hall
                        </motion.button>
                    </motion.div>
                )}

                {/* STEP 2: EXAM */}
                {step === 'EXAM' && (
                    <motion.div 
                        key="exam"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        style={styles.examContainer}
                    >
                        <header style={styles.examHeader}>
                            <h2 style={{margin: 0}}>{examData.title}</h2>
                            <div style={styles.badge}>{studentDetails.reg_number}</div>
                        </header>

                        {examData.questions.map((q, index) => (
                            <motion.div 
                                key={q.id}
                                custom={index}
                                variants={questionVariants}
                                initial="hidden"
                                animate="visible"
                                style={styles.questionCard}
                            >
                                <h3 style={styles.questionText}>
                                    <span style={styles.qNumber}>0{index + 1}</span> 
                                    {q.text}
                                </h3>

                                {q.question_type === 'MCQ' ? (
                                    <div style={styles.optionsGrid}>
                                        {q.options.split(',').map((opt) => {
                                            const isSelected = answers[q.id] === opt.trim();
                                            return (
                                                <motion.div 
                                                    key={opt}
                                                    whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.1)" }}
                                                    onClick={() => setAnswers({...answers, [q.id]: opt.trim()})}
                                                    style={{
                                                        ...styles.optionBox,
                                                        borderColor: isSelected ? '#00f3ff' : 'rgba(255,255,255,0.1)',
                                                        backgroundColor: isSelected ? 'rgba(0, 243, 255, 0.1)' : 'transparent'
                                                    }}
                                                >
                                                    <div style={{
                                                        ...styles.radioCircle,
                                                        background: isSelected ? '#00f3ff' : 'transparent'
                                                    }} />
                                                    {opt.trim()}
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <textarea 
                                        style={styles.textarea}
                                        placeholder="Type your answer..."
                                        onChange={e => setAnswers({...answers, [q.id]: e.target.value})}
                                    />
                                )}
                            </motion.div>
                        ))}

                        <motion.button 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }}
                            whileHover={{ scale: 1.05, boxShadow: "0px 0px 30px rgba(188, 19, 254, 0.5)" }}
                            style={styles.submitButton}
                            onClick={submitExam}
                        >
                            Submit Final Answers <Send size={18} style={{marginLeft: 10}}/>
                        </motion.button>
                    </motion.div>
                )}

                {/* STEP 3: WAITING */}
                {step === 'WAITING' && (
                    <motion.div 
                        key="waiting"
                        variants={containerVariants}
                        initial="hidden" animate="visible"
                        style={styles.glassCard}
                    >
                        <Clock size={60} color="#bc13fe" style={{marginBottom: 20}} />
                        <h2 style={styles.title}>Submission Received</h2>
                        <p style={styles.subtitle}>Your answers are with the instructor.</p>
                        <div style={styles.infoBox}>
                            <p>Status: <strong>Pending Grading</strong></p>
                            <p>ID: {studentDetails.reg_number}</p>
                        </div>
                        <button style={styles.secondaryButton} onClick={() => window.location.reload()}>
                            Check Status Again
                        </button>
                    </motion.div>
                )}

                {/* STEP 4: RESULT */}
                {step === 'RESULT' && (
                    <motion.div 
                        key="result"
                        variants={containerVariants}
                        initial="hidden" animate="visible"
                        style={styles.glassCard}
                    >
                        <motion.div 
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            style={styles.scoreCircle}
                        >
                            <h1 style={{fontSize: '3rem', margin: 0}}>{result}</h1>
                            <span style={{fontSize: '0.9rem', opacity: 0.7}}>SCORE</span>
                        </motion.div>
                        <h2 style={styles.title}>Grading Complete</h2>
                        <p style={styles.subtitle}>Excellent work!</p>
                    </motion.div>
                )}

            </AnimatePresence>
        </div>
    );
};

// --- SUB-COMPONENTS ---
const LoadingScreen = ({ text }) => (
    <div style={styles.centerScreen}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
            <Loader2 size={50} color="#00f3ff" />
        </motion.div>
        <p style={{marginTop: 20, color: '#a1a1aa'}}>{text}</p>
    </div>
);

const ErrorScreen = () => (
    <div style={styles.centerScreen}>
        <AlertCircle size={50} color="#ff4444" />
        <h2 style={{marginTop: 20}}>Exam Not Found</h2>
        <p style={{color: '#a1a1aa'}}>Please check the link provided by your teacher.</p>
    </div>
);

// --- PREMIUM STYLES (JS Objects) ---
const styles = {
    pageWrapper: {
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
    },
    centerScreen: {
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    glassCard: {
        background: 'rgba(20, 20, 25, 0.7)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '24px',
        padding: '50px',
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
    },
    examContainer: {
        maxWidth: '800px',
        width: '100%',
        paddingBottom: '50px',
    },
    examHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '40px',
        padding: '20px',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.05)',
    },
    badge: {
        background: 'rgba(0, 243, 255, 0.1)',
        color: '#00f3ff',
        padding: '5px 15px',
        borderRadius: '20px',
        fontSize: '0.9rem',
        border: '1px solid rgba(0, 243, 255, 0.2)',
    },
    title: {
        fontSize: '2rem',
        margin: '10px 0',
        fontWeight: '700',
        background: 'linear-gradient(90deg, #fff, #a1a1aa)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    subtitle: {
        color: '#a1a1aa',
        marginBottom: '30px',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        marginBottom: '30px',
    },
    input: {
        background: 'rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.1)',
        padding: '15px',
        borderRadius: '12px',
        color: 'white',
        fontSize: '1rem',
        outline: 'none',
        transition: 'all 0.3s',
    },
    primaryButton: {
        background: 'linear-gradient(135deg, #00f3ff 0%, #0066ff 100%)',
        color: 'white',
        border: 'none',
        padding: '15px 40px',
        borderRadius: '30px',
        fontSize: '1.1rem',
        fontWeight: '600',
        cursor: 'pointer',
        width: '100%',
    },
    submitButton: {
        background: 'linear-gradient(135deg, #bc13fe 0%, #7d00ff 100%)',
        color: 'white',
        border: 'none',
        padding: '18px 40px',
        borderRadius: '16px',
        fontSize: '1.2rem',
        fontWeight: '600',
        cursor: 'pointer',
        width: '100%',
        marginTop: '30px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    secondaryButton: {
        background: 'transparent',
        border: '1px solid rgba(255,255,255,0.2)',
        color: '#fff',
        padding: '10px 20px',
        borderRadius: '20px',
        cursor: 'pointer',
        marginTop: '20px',
    },
    questionCard: {
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '16px',
        padding: '30px',
        marginBottom: '20px',
    },
    questionText: {
        fontSize: '1.2rem',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '15px',
        fontWeight: '500',
    },
    qNumber: {
        color: '#00f3ff',
        fontSize: '0.9rem',
        paddingTop: '3px',
    },
    optionsGrid: {
        display: 'grid',
        gap: '12px',
    },
    optionBox: {
        display: 'flex',
        alignItems: 'center',
        padding: '15px',
        borderRadius: '12px',
        border: '1px solid',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    radioCircle: {
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        border: '2px solid rgba(255,255,255,0.3)',
        marginRight: '15px',
    },
    textarea: {
        width: '100%',
        height: '120px',
        background: 'rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        color: 'white',
        padding: '15px',
        fontSize: '1rem',
        fontFamily: 'inherit',
    },
    infoBox: {
        background: 'rgba(255,255,255,0.05)',
        padding: '15px',
        borderRadius: '12px',
        marginTop: '20px',
    },
    scoreCircle: {
        width: '150px',
        height: '150px',
        borderRadius: '50%',
        border: '4px solid #00f3ff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '0 auto 30px',
        boxShadow: '0 0 30px rgba(0, 243, 255, 0.2)',
    }
};

export default ExamPage;