import React, { useState, useEffect, useCallback } from 'react';
import { fetchApi } from '../../config/api';

export default function ConsultationStock() {
    const [produits, setProduits] = useState([]);
    const [recherche, setRecherche] = useState('');
    const [filtreStatut, setFiltreStatut] = useState('tous'); // 'tous', 'critique', 'rupture'
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState('');

    const chargerStock = useCallback(async () => {
        setChargement(true);
        setErreur('');
        try {
            const data = await fetchApi('/api/produits');
            
            // Extraction souple selon le format de réponse de l'API
            const liste = Array.isArray(data) ? data : (data.produits || data.data || []);
            setProduits(liste);
        } catch (err) {
            console.error('Erreur chargement stock :', err);
            setErreur('Impossible de charger les données du stock.');
        } fontally {
            setChargement(false);
        }
    }, []);

    useEffect(() => {
        chargerStock();
    }, [chargerStock]);

    // Helpers pour extraire les valeurs peu importe le nommage backend (MongoDB/SQL)
    const getNom = p => p?.nom || p?.designation || p?.libelle || 'Sans nom';
    const getCodeBarre = p => p?.code_barre || p?.codeBarre || '';
    const getStock = p => Number(p?.stock_actuel ?? p?.stock ?? 0);
    const getSeuil = p => Number(p?.stock_seuil ?? p?.seuil_alerte ?? p?.seuil ?? 5);
    const getPrix = p => Number(p?.prix_vente ?? p?.prix ?? 0);

    // Filtrage dynamique
    const produitsFiltres = produits.filter(p => {
        const nom = getNom(p);
        const codeBarre = getCodeBarre(p);
        const term = recherche.trim().toLowerCase();

        const matchRecherche = nom.toLowerCase().includes(term) || (codeBarre && codeBarre.includes(term));

        const stock = getStock(p);
        const seuilAlerte = getSeuil(p);

        if (!matchRecherche) return false;

        if (filtreStatut === 'rupture') return stock <= 0;
        if (filtreStatut === 'critique') return stock > 0 && stock <= seuilAlerte;

        return true;
    });

    // Statistiques rapides
    const totalArticles = produits.length;
    const nbRuptures = produits.filter(p => getStock(p) <= 0).length;
    const nbCritiques = produits.filter(p => {
        const stock = getStock(p);
        const seuil = getSeuil(p);
        return stock > 0 && stock <= seuil;
    }).length;

    const getBadgeStock = (stockActuel, seuilAlerte) => {
        const qte = Number(stockActuel) || 0;
        const seuil = Number(seuilAlerte) || 5;

        if (qte <= 0) {
            return {
                label: 'Rupture de stock',
                bg: '#f8d7da',
                color: '#721c24'
            };
        }
        if (qte <= seuil) {
            return {
                label: `${qte} unité(s) (Stock faible)`,
                bg: '#fff3cd',
                color: '#856404'
            };
        }
        return {
            label: `${qte} unités`,
            bg: '#d4edda',
            color: '#155724'
        };
    };

    return (
        <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                    <h3 style={{ margin: 0, color: '#333' }}>Consultation des Stocks & Prix</h3>
                    <p style={{ color: '#666', margin: '5px 0 0 0', fontSize: '14px' }}>
                        Vérifiez en temps réel la disponibilité et le prix de vente des articles.
                    </p>
                </div>
                <button 
                    onClick={chargerStock} 
                    style={{ padding: '8px 14px', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
                >
                    🔄 Actualiser
                </button>
            </div>

            {erreur && <div style={{ background: '#f8d7da', color: '#721c24', padding: '10px 15px', borderRadius: '4px', marginBottom: '15px' }}>{erreur}</div>}

            {/* Cartes de synthèse rapide */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                <div style={{ background: '#f8f9fa', border: '1px solid #e9ecef', padding: '15px', borderRadius: '6px' }}>
                    <span style={{ fontSize: '12px', color: '#6c757d', fontWeight: 'bold' }}>Total Références</span>
                    <h2 style={{ margin: '5px 0 0 0', color: '#007bff' }}>{totalArticles}</h2>
                </div>
                <div style={{ background: '#fff3cd', border: '1px solid #ffeeba', padding: '15px', borderRadius: '6px' }}>
                    <span style={{ fontSize: '12px', color: '#856404', fontWeight: 'bold' }}>Stocks Critiques</span>
                    <h2 style={{ margin: '5px 0 0 0', color: '#856404' }}>{nbCritiques}</h2>
                </div>
                <div style={{ background: '#f8d7da', border: '1px solid #f5c6cb', padding: '15px', borderRadius: '6px' }}>
                    <span style={{ fontSize: '12px', color: '#721c24', fontWeight: 'bold' }}>Ruptures de Stock</span>
                    <h2 style={{ margin: '5px 0 0 0', color: '#721c24' }}>{nbRuptures}</h2>
                </div>
            </div>

            {/* Barre de Recherche et Filtres */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <input
                    type="text"
                    placeholder="Rechercher par nom ou code-barres..."
                    value={recherche}
                    onChange={e => setRecherche(e.target.value)}
                    style={{ flex: 1, minWidth: '250px', padding: '12px', fontSize: '15px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                
                <div style={{ display: 'flex', gap: '5px' }}>
                    <button 
                        onClick={() => setFiltreStatut('tous')}
                        style={{ padding: '10px 15px', border: '1px solid #ccc', borderRadius: '4px', background: filtreStatut === 'tous' ? '#007bff' : '#f8f9fa', color: filtreStatut === 'tous' ? '#fff' : '#333', cursor: 'pointer' }}
                    >
                        Tous
                    </button>
                    <button 
                        onClick={() => setFiltreStatut('critique')}
                        style={{ padding: '10px 15px', border: '1px solid #ccc', borderRadius: '4px', background: filtreStatut === 'critique' ? '#ffc107' : '#f8f9fa', color: filtreStatut === 'critique' ? '#000' : '#333', cursor: 'pointer', fontWeight: filtreStatut === 'critique' ? 'bold' : 'normal' }}
                    >
                        Critiques ({nbCritiques})
                    </button>
                    <button 
                        onClick={() => setFiltreStatut('rupture')}
                        style={{ padding: '10px 15px', border: '1px solid #ccc', borderRadius: '4px', background: filtreStatut === 'rupture' ? '#dc3545' : '#f8f9fa', color: filtreStatut === 'rupture' ? '#fff' : '#333', cursor: 'pointer', fontWeight: filtreStatut === 'rupture' ? 'bold' : 'normal' }}
                    >
                        Ruptures ({nbRuptures})
                    </button>
                </div>
            </div>

            {/* Tableau des produits */}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #ddd', textAlign: 'left' }}>
                        <th style={{ padding: '12px' }}>Code-Barres</th>
                        <th style={{ padding: '12px' }}>Désignation Article</th>
                        <th style={{ padding: '12px', textAlign: 'right' }}>Prix de Vente</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>Disponibilité Stock</th>
                    </tr>
                </thead>
                <tbody>
                    {chargement ? (
                        <tr>
                            <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Chargement du stock en cours...</td>
                        </tr>
                    ) : produitsFiltres.length === 0 ? (
                        <tr>
                            <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Aucun article ne correspond à votre recherche.</td>
                        </tr>
                    ) : (
                        produitsFiltres.map(p => {
                            const id = p._id || p.id;
                            const stockActuel = getStock(p);
                            const stockSeuil = getSeuil(p);
                            const badge = getBadgeStock(stockActuel, stockSeuil);
                            const prix = getPrix(p);
                            const codeBarre = getCodeBarre(p);

                            return (
                                <tr key={id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '12px', color: '#666', fontFamily: 'monospace' }}>{codeBarre || 'N/A'}</td>
                                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#333' }}>{getNom(p)}</td>
                                    <td style={{ padding: '12px', color: '#28a745', fontWeight: 'bold', textAlign: 'right', fontSize: '15px' }}>
                                        {prix.toLocaleString('fr-FR')} FCFA
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'center' }}>
                                        <span style={{ 
                                            padding: '6px 12px', 
                                            borderRadius: '20px', 
                                            fontSize: '12px',
                                            backgroundColor: badge.bg,
                                            color: badge.color,
                                            fontWeight: 'bold',
                                            display: 'inline-block'
                                        }}>
                                            {badge.label}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
}