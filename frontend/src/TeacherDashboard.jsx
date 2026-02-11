import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { auth, db } from './firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { CheckCircle, Plus, Save, Trash2, ExternalLink, GraduationCap, LogOut, Building, UserPen, Sparkles, FolderClock, Copy } from 'lucide-react';

// CHANGE THIS TO YOUR RENDER URL
const API_URL = 'https://exam-system-dfnl.vercel.app/'; 

const TeacherDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [teacherProfile, setTeacherProfile] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true);

    // Exam Creation Form
    const [subject, setSubject] = useState('');
    const [title, setTitle] = useState('');
    const [questions, setQuestions] = useState([]);
    const [createdExamId, setCreatedExamId] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                try {
                    const docRef = doc(db, "teachers", currentUser.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) setTeacherProfile(docSnap.data());
                } catch (e) { console.error("Profile Error:", e); }
            } else {
                navigate('/login');
            }
            setLoadingAuth(false);
        });
        return () => unsubscribe();
    }, [navigate]);

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/login');
    };

    const addQuestion = () => setQuestions([...questions, { text: '', type: 'MCQ', options: '', maxMarks: 5 }]);
    const removeQuestion = (index) => setQuestions(questions.filter((_, i) => i !== index));
    const handleQuestionChange = (index, field, value) => {
        const newQuestions = [...questions];
        newQuestions[index][field] = value;
        setQuestions(newQuestions);
    };

    const saveExam = async () => {
        if (!subject.trim()) return alert("Please enter a Subject Name!");
        if (!title.trim()) return alert("Please enter an Exam Title!");
        if (questions.length === 0) return alert("Add at least one question!");

        setLoading(true);
        try {
            const response = await axios.post(`${API_URL}/api/create-exam`, {
                title, subject, questions, teacherId: user.uid
            });
            setCreatedExamId(response.data.id);
            setTitle('');
            setSubject('');
            setQuestions([]);
        } catch (error) { alert("Failed to save exam."); } 
        finally { setLoading(false); }
    };

    const copyToClipboard = (id) => {
        navigator.clipboard.writeText(id);
        alert("Exam ID Copied!");
    };

    if (loadingAuth) return <div className="loading-screen">Loading Dashboard...</div>;

    return (
        <div className="dashboard-container">
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
                            <button onClick={() => navigate('/profile')} className="icon-btn-small" title="Edit Profile">
                                <UserPen size={14} />
                            </button>
                        </div>
                    </div>
                </div>
                
                <div className="header-actions">
                    {/* NEW HISTORY BUTTON */}
                    <button onClick={() => navigate('/history')} className="history-btn">
                        <FolderClock size={18} /> History
                    </button>
                    <button onClick={handleLogout} className="logout-btn">
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </div>
            
            {/* SUCCESS BANNER */}
            {createdExamId && (
                <div className="success-banner slide-in">
                    <div className="banner-content">
                        <div className="icon-box"><CheckCircle size={32} color="#00ff88" /></div>
                        <div>
                            <h3>Exam Created Successfully!</h3>
                            <p>Subject: {subject}</p>
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

            {/* MAIN CONTENT - CENTERED CREATE CARD */}
            <div className="main-content fade-in">
                <div className="card create-card">
                    <h2 className="card-title">
                        <Sparkles size={22} color="#00f3ff"/> Create New Exam
                    </h2>
                    
                    <div className="form-group">
                        <label>Subject</label>
                        <input className="custom-input" placeholder="e.g. Mathematics, Physics, Coding..." value={subject} onChange={e => setSubject(e.target.value)} />
                    </div>

                    <div className="form-group">
                        <label>Exam Title</label>
                        <input className="custom-input" placeholder="e.g. Mid-Term Assessment" value={title} onChange={e => setTitle(e.target.value)} />
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
            </div>

            <style>{`
                .dashboard-container { min-height: 100vh; background: #050505; color: white; padding: 30px; font-family: 'Space Grotesk', sans-serif; position: relative; overflow-x: hidden; }
                .bg-glow-1 { position: fixed; top: -10%; left: -10%; width: 500px; height: 500px; background: radial-gradient(circle, rgba(0, 243, 255, 0.15) 0%, transparent 70%); filter: blur(100px); pointer-events: none; animation: float 10s infinite; }
                .bg-glow-2 { position: fixed; bottom: -10%; right: -10%; width: 600px; height: 600px; background: radial-gradient(circle, rgba(188, 19, 254, 0.15) 0%, transparent 70%); filter: blur(100px); pointer-events: none; animation: float 12s infinite reverse; }
                
                .glass-panel, .card { background: rgba(20, 20, 20, 0.6); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 20px; box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37); position: relative; z-index: 1; }
                .top-bar { display: flex; justify-content: space-between; align-items: center; padding: 20px 30px; margin-bottom: 40px; }
                .profile-section { display: flex; align-items: center; gap: 20px; }
                .avatar { width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, #00f3ff, #bc13fe); color: black; font-weight: bold; font-size: 1.5rem; display: flex; justify-content: center; align-items: center; border: 2px solid white; box-shadow: 0 0 15px rgba(0, 243, 255, 0.5); }
                .welcome-text { margin: 0; font-size: 1.5rem; background: linear-gradient(90deg, #fff, #aaa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                .profile-meta { display: flex; align-items: center; gap: 10px; color: #888; font-size: 0.9rem; margin-top: 5px; }
                .icon-btn-small { background: rgba(255,255,255,0.1); border: none; border-radius: 50%; width: 24px; height: 24px; display: flex; justify-content: center; align-items: center; color: #00f3ff; cursor: pointer; transition: 0.2s; }
                .icon-btn-small:hover { background: #00f3ff; color: black; transform: scale(1.1); }
                
                .header-actions { display: flex; gap: 15px; }
                .logout-btn { display: flex; align-items: center; gap: 8px; background: rgba(255, 68, 68, 0.1); color: #ff4444; border: 1px solid rgba(255, 68, 68, 0.2); padding: 10px 20px; border-radius: 12px; cursor: pointer; transition: 0.3s; }
                .logout-btn:hover { background: #ff4444; color: white; box-shadow: 0 0 15px rgba(255, 68, 68, 0.4); }
                .history-btn { display: flex; align-items: center; gap: 8px; background: rgba(188, 19, 254, 0.1); color: #bc13fe; border: 1px solid rgba(188, 19, 254, 0.2); padding: 10px 20px; border-radius: 12px; cursor: pointer; transition: 0.3s; }
                .history-btn:hover { background: #bc13fe; color: white; box-shadow: 0 0 15px rgba(188, 19, 254, 0.4); }

                /* CENTERED LAYOUT */
                .main-content { display: flex; justify-content: center; }
                .create-card { width: 100%; max-width: 800px; padding: 40px; }
                .card-title { margin-top: 0; display: flex; align-items: center; gap: 12px; color: white; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 15px; margin-bottom: 25px; }

                .form-group { margin-bottom: 20px; }
                .form-group label { display: block; color: #aaa; margin-bottom: 8px; font-size: 0.9rem; }
                .custom-input, .custom-select { width: 100%; background: #0a0a0a; border: 1px solid #333; padding: 14px; border-radius: 10px; color: white; outline: none; transition: 0.3s; box-sizing: border-box; }
                .custom-input:focus, .custom-select:focus { border-color: #00f3ff; box-shadow: 0 0 10px rgba(0, 243, 255, 0.2); }
                
                .questions-container { margin-bottom: 20px; }
                .question-box { background: rgba(30, 30, 30, 0.5); padding: 20px; border-radius: 12px; margin-bottom: 15px; border-left: 3px solid #bc13fe; transition: 0.3s; }
                .question-box:hover { background: rgba(40, 40, 40, 0.8); transform: translateX(5px); }
                .q-header { display: flex; justify-content: space-between; color: #ccc; margin-bottom: 10px; }
                .delete-icon { color: #666; cursor: pointer; transition: 0.2s; }
                .delete-icon:hover { color: #ff4444; }
                .q-meta-row { display: flex; gap: 10px; margin-top: 10px; }
                .marks-input { width: 100px; }
                .options-input { margin-top: 10px; border-color: #bc13fe; }

                .action-buttons { display: flex; gap: 15px; margin-top: 30px; }
                .btn-primary { flex: 1; padding: 14px; background: linear-gradient(90deg, #00f3ff, #bc13fe); border: none; border-radius: 10px; color: black; font-weight: bold; cursor: pointer; font-size: 1rem; display: flex; justify-content: center; align-items: center; gap: 10px; transition: 0.3s; }
                .btn-primary:hover { transform: translateY(-3px); box-shadow: 0 0 25px rgba(188, 19, 254, 0.4); }
                .btn-secondary { flex: 1; padding: 14px; background: transparent; border: 1px solid #555; color: white; border-radius: 10px; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 10px; transition: 0.3s; }
                .btn-secondary:hover { border-color: white; background: rgba(255,255,255,0.05); }

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
                .slide-up { animation: slideUp 0.5s ease-out forwards; opacity: 0; }
                .slide-in { animation: slideIn 0.5s ease-out; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes slideIn { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default TeacherDashboard;