import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Code, Shield, Database, Globe } from 'lucide-react';

const About = () => {
    const navigate = useNavigate();

    return (
        <div style={styles.container}>
            <button onClick={() => navigate('/login')} style={styles.backButton}>
                <ArrowLeft size={20} /> Back to Login
            </button>

            <div style={styles.content}>
                <div style={styles.badge}>
                    <CheckCircle size={16} /> Verified Developer
                </div>
                
                <h1 style={styles.title}>About The Creator</h1>
                <h2 style={styles.name}>Priyansu Dash</h2>
                <p style={styles.role}>Full Stack Developer & Cybersecurity Enthusiast</p>

                <p style={styles.description}>
                    This Exam System is a state-of-the-art platform designed to make online testing 
                    seamless, secure, and beautiful. Built with modern web technologies to ensure 
                    speed and reliability for both teachers and students.
                </p>

                <div style={styles.grid}>
                    <div style={styles.techCard}>
                        <Globe size={30} color="#00f3ff"/>
                        <h3>React.js</h3>
                        <p>Frontend UI</p>
                    </div>
                    <div style={styles.techCard}>
                        <Code size={30} color="#bc13fe"/>
                        <h3>Node.js</h3>
                        <p>Backend Logic</p>
                    </div>
                    <div style={styles.techCard}>
                        <Database size={30} color="#ff0055"/>
                        <h3>Firebase</h3>
                        <p>Realtime DB</p>
                    </div>
                    <div style={styles.techCard}>
                        <Shield size={30} color="#00ff88"/>
                        <h3>Secure Auth</h3>
                        <p>Protection</p>
                    </div>
                </div>

                <div style={styles.footer}>
                    <p>© 2026 Priyansu Dash. All Rights Reserved.</p>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { minHeight: '100vh', background: '#050505', color: 'white', fontFamily: "'Space Grotesk', sans-serif", padding: '40px', position: 'relative' },
    backButton: { background: 'transparent', border: '1px solid #333', color: '#fff', padding: '10px 20px', borderRadius: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' },
    content: { maxWidth: '800px', margin: '0 auto', textAlign: 'center' },
    badge: { display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(0, 243, 255, 0.1)', color: '#00f3ff', padding: '5px 15px', borderRadius: '20px', fontSize: '0.9rem', marginBottom: '20px', border: '1px solid rgba(0, 243, 255, 0.3)' },
    title: { fontSize: '1rem', color: '#888', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' },
    name: { fontSize: '4rem', margin: '0 0 10px', background: 'linear-gradient(90deg, #fff, #aaa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    role: { fontSize: '1.2rem', color: '#bc13fe', marginBottom: '40px' },
    description: { lineHeight: '1.6', color: '#ccc', marginBottom: '50px', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 50px' },
    
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px', marginBottom: '60px' },
    techCard: { background: '#111', padding: '30px', borderRadius: '16px', border: '1px solid #222', textAlign: 'center', transition: 'transform 0.3s', cursor: 'default' },
    footer: { borderTop: '1px solid #222', paddingTop: '30px', color: '#555', fontSize: '0.9rem' }
};

export default About;