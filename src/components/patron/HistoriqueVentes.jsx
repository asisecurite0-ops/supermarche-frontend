import React, { useState, useEffect, useCallback } from 'react';
import { fetchApi } from '../../config/api';

export default function HistoriqueVentes() {
    const [ventes, setVentes] = useState([]);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState('');
    const [filtreDate, setFiltreDate] = useState('');
    const [filtreCaissier, setFiltreCaissier] = useState('');
    const [venteAffichee, setVenteAffichee] = useState(null); // Pour la vue détaillée des articles

    const chargerVentes = useCallback(async () => {
        setChargement(true);
        setErreur('');
        try {
            let data;
            try {
                data = await fetchApi('/api/ventes');
            } catch (err) {
                // Route de repli si la première échoue
                data = await fetchApi('/api/proprietaire/ventes');
            }
            const liste = Array.isArray(data) ? data : (data.ventes || data.data || []);
            setVentes(liste);
        } catch (err) {
            console.error('Erreur lors du chargement des ventes:', err);
            setErreur('Impossible de charger le journal des ventes.');
        } finally {
            setChargement(false);
        }
    }, []);

    useEffect(() => {
        chargerVentes();
    }, [chargerVentes]);

    // Formater une date pour comparaison ou affichage
    const formaterDateLisible = (dateStr) => {
        if (!dateStr) return 'N/A';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Normaliser la date (AAAA-MM-JJ) pour le filtre
    const extraireDateYMD = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr.split(' ')[0] || '';
        return d.toISOString().split('T')[0];
    };

    // Filtrage des ventes
    const ventesFiltrees = ventes.filter(v => {
        const dateVenteYMD = extraireDateYMD(v.date_vente || v.createdAt || v.date);
        const correspondDate = filtreDate ? dateVenteYMD === filtreDate : true;
        const caissierNom = v.employe_nom || v.caissier || v.vendeur || '';
        const correspondCaissier = filtreCaissier ? caissierNom.toLowerCase().includes(filtreCaissier.toLowerCase()) : true;
        return correspondDate && correspondCaissier;
    });

    // Calculs pour la clôture financière
    const totalRecettes = ventesFiltrees.reduce((sum, v) => sum + (Number(v.montant_total || v.total) || 0), 0);
    const totalEspeces = ventesFiltrees.filter(v => (v.mode_paiement || 'Espèces') === 'Espèces').reduce((sum, v) => sum + (Number(v.montant_total || v.total) || 0), 0);
    const totalMobile = ventesFiltrees.filter(v => v.mode_paiement === 'Mobile Money').reduce((sum, v) => sum + (Number(v.montant_total || v.total) || 0), 0);
    const totalCarte = ventesFiltrees.filter(v => v.mode_paiement === 'Carte').reduce((sum, v) => sum + (Number(v.montant_total || v.total) || 0), 0);

    return (
        <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #007bff', paddingBottom: '10px', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, color: '#333' }}>
                    📋 Historique des Ventes & Clôture de Caisse
                </h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                        onClick={chargerVentes}
                        style={{ padding: '8px 16px', background: '#17a2b8', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        🔄 Actualiser
                    </button>
                    <button 
                        onClick={() => window.print()}
                        style={{ padding: '8px 16px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        🖨️ Imprimer Rapport
                    </button>
                </div>
            </div>

            {erreur && (
                <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '12px', marginBottom: '20px', borderRadius: '4px', fontWeight: 'bold' }}>
                    {erreur}
                </div>
            )}

            {/* Cartes de synthèse financière */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '25px' }}>
                <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '6px', borderLeft: '5px solid #2196f3' }}>
                    <div style={{ fontSize: '12px', color: '#555', fontWeight: 'bold' }}>RECETTES TOTALES</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#0d47a1', marginTop: '5px' }}>
                        {totalRecettes.toLocaleString('fr-FR')} FCFA
                    </div>
                </div>

                <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '6px', borderLeft: '5px solid #4caf50' }}>
                    <div style={{ fontSize: '12px', color: '#555', fontWeight: 'bold' }}>TOTAL ESPÈCES</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1b5e20', marginTop: '5px' }}>
                        {totalEspeces.toLocaleString('fr-FR')} FCFA
                    </div>
                </div>

                <div style={{ background: '#fff3e0', padding: '15px', borderRadius: '6px', borderLeft: '5px solid #ff9800' }}>
                    <div style={{ fontSize: '12px', color: '#555', fontWeight: 'bold' }}>MOBILE MONEY</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#e65100', marginTop: '5px' }}>
                        {totalMobile.toLocaleString('fr-FR')} FCFA
                    </div>
                </div>

                <div style={{ background: '#f3e5f5', padding: '15px', borderRadius: '6px', borderLeft: '5px solid #9c27b0' }}>
                    <div style={{ fontSize: '12px', color: '#555', fontWeight: 'bold' }}>CARTE BANCAIRE</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#4a148c', marginTop: '5px' }}>
                        {totalCarte.toLocaleString('fr-FR')} FCFA
                    </div>
                </div>
            </div>

            {/* Barre de filtres */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div>
                    <label style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Filtrer par date :</label>
                    <input 
                        type="date" 
                        value={filtreDate} 
                        onChange={e => setFiltreDate(e.target.value)}
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>

                <div>
                    <label style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Rechercher un caissier :</label>
                    <input 
                        type="text" 
                        placeholder="Nom du caissier..." 
                        value={filtreCaissier} 
                        onChange={e => setFiltreCaissier(e.target.value)}
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '200px' }}
                    />
                </div>

                {(filtreDate || filtreCaissier) && (
                    <button 
                        onClick={() => { setFiltreDate(''); setFiltreCaissier(''); }}
                        style={{ marginTop: '20px', padding: '8px 12px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        Réinitialiser les filtres
                    </button>
                )}
            </div>

            {/* Tableau du journal des ventes */}
            {chargement ? (
                <p style={{ padding: '20px', textAlign: 'center' }}>Chargement du journal des ventes...</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                            <th style={{ padding: '12px' }}>N° Ticket</th>
                            <th style={{ padding: '12px' }}>Date & Heure</th>
                            <th style={{ padding: '12px' }}>Caissier</th>
                            <th style={{ padding: '12px' }}>Paiement</th>
                            <th style={{ padding: '12px', textAlign: 'right' }}>Montant Total</th>
                            <th style={{ padding: '12px', textAlign: 'center' }}>Détails</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ventesFiltrees.length > 0 ? (
                            ventesFiltrees.map((v) => {
                                const id = v.id || v._id;
                                const dateVente = v.date_vente || v.createdAt || v.date;
                                const caissier = v.employe_nom || v.caissier || v.vendeur || 'Caissier';
                                const modePaiement = v.mode_paiement || 'Espèces';
                                const montant = Number(v.montant_total || v.total || 0);
                                const estOuvert = venteAffichee === id;

                                return (
                                    <React.Fragment key={id}>
                                        <tr style={{ borderBottom: '1px solid #eee', background: estOuvert ? '#f1f8ff' : 'transparent' }}>
                                            <td style={{ padding: '12px', fontWeight: 'bold', color: '#007bff' }}>#{String(id).slice(-6)}</td>
                                            <td style={{ padding: '12px' }}>{formaterDateLisible(dateVente)}</td>
                                            <td style={{ padding: '12px' }}>{caissier}</td>
                                            <td style={{ padding: '12px' }}>
                                                <span style={{ 
                                                    padding: '4px 8px', 
                                                    borderRadius: '4px', 
                                                    fontSize: '12px', 
                                                    fontWeight: 'bold',
                                                    backgroundColor: modePaiement === 'Espèces' ? '#e8f5e9' : modePaiement === 'Mobile Money' ? '#fff3e0' : '#f3e5f5',
                                                    color: modePaiement === 'Espèces' ? '#2e7d32' : modePaiement === 'Mobile Money' ? '#ef6c00' : '#7b1fa2'
                                                }}>
                                                    {modePaiement}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', fontSize: '15px' }}>
                                                {montant.toLocaleString('fr-FR')} FCFA
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'center' }}>
                                                <button
                                                    onClick={() => setVenteAffichee(estOuvert ? null : id)}
                                                    style={{ padding: '4px 8px', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                                                >
                                                    {estOuvert ? 'Masquer' : '🔍 Voir articles'}
                                                </button>
                                            </td>
                                        </tr>

                                        {/* Vue détaillée des articles achetés */}
                                        {estOuvert && (
                                            <tr style={{ background: '#f8f9fa' }}>
                                                <td colSpan="6" style={{ padding: '15px', borderBottom: '2px solid #007bff' }}>
                                                    <strong>Articles achetés (Ticket #{String(id).slice(-6)}) :</strong>
                                                    <ul style={{ margin: '10px 0 0 0', paddingLeft: '20px' }}>
                                                        {(v.articles || v.produits || []).length > 0 ? (
                                                            (v.articles || v.produits).map((art, idx) => (
                                                                <li key={idx} style={{ marginBottom: '4px', fontSize: '14px' }}>
                                                                    {art.nom || art.nom_produit || 'Article'} - 
                                                                    <b> {art.quantite || art.qte || 1} x </b> 
                                                                    {Number(art.prix_unitaire || art.prix || 0).toLocaleString('fr-FR')} FCFA 
                                                                    = <b>{((art.quantite || 1) * (art.prix_unitaire || art.prix || 0)).toLocaleString('fr-FR')} FCFA</b>
                                                                </li>
                                                            ))
                                                        ) : (
                                                            <li style={{ color: '#888' }}>Aucun détail sur les articles de cette vente.</li>
                                                        )}
                                                    </ul>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
                                    Aucune vente enregistrée pour cette sélection.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
}