import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // <-- Import for navigation
import { Copy, CheckCircle, Plus, Save, Trash2, ExternalLink, GraduationCap } from 'lucide-react';

const API_URL = 'https://exam-system-api-fmyy.onrender.com'; 
// (Make sure there is NO slash at the end!)

const TeacherDashboard = () => {
    const navigate = useNavigate(); // <-- Hook to change pages
    const [title, setTitle] = useState('');
    const [questions, setQuestions] = useState([]);
    const [createdExamId, setCreatedExamId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [existingId, setExistingId] = useState(''); // For the "Grade Existing" box

    // Default new question is MCQ
    const addQuestion = () => {
        setQuestions([...questions, { 
            text: '', 
            type: 'MCQ', 
            options: '', 
            maxMarks: 5 
        }]);
    };

    const removeQuestion = (index) => {
        const newQuestions = questions.filter((_, i) => i !== index);
        setQuestions(newQuestions);
    };

    const handleQuestionChange = (index, field, value) => {
        const newQuestions = [...questions];
        newQuestions[index][field] = value;
        setQuestions(newQuestions);
    };

    const saveExam = async () => {
        if (!title) return alert("Please enter an Exam Title!");
        if (questions.length === 0) return alert("Add at least one question!");

        setLoading(true);
        try {
            const response = await axios.post(`${API_URL}/api/create-exam`, {
                title,
                questions
            });
            setCreatedExamId(response.data.id);
            setTitle('');
            setQuestions([]);
        } catch (error) {
            console.error(error);
            alert("Failed to save exam.");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(createdExamId);
        alert("ID Copied!");
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>Teacher Dashboard 👨‍🏫</h1>
            
            {/* --- SUCCESS BANNER WITH BUTTONS --- */}
            {createdExamId && (
                <div style={styles.successBanner}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                        <CheckCircle size={32} color="#00ff88" />
                        <div>
                            <h3 style={{margin: 0, color: '#00ff88'}}>Exam Created!</h3>
                            <p style={{margin: '5px 0 0', color: '#ccc'}}>Share this ID with students:</p>
                        </div>
                    </div>
                    
                    <div style={styles.codeBox}>
                        <span style={styles.codeText}>{createdExamId}</span>
                        <button onClick={copyToClipboard} style={styles.copyButton}><Copy size={18} /> Copy</button>
                    </div>

                    {/* NEW BUTTONS TO CONNECT */}
                    <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                        <button 
                            onClick={() => navigate(`/grade/${createdExamId}`)} 
                            style={styles.actionButton}
                        >
                            <GraduationCap size={18} /> Open Grading Panel
                        </button>
                        <button 
                            onClick={() => window.open(`/exam/${createdExamId}`, '_blank')} 
                            style={styles.outlineButton}
                        >
                            <ExternalLink size={18} /> Test as Student
                        </button>
                    </div>

                    <button onClick={() => setCreatedExamId(null)} style={styles.closeButton}>Create Another</button>
                </div>
            )}

            {/* --- CREATE EXAM CARD --- */}
            <div style={styles.card}>
                <h2 style={{marginTop: 0, color: '#fff'}}>Create New Exam</h2>
                <input 
                    style={styles.input}
                    placeholder="Exam Title (e.g., Final Physics Exam)" 
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                />

                {questions.map((q, index) => (
                    <div key={index} style={styles.questionBox}>
                        <div style={{display: 'flex', justifyContent: 'space-between'}}>
                            <h4 style={{margin: '0 0 10px 0', color: '#aaa'}}>Question {index + 1}</h4>
                            <Trash2 size={18} color="#ff4444" style={{cursor:'pointer'}} onClick={() => removeQuestion(index)} />
                        </div>

                        <input 
                            style={styles.input}
                            placeholder="Type Question Here..."
                            value={q.text}
                            onChange={e => handleQuestionChange(index, 'text', e.target.value)}
                        />

                        <div style={{display: 'flex', gap: '10px', marginBottom: '10px'}}>
                            <select 
                                style={styles.select}
                                value={q.type}
                                onChange={e => handleQuestionChange(index, 'type', e.target.value)}
                            >
                                <option value="MCQ">Multiple Choice</option>
                                <option value="Text">Written Answer</option>
                            </select>

                            <input 
                                type="number"
                                placeholder="Marks"
                                style={{...styles.input, width: '80px', marginBottom: 0}}
                                value={q.maxMarks}
                                onChange={e => handleQuestionChange(index, 'maxMarks', e.target.value)}
                            />
                        </div>

                        {q.type === 'MCQ' && (
                            <input 
                                style={styles.input}
                                placeholder="Options (Comma separated: A,B,C,D)"
                                value={q.options}
                                onChange={e => handleQuestionChange(index, 'options', e.target.value)}
                            />
                        )}
                    </div>
                ))}

                <div style={styles.buttonGroup}>
                    <button onClick={addQuestion} style={styles.secondaryButton}><Plus size={18} /> Add Question</button>
                    <button onClick={saveExam} style={styles.primaryButton} disabled={loading}>
                        {loading ? 'Saving...' : <><Save size={18} /> Save Exam</>}
                    </button>
                </div>
            </div>

            {/* --- NEW SECTION: GRADE EXISTING EXAM --- */}
            <div style={{...styles.card, marginTop: '30px', textAlign: 'center'}}>
                <h3 style={{color: '#888'}}>Or Grade an Existing Exam</h3>
                <div style={{display: 'flex', gap: '10px', justifyContent: 'center'}}>
                    <input 
                        style={{...styles.input, marginBottom: 0, width: '200px'}} 
                        placeholder="Paste Exam ID"
                        value={existingId}
                        onChange={e => setExistingId(e.target.value)}
                    />
                    <button 
                        onClick={() => navigate(`/grade/${existingId}`)}
                        style={styles.primaryButton}
                    >
                        Go
                    </button>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { minHeight: '100vh', background: '#0a0a0a', padding: '40px', fontFamily: "'Space Grotesk', sans-serif" },
    header: { textAlign: 'center', background: 'linear-gradient(90deg, #00f3ff, #bc13fe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '40px' },
    
    // Banner Styles
    successBanner: { maxWidth: '600px', margin: '0 auto 30px', background: 'rgba(0, 255, 136, 0.1)', border: '1px solid #00ff88', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' },
    codeBox: { background: '#000', padding: '10px 15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #333' },
    codeText: { color: '#00ff88', fontFamily: 'monospace', fontSize: '1.2rem' },
    copyButton: { background: '#333', border: 'none', color: 'white', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer', display: 'flex', gap: '5px' },
    closeButton: { background: 'transparent', border: '1px solid #00ff88', color: '#00ff88', padding: '8px', borderRadius: '5px', cursor: 'pointer', alignSelf: 'center', marginTop: '10px' },
    
    // New Action Buttons
    actionButton: { flex: 1, padding: '10px', background: '#00ff88', color: 'black', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', gap: '8px' },
    outlineButton: { flex: 1, padding: '10px', background: 'transparent', border: '1px solid #00ff88', color: '#00ff88', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: '8px' },

    // Card Styles
    card: { maxWidth: '600px', margin: '0 auto', background: '#141414', padding: '30px', borderRadius: '16px', border: '1px solid #333', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' },
    input: { width: '100%', padding: '12px', marginBottom: '15px', background: '#222', border: '1px solid #444', borderRadius: '8px', color: 'white', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' },
    select: { flex: 1, padding: '12px', background: '#222', border: '1px solid #444', borderRadius: '8px', color: 'white', fontSize: '1rem', outline: 'none' },
    questionBox: { background: '#1a1a1a', padding: '20px', borderRadius: '10px', marginBottom: '20px', borderLeft: '4px solid #bc13fe' },
    buttonGroup: { display: 'flex', gap: '15px', marginTop: '20px' },
    primaryButton: { flex: 1, padding: '12px', background: '#00f3ff', color: '#000', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', gap: '8px' },
    secondaryButton: { flex: 1, padding: '12px', background: 'transparent', color: '#fff', border: '1px solid #444', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: '8px' }
};

export default TeacherDashboard;