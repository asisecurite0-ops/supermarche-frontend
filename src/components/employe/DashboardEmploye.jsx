import React, { useState } from 'react';
import Caisse from './Caisse';
import ConsultationStock from './ConsultationStock';

export default function DashboardEmploye({ utilisateur, onLogout }) {
    const [ongletActif, setOngletActif] = useState('caisse');

    const menus = [
        { id: 'caisse', label: '🛒 Caisse & Encaissement' },
        { id: 'stock', label: '📦 Consultation Stocks & Prix' },
    ];

    // Extraction sécurisée de l'identité de l'agent
    const nomAgent = utilisateur?.nom || utilisateur?.prenom || utilisateur?.email || 'Caissier';

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f4f6f9', fontFamily: 'Arial, sans-serif' }}>
            {/* Directives pour masquer la navigation lors des impressions de tickets */}
            <style>
                {`
                    @media print {
                        header, .no-print {
                            display: none !important;
                        }
                        main {
                            padding: 0 !important;
                        }
                    }
                    @media (max-width: 768px) {
                        .header-container {
                            flex-direction: column !important;
                            gap: 12px !important;
                            align-items: flex-start !important;
                        }
                        .menu-buttons {
                            width: 100% !important;
                            flex-wrap: wrap !important;
                        }
                    }
                `}
            </style>

            {/* Barre de navigation supérieure */}
            <header 
                className="no-print header-container" 
                style={{ 
                    background: '#212529', 
                    color: '#fff', 
                    padding: '15px 25px', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)' 
                }}
            >
                <div>
                    <h2 style={{ margin: 0, fontSize: '18px', letterSpacing: '0.5px' }}>
                        Supermarché App — Espace Caissier / Gérant
                    </h2>
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#adb5bd' }}>
                        Agent : <strong style={{ color: '#fff' }}>{nomAgent}</strong>
                    </p>
                </div>

                <div className="menu-buttons" role="tablist" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {/* Navigation par onglets */}
                    {menus.map(menu => {
                        const estActif = ongletActif === menu.id;
                        return (
                            <button 
                                key={menu.id}
                                role="tab"
                                aria-selected={estActif}
                                onClick={() => setOngletActif(menu.id)}
                                style={{ 
                                    padding: '9px 16px', 
                                    backgroundColor: estActif ? '#0d6efd' : 'transparent', 
                                    color: '#fff', 
                                    border: estActif ? '1px solid #0d6efd' : '1px solid #6c757d', 
                                    borderRadius: '5px', 
                                    cursor: 'pointer', 
                                    fontWeight: estActif ? 'bold' : 'normal',
                                    transition: 'all 0.2s ease-in-out'
                                }}
                            >
                                {menu.label}
                            </button>
                        );
                    })}

                    <div style={{ width: '1px', height: '25px', backgroundColor: '#495057', margin: '0 5px' }} />

                    {/* Bouton de déconnexion sécurisé */}
                    <button 
                        onClick={() => onLogout && onLogout()}
                        style={{ 
                            padding: '9px 16px', 
                            backgroundColor: '#dc3545', 
                            color: '#fff', 
                            border: 'none', 
                            borderRadius: '5px', 
                            cursor: 'pointer', 
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                        }}
                    >
                        🚪 Déconnexion
                    </button>
                </div>
            </header>

            {/* Contenu principal */}
            <main style={{ padding: '25px' }}>
                {ongletActif === 'caisse' && <Caisse utilisateur={utilisateur} />}
                {ongletActif === 'stock' && <ConsultationStock utilisateur={utilisateur} />}
            </main>
        </div>
    );
}