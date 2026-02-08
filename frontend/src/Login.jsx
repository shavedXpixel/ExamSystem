import React, { useState } from 'react';
import { auth } from './firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/'); // Go to Dashboard
        } catch (error) {
            alert("Invalid Email or Password");
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={{color: 'white'}}>Teacher Login 🔐</h2>
                <form onSubmit={handleLogin}>
                    <input style={styles.input} placeholder="Email" onChange={(e)=>setEmail(e.target.value)} />
                    <input style={styles.input} type="password" placeholder="Password" onChange={(e)=>setPassword(e.target.value)} />
                    <button style={styles.button}>Login</button>
                </form>
                <p style={{color: '#888', marginTop: 10}}>New here? <Link to="/signup" style={{color:'#00f3ff'}}>Create Account</Link></p>
            </div>
        </div>
    );
};

const styles = {
    container: { height: '100vh', background: '#0a0a0a', display: 'flex', justifyContent: 'center', alignItems: 'center' },
    card: { background: '#141414', padding: 40, borderRadius: 16, border: '1px solid #333', textAlign: 'center', width: 300 },
    input: { width: '100%', padding: 12, marginBottom: 15, background: '#222', border: '1px solid #444', borderRadius: 8, color: 'white' },
    button: { width: '100%', padding: 12, background: '#bc13fe', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }
};

export default Login;