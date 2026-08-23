import React, { useState } from 'react';
import { fetchApi } from '../config/api';

export default function Login({ onLoginSuccess }) {
    const [cleAcces, setCleAcces] = useState('');
    const [erreur, setErreur] = useState('');
    const [chargement, setChargement] = useState(false);

    const handleLogin = async (e) => {
        if (e) e.preventDefault();
        
        const pinClean = cleAcces.trim();
        if (!pinClean) {
            setErreur('Veuillez entrer un code PIN ou une clé d\'accès.');
            return;
        }

        setErreur('');
        setChargement(true);

        try {
            // Utilisation du helper centralisé fetchApi
            const data = await fetchApi('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ cle_acces: pinClean })
            });

            // Transmission de l'utilisateur (PATRON ou EMPLOYE) au composant parent
            onLoginSuccess(data.utilisateur);
        } catch (err) {
            console.error("Erreur d'authentification :", err);
            setErreur(err.message || 'Clé d\'accès ou code PIN invalide.');
        } finally {
            setChargement(false);
        }
    };

    // Fonctions pour le pavé numérique tactile
    const ajouterChiffre = (chiffre) => {
        if (erreur) setErreur('');
        if (cleAcces.length < 8) {
            setCleAcces(prev => prev + chiffre);
        }
    };

    const effacerChiffre = () => {
        if (erreur) setErreur('');
        setCleAcces(prev => prev.slice(0, -1));
    };

    const reinitialiser = () => {
        setCleAcces('');
        setErreur('');
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.card}>
                <h2 style={styles.title}>Supermarché App</h2>
                <p style={styles.subtitle}>Entrez votre code PIN ou clé d'accès</p>
                
                <form onSubmit={handleLogin}>
                    {/* Champ de saisie du PIN */}
                    <input 
                        type="password"
                        inputMode="numeric"
                        value={cleAcces} 
                        onChange={(e) => {
                            if (erreur) setErreur('');
                            setCleAcces(e.target.value);
                        }} 
                        placeholder="••••" 
                        maxLength={8}
                        style={styles.pinInput}
                        autoFocus
                        disabled={chargement}
                    />

                    {/* Pavé Numérique pour Écran Tactile / Caisse */}
                    <div style={styles.keypadGrid}>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                            <button
                                key={n}
                                type="button"
                                onClick={() => ajouterChiffre(n.toString())}
                                disabled={chargement}
                                style={styles.numBtn}
                            >
                                {n}
                            </button>
                        ))}
                        <button
                            type="button"
                            onClick={reinitialiser}
                            disabled={chargement}
                            style={{ ...styles.actionBtn, color: '#6c757d' }}
                            title="Effacer tout"
                        >
                            C
                        </button>
                        <button
                            type="button"
                            onClick={() => ajouterChiffre('0')}
                            disabled={chargement}
                            style={styles.numBtn}
                        >
                            0
                        </button>
                        <button
                            type="button"
                            onClick={effacerChiffre}
                            disabled={chargement}
                            style={{ ...styles.actionBtn, color: '#dc3545' }}
                            title="Effacer le dernier chiffre"
                        >
                            ⌫
                        </button>
                    </div>

                    {/* Bouton de Connexion */}
                    <button 
                        type="submit" 
                        disabled={chargement || !cleAcces}
                        style={{
                            ...styles.submitBtn,
                            backgroundColor: chargement || !cleAcces ? '#6c757d' : '#007bff',
                            cursor: chargement || !cleAcces ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {chargement ? 'Vérification...' : 'Se connecter'}
                    </button>
                </form>

                {/* Message d'erreur */}
                {erreur && (
                    <div style={styles.errorBox}>
                        {erreur}
                    </div>
                )}
            </div>
        </div>
    );
}

// Inline Styles
const styles = {
    overlay: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f0f2f5',
        fontFamily: 'Arial, sans-serif'
    },
    card: {
        padding: '30px',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        width: '360px',
        textAlign: 'center'
    },
    title: {
        margin: '0 0 5px 0',
        color: '#1a1a1a',
        fontSize: '22px'
    },
    subtitle: {
        color: '#666',
        fontSize: '14px',
        marginBottom: '20px'
    },
    pinInput: {
        width: '100%',
        padding: '12px',
        fontSize: '22px',
        boxSizing: 'border-box',
        marginBottom: '15px',
        borderRadius: '6px',
        border: '2px solid #ddd',
        textAlign: 'center',
        letterSpacing: '6px',
        fontWeight: 'bold',
        outline: 'none'
    },
    keypadGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '10px',
        marginBottom: '15px'
    },
    numBtn: {
        padding: '15px',
        fontSize: '18px',
        fontWeight: 'bold',
        backgroundColor: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'background 0.1s'
    },
    actionBtn: {
        padding: '15px',
        fontSize: '16px',
        fontWeight: 'bold',
        backgroundColor: '#e9ecef',
        border: '1px solid #dee2e6',
        borderRadius: '6px',
        cursor: 'pointer'
    },
    submitBtn: {
        width: '100%',
        padding: '14px',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '16px',
        fontWeight: 'bold',
        transition: 'background 0.2s'
    },
    errorBox: {
        marginTop: '15px',
        padding: '10px',
        backgroundColor: '#f8d7da',
        color: '#721c24',
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: 'bold',
        border: '1px solid #f5c6cb'
    }
};