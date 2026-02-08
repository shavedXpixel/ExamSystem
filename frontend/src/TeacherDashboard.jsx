import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { auth, db } from './firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Copy, CheckCircle, Plus, Save, Trash2, ExternalLink, GraduationCap, LogOut, Folder, BookOpen, Building, UserPen, Sparkles } from 'lucide-react';

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
                } catch (e) { console.error("Profile Error:", e); }

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
            const usedSubjects = [...new Set(res.data.map(e => e.subject))];
            setDropdownSubjects(prev => [...new Set([...DEFAULT_SUBJECTS, ...usedSubjects])]);
        } catch (err) { console.error(err); }
    };

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/login');
    };

    // --- LOGIC HANDLERS ---
    const addNewSubject = () => {
        if (!newSubjectName.trim()) return;
        setDropdownSubjects(prev => [...prev, newSubjectName]);
        setSelectedSubject(newSubjectName); // Select immediately
        setNewSubjectName("");
        setIsAddingSubject(false);
    };

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
            fetchHistory(user.uid);
        } catch (error) { alert("Failed to save exam."); } 
        finally { setLoading(false); }
    };

    const copyToClipboard = (id) => {
        navigator.clipboard.writeText(id);
        alert("Exam ID Copied!");
    };

    const uniqueHistorySubjects = ["All", ...new Set(allExams.map(e => e.subject))];
    const filteredExams = historyFilter === "All" ? allExams : allExams.filter(exam => exam.subject === historyFilter);

    if (loadingAuth) return <div className="loading-screen">Loading Dashboard...</div>;

    return (
        <div className="dashboard-container">
            {/* Background Elements */}
            <div className="bg-glow-1"></div>
            <div className="bg-glow-2"></div>

            {/* HEADER */}
            <div className="top-bar glass-panel">
                <div className="profile-section">
                    <div className="avatar">
                        {teacherProfile ? teacherProfile.name[0].toUpperCase() : user?.email[0].toUpperCase()}
                    </div>
                    <div>
                        <h1 className="welcome-text">
                            Hello, {teacherProfile ? `Prof. ${teacherProfile.name.split(' ')[0]}` : "Teacher"} <span className="wave">👋</span>
                        </h1>
                        <div className="profile-meta">
                            <Building size={14} /> 
                            <span>{teacherProfile?.college || user?.email}</span>
                            
                            {/* Edit Profile Button */}
                            <button onClick={() => navigate('/profile')} className="icon-btn-small" title="Edit Profile">
                                <UserPen size={14} />
                            </button>
                        </div>
                    </div>
                </div>
                <button onClick={handleLogout} className="logout-btn">
                    <LogOut size={18} /> <span>Logout</span>
                </button>
            </div>
            
            {/* SUCCESS BANNER */}
            {createdExamId && (
                <div className="success-banner slide-in">
                    <div className="banner-content">
                        <div className="icon-box"><CheckCircle size={32} color="#00ff88" /></div>
                        <div>
                            <h3>Exam Created Successfully!</h3>
                            <p>Subject: {selectedSubject}</p>
                        </div>
                    </div>
                    <div className="code-display">
                        <span>{createdExamId}</span>
                        <button onClick={() => copyToClipboard(createdExamId)}><Copy size={16} /> Copy</button>
                    </div>
                    <div className="banner-actions">
                        <button onClick={() => navigate(`/grade/${createdExamId}`)} className="btn-primary-small"><GraduationCap size={16} /> Grading</button>
                        <button onClick={() => window.open(`/exam/${createdExamId}`, '_blank')} className="btn-outline-small"><ExternalLink size={16} /> Test Link</button>
                        <button onClick={() => setCreatedExamId(null)} className="btn-text-small">Dismiss</button>
                    </div>
                </div>
            )}

            {/* MAIN GRID */}
            <div className="main-grid">
                
                {/* --- LEFT: CREATE EXAM --- */}
                <div className="card create-card fade-in">
                    <h2 className="card-title">
                        <Sparkles size={22} color="#00f3ff"/> Create New Exam
                    </h2>
                    
                    <div className="form-group">
                        <label>Subject</label>
                        <div className="subject-row">
                            <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="custom-select">
                                {dropdownSubjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                            </select>
                            <button onClick={() => setIsAddingSubject(!isAddingSubject)} className="add-subject-btn" title="Add Subject">
                                <Plus size={20} />
                            </button>
                        </div>
                        
                        {isAddingSubject && (
                            <div className="new-subject-popup slide-down">
                                <input placeholder="New Subject Name..." value={newSubjectName} onChange={e => setNewSubjectName(e.target.value)} />
                                <button onClick={addNewSubject}>Add</button>
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Exam Title</label>
                        <input className="custom-input" placeholder="e.g. Mid-Term Physics Assessment" value={title} onChange={e => setTitle(e.target.value)} />
                    </div>

                    <div className="questions-container">
                        {questions.map((q, index) => (
                            <div key={index} className="question-box slide-up" style={{animationDelay: `${index * 0.1}s`}}>
                                <div className="q-header">
                                    <h4>Question {index + 1}</h4>
                                    <Trash2 size={18} className="delete-icon" onClick={() => removeQuestion(index)} />
                                </div>
                                <input className="custom-input q-text" placeholder="Type Question Here..." value={q.text} onChange={e => handleQuestionChange(index, 'text', e.target.value)} />
                                
                                <div className="q-meta-row">
                                    <select className="custom-select" value={q.type} onChange={e => handleQuestionChange(index, 'type', e.target.value)}>
                                        <option value="MCQ">Multiple Choice</option>
                                        <option value="Text">Written Answer</option>
                                    </select>
                                    <input type="number" className="custom-input marks-input" placeholder="Marks" value={q.maxMarks} onChange={e => handleQuestionChange(index, 'maxMarks', e.target.value)} />
                                </div>

                                {q.type === 'MCQ' && (
                                    <input className="custom-input options-input" placeholder="Options (Comma separated: A,B,C,D)" value={q.options} onChange={e => handleQuestionChange(index, 'options', e.target.value)} />
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="action-buttons">
                        <button onClick={addQuestion} className="btn-secondary"><Plus size={18} /> Add Question</button>
                        <button onClick={saveExam} className="btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : <><Save size={18} /> Save Exam</>}
                        </button>
                    </div>
                </div>

                {/* --- RIGHT: HISTORY --- */}
                <div className="card history-card fade-in">
                    <h2 className="card-title">
                        <Folder size={22} color="#bc13fe" /> Exam History
                    </h2>
                    
                    <div className="filter-tags">
                        {uniqueHistorySubjects.map(sub => (
                            <button 
                                key={sub} 
                                className={`tag ${historyFilter === sub ? 'active' : ''}`}
                                onClick={() => setHistoryFilter(sub)}
                            >
                                {sub}
                            </button>
                        ))}
                    </div>

                    <div className="exam-list custom-scroll">
                        {filteredExams.length === 0 ? (
                            <div className="empty-state">
                                <BookOpen size={40} />
                                <p>No exams found.</p>
                            </div>
                        ) : (
                            filteredExams.map((exam, idx) => (
                                <div key={exam.id} className="exam-item slide-in-right" style={{animationDelay: `${idx * 0.05}s`}}>
                                    <div className="exam-info">
                                        <div className="exam-title">{exam.title}</div>
                                        <div className="exam-meta">
                                            <span className="badge">{exam.subject}</span>
                                            <span className="marks">{exam.totalMarks} Marks</span>
                                        </div>
                                    </div>
                                    <div className="exam-actions">
                                        <button onClick={() => copyToClipboard(exam.id)} title="Copy ID"><Copy size={16} /></button>
                                        
                                        {/* VIEW RESULTS BUTTON */}
                                        <button 
                                            className="grade-btn" 
                                            onClick={() => navigate(`/grade/${exam.id}`)} 
                                            title="View Results & Students"
                                        >
                                            <GraduationCap size={16} />
                                            <span>Results</span>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* --- PREMIUM CSS STYLES --- */}
            <style>{`
                /* Global & Layout */
                .dashboard-container { min-height: 100vh; background: #050505; color: white; padding: 30px; font-family: 'Space Grotesk', sans-serif; position: relative; overflow-x: hidden; }
                .bg-glow-1 { position: fixed; top: -10%; left: -10%; width: 500px; height: 500px; background: radial-gradient(circle, rgba(0, 243, 255, 0.15) 0%, transparent 70%); filter: blur(100px); z-index: 0; pointer-events: none; animation: float 10s infinite; }
                .bg-glow-2 { position: fixed; bottom: -10%; right: -10%; width: 600px; height: 600px; background: radial-gradient(circle, rgba(188, 19, 254, 0.15) 0%, transparent 70%); filter: blur(100px); z-index: 0; pointer-events: none; animation: float 12s infinite reverse; }
                
                /* Glassmorphism Panel */
                .glass-panel, .card {
                    background: rgba(20, 20, 20, 0.6);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 20px;
                    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
                    position: relative;
                    z-index: 1;
                }

                /* Top Bar */
                .top-bar { display: flex; justify-content: space-between; align-items: center; padding: 20px 30px; margin-bottom: 40px; }
                .profile-section { display: flex; align-items: center; gap: 20px; }
                .avatar { width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, #00f3ff, #bc13fe); color: black; font-weight: bold; font-size: 1.5rem; display: flex; justify-content: center; align-items: center; border: 2px solid white; box-shadow: 0 0 15px rgba(0, 243, 255, 0.5); }
                .welcome-text { margin: 0; font-size: 1.5rem; background: linear-gradient(90deg, #fff, #aaa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                .profile-meta { display: flex; align-items: center; gap: 10px; color: #888; font-size: 0.9rem; margin-top: 5px; }
                .icon-btn-small { background: rgba(255,255,255,0.1); border: none; border-radius: 50%; width: 24px; height: 24px; display: flex; justify-content: center; align-items: center; color: #00f3ff; cursor: pointer; transition: 0.2s; }
                .icon-btn-small:hover { background: #00f3ff; color: black; transform: scale(1.1); }
                .logout-btn { display: flex; align-items: center; gap: 8px; background: rgba(255, 68, 68, 0.1); color: #ff4444; border: 1px solid rgba(255, 68, 68, 0.2); padding: 10px 20px; border-radius: 12px; cursor: pointer; transition: 0.3s; }
                .logout-btn:hover { background: #ff4444; color: white; box-shadow: 0 0 15px rgba(255, 68, 68, 0.4); }

                /* Grid Layout */
                .main-grid { display: grid; grid-template-columns: 1.4fr 0.8fr; gap: 30px; max-width: 1600px; margin: 0 auto; }
                
                /* Cards */
                .card { padding: 30px; height: fit-content; transition: 0.3s; }
                .card-title { margin-top: 0; display: flex; align-items: center; gap: 12px; color: white; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 15px; margin-bottom: 25px; }
                .history-card { max-height: 85vh; display: flex; flex-direction: column; }

                /* Inputs & Forms */
                .form-group { margin-bottom: 20px; }
                .form-group label { display: block; color: #aaa; margin-bottom: 8px; font-size: 0.9rem; }
                .custom-input, .custom-select { width: 100%; background: #0a0a0a; border: 1px solid #333; padding: 14px; border-radius: 10px; color: white; outline: none; transition: 0.3s; box-sizing: border-box; }
                .custom-input:focus, .custom-select:focus { border-color: #00f3ff; box-shadow: 0 0 10px rgba(0, 243, 255, 0.2); }
                .subject-row { display: flex; gap: 10px; }
                .add-subject-btn { background: #00f3ff; color: black; border: none; border-radius: 10px; width: 50px; cursor: pointer; transition: 0.2s; display: flex; justify-content: center; align-items: center; }
                .add-subject-btn:hover { transform: scale(1.05); box-shadow: 0 0 15px #00f3ff; }
                
                /* New Subject Popup */
                .new-subject-popup { margin-top: 10px; display: flex; gap: 10px; background: rgba(0, 243, 255, 0.1); padding: 10px; border-radius: 10px; border: 1px solid #00f3ff; }
                .new-subject-popup input { flex: 1; background: black; border: none; color: white; padding: 8px; border-radius: 5px; outline: none; }
                .new-subject-popup button { background: #00f3ff; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; font-weight: bold; }

                /* Question Box */
                .questions-container { margin-bottom: 20px; }
                .question-box { background: rgba(30, 30, 30, 0.5); padding: 20px; border-radius: 12px; margin-bottom: 15px; border-left: 3px solid #bc13fe; transition: 0.3s; }
                .question-box:hover { background: rgba(40, 40, 40, 0.8); transform: translateX(5px); }
                .q-header { display: flex; justify-content: space-between; color: #ccc; margin-bottom: 10px; }
                .delete-icon { color: #666; cursor: pointer; transition: 0.2s; }
                .delete-icon:hover { color: #ff4444; }
                .q-meta-row { display: flex; gap: 10px; margin-top: 10px; }
                .marks-input { width: 100px; }
                .options-input { margin-top: 10px; border-color: #bc13fe; }

                /* Buttons */
                .action-buttons { display: flex; gap: 15px; margin-top: 30px; }
                .btn-primary { flex: 1; padding: 14px; background: linear-gradient(90deg, #00f3ff, #bc13fe); border: none; border-radius: 10px; color: black; font-weight: bold; cursor: pointer; font-size: 1rem; display: flex; justify-content: center; align-items: center; gap: 10px; transition: 0.3s; }
                .btn-primary:hover { transform: translateY(-3px); box-shadow: 0 0 25px rgba(188, 19, 254, 0.4); }
                .btn-secondary { flex: 1; padding: 14px; background: transparent; border: 1px solid #555; color: white; border-radius: 10px; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 10px; transition: 0.3s; }
                .btn-secondary:hover { border-color: white; background: rgba(255,255,255,0.05); }

                /* History List */
                .filter-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
                .tag { background: #111; border: 1px solid #333; color: #888; padding: 6px 12px; border-radius: 20px; cursor: pointer; transition: 0.3s; font-size: 0.85rem; }
                .tag:hover, .tag.active { border-color: #00f3ff; color: #00f3ff; background: rgba(0, 243, 255, 0.1); box-shadow: 0 0 10px rgba(0, 243, 255, 0.2); }
                
                .exam-list { overflow-y: auto; padding-right: 5px; flex: 1; }
                .custom-scroll::-webkit-scrollbar { width: 5px; }
                .custom-scroll::-webkit-scrollbar-thumb { background: #333; border-radius: 5px; }
                .exam-item { display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.03); padding: 18px; border-radius: 12px; margin-bottom: 12px; border: 1px solid transparent; transition: 0.3s; }
                .exam-item:hover { border-color: #bc13fe; background: rgba(188, 19, 254, 0.05); transform: scale(1.02); }
                .exam-title { font-weight: bold; margin-bottom: 5px; color: #eee; }
                .exam-meta { display: flex; gap: 10px; font-size: 0.8rem; }
                .badge { background: #222; padding: 2px 8px; border-radius: 4px; color: #aaa; }
                .exam-actions { display: flex; gap: 8px; }
                .exam-actions button { background: #111; border: 1px solid #333; color: #fff; height: 32px; border-radius: 8px; cursor: pointer; display: flex; justify-content: center; align-items: center; transition: 0.2s; }
                .exam-actions button:hover { border-color: #fff; }
                .grade-btn { width: auto; padding: 0 15px; gap: 8px; }
                .grade-btn:hover { background: #00f3ff; color: black; border-color: #00f3ff !important; }

                /* Success Banner */
                .success-banner { background: rgba(0, 255, 136, 0.1); border: 1px solid #00ff88; border-radius: 15px; padding: 25px; margin: 0 auto 40px; max-width: 800px; display: flex; flex-direction: column; gap: 15px; backdrop-filter: blur(10px); }
                .banner-content { display: flex; align-items: center; gap: 15px; }
                .banner-content h3 { margin: 0; color: #00ff88; }
                .banner-content p { margin: 5px 0 0; color: #ccc; }
                .code-display { background: black; border: 1px solid #333; padding: 10px 20px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; }
                .code-display span { font-family: monospace; font-size: 1.2rem; color: #00ff88; letter-spacing: 2px; }
                .code-display button { background: #333; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; display: flex; gap: 5px; }
                .banner-actions { display: flex; gap: 10px; }
                .btn-primary-small { background: #00ff88; color: black; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; display: flex; gap: 8px; }
                .btn-outline-small { background: transparent; border: 1px solid #00ff88; color: #00ff88; padding: 10px 20px; border-radius: 8px; cursor: pointer; display: flex; gap: 8px; }
                .btn-text-small { background: transparent; border: none; color: #aaa; cursor: pointer; text-decoration: underline; margin-left: auto; }

                /* Animations */
                @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-20px); } 100% { transform: translateY(0px); } }
                @keyframes wave { 0% { transform: rotate(0deg); } 20% { transform: rotate(15deg); } 40% { transform: rotate(-10deg); } 60% { transform: rotate(5deg); } 100% { transform: rotate(0deg); } }
                .wave { display: inline-block; animation: wave 2s infinite; transform-origin: 70% 70%; }
                .fade-in { animation: fadeIn 0.8s ease-out; }
                .slide-down { animation: slideDown 0.3s ease-out; }
                .slide-up { animation: slideUp 0.5s ease-out forwards; opacity: 0; }
                .slide-in { animation: slideIn 0.5s ease-out; }
                .slide-in-right { animation: slideInRight 0.5s ease-out forwards; opacity: 0; transform: translateX(-20px); }
                
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes slideIn { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes slideInRight { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
            `}</style>
        </div>
    );
};

export default TeacherDashboard;