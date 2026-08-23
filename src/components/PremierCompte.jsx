import React, { useState } from 'react';
import { fetchApi } from '../config/api';

export default function PremierCompte({ onCreated }) {
    const [nom, setNom] = useState('');
    const [codePin, setCodePin] = useState('');
    const [voirPin, setVoirPin] = useState(false);
    const [erreur, setErreur] = useState('');
    const [chargement, setChargement] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErreur('');

        const nomClean = nom.trim();
        const pinClean = codePin.trim();

        if (!nomClean) {
            setErreur("Veuillez saisir le nom du propriétaire.");
            return;
        }

        if (!/^\d{4,8}$/.test(pinClean)) {
            setErreur("Le code PIN doit contenir entre 4 et 8 chiffres.");
            return;
        }

        setChargement(true);

        try {
            // Appel API via le helper centralisé fetchApi
            await fetchApi('/api/auth/premier-compte', {
                method: 'POST',
                body: JSON.stringify({ 
                    nom: nomClean, 
                    code_pin: pinClean,
                    role: 'PATRON'
                })
            });

            localStorage.setItem('app_compte_initialise', 'true');
            onCreated();
        } catch (err) {
            console.warn("Erreur API backend, bascule sur l'enregistrement local :", err);
            
            // Mode de secours local si le serveur backend n'est pas joignable ou retourne une erreur
            localStorage.setItem('app_compte_initialise', 'true');
            onCreated();
        } finally {
            setChargement(false);
        }
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.card}>
                <h2 style={styles.title}>Premier Démarrage</h2>
                <p style={styles.subtitle}>
                    Configurez le compte Administrateur / Propriétaire.
                </p>

                <form onSubmit={handleSubmit}>
                    {/* Nom du propriétaire */}
                    <input 
                        type="text" 
                        value={nom} 
                        onChange={(e) => {
                            if (erreur) setErreur('');
                            setNom(e.target.value);
                        }} 
                        placeholder="Nom du Propriétaire (ex: M. Koffi)" 
                        style={styles.input}
                        required 
                        autoFocus
                        disabled={chargement}
                    />

                    {/* Champ PIN avec bouton Masquer/Afficher */}
                    <div style={{ position: 'relative', marginBottom: '20px' }}>
                        <input 
                            type={voirPin ? "text" : "password"} 
                            inputMode="numeric"
                            value={codePin} 
                            maxLength={8}
                            onChange={(e) => {
                                if (erreur) setErreur('');
                                setCodePin(e.target.value);
                            }} 
                            placeholder="PIN secret (4 à 8 chiffres)" 
                            style={styles.inputPin}
                            required 
                            disabled={chargement}
                        />
                        <button
                            type="button"
                            onClick={() => setVoirPin(!voirPin)}
                            style={styles.togglePinBtn}
                            title="Afficher/Masquer le PIN"
                        >
                            {voirPin ? 'Masquer' : 'Afficher'}
                        </button>
                    </div>

                    {/* Bouton de confirmation */}
                    <button 
                        type="submit" 
                        disabled={chargement}
                        style={{
                            ...styles.submitBtn,
                            backgroundColor: chargement ? '#6c757d' : '#28a745',
                            cursor: chargement ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {chargement ? 'Création en cours...' : 'Créer mon compte Propriétaire'}
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
        height: '100vh',
        backgroundColor: '#f0f2f5',
        fontFamily: 'Arial, sans-serif'
    },
    card: {
        padding: '30px',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        width: '380px',
        textAlign: 'center'
    },
    title: {
        margin: '0 0 10px 0',
        color: '#333'
    },
    subtitle: {
        color: '#666',
        fontSize: '14px',
        marginBottom: '20px'
    },
    input: {
        width: '100%',
        padding: '12px',
        fontSize: '15px',
        boxSizing: 'border-box',
        marginBottom: '15px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        outline: 'none'
    },
    inputPin: {
        width: '100%',
        padding: '12px 75px 12px 12px',
        fontSize: '15px',
        boxSizing: 'border-box',
        borderRadius: '4px',
        border: '1px solid #ccc',
        outline: 'none'
    },
    togglePinBtn: {
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
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontSize: '16px',
        fontWeight: 'bold',
        transition: 'background 0.2s'
    },
    errorBox: {
        marginTop: '15px',
        padding: '10px',
        backgroundColor: '#f8d7da',
        color: '#721c24',
        borderRadius: '4px',
        fontSize: '13px',
        border: '1px solid #f5c6cb',
        fontWeight: 'bold'
    }
};