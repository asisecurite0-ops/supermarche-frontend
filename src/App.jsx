import React, { useState, useEffect, useCallback } from 'react';
import Activation from './components/Activation';
import Login from './components/Login';
import PremierCompte from './components/PremierCompte';
import DashboardEmploye from './components/employe/DashboardEmploye';
import Dashboard from './components/patron/Dashboard';
import { fetchApi } from './config/api';

export default function App() {
    const [licenceState, setLicenceState] = useState({
        chargement: true,
        autorise: false,
        mode: 'ESSAI',
        joursRestants: 7,
        erreur: null
    });

    const [premierCompteExiste, setPremierCompteExiste] = useState(false);
    const [utilisateur, setUtilisateur] = useState(null);

    // Vérification de la licence auprès du backend Cloud (Render)
    const verifierLicence = useCallback(async () => {
        try {
            const data = await fetchApi('/api/licence/verifier');

            if (data && data.autorise) {
                setLicenceState({
                    chargement: false,
                    autorise: true,
                    mode: data.mode,
                    joursRestants: data.joursRestants ?? 0,
                    erreur: null
                });
            } else {
                setLicenceState({
                    chargement: false,
                    autorise: false,
                    mode: 'BLOQUE',
                    joursRestants: 0,
                    erreur: data?.erreur || "Licence non valide ou expirée."
                });
            }
        } catch (err) {
            console.error("Erreur de connexion au serveur backend :", err);
            setLicenceState({
                chargement: false,
                autorise: false,
                mode: 'BLOQUE',
                joursRestants: 0,
                erreur: "Connexion au serveur impossible. Vérifiez votre réseau ou attendez le réveil du serveur."
            });
        }
    }, []);

    // Vérification des comptes existants sur MongoDB Atlas
    const verifierComptes = useCallback(async () => {
        try {
            const data = await fetchApi('/api/auth/initialise');
            if (data) {
                setPremierCompteExiste(Boolean(data.compteExiste));
            }
        } catch (err) {
            console.error("Erreur de vérification des comptes :", err);
            setPremierCompteExiste(false);
        }
    }, []);

    useEffect(() => {
        verifierLicence();
        verifierComptes();
    }, [verifierLicence, verifierComptes]);

    if (licenceState.chargement) {
        return (
            <div style={styles.loadingContainer}>
                <h2>Connexion et vérification de la licence en cours...</h2>
            </div>
        );
    }

    if (!licenceState.autorise) {
        return (
            <Activation 
                messageErreur={licenceState.erreur} 
                onActivated={verifierLicence} 
            />
        );
    }

    if (!premierCompteExiste) {
        return (
            <PremierCompte 
                onCreated={() => {
                    verifierComptes();
                }} 
            />
        );
    }

    return (
        <div className="app-container">
            {licenceState.mode === 'ESSAI' && (
                <div style={styles.bannerEssai}>
                    ⏳ Période d'essai active — {licenceState.joursRestants} jour(s) restant(s).
                </div>
            )}

            <style>{`
                @media print {
                    body * { visibility: hidden !important; }
                    #section-rapport-patron, #section-rapport-patron *,
                    #section-a-imprimer, #section-a-imprimer * {
                        visibility: visible !important;
                    }
                    #section-rapport-patron, #section-a-imprimer {
                        display: block !important;
                        position: absolute !important;
                        left: 0 !important; top: 0 !important;
                        width: 100% !important; background: #fff !important;
                    }
                    button, form, nav, header, .no-print { display: none !important; }
                }
            `}</style>

            {!utilisateur && (
                <Login onLoginSuccess={(user) => setUtilisateur(user)} />
            )}

            {utilisateur && (utilisateur.role === 'EMPLOYE' || utilisateur.role === 'CAISSIER') && (
                <DashboardEmploye 
                    utilisateur={utilisateur} 
                    onLogout={() => setUtilisateur(null)} 
                />
            )}

            {utilisateur && (utilisateur.role === 'PATRON' || utilisateur.role === 'GERANT') && (
                <Dashboard 
                    utilisateur={utilisateur} 
                    onLogout={() => setUtilisateur(null)} 
                    onRefreshLicence={verifierLicence}
                />
            )}

            {utilisateur && !['EMPLOYE', 'CAISSIER', 'PATRON', 'GERANT'].includes(utilisateur.role) && (
                <div style={styles.unknownRoleContainer}>
                    <h2>Rôle non reconnu. Veuillez contacter le support.</h2>
                    <button onClick={() => setUtilisateur(null)}>Retour à la connexion</button>
                </div>
            )}
        </div>
    );
}

const styles = {
    loadingContainer: {
        textAlign: 'center',
        marginTop: '100px',
        fontFamily: 'sans-serif'
    },
    bannerEssai: {
        background: '#fff3cd',
        color: '#856404',
        padding: '8px 15px',
        textAlign: 'center',
        fontSize: '0.9rem',
        borderBottom: '1px solid #ffeeba',
        fontWeight: 'bold'
    },
    unknownRoleContainer: {
        textAlign: 'center',
        marginTop: '50px'
    }
};