import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { auth } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { Copy, ArrowLeft, Search, GraduationCap, Folder, Filter, BookOpen } from 'lucide-react';

// CHANGE THIS TO YOUR RENDER URL
const API_URL = 'https://exam-system-dfnl.vercel.app/'; 

const HistoryPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [exams, setExams] = useState([]);
    
    // Search & Filter
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('All');

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                fetchHistory(currentUser.uid);
            } else {
                navigate('/login');
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [navigate]);

    const fetchHistory = async (userId) => {
        try {
            const res = await axios.get(`${API_URL}/api/exams?teacherId=${userId}`);
            setExams(res.data);
        } catch (err) { console.error(err); }
    };

    const copyToClipboard = (id) => {
        navigator.clipboard.writeText(id);
        alert("Exam ID Copied!");
    };

    // --- FILTER LOGIC ---
    const subjects = ['All', ...new Set(exams.map(e => e.subject))];

    const filteredExams = exams.filter(exam => {
        const matchesSearch = exam.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              exam.subject.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSubject = selectedSubject === 'All' || exam.subject === selectedSubject;
        
        return matchesSearch && matchesSubject;
    });

    if (loading) return <div className="loading-screen">Loading History...</div>;

    return (
        <div className="page-container">
            <div className="bg-glow-1"></div>
            <div className="bg-glow-2"></div>

            {/* HEADER */}
            <div className="header glass-panel">
                <button onClick={() => navigate('/')} className="back-btn">
                    <ArrowLeft size={20} /> Back to Dashboard
                </button>
                <h1 className="page-title"><Folder size={28} color="#bc13fe" /> Exam Archives</h1>
            </div>

            {/* CONTROLS (Search & Filter) */}
            <div className="controls-section fade-in">
                <div className="search-bar">
                    <Search size={20} color="#666" />
                    <input 
                        placeholder="Search by Title or Subject..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="filter-tags">
                    {subjects.map(sub => (
                        <button 
                            key={sub} 
                            className={`tag ${selectedSubject === sub ? 'active' : ''}`}
                            onClick={() => setSelectedSubject(sub)}
                        >
                            {sub}
                        </button>
                    ))}
                </div>
            </div>

            {/* EXAM GRID */}
            <div className="exam-grid">
                {filteredExams.length === 0 ? (
                    <div className="empty-state fade-in">
                        <BookOpen size={50} />
                        <p>No exams found matching your search.</p>
                    </div>
                ) : (
                    filteredExams.map((exam, index) => (
                        <div key={exam.id} className="exam-card slide-up" style={{animationDelay: `${index * 0.05}s`}}>
                            <div className="card-top">
                                <span className="subject-badge">{exam.subject}</span>
                                <span className="date-badge">{new Date(exam.createdAt?._seconds * 1000).toLocaleDateString()}</span>
                            </div>
                            
                            <h3 className="exam-title">{exam.title}</h3>
                            <div className="exam-stats">
                                <span>{exam.questions?.length || 0} Questions</span>
                                <span>•</span>
                                <span>{exam.totalMarks} Marks</span>
                            </div>

                            <div className="card-actions">
                                <button onClick={() => copyToClipboard(exam.id)} className="action-btn copy" title="Copy ID">
                                    <Copy size={16} /> ID
                                </button>
                                <button onClick={() => navigate(`/grade/${exam.id}`)} className="action-btn grade">
                                    <GraduationCap size={16} /> View Results
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <style>{`
                .page-container { min-height: 100vh; background: #050505; color: white; padding: 30px; font-family: 'Space Grotesk', sans-serif; position: relative; }
                .bg-glow-1 { position: fixed; top: -10%; right: -10%; width: 600px; height: 600px; background: radial-gradient(circle, rgba(188, 19, 254, 0.1) 0%, transparent 70%); filter: blur(100px); pointer-events: none; }
                .bg-glow-2 { position: fixed; bottom: -10%; left: -10%; width: 500px; height: 500px; background: radial-gradient(circle, rgba(0, 243, 255, 0.1) 0%, transparent 70%); filter: blur(100px); pointer-events: none; }

                .glass-panel { background: rgba(20, 20, 20, 0.6); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 20px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 30px; }
                .page-title { margin: 0; font-size: 1.8rem; display: flex; align-items: center; gap: 10px; color: white; }
                .back-btn { background: transparent; border: 1px solid #333; color: #888; padding: 10px 20px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.3s; }
                .back-btn:hover { border-color: #fff; color: #fff; }

                .controls-section { display: flex; gap: 20px; align-items: center; margin-bottom: 40px; flex-wrap: wrap; }
                .search-bar { flex: 1; min-width: 300px; background: #111; border: 1px solid #333; padding: 12px 20px; border-radius: 12px; display: flex; align-items: center; gap: 10px; transition: 0.3s; }
                .search-bar:focus-within { border-color: #00f3ff; box-shadow: 0 0 15px rgba(0, 243, 255, 0.15); }
                .search-bar input { background: transparent; border: none; color: white; width: 100%; outline: none; font-size: 1rem; }
                
                .filter-tags { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 5px; }
                .tag { background: #111; border: 1px solid #333; color: #888; padding: 8px 16px; border-radius: 20px; cursor: pointer; white-space: nowrap; transition: 0.3s; }
                .tag.active, .tag:hover { background: rgba(0, 243, 255, 0.1); border-color: #00f3ff; color: #00f3ff; }

                .exam-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
                .exam-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 25px; border-radius: 20px; transition: 0.3s; position: relative; overflow: hidden; }
                .exam-card:hover { transform: translateY(-5px); border-color: #bc13fe; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
                
                .card-top { display: flex; justify-content: space-between; margin-bottom: 15px; }
                .subject-badge { background: rgba(188, 19, 254, 0.15); color: #bc13fe; padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: bold; }
                .date-badge { color: #666; font-size: 0.8rem; }
                
                .exam-title { margin: 0 0 10px 0; font-size: 1.2rem; }
                .exam-stats { color: #888; font-size: 0.9rem; margin-bottom: 20px; display: flex; gap: 10px; }

                .card-actions { display: flex; gap: 10px; }
                .action-btn { flex: 1; padding: 10px; border-radius: 8px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: bold; transition: 0.2s; }
                .action-btn.copy { background: #111; color: #ccc; border: 1px solid #333; }
                .action-btn.copy:hover { border-color: #fff; color: #fff; }
                .action-btn.grade { background: #00f3ff; color: black; }
                .action-btn.grade:hover { box-shadow: 0 0 15px rgba(0, 243, 255, 0.4); }

                .empty-state { text-align: center; color: #444; width: 100%; grid-column: 1 / -1; padding: 50px; }
                
                .fade-in { animation: fadeIn 0.5s ease-out; }
                .slide-up { animation: slideUp 0.5s ease-out forwards; opacity: 0; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default HistoryPage;