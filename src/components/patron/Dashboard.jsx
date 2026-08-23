import React, { useState, useEffect, useCallback } from 'react';
import { fetchApi } from '../../config/api';
import Comptabilite from './Comptabilite';
import GestionStock from './GestionStock';
import GestionFournisseurs from './GestionFournisseurs';
import GestionDettes from './GestionDettes';
import CapitauxPropres from './CapitauxPropres';
import Immobilisations from './Immobilisations';
import Charges from './Charges';
import HistoriqueVentes from './HistoriqueVentes';
import ProfilDeveloppeur from './ProfilDeveloppeur';
import SecuritySettings from '../SecuritySettings';

// Section de gestion des caissiers / employés
function GestionEmployes() {
    const [nom, setNom] = useState('');
    const [pin, setPin] = useState('');
    const [employes, setEmployes] = useState([]);
    const [message, setMessage] = useState('');

    const chargerEmployes = useCallback(async () => {
        try {
            const data = await fetchApi('/api/utilisateurs');
            const liste = Array.isArray(data) ? data : (data.utilisateurs || []);
            setEmployes(liste.filter(u => u.role === 'EMPLOYE' || u.role === 'CAISSIER'));
        } catch (err) {
            setMessage("❌ Erreur de chargement de la liste des employés.");
        }
    }, []);

    useEffect(() => {
        chargerEmployes();
    }, [chargerEmployes]);

    const handleCreerEmploye = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            const data = await fetchApi('/api/utilisateurs', {
                method: 'POST',
                body: JSON.stringify({
                    nom: nom.trim(),
                    role: 'EMPLOYE',
                    code_pin: pin.trim()
                })
            });

            setMessage("🎉 Compte caissier créé avec succès !");
            setNom('');
            setPin('');
            chargerEmployes();
        } catch (err) {
            setMessage(`❌ ${err.message || "Erreur de création"}`);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <h3 style={{ marginTop: 0, color: '#1e293b' }}>👥 Créer & Gérer les Comptes Caissiers</h3>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
                Créez les accès pour vos caissiers. Ils pourront encaisser les ventes sans accéder aux bilans financiers.
            </p>

            <form onSubmit={handleCreerEmploye} style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <input 
                    type="text" 
                    placeholder="Nom du caissier..." 
                    value={nom} 
                    onChange={(e) => setNom(e.target.value)} 
                    required 
                    style={{ flex: '1', minWidth: '200px', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                />
                <input 
                    type="password" 
                    placeholder="Code PIN" 
                    value={pin} 
                    onChange={(e) => setPin(e.target.value)} 
                    required 
                    style={{ width: '140px', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                />
                <button 
                    type="submit" 
                    style={{ padding: '12px 24px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    + Créer Caissier
                </button>
            </form>

            {message && (
                <div style={{ padding: '12px', marginBottom: '20px', borderRadius: '8px', background: message.startsWith('🎉') ? '#dcfce7' : '#fee2e2', color: message.startsWith('🎉') ? '#166534' : '#991b1b', fontWeight: 'bold', fontSize: '14px' }}>
                    {message}
                </div>
            )}

            <h4 style={{ color: '#334155', marginBottom: '12px' }}>Caissiers Enregistrés</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: '#f8fafc', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
                        <th style={{ padding: '10px' }}>ID</th>
                        <th style={{ padding: '10px' }}>Nom</th>
                        <th style={{ padding: '10px' }}>Rôle</th>
                        <th style={{ padding: '10px' }}>Code PIN</th>
                    </tr>
                </thead>
                <tbody>
                    {employes.map((emp, index) => (
                        <tr key={emp.id || emp._id || index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '10px' }}>{emp.id || emp._id || index + 1}</td>
                            <td style={{ padding: '10px', fontWeight: 'bold' }}>{emp.nom}</td>
                            <td style={{ padding: '10px' }}>{emp.role}</td>
                            <td style={{ padding: '10px' }}>••••</td>
                        </tr>
                    ))}
                    {employes.length === 0 && (
                        <tr>
                            <td colSpan="4" style={{ padding: '16px', textAlign: 'center', color: '#94a3b8' }}>
                                Aucun caissier enregistré.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default function DashboardPatron({ utilisateur, onLogout, onRefreshLicence }) {
    const [onglet, setOnglet] = useState('dashboard');

    const handleImprimerRapport = () => {
        window.print();
    };

    const navItems = [
        { id: 'dashboard', label: 'Tableau de Bord', color: '#007bff' },
        { id: 'ventes', label: 'Journal des Ventes', color: '#007bff' },
        { id: 'stocks', label: 'Gestion des Stocks (Classe 3)', color: '#007bff' },
        { id: 'fournisseurs', label: 'Fournisseurs & Tiers (Classe 4)', color: '#007bff' },
        { id: 'dettes', label: 'Gestion des Dettes', color: '#007bff' },
        { id: 'charges', label: 'Charges & Salaires (Classe 6)', color: '#e0a800', textColor: '#000', isBold: true },
        { id: 'capitaux', label: 'Capitaux Propres (Classe 1)', color: '#28a745' },
        { id: 'immobilisations', label: 'Actif Immobilisé (Classe 2)', color: '#28a745' },
        { id: 'employes', label: '👥 Caissiers & Employés', color: '#0d9488' },
        { id: 'securite', label: '⚙️ Sécurité & Licence', color: '#17a2b8' },
        { id: 'profil', label: '👨‍💻 Contacts Développeur', color: '#6f42c1' },
    ];

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
            <style>
                {`
                    @media print {
                        header, nav, .no-print {
                            display: none !important;
                        }
                        body, div {
                            background: white !important;
                            padding: 0 !important;
                        }
                        #section-rapport-patron {
                            width: 100% !important;
                            border: none !important;
                            box-shadow: none !important;
                        }
                    }
                `}
            </style>

            <header className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', backgroundColor: '#fff', padding: '15px 20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <h2 style={{ margin: 0, color: '#333', fontSize: '20px' }}>
                    Espace Patron - SYSCOHADA : <span style={{ color: '#007bff' }}>{utilisateur?.nom || 'Propriétaire'}</span>
                </h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                        onClick={handleImprimerRapport} 
                        style={{ padding: '9px 16px', backgroundColor: '#17a2b8', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                        🖨️ Imprimer ce Rapport
                    </button>
                    <button 
                        onClick={onLogout} 
                        style={{ padding: '9px 16px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Déconnexion
                    </button>
                </div>
            </header>

            <nav className="no-print" style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {navItems.map(item => {
                    const estActif = onglet === item.id;
                    const bgStyle = estActif ? (item.color || '#007bff') : '#fff';
                    const textStyle = estActif ? (item.textColor || '#fff') : '#495057';

                    return (
                        <button
                            key={item.id}
                            onClick={() => setOnglet(item.id)}
                            style={{
                                padding: '10px 16px',
                                background: bgStyle,
                                color: textStyle,
                                border: estActif ? `1px solid ${item.color || '#007bff'}` : '1px solid #ced4da',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontWeight: estActif || item.isBold ? 'bold' : 'normal',
                                transition: 'all 0.2s ease-in-out',
                                boxShadow: estActif ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                            }}
                        >
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            <main id="section-rapport-patron">
                {onglet === 'dashboard' && <Comptabilite />}
                {onglet === 'ventes' && <HistoriqueVentes />}
                {onglet === 'stocks' && <GestionStock />}
                {onglet === 'fournisseurs' && <GestionFournisseurs />}
                {onglet === 'dettes' && <GestionDettes />}
                {onglet === 'charges' && <Charges />}
                {onglet === 'capitaux' && <CapitauxPropres />}
                {onglet === 'immobilisations' && <Immobilisations />}
                {onglet === 'employes' && <GestionEmployes />}
                {onglet === 'securite' && <SecuritySettings onLicenceActivated={onRefreshLicence} />}
                {onglet === 'profil' && <ProfilDeveloppeur />}
            </main>
        </div>
    );
}