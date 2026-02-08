import React, { useState } from 'react';
import { auth } from './firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, ArrowLeft } from 'lucide-react';

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            alert("Account Created Successfully! 🚀");
            navigate('/');
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.circle1}></div>
            
            <div style={styles.glassCard}>
                <Link to="/login" style={styles.backLink}><ArrowLeft size={18} /> Back</Link>
                
                <h1 style={styles.header}>Join the Future</h1>
                <p style={styles.subtitle}>Create your teacher account today.</p>

                <form onSubmit={handleSignup} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <input 
                            style={styles.input} 
                            placeholder="Email Address" 
                            onChange={(e)=>setEmail(e.target.value)} 
                        />
                    </div>
                    <div style={{...styles.inputGroup, animationDelay: '0.1s'}}>
                        <input 
                            style={styles.input} 
                            type="password" 
                            placeholder="Choose Password" 
                            onChange={(e)=>setPassword(e.target.value)} 
                        />
                    </div>
                    
                    <button style={styles.button}>
                        <UserPlus size={20} /> Create Account
                    </button>
                </form>
            </div>
            
            <style>{`
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(-50px); }
                    to { opacity: 1; transform: translateX(0); }
                }
            `}</style>
        </div>
    );
};

const styles = {
    container: { height: '100vh', background: '#050505', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: "'Space Grotesk', sans-serif", position: 'relative', overflow: 'hidden' },
    circle1: { position: 'absolute', top: '20%', right: '-5%', width: '600px', height: '600px', background: 'radial-gradient(circle, #bc13fe 0%, transparent 60%)', opacity: 0.15, filter: 'blur(100px)' },
    
    glassCard: {
        background: 'rgba(20, 20, 20, 0.8)',
        border: '1px solid #333',
        padding: '50px',
        borderRadius: '24px',
        width: '380px',
        position: 'relative',
        boxShadow: '0 0 40px rgba(188, 19, 254, 0.2)',
        animation: 'slideIn 0.6s ease-out'
    },
    backLink: { position: 'absolute', top: '20px', left: '20px', color: '#666', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem' },
    header: { color: 'white', fontSize: '2rem', marginBottom: '5px', marginTop: '20px' },
    subtitle: { color: '#888', marginBottom: '30px' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px' },
    inputGroup: { animation: 'slideIn 0.5s ease-out forwards', opacity: 0 },
    input: {
        width: '100%', padding: '15px', background: '#000', border: '1px solid #333', borderRadius: '12px', color: 'white', fontSize: '1rem', outline: 'none', transition: 'border 0.3s',
        boxSizing: 'border-box'
    },
    button: {
        width: '100%', padding: '15px', background: '#fff', color: 'black', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', transition: 'transform 0.2s',
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '10px'
    }
};

export default Signup;