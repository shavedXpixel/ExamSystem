import React from 'react';
import { CheckCircle, AlertCircle, X, Check } from 'lucide-react';

const Modal = ({ isOpen, type, title, message, onClose, onConfirm }) => {
    if (!isOpen) return null;

    const isConfirm = type === 'confirm';
    const isError = type === 'error';

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <button onClick={onClose} style={styles.closeBtn}><X size={20} /></button>
                
                <div style={styles.iconBox}>
                    {isError ? <AlertCircle size={40} color="#ff4444" /> : <CheckCircle size={40} color="#00ff88" />}
                </div>

                <h2 style={styles.title}>{title}</h2>
                <p style={styles.message}>{message}</p>

                <div style={styles.buttonGroup}>
                    {isConfirm ? (
                        <>
                            <button onClick={onClose} style={styles.cancelBtn}>Cancel</button>
                            <button onClick={onConfirm} style={styles.confirmBtn}>Yes, I'm Sure</button>
                        </>
                    ) : (
                        <button onClick={onClose} style={styles.okBtn}>Okay, Got it!</button>
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, animation: 'fadeIn 0.2s' },
    modal: { background: '#141414', border: '1px solid #333', padding: '30px', borderRadius: '20px', width: '350px', textAlign: 'center', position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', animation: 'scaleUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' },
    closeBtn: { position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: '#666', cursor: 'pointer' },
    iconBox: { marginBottom: '15px', display: 'flex', justifyContent: 'center' },
    title: { color: 'white', margin: '0 0 10px 0', fontSize: '1.5rem' },
    message: { color: '#aaa', margin: '0 0 25px 0', lineHeight: '1.5' },
    buttonGroup: { display: 'flex', gap: '10px', justifyContent: 'center' },
    
    // Buttons
    okBtn: { width: '100%', padding: '12px', background: '#00ff88', border: 'none', borderRadius: '8px', color: 'black', fontWeight: 'bold', cursor: 'pointer' },
    confirmBtn: { padding: '10px 20px', background: '#00f3ff', border: 'none', borderRadius: '8px', color: 'black', fontWeight: 'bold', cursor: 'pointer' },
    cancelBtn: { padding: '10px 20px', background: 'transparent', border: '1px solid #444', borderRadius: '8px', color: '#888', cursor: 'pointer' }
};

export default Modal;