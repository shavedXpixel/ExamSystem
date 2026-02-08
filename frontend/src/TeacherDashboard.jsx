import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { auth, db } from './firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Copy, CheckCircle, Plus, Save, Trash2, ExternalLink, GraduationCap, LogOut, Folder, BookOpen, Building, Filter } from 'lucide-react';

// CHANGE THIS TO YOUR RENDER URL
const API_URL = 'https://exam-system-api-fmyy.onrender.com'; 

const DEFAULT_SUBJECTS = [
    "Mathematics", "Physics", "Chemistry", "Biology", "Computer Science",
    "English", "History", "Geography", "Hindi", "General Knowledge"
];

const TeacherDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [teacherProfile, setTeacherProfile] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true);

    // Data States
    const [allExams, setAllExams] = useState([]);
    
    // Dropdown Subjects (Defaults + Custom ones you've used before)
    const [dropdownSubjects, setDropdownSubjects] = useState(DEFAULT_SUBJECTS);
    
    // Selection States
    const [selectedSubject, setSelectedSubject] = useState(DEFAULT_SUBJECTS[0]);
    const [isAddingSubject, setIsAddingSubject] = useState(false);
    const [newSubjectName, setNewSubjectName] = useState("");

    // Exam Creation Form
    const [title, setTitle] = useState('');
    const [questions, setQuestions] = useState([]);
    const [createdExamId, setCreatedExamId] = useState(null);
    const [loading, setLoading] = useState(false);

    // History Filter State
    const [historyFilter, setHistoryFilter] = useState("All");

    // 1. Check Login & Load Data
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                try {
                    const docRef = doc(db, "teachers", currentUser.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) setTeacherProfile(docSnap.data());
                } catch (e) { console.error(e); }

                fetchHistory(currentUser.uid);
            } else {
                navigate('/login');
            }
            setLoadingAuth(false);
        });
        return () => unsubscribe();
    }, [navigate]);

    const fetchHistory = async (userId) => {
        try {
            const res = await axios.get(`${API_URL}/api/exams?teacherId=${userId}`);
            setAllExams(res.data);
            
            // LOGIC: Extract unique subjects from PAST exams to add to the dropdown
            const usedSubjects = [...new Set(res.data.map(e => e.subject))];
            
            // Update the Dropdown to include these custom subjects (merging with defaults)
            setDropdownSubjects(prev => [...new Set([...DEFAULT_SUBJECTS, ...usedSubjects])]);
        } catch (err) {
            console.error("Failed to load history", err);
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/login');
    };

    // --- SUBJECT LOGIC ---
    const addNewSubject = () => {
        if (!newSubjectName.trim()) return;
        // Add to dropdown immediately
        setDropdownSubjects(prev => [...prev, newSubjectName]);
        setSelectedSubject(newSubjectName);
        setNewSubjectName("");
        setIsAddingSubject(false);
    };

    // --- EXAM LOGIC ---
    const addQuestion = () => setQuestions([...questions, { text: '', type: 'MCQ', options: '', maxMarks: 5 }]);
    const removeQuestion = (index) => setQuestions(questions.filter((_, i) => i !== index));
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
                subject: selectedSubject,
                questions,
                teacherId: user.uid
            });
            
            setCreatedExamId(response.data.id);
            setTitle('');
            setQuestions([]);
            // Refresh history immediately (this updates the filter buttons)
            fetchHistory(user.uid); 
        } catch (error) {
            console.error(error);
            alert("Failed to save exam.");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (id) => {
        navigator.clipboard.writeText(id);
        alert("Exam ID Copied!");
    };

    // --- DYNAMIC HISTORY FILTERS ---
    // Only show subjects that actually exist in the history
    const uniqueHistorySubjects = ["All", ...new Set(allExams.map(e => e.subject))];

    const filteredExams = historyFilter === "All" 
        ? allExams 
        : allExams.filter(exam => exam.subject === historyFilter);

    if (loadingAuth) return <div style={{color:'white', textAlign:'center', marginTop: 50}}>Loading...</div>;

    return (
        <div style={styles.container}>
            {/* HEADER */}
            <div style={styles.topBar}>
                <div style={{display:'flex', alignItems:'center', gap: 15}}>
                    <div style={styles.avatar}>
                        {teacherProfile ? teacherProfile.name[0].toUpperCase() : user?.email[0].toUpperCase()}
                    </div>
                    <div>
                        <h1 style={styles.header}>
                            Welcome, {teacherProfile ? `Prof. ${teacherProfile.name.split(' ')[0]}` : "Teacher"} 👨‍🏫
                        </h1>
                        <p style={{color:'#888', margin:0, fontSize: '0.9rem', display:'flex', alignItems:'center', gap:5}}>
                            <Building size={14} /> {teacherProfile?.college || user?.email}
                        </p>
                    </div>
                </div>
                <button onClick={handleLogout} style={styles.logoutButton}>
                    <LogOut size={18} /> Logout
                </button>
            </div>
            
            {/* SUCCESS BANNER */}
            {createdExamId && (
                <div style={styles.successBanner}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                        <CheckCircle size={32} color="#00ff88" />
                        <div>
                            <h3 style={{margin: 0, color: '#00ff88'}}>Exam Created Successfully!</h3>
                            <p style={{margin: '5px 0 0', color: '#ccc'}}>Subject: {selectedSubject}</p>
                        </div>
                    </div>
                    
                    <div style={styles.codeBox}>
                        <span style={styles.codeText}>{createdExamId}</span>
                        <button onClick={() => copyToClipboard(createdExamId)} style={styles.copyButton}><Copy size={18} /> Copy</button>
                    </div>

                    <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                        <button onClick={() => navigate(`/grade/${createdExamId}`)} style={styles.actionButton}>
                            <GraduationCap size={18} /> Open Grading
                        </button>
                        <button onClick={() => window.open(`/exam/${createdExamId}`, '_blank')} style={styles.outlineButton}>
                            <ExternalLink size={18} /> Test Link
                        </button>
                    </div>
                    <button onClick={() => setCreatedExamId(null)} style={styles.closeButton}>Create Another</button>
                </div>
            )}

            {/* MAIN GRID */}
            <div style={styles.grid}>
                
                {/* --- LEFT: CREATE EXAM --- */}
                <div style={styles.card}>
                    <h2 style={{marginTop: 0, color: '#fff', display:'flex', alignItems:'center', gap:10}}>
                        <Plus size={24} color="#00f3ff"/> Create New Exam
                    </h2>
                    
                    <label style={styles.label}>Subject</label>
                    <div style={{display: 'flex', gap: '10px', marginBottom: '15px'}}>
                        {/* Dropdown shows DEFAULT + CUSTOM subjects */}
                        <select 
                            style={styles.select} 
                            value={selectedSubject}
                            onChange={e => setSelectedSubject(e.target.value)}
                        >
                            {dropdownSubjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                        </select>
                        <button onClick={() => setIsAddingSubject(!isAddingSubject)} style={styles.iconBtnPrimary} title="Add New Subject"><Plus size={20} /></button>
                    </div>

                    {isAddingSubject && (
                        <div style={styles.newSubjectBox}>
                            <input style={styles.miniInput} placeholder="Enter Subject Name..." value={newSubjectName} onChange={e => setNewSubjectName(e.target.value)} />
                            <button onClick={addNewSubject} style={styles.miniBtn}>Add</button>
                        </div>
                    )}

                    <label style={styles.label}>Exam Title</label>
                    <input style={styles.input} placeholder="e.g., Mid-Term Physics Assessment" value={title} onChange={e => setTitle(e.target.value)} />

                    {questions.map((q, index) => (
                        <div key={index} style={styles.questionBox}>
                            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                <h4 style={{margin: '0 0 10px 0', color: '#aaa'}}>Question {index + 1}</h4>
                                <Trash2 size={18} color="#ff4444" style={{cursor:'pointer'}} onClick={() => removeQuestion(index)} />
                            </div>
                            <input style={styles.input} placeholder="Type Question Here..." value={q.text} onChange={e => handleQuestionChange(index, 'text', e.target.value)} />
                            <div style={{display: 'flex', gap: '10px', marginBottom: '10px'}}>
                                <select style={styles.select} value={q.type} onChange={e => handleQuestionChange(index, 'type', e.target.value)}>
                                    <option value="MCQ">Multiple Choice</option>
                                    <option value="Text">Written Answer</option>
                                </select>
                                <input type="number" placeholder="Marks" style={{...styles.input, width: '80px', marginBottom: 0}} value={q.maxMarks} onChange={e => handleQuestionChange(index, 'maxMarks', e.target.value)} />
                            </div>
                            {q.type === 'MCQ' && (
                                <input style={styles.input} placeholder="Options (A,B,C,D)" value={q.options} onChange={e => handleQuestionChange(index, 'options', e.target.value)} />
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

                {/* --- RIGHT: HISTORY (Dynamic) --- */}
                <div style={styles.historyCard}>
                    <h2 style={{marginTop: 0, color: '#00f3ff', display:'flex', alignItems:'center', gap:10}}>
                        <Folder size={24} /> Exam History
                    </h2>
                    
                    {/* Only show subjects that HAVE exams */}
                    <div style={styles.filterContainer}>
                        {uniqueHistorySubjects.length === 1 ? (
                            <p style={{color: '#666', fontSize: '0.9rem', fontStyle: 'italic'}}>
                                No exams created yet.
                            </p>
                        ) : (
                            uniqueHistorySubjects.map(sub => (
                                <button 
                                    key={sub} 
                                    style={historyFilter === sub ? styles.filterActive : styles.filterBtn} 
                                    onClick={() => setHistoryFilter(sub)}
                                >
                                    {sub}
                                </button>
                            ))
                        )}
                    </div>

                    <div style={styles.examList}>
                        {filteredExams.length === 0 ? (
                            <div style={{textAlign:'center', padding: 20, color:'#555'}}>
                                <BookOpen size={40} style={{marginBottom:10, opacity:0.5}} />
                                <p>No exams found.</p>
                            </div>
                        ) : (
                            filteredExams.map(exam => (
                                <div key={exam.id} style={styles.examItem}>
                                    <div>
                                        <div style={styles.examTitle}>{exam.title}</div>
                                        <div style={styles.examMeta}>
                                            <span style={styles.subjectTag}>{exam.subject || "General"}</span>
                                            <span style={{color:'#666'}}>{exam.totalMarks} Marks</span>
                                        </div>
                                    </div>
                                    <div style={{display:'flex', gap: '8px'}}>
                                        <button onClick={() => copyToClipboard(exam.id)} style={styles.iconBtn} title="Copy ID"><Copy size={16} /></button>
                                        <button onClick={() => navigate(`/grade/${exam.id}`)} style={styles.iconBtnPrimary} title="Grade"><GraduationCap size={16} /></button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { minHeight: '100vh', background: '#0a0a0a', padding: '40px', fontFamily: "'Space Grotesk', sans-serif" },
    topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' },
    header: { margin: 0, fontSize: '1.8rem', background: 'linear-gradient(90deg, #00f3ff, #bc13fe)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    avatar: { width: 45, height: 45, borderRadius: '50%', background: '#bc13fe', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '1.2rem', border: '2px solid #fff' },
    logoutButton: { background: '#222', color: '#ff4444', border: '1px solid #333', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center' },
    
    grid: { display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px', maxWidth: '1400px', margin: '0 auto' },
    
    // Cards
    card: { background: '#141414', padding: '30px', borderRadius: '16px', border: '1px solid #333' },
    historyCard: { background: '#111', padding: '30px', borderRadius: '16px', border: '1px solid #333', height: 'fit-content', maxHeight: '80vh', display: 'flex', flexDirection: 'column' },

    // Inputs
    label: { color: '#888', fontSize: '0.9rem', marginBottom: '5px', display: 'block' },
    input: { width: '100%', padding: '12px', marginBottom: '15px', background: '#222', border: '1px solid #444', borderRadius: '8px', color: 'white', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' },
    select: { flex: 1, padding: '12px', background: '#222', border: '1px solid #444', borderRadius: '8px', color: 'white', fontSize: '1rem', outline: 'none' },

    // New Subject Box
    newSubjectBox: { display: 'flex', gap: '10px', marginBottom: '20px', animation: 'fadeIn 0.3s' },
    miniInput: { flex: 1, padding: '10px', background: '#000', border: '1px solid #00f3ff', borderRadius: '5px', color: 'white', outline: 'none' },
    miniBtn: { padding: '0 15px', background: '#00f3ff', color: 'black', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },

    // History Filters
    filterContainer: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' },
    filterBtn: { padding: '6px 12px', background: '#222', border: '1px solid #444', color: '#888', borderRadius: '20px', cursor: 'pointer', fontSize: '0.8rem' },
    filterActive: { padding: '6px 12px', background: '#00f3ff', border: '1px solid #00f3ff', color: 'black', borderRadius: '20px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' },

    // Exam List
    examList: { overflowY: 'auto', paddingRight: '5px' },
    examItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1a1a1a', padding: '15px', borderRadius: '10px', marginBottom: '10px', borderLeft: '3px solid #bc13fe' },
    examTitle: { color: 'white', fontWeight: 'bold', marginBottom: '5px' },
    examMeta: { display: 'flex', gap: '10px', fontSize: '0.8rem' },
    subjectTag: { background: '#333', padding: '2px 8px', borderRadius: '4px', color: '#ccc' },
    
    // Buttons
    buttonGroup: { display: 'flex', gap: '15px', marginTop: '20px' },
    primaryButton: { flex: 1, padding: '12px', background: '#00f3ff', color: '#000', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', gap: '8px' },
    secondaryButton: { flex: 1, padding: '12px', background: 'transparent', color: '#fff', border: '1px solid #444', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: '8px' },
    iconBtn: { padding: '10px', background: '#333', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' },
    iconBtnPrimary: { padding: '10px', background: '#00f3ff', border: 'none', borderRadius: '8px', color: 'black', cursor: 'pointer' },

    // Success Banner
    successBanner: { maxWidth: '800px', margin: '0 auto 30px', background: 'rgba(0, 255, 136, 0.1)', border: '1px solid #00ff88', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' },
    codeBox: { background: '#000', padding: '10px 15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #333' },
    codeText: { color: '#00ff88', fontFamily: 'monospace', fontSize: '1.2rem' },
    copyButton: { background: '#333', border: 'none', color: 'white', padding: '8px 12px', borderRadius: '5px', cursor: 'pointer', display: 'flex', gap: '5px' },
    actionButton: { flex: 1, padding: '10px', background: '#00ff88', color: 'black', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', gap: '8px' },
    outlineButton: { flex: 1, padding: '10px', background: 'transparent', border: '1px solid #00ff88', color: '#00ff88', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: '8px' },
    closeButton: { background: 'transparent', border: '1px solid #00ff88', color: '#00ff88', padding: '8px', borderRadius: '5px', cursor: 'pointer', alignSelf: 'center' },
    questionBox: { background: '#1a1a1a', padding: '20px', borderRadius: '10px', marginBottom: '20px', borderLeft: '4px solid #bc13fe' },
};

export default TeacherDashboard;