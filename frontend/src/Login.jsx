import React, { useState } from 'react';
import { auth } from './firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Info } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/');
        } catch (error) {
            alert("❌ Invalid Credentials");
        }
    };

    return (
        <div style={styles.container}>
            {/* BACKGROUND ANIMATION CIRCLES */}
            <div style={styles.circle1}></div>
            <div style={styles.circle2}></div>

            <div style={styles.glassCard}>
                <h1 style={styles.glowText}>EXAM SYSTEM</h1>
                <p style={styles.subtitle}>Secure. Fast. Reliable.</p>

                <h2 style={{color: 'white', marginBottom: 20}}>Teacher Login</h2>
                
                <form onSubmit={handleLogin} style={styles.form}>
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
                            placeholder="Password" 
                            onChange={(e)=>setPassword(e.target.value)} 
                        />
                    </div>
                    
                    <button style={styles.button}>
                        <LogIn size={20} /> Login to Dashboard
                    </button>
                </form>

                <div style={styles.footer}>
                    <p style={{color: '#aaa'}}>New Teacher? <Link to="/signup" style={styles.link}>Create Account</Link></p>
                    <Link to="/about" style={styles.aboutLink}>
                        <Info size={16} /> About Developer
                    </Link>
                </div>
            </div>

            <style>{`
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                    100% { transform: translateY(0px); }
                }
                @keyframes glow {
                    0% { text-shadow: 0 0 10px #00f3ff, 0 0 20px #00f3ff; }
                    50% { text-shadow: 0 0 20px #bc13fe, 0 0 30px #bc13fe; }
                    100% { text-shadow: 0 0 10px #00f3ff, 0 0 20px #00f3ff; }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

const styles = {
    container: { height: '100vh', background: '#050505', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: "'Space Grotesk', sans-serif", overflow: 'hidden', position: 'relative' },
    circle1: { position: 'absolute', top: '-10%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, #00f3ff 0%, transparent 70%)', opacity: 0.2, filter: 'blur(80px)', animation: 'float 6s ease-in-out infinite' },
    circle2: { position: 'absolute', bottom: '-10%', right: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, #bc13fe 0%, transparent 70%)', opacity: 0.2, filter: 'blur(80px)', animation: 'float 8s ease-in-out infinite reverse' },
    
    glassCard: {
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '50px',
        borderRadius: '24px',
        width: '400px',
        textAlign: 'center',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        zIndex: 10,
        animation: 'slideUp 0.8s ease-out'
    },
    glowText: {
        fontSize: '2.5rem',
        color: 'white',
        margin: 0,
        animation: 'glow 3s infinite alternate',
        fontWeight: '800',
        letterSpacing: '2px'
    },
    subtitle: { color: '#00f3ff', margin: '5px 0 30px', fontSize: '0.9rem', letterSpacing: '1px' },
    form: { display: 'flex', flexDirection: 'column', gap: '15px' },
    inputGroup: { animation: 'slideUp 0.5s ease-out forwards', opacity: 0 },
    input: {
        width: '100%', padding: '15px', background: 'rgba(0,0,0,0.3)', border: '1px solid #333', borderRadius: '12px', color: 'white', fontSize: '1rem', outline: 'none', transition: 'all 0.3s',
        boxSizing: 'border-box'
    },
    button: {
        width: '100%', padding: '15px', background: 'linear-gradient(90deg, #00f3ff, #bc13fe)', border: 'none', borderRadius: '12px', color: 'white', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', transition: 'transform 0.2s',
        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '10px'
    },
    footer: { marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' },
    link: { color: '#00f3ff', textDecoration: 'none', fontWeight: 'bold' },
    aboutLink: { display: 'flex', alignItems: 'center', gap: '5px', color: '#888', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.3s', cursor: 'pointer' }
};

export default Login;