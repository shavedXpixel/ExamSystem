import React, { useState } from 'react';
import { auth } from './firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            alert("Account Created!");
            navigate('/'); // Go to Dashboard
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={{color: 'white'}}>Teacher Sign Up 📝</h2>
                <form onSubmit={handleSignup}>
                    <input style={styles.input} placeholder="Email" onChange={(e)=>setEmail(e.target.value)} />
                    <input style={styles.input} type="password" placeholder="Password" onChange={(e)=>setPassword(e.target.value)} />
                    <button style={styles.button}>Sign Up</button>
                </form>
                <p style={{color: '#888', marginTop: 10}}>Already have an account? <Link to="/login" style={{color:'#00f3ff'}}>Login</Link></p>
            </div>
        </div>
    );
};

const styles = {
    container: { height: '100vh', background: '#0a0a0a', display: 'flex', justifyContent: 'center', alignItems: 'center' },
    card: { background: '#141414', padding: 40, borderRadius: 16, border: '1px solid #333', textAlign: 'center', width: 300 },
    input: { width: '100%', padding: 12, marginBottom: 15, background: '#222', border: '1px solid #444', borderRadius: 8, color: 'white' },
    button: { width: '100%', padding: 12, background: '#00f3ff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }
};

export default Signup;