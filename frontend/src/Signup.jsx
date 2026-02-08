import React, { useState } from 'react';
import { auth, db } from './firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore'; // For saving user data
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, ArrowLeft, User, Calendar, Building } from 'lucide-react';

const Signup = () => {
    const navigate = useNavigate();
    
    // Form States
    const [name, setName] = useState('');
    const [college, setCollege] = useState('');
    const [dob, setDob] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Create Authentication Account
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Save Extra Details to Database
            await setDoc(doc(db, "teachers", user.uid), {
                name: name,
                college: college,
                dob: dob,
                email: email,
                createdAt: new Date()
            });

            alert(`Welcome, Prof. ${name}! Account Created. 🚀`);
            navigate('/');
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.circle1}></div>
            
            <div style={styles.glassCard}>
                <Link to="/login" style={styles.backLink}><ArrowLeft size={18} /> Back</Link>
                
                <h1 style={styles.header}>Teacher Registration</h1>
                <p style={styles.subtitle}>Join the premium exam network.</p>

                <form onSubmit={handleSignup} style={styles.form}>
                    
                    {/* Name Input */}
                    <div style={styles.inputIconGroup}>
                        <User size={18} color="#888" style={styles.icon} />
                        <input 
                            style={styles.inputWithIcon} 
                            placeholder="Full Name" 
                            required
                            value={name}
                            onChange={(e)=>setName(e.target.value)} 
                        />
                    </div>

                    {/* College Input */}
                    <div style={styles.inputIconGroup}>
                        <Building size={18} color="#888" style={styles.icon} />
                        <input 
                            style={styles.inputWithIcon} 
                            placeholder="College / University Name" 
                            required
                            value={college}
                            onChange={(e)=>setCollege(e.target.value)} 
                        />
                    </div>

                    {/* DOB Input */}
                    <div style={styles.inputIconGroup}>
                        <Calendar size={18} color="#888" style={styles.icon} />
                        <input 
                            style={styles.inputWithIcon} 
                            type="date"
                            placeholder="Date of Birth" 
                            required
                            value={dob}
                            onChange={(e)=>setDob(e.target.value)} 
                        />
                    </div>

                    <div style={styles.divider}></div>

                    {/* Email & Password */}
                    <input 
                        style={styles.input} 
                        type="email"
                        placeholder="Email Address" 
                        required
                        value={email}
                        onChange={(e)=>setEmail(e.target.value)} 
                    />
                    <input 
                        style={styles.input} 
                        type="password" 
                        placeholder="Password" 
                        required
                        value={password}
                        onChange={(e)=>setPassword(e.target.value)} 
                    />
                    
                    <button style={styles.button} disabled={loading}>
                        <UserPlus size={20} /> {loading ? "Creating..." : "Register"}
                    </button>
                </form>
            </div>
        </div>
    );
};

const styles = {
    container: { height: '100vh', background: '#050505', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: "'Space Grotesk', sans-serif", position: 'relative', overflow: 'hidden' },
    circle1: { position: 'absolute', top: '20%', right: '-5%', width: '600px', height: '600px', background: 'radial-gradient(circle, #bc13fe 0%, transparent 60%)', opacity: 0.15, filter: 'blur(100px)' },
    
    glassCard: {
        background: 'rgba(20, 20, 20, 0.8)',
        border: '1px solid #333',
        padding: '40px',
        borderRadius: '24px',
        width: '400px',
        position: 'relative',
        boxShadow: '0 0 40px rgba(188, 19, 254, 0.2)',
    },
    backLink: { position: 'absolute', top: '20px', left: '20px', color: '#666', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem' },
    header: { color: 'white', fontSize: '1.8rem', marginBottom: '5px', marginTop: '10px' },
    subtitle: { color: '#888', marginBottom: '20px' },
    form: { display: 'flex', flexDirection: 'column', gap: '12px' },
    
    // New Input Styles with Icons
    inputIconGroup: { position: 'relative', display: 'flex', alignItems: 'center' },
    icon: { position: 'absolute', left: '15px', zIndex: 1 },
    inputWithIcon: {
        width: '100%', padding: '12px 12px 12px 45px', background: '#000', border: '1px solid #333', borderRadius: '12px', color: 'white', fontSize: '1rem', outline: 'none', transition: 'border 0.3s', boxSizing: 'border-box'
    },
    input: {
        width: '100%', padding: '12px', background: '#000', border: '1px solid #333', borderRadius: '12px', color: 'white', fontSize: '1rem', outline: 'none', transition: 'border 0.3s', boxSizing: 'border-box'
    },
    divider: { height: '1px', background: '#333', margin: '5px 0' },
    
    button: {
        width: '100%', padding: '15px', background: 'linear-gradient(90deg, #bc13fe, #7d00ff)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', transition: 'transform 0.2s',
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '10px'
    }
};

export default Signup;