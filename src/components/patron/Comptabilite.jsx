import React, { useState, useEffect } from 'react';
import { fetchApi } from '../../config/api';

export default function Comptabilite() {
    const [donnees, setDonnees] = useState({
        chiffre_affaires: 0,
        cout_total_achat: 0,
        marge_brute: 0,
        total_charges: 0,
        benefice_net_reel: 0,
        valeur_stock_total: 0,
        total_dettes_fournisseurs: 0,
        ventes: [],
        topProduits: []
    });
    const [chargement, setChargement] = useState(true);

    useEffect(() => {
        // Récupération simultanée des stats Pro et des listes
        Promise.all([
            fetchApi('/api/patron/comptabilite-pro'),
            fetchApi('/api/patron/comptabilite')
        ])
            .then(([dataPro, dataStandard]) => {
                setDonnees({
                    ...dataPro,
                    ventes: dataStandard.ventes || [],
                    topProduits: dataStandard.topProduits || []
                });
                setChargement(false);
            })
            .catch(err => {
                console.error('Erreur chargement comptabilité :', err);
                setChargement(false);
            });
    }, []);

    // Fonction d'attribution de style pour les badges de paiement
    const getPaiementBadgeStyle = (mode) => {
        switch (mode?.toUpperCase()) {
            case 'ESPECES':
            case 'ESPÈCES':
                return { background: '#d4edda', color: '#155724' };
            case 'MOBILE_MONEY':
            case 'MOBILE MONEY':
                return { background: '#fff3cd', color: '#856404' };
            case 'CARTE':
            case 'CARTE BANCAIRE':
                return { background: '#cce5ff', color: '#004085' };
            default:
                return { background: '#e9ecef', color: '#383d41' };
        }
    };

    if (chargement) return <p style={{ padding: '20px' }}>Chargement des bilans comptables...</p>;

    return (
        <div id="section-rapport-patron">
            {/* Bloc 1 : Compte de Résultat & Bilan d'Actif (PRO) */}
            <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '25px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <div>
                        <h3 style={{ margin: 0, color: '#333' }}>Bilan Financier & Compte de Résultat Pro</h3>
                        <p style={{ color: '#666', margin: '5px 0 0 0' }}>Vue consolidée intégrant les ventes, les charges d'exploitation, les stocks et les dettes fournisseurs.</p>
                    </div>
                    <button 
                        onClick={() => window.print()} 
                        style={{ padding: '8px 16px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        🖨️ Imprimer Rapport
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '20px' }}>
                    <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', borderLeft: '5px solid #007bff' }}>
                        <h4 style={{ margin: '0 0 5px 0', color: '#555', fontSize: '14px' }}>Chiffre d'Affaires Global</h4>
                        <h2 style={{ margin: 0, color: '#007bff', fontSize: '22px' }}>
                            {Number(donnees.chiffre_affaires || 0).toLocaleString('fr-FR')} FCFA
                        </h2>
                    </div>

                    <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', borderLeft: '5px solid #dc3545' }}>
                        <h4 style={{ margin: '0 0 5px 0', color: '#555', fontSize: '14px' }}>Coût d'Achat Marchandises</h4>
                        <h2 style={{ margin: 0, color: '#dc3545', fontSize: '22px' }}>
                            {Number(donnees.cout_total_achat || 0).toLocaleString('fr-FR')} FCFA
                        </h2>
                    </div>

                    <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', borderLeft: '5px solid #ffc107' }}>
                        <h4 style={{ margin: '0 0 5px 0', color: '#555', fontSize: '14px' }}>Charges d'Exploitation</h4>
                        <h2 style={{ margin: 0, color: '#d39e00', fontSize: '22px' }}>
                            {Number(donnees.total_charges || 0).toLocaleString('fr-FR')} FCFA
                        </h2>
                    </div>

                    <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', borderLeft: '5px solid #17a2b8' }}>
                        <h4 style={{ margin: '0 0 5px 0', color: '#555', fontSize: '14px' }}>Valeur du Stock Actuel (Actif)</h4>
                        <h2 style={{ margin: 0, color: '#17a2b8', fontSize: '22px' }}>
                            {Number(donnees.valeur_stock_total || 0).toLocaleString('fr-FR')} FCFA
                        </h2>
                    </div>

                    <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', borderLeft: '5px solid #6c757d' }}>
                        <h4 style={{ margin: '0 0 5px 0', color: '#555', fontSize: '14px' }}>Dettes Fournisseurs (Passif)</h4>
                        <h2 style={{ margin: 0, color: '#6c757d', fontSize: '22px' }}>
                            {Number(donnees.total_dettes_fournisseurs || 0).toLocaleString('fr-FR')} FCFA
                        </h2>
                    </div>
                </div>

                <div style={{ 
                    background: donnees.benefice_net_reel >= 0 ? '#e2f0d9' : '#f8d7da', 
                    padding: '20px', 
                    borderRadius: '8px', 
                    borderLeft: `5px solid ${donnees.benefice_net_reel >= 0 ? '#28a745' : '#dc3545'}` 
                }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Bénéfice Net Réel (Après Charges & Achats)</h4>
                    <h1 style={{ margin: '0 0 5px 0', color: donnees.benefice_net_reel >= 0 ? '#28a745' : '#dc3545' }}>
                        {Number(donnees.benefice_net_reel || 0).toLocaleString('fr-FR')} FCFA
                    </h1>
                    <p style={{ margin: 0, fontWeight: 'bold', color: '#555' }}>
                        Marge Brute Globale : {Number(donnees.marge_brute || 0).toLocaleString('fr-FR')} FCFA
                    </p>
                </div>
            </div>

            {/* Bloc 2 : Détail des Ventes par Produit */}
            <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '25px' }}>
                <h3 style={{ marginTop: 0, color: '#333' }}>Détail des Ventes par Article</h3>
                <p style={{ color: '#666', marginBottom: '15px' }}>Classement des produits selon les quantités vendues en caisse.</p>

                {(!donnees.topProduits || donnees.topProduits.length === 0) ? (
                    <p style={{ color: '#777' }}>Aucun produit vendu pour l'instant.</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #ddd', textAlign: 'left' }}>
                                <th style={{ padding: '10px' }}>Produit</th>
                                <th style={{ padding: '10px' }}>Quantité Totale Vendue</th>
                                <th style={{ padding: '10px', textAlign: 'right' }}>Chiffre d'Affaires Généré</th>
                            </tr>
                        </thead>
                        <tbody>
                            {donnees.topProduits.map((p, index) => (
                                <tr key={p.id || index} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '10px', fontWeight: 'bold' }}>{p.nom}</td>
                                    <td style={{ padding: '10px' }}>{p.quantite_vendue} unité(s)</td>
                                    <td style={{ padding: '10px', color: '#28a745', fontWeight: 'bold', textAlign: 'right' }}>
                                        {Number(p.ca_produit || 0).toLocaleString('fr-FR')} FCFA
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Bloc 3 : Journal des Ventes Chronologique */}
            <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #ddd' }}>
                <h3 style={{ marginTop: 0, color: '#333' }}>Journal Chronologique des Tickets de Caisse</h3>
                <p style={{ color: '#666', marginBottom: '20px' }}>Traçabilité complète de chaque encaissement.</p>

                {(!donnees.ventes || donnees.ventes.length === 0) ? (
                    <p style={{ color: '#777' }}>Aucun ticket enregistré pour le moment.</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #ddd', textAlign: 'left' }}>
                                <th style={{ padding: '10px' }}>N° Ticket</th>
                                <th style={{ padding: '10px' }}>Date & Heure</th>
                                <th style={{ padding: '10px' }}>Caissier(e)</th>
                                <th style={{ padding: '10px' }}>Paiement</th>
                                <th style={{ padding: '10px', textAlign: 'right' }}>Montant Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {donnees.ventes.map((v, index) => (
                                <tr key={v.id || v._id || index} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '10px', fontWeight: 'bold' }}>#{v.id || index + 1}</td>
                                    <td style={{ padding: '10px', fontSize: '13px', color: '#555' }}>
                                        {v.date_vente || v.createdAt ? new Date(v.date_vente || v.createdAt).toLocaleString('fr-FR') : '-'}
                                    </td>
                                    <td style={{ padding: '10px' }}>{v.employe_nom || 'Anonyme'}</td>
                                    <td style={{ padding: '10px' }}>
                                        <span style={{ 
                                            padding: '4px 8px', 
                                            borderRadius: '4px', 
                                            fontSize: '12px', 
                                            fontWeight: 'bold',
                                            ...getPaiementBadgeStyle(v.mode_paiement)
                                        }}>
                                            {v.mode_paiement || 'ESPECES'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '10px', color: '#28a745', fontWeight: 'bold', textAlign: 'right' }}>
                                        {Number(v.montant_total || 0).toLocaleString('fr-FR')} FCFA
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}