import React, { useState, useEffect } from 'react';
import { auth, db } from './firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { User, Building, Calendar, Save, ArrowLeft, Loader2 } from 'lucide-react';
import Modal from './Modal';

const ProfilePage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState(null);
    
    // Form Data
    const [formData, setFormData] = useState({
        name: '',
        college: '',
        dob: '',
        email: '' // Read-only
    });

    // Modal State
    const [modal, setModal] = useState({ isOpen: false, type: '', title: '', message: '' });

    // 1. Fetch User Data on Load
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                try {
                    const docRef = doc(db, "teachers", currentUser.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setFormData({ ...docSnap.data(), email: currentUser.email });
                    }
                } catch (e) {
                    console.error("Error fetching profile:", e);
                }
            } else {
                navigate('/login');
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [navigate]);

    // 2. Handle Save
    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const docRef = doc(db, "teachers", user.uid);
            await updateDoc(docRef, {
                name: formData.name,
                college: formData.college,
                dob: formData.dob
            });
            
            setModal({
                isOpen: true, 
                type: 'success', 
                title: 'Profile Updated! ✅', 
                message: 'Your details have been saved successfully.'
            });
        } catch (error) {
            setModal({ isOpen: true, type: 'error', title: 'Error', message: 'Could not save profile.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={styles.loadingScreen}><Loader2 className="spin" size={40} color="#00f3ff"/></div>;

    return (
        <div style={styles.container}>
            <Modal 
                isOpen={modal.isOpen} 
                type={modal.type} 
                title={modal.title} 
                message={modal.message} 
                onClose={() => setModal({ ...modal, isOpen: false })} 
            />

            <div style={styles.circle1}></div>
            
            <div style={styles.glassCard}>
                <button onClick={() => navigate('/')} style={styles.backButton}>
                    <ArrowLeft size={20} /> Back to Dashboard
                </button>

                <div style={styles.header}>
                    <div style={styles.avatarLarge}>{formData.name ? formData.name[0].toUpperCase() : 'U'}</div>
                    <div>
                        <h1 style={styles.title}>Edit Profile</h1>
                        <p style={styles.subtitle}>{formData.email}</p>
                    </div>
                </div>

                <form onSubmit={handleSave} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Full Name</label>
                        <div style={styles.inputWrapper}>
                            <User size={18} color="#888" style={styles.icon} />
                            <input 
                                style={styles.input} 
                                value={formData.name} 
                                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                            />
                        </div>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>College / University</label>
                        <div style={styles.inputWrapper}>
                            <Building size={18} color="#888" style={styles.icon} />
                            <input 
                                style={styles.input} 
                                value={formData.college} 
                                onChange={(e) => setFormData({...formData, college: e.target.value})} 
                            />
                        </div>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Date of Birth</label>
                        <div style={styles.inputWrapper}>
                            <Calendar size={18} color="#888" style={styles.icon} />
                            <input 
                                type="date" 
                                style={styles.input} 
                                value={formData.dob} 
                                onChange={(e) => setFormData({...formData, dob: e.target.value})} 
                            />
                        </div>
                    </div>

                    <button style={styles.saveButton} disabled={saving}>
                        {saving ? 'Saving...' : <><Save size={20} /> Save Changes</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

const styles = {
    container: { minHeight: '100vh', background: '#050505', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: "'Space Grotesk', sans-serif", position: 'relative', overflow: 'hidden', padding: '20px' },
    loadingScreen: { height: '100vh', background: '#050505', display: 'flex', justifyContent: 'center', alignItems: 'center' },
    circle1: { position: 'absolute', top: '-10%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, #00f3ff 0%, transparent 60%)', opacity: 0.1, filter: 'blur(80px)' },
    
    glassCard: { width: '100%', maxWidth: '500px', background: 'rgba(20, 20, 20, 0.8)', border: '1px solid #333', borderRadius: '24px', padding: '40px', position: 'relative', boxShadow: '0 0 40px rgba(0, 243, 255, 0.1)' },
    
    backButton: { background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', fontSize: '0.9rem', transition: 'color 0.2s' },
    
    header: { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' },
    avatarLarge: { width: '70px', height: '70px', borderRadius: '50%', background: 'linear-gradient(135deg, #00f3ff, #bc13fe)', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '2rem', fontWeight: 'bold', boxShadow: '0 0 20px rgba(188, 19, 254, 0.3)' },
    title: { margin: 0, color: 'white', fontSize: '1.8rem' },
    subtitle: { margin: 0, color: '#666', fontSize: '0.9rem' },

    form: { display: 'flex', flexDirection: 'column', gap: '20px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { color: '#888', fontSize: '0.9rem', marginLeft: '5px' },
    inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
    icon: { position: 'absolute', left: '15px', zIndex: 1 },
    input: { width: '100%', padding: '12px 12px 12px 45px', background: '#0a0a0a', border: '1px solid #333', borderRadius: '12px', color: 'white', fontSize: '1rem', outline: 'none', transition: 'border 0.3s', boxSizing: 'border-box' },
    
    saveButton: { width: '100%', padding: '15px', background: 'linear-gradient(90deg, #00f3ff, #bc13fe)', color: 'black', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '10px' }
};

export default ProfilePage;