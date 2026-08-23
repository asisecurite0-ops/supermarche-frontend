import React, { useState, useEffect } from 'react';
import { fetchApi } from '../config/api';

export default function Activation({ onActivated, messageErreur }) {
    // Génération ou récupération d'un identifiant machine unique
    const [hardwareId] = useState(() => {
        let id = localStorage.getItem('app_hardware_id');
        if (!id) {
            id = 'HW-' + Math.random().toString(36).substring(2, 10).toUpperCase() + '-' + Date.now().toString(36).toUpperCase();
            localStorage.setItem('app_hardware_id', id);
        }
        return id;
    });

    const [cleSaisie, setCleSaisie] = useState('');
    const [erreur, setErreur] = useState(messageErreur || '');
    const [chargement, setChargement] = useState(false);
    const [voirCle, setVoirCle] = useState(false);
    const [copie, setCopie] = useState(false);

    // Synchronisation de l'erreur transmise en prop
    useEffect(() => {
        if (messageErreur) {
            setErreur(messageErreur);
        }
    }, [messageErreur]);

    const handleActiver = async (e) => {
        e.preventDefault();
        setErreur('');

        const cleUti = cleSaisie.trim();
        if (!cleUti) {
            setErreur('Veuillez saisir une clé d\'activation.');
            return;
        }

        setChargement(true);

        try {
            // Appel API sécurisé via le helper centralisé
            await fetchApi('/api/licence/activer', {
                method: 'POST',
                body: JSON.stringify({ cle: cleUti, hardwareId })
            });

            // Relance la vérification globale dans App.jsx
            onActivated(); 
        } catch (err) {
            setErreur(err.message || "Clé d'activation incorrecte ou serveur indisponible.");
        } finally {
            setChargement(false);
        }
    };

    const copierHardwareId = () => {
        navigator.clipboard.writeText(hardwareId);
        setCopie(true);
        setTimeout(() => setCopie(false), 2000);
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.card}>
                <h2 style={styles.title}>Activation du Logiciel</h2>
                <p style={styles.subtitle}>
                    Entrez la clé d'activation officielle pour débloquer l'accès complet.
                </p>

                {/* Encadré Hardware ID */}
                <div style={styles.idContainer} onClick={copierHardwareId} title="Cliquer pour copier">
                    <small style={styles.idLabel}>
                        Identifiant Machine {copie && <span style={{ color: '#28a745' }}>— Copié !</span>} :
                    </small>
                    <code style={styles.idCode}>{hardwareId}</code>
                </div>

                {/* Message d'erreur */}
                {erreur && <div style={styles.errorBox}>{erreur}</div>}

                <form onSubmit={handleActiver}>
                    <div style={{ position: 'relative', marginBottom: '15px' }}>
                        <input
                            type={voirCle ? "text" : "password"}
                            placeholder="Entrez votre clé d'activation..."
                            value={cleSaisie}
                            onChange={(e) => setCleSaisie(e.target.value)}
                            disabled={chargement}
                            style={styles.input}
                            autoFocus
                        />
                        <button
                            type="button"
                            onClick={() => setVoirCle(!voirCle)}
                            style={styles.toggleBtn}
                        >
                            {voirCle ? 'Masquer' : 'Afficher'}
                        </button>
                    </div>

                    <button 
                        type="submit"
                        disabled={chargement}
                        style={{
                            ...styles.submitBtn,
                            background: chargement ? '#6c757d' : '#28a745',
                            cursor: chargement ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {chargement ? 'Vérification...' : 'Activer la licence'}
                    </button>
                </form>
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
        height: '100vh',
        background: '#f4f6f9',
        fontFamily: 'Arial, sans-serif'
    },
    card: {
        background: '#fff',
        padding: '30px',
        borderRadius: '8px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
        width: '400px',
        textAlign: 'center'
    },
    title: {
        color: '#333',
        marginBottom: '10px'
    },
    subtitle: {
        fontSize: '13px',
        color: '#666',
        marginBottom: '20px'
    },
    idContainer: {
        background: '#f8f9fa',
        padding: '10px',
        borderRadius: '4px',
        marginBottom: '20px',
        border: '1px solid #ddd',
        cursor: 'pointer'
    },
    idLabel: {
        display: 'block',
        color: '#888',
        fontWeight: 'bold'
    },
    idCode: {
        fontSize: '13px',
        color: '#007bff',
        fontWeight: 'bold'
    },
    errorBox: {
        background: '#f8d7da',
        color: '#721c24',
        padding: '10px',
        borderRadius: '4px',
        marginBottom: '15px',
        fontSize: '13px',
        border: '1px solid #f5c6cb'
    },
    input: {
        width: '100%',
        padding: '12px 75px 12px 12px',
        fontSize: '14px',
        boxSizing: 'border-box',
        borderRadius: '4px',
        border: '1px solid #ccc'
    },
    toggleBtn: {
        position: 'absolute',
        right: '10px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        color: '#007bff',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: 'bold'
    },
    submitBtn: {
        width: '100%',
        padding: '12px',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        fontSize: '15px',
        fontWeight: 'bold'
    }
};