import React, { useState, useEffect, useCallback } from 'react';
import { fetchApi } from '../config/api';

export default function GestionEmployes() {
    const [nom, setNom] = useState('');
    const [pin, setPin] = useState('');
    const [voirPin, setVoirPin] = useState(false);
    const [recherche, setRecherche] = useState('');
    const [employes, setEmployes] = useState([]);
    const [message, setMessage] = useState('');
    const [chargement, setChargement] = useState(false);

    // Charger la liste des employés depuis le backend
    const chargerEmployes = useCallback(async () => {
        try {
            const data = await fetchApi('/api/utilisateurs');
            if (Array.isArray(data)) {
                // Filtrer uniquement les caissiers/employés
                setEmployes(data.filter(u => u.role === 'EMPLOYE' || u.role === 'CAISSIER'));
            } else {
                setMessage("❌ Format de réponse invalide pour la liste des caissiers.");
            }
        } catch (err) {
            console.error("Erreur de chargement des employés :", err);
            setMessage(`❌ ${err.message || "Erreur de connexion au serveur backend."}`);
        }
    }, []);

    useEffect(() => {
        chargerEmployes();
    }, [chargerEmployes]);

    // Ajouter un nouvel employé / caissier
    const handleCreerEmploye = async (e) => {
        e.preventDefault();
        setMessage('');

        const nomClean = nom.trim();
        const pinClean = pin.trim();

        if (!/^\d{4,6}$/.test(pinClean)) {
            setMessage("❌ Le code PIN doit contenir entre 4 et 6 chiffres.");
            return;
        }

        setChargement(true);

        try {
            await fetchApi('/api/utilisateurs', {
                method: 'POST',
                body: JSON.stringify({
                    nom: nomClean,
                    role: 'EMPLOYE',
                    code_pin: pinClean
                })
            });

            setMessage("🎉 Compte caissier créé avec succès !");
            setNom('');
            setPin('');
            chargerEmployes();
        } catch (err) {
            console.error("Erreur création employé :", err);
            setMessage(`❌ ${err.message || "Erreur lors de la création du compte."}`);
        } finally {
            setChargement(false);
        }
    };

    // Supprimer un employé
    const handleSupprimer = async (id, nomEmp) => {
        if (!window.confirm(`Voulez-vous vraiment supprimer le caissier "${nomEmp}" ?`)) {
            return;
        }

        try {
            await fetchApi(`/api/utilisateurs/${id}`, {
                method: 'DELETE'
            });

            setMessage(`✅ Caissier "${nomEmp}" supprimé avec succès.`);
            chargerEmployes();
        } catch (err) {
            console.error("Erreur suppression employé :", err);
            setMessage(`❌ ${err.message || "Impossible de supprimer le caissier."}`);
        }
    };

    // Filtrage des employés selon le champ de recherche
    const employesFiltres = employes.filter(emp =>
        emp.nom ? emp.nom.toLowerCase().includes(recherche.toLowerCase()) : false
    );

    return (
        <div style={styles.container}>
            <h3 style={styles.title}>👥 Gestion des Comptes Caissiers</h3>
            
            {/* Formulaire d'ajout */}
            <form onSubmit={handleCreerEmploye} style={styles.form}>
                <input 
                    type="text" 
                    placeholder="Nom complet du caissier" 
                    value={nom} 
                    onChange={(e) => setNom(e.target.value)} 
                    required 
                    style={styles.inputFlex}
                />
                
                <div style={styles.pinWrapper}>
                    <input 
                        type={voirPin ? "text" : "password"} 
                        placeholder="PIN (4 à 6 chiffres)" 
                        value={pin} 
                        maxLength={6}
                        onChange={(e) => setPin(e.target.value)} 
                        required 
                        style={styles.inputPin}
                    />
                    <button 
                        type="button" 
                        onClick={() => setVoirPin(!voirPin)} 
                        style={styles.togglePinBtn}
                        title="Afficher/Masquer PIN"
                    >
                        {voirPin ? '🙈' : '👁️'}
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
                    {chargement ? 'Création...' : '+ Ajouter'}
                </button>
            </form>

            {/* Notification message */}
            {message && (
                <div style={{
                    ...styles.alertBox,
                    background: message.startsWith('🎉') || message.startsWith('✅') ? '#d4edda' : '#f8d7da',
                    color: message.startsWith('🎉') || message.startsWith('✅') ? '#155724' : '#721c24'
                }}>
                    {message}
                </div>
            )}

            {/* Champ de recherche & En-tête liste */}
            <div style={styles.headerTable}>
                <h4 style={{ margin: 0 }}>Liste des Caissiers ({employesFiltres.length})</h4>
                <input 
                    type="text" 
                    placeholder="🔍 Rechercher un caissier..." 
                    value={recherche} 
                    onChange={(e) => setRecherche(e.target.value)} 
                    style={styles.searchInput}
                />
            </div>

            {/* Tableau des employés */}
            <table style={styles.table}>
                <thead>
                    <tr style={styles.thRow}>
                        <th style={styles.th}>ID</th>
                        <th style={styles.th}>Nom</th>
                        <th style={styles.th}>Rôle</th>
                        <th style={styles.th}>Code PIN</th>
                        <th style={{ ...styles.th, textAlign: 'center' }}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {employesFiltres.map(emp => (
                        <tr key={emp._id || emp.id} style={styles.tr}>
                            <td style={styles.td}>{emp._id || emp.id}</td>
                            <td style={{ ...styles.td, fontWeight: 'bold' }}>{emp.nom}</td>
                            <td style={styles.td}>
                                <span style={styles.badgeRole}>{emp.role}</span>
                            </td>
                            <td style={styles.td}>••••</td>
                            <td style={{ ...styles.td, textAlign: 'center' }}>
                                <button 
                                    onClick={() => handleSupprimer(emp._id || emp.id, emp.nom)} 
                                    style={styles.deleteBtn}
                                    title="Supprimer le caissier"
                                >
                                    🗑️ Supprimer
                                </button>
                            </td>
                        </tr>
                    ))}
                    {employesFiltres.length === 0 && (
                        <tr>
                            <td colSpan="5" style={styles.emptyTd}>
                                Aucun caissier trouvé.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

// Inline Styles
const styles = {
    container: {
        maxWidth: '750px',
        margin: '0 auto',
        background: '#fff',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        fontFamily: 'Arial, sans-serif'
    },
    title: {
        marginTop: 0,
        marginBottom: '20px',
        color: '#333'
    },
    form: {
        display: 'flex',
        gap: '10px',
        marginBottom: '15px'
    },
    inputFlex: {
        flex: 1,
        padding: '10px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        fontSize: '14px'
    },
    pinWrapper: {
        position: 'relative',
        width: '180px'
    },
    inputPin: {
        width: '100%',
        padding: '10px 35px 10px 10px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        fontSize: '14px',
        boxSizing: 'border-box'
    },
    togglePinBtn: {
        position: 'absolute',
        right: '8px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '14px'
    },
    submitBtn: {
        padding: '10px 20px',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        fontWeight: 'bold',
        fontSize: '14px'
    },
    alertBox: {
        padding: '10px 15px',
        borderRadius: '4px',
        marginBottom: '15px',
        fontSize: '14px',
        fontWeight: 'bold'
    },
    headerTable: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '10px',
        marginTop: '20px'
    },
    searchInput: {
        padding: '6px 12px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        fontSize: '13px',
        width: '200px'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse'
    },
    thRow: {
        background: '#f8f9fa',
        textAlign: 'left'
    },
    th: {
        padding: '10px',
        borderBottom: '2px solid #ddd',
        fontSize: '13px',
        color: '#555'
    },
    tr: {
        borderBottom: '1px solid #eee'
    },
    td: {
        padding: '10px',
        fontSize: '14px'
    },
    badgeRole: {
        background: '#e9ecef',
        padding: '3px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        color: '#495057',
        fontWeight: 'bold'
    },
    deleteBtn: {
        background: '#dc3545',
        color: '#fff',
        border: 'none',
        padding: '5px 10px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '12px'
    },
    emptyTd: {
        padding: '15px',
        textAlign: 'center',
        color: '#888',
        fontSize: '14px'
    }
};