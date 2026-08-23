import React, { useState, useEffect, useCallback } from 'react';
import { fetchApi } from '../../config/api';

export default function GestionStock() {
    const [produits, setProduits] = useState([]);
    const [recherche, setRecherche] = useState('');
    const [codeBarre, setCodeBarre] = useState('');
    const [nom, setNom] = useState('');
    const [prixAchat, setPrixAchat] = useState('');
    const [prixVente, setPrixVente] = useState('');
    const [stockInitial, setStockInitial] = useState('');

    const [editionId, setEditionId] = useState(null);
    const [editPrixAchat, setEditPrixAchat] = useState('');
    const [editPrixVente, setEditPrixVente] = useState('');
    const [editStock, setEditStock] = useState('');

    const [message, setMessage] = useState('');
    const [erreur, setErreur] = useState('');
    const [chargement, setChargement] = useState(true);
    const [enEnvoi, setEnEnvoi] = useState(false);

    const chargerProduits = useCallback(async () => {
        setChargement(true);
        try {
            const data = await fetchApi('/api/produits');
            const liste = Array.isArray(data) ? data : (data.produits || data.data || []);
            setProduits(liste);
        } catch (err) {
            console.error('Erreur chargement produits:', err);
            setErreur('Impossible de charger la liste des produits.');
        } finally {
            setChargement(false);
        }
    }, []);

    useEffect(() => {
        chargerProduits();
    }, [chargerProduits]);

    const handleAjouter = async (e) => {
        e.preventDefault();
        setMessage('');
        setErreur('');

        if (!codeBarre.trim() || !nom.trim() || !prixAchat || !prixVente || !stockInitial) {
            setErreur('Tous les champs du produit sont obligatoires.');
            return;
        }

        setEnEnvoi(true);

        try {
            const payload = {
                code_barre: codeBarre.trim(),
                nom: nom.trim(),
                prix_achat: parseFloat(prixAchat),
                prix_vente: parseFloat(prixVente),
                stock_actuel: parseInt(stockInitial, 10),
                stock_initial: parseInt(stockInitial, 10),
                stock_seuil: 5
            };

            await fetchApi('/api/produits', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            setMessage('Produit ajouté avec succès !');
            setCodeBarre('');
            setNom('');
            setPrixAchat('');
            setPrixVente('');
            setStockInitial('');
            
            chargerProduits();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setErreur(err.message || 'Erreur lors de l’ajout du produit');
        } finally {
            setEnEnvoi(false);
        }
    };

    const demarrerEdition = (prod) => {
        const id = prod.id || prod._id;
        setEditionId(id);
        setEditPrixAchat(prod.prix_achat);
        setEditPrixVente(prod.prix_vente);
        setEditStock(prod.stock_actuel);
    };

    const annulerEdition = () => {
        setEditionId(null);
        setEditPrixAchat('');
        setEditPrixVente('');
        setEditStock('');
    };

    const sauvegarderEdition = async (id) => {
        setMessage('');
        setErreur('');
        try {
            const payload = {
                prix_achat: parseFloat(editPrixAchat),
                prix_vente: parseFloat(editPrixVente),
                stock_actuel: parseInt(editStock, 10)
            };

            await fetchApi(`/api/produits/${id}`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            });

            setEditionId(null);
            setMessage('Produit mis à jour !');
            chargerProduits();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setErreur(err.message || 'Erreur lors de la mise à jour');
        }
    };

    const handleSupprimer = async (prod) => {
        const id = prod.id || prod._id;
        if (!window.confirm(`Voulez-vous vraiment supprimer le produit "${prod.nom}" ?`)) return;

        try {
            await fetchApi(`/api/produits/${id}`, {
                method: 'DELETE'
            });

            setMessage('Produit supprimé avec succès.');
            chargerProduits();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setErreur(err.message || 'Erreur lors de la suppression');
        }
    };

    const produitsFiltres = produits.filter(p => 
        (p.nom || '').toLowerCase().includes(recherche.toLowerCase()) ||
        (p.code_barre || '').toLowerCase().includes(recherche.toLowerCase())
    );

    const valeurStockAchat = produits.reduce((sum, p) => sum + ((Number(p.prix_achat) || 0) * (Number(p.stock_actuel) || 0)), 0);
    const valeurStockVente = produits.reduce((sum, p) => sum + ((Number(p.prix_vente) || 0) * (Number(p.stock_actuel) || 0)), 0);

    if (chargement) return <p style={{ padding: '20px' }}>Chargement de l'inventaire des stocks...</p>;

    return (
        <div style={{ marginTop: '20px', background: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #ddd' }}>
            <h3 style={{ marginTop: 0, color: '#333' }}>Gestion des Stocks (Classe 3 SYSCOHADA)</h3>
            <p style={{ color: '#666', marginBottom: '20px' }}>Enregistrez vos marchandises et suivez les variations de stock et prix en temps réel.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', marginBottom: '25px' }}>
                <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', borderLeft: '5px solid #17a2b8' }}>
                    <h4 style={{ margin: '0 0 5px 0', color: '#555', fontSize: '13px' }}>Valeur du Stock (Au Coût d'Achat)</h4>
                    <h2 style={{ margin: 0, color: '#17a2b8', fontSize: '20px' }}>{valeurStockAchat.toLocaleString('fr-FR')} FCFA</h2>
                </div>
                <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', borderLeft: '5px solid #28a745' }}>
                    <h4 style={{ margin: '0 0 5px 0', color: '#555', fontSize: '13px' }}>Chiffre d'Affaires Potentiel (Vente)</h4>
                    <h2 style={{ margin: 0, color: '#28a745', fontSize: '20px' }}>{valeurStockVente.toLocaleString('fr-FR')} FCFA</h2>
                </div>
            </div>

            {message && <div style={{ backgroundColor: '#d4edda', color: '#155724', padding: '12px', marginBottom: '20px', borderRadius: '4px', fontWeight: 'bold' }}>{message}</div>}
            {erreur && <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '12px', marginBottom: '20px', borderRadius: '4px', fontWeight: 'bold' }}>{erreur}</div>}

            <form onSubmit={handleAjouter} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr)) 120px', gap: '10px', marginBottom: '25px', background: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '1px solid #e9ecef', alignItems: 'flex-end' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>Code-barres</label>
                    <input type="text" placeholder="Ex: 6181001" value={codeBarre} onChange={e => setCodeBarre(e.target.value)} required style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>Nom de l'article</label>
                    <input type="text" placeholder="Ex: Lait 1L" value={nom} onChange={e => setNom(e.target.value)} required style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>Prix d'achat (FCFA)</label>
                    <input type="number" placeholder="0" value={prixAchat} onChange={e => setPrixAchat(e.target.value)} required style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>Prix de vente (FCFA)</label>
                    <input type="number" placeholder="0" value={prixVente} onChange={e => setPrixVente(e.target.value)} required style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>Stock initial</label>
                    <input type="number" placeholder="0" value={stockInitial} onChange={e => setStockInitial(e.target.value)} required style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }} />
                </div>
                <div>
                    <button type="submit" disabled={enEnvoi} style={{ width: '100%', padding: '11px', backgroundColor: enEnvoi ? '#6c757d' : '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: enEnvoi ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
                        {enEnvoi ? 'Ajout...' : 'Ajouter'}
                    </button>
                </div>
            </form>

            <div style={{ marginBottom: '15px' }}>
                <input type="text" placeholder="🔍 Rechercher un produit par nom ou code-barres..." value={recherche} onChange={e => setRecherche(e.target.value)} style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #ddd', textAlign: 'left' }}>
                        <th style={{ padding: '12px' }}>Code-barres</th>
                        <th style={{ padding: '12px' }}>Nom</th>
                        <th style={{ padding: '12px', textAlign: 'right' }}>Prix d'achat</th>
                        <th style={{ padding: '12px', textAlign: 'right' }}>Prix de vente</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>Stock Actuel</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {produitsFiltres.length === 0 ? (
                        <tr>
                            <td colSpan="6" style={{ padding: '15px', textAlign: 'center', color: '#666' }}>
                                {recherche ? 'Aucun produit ne correspond à votre recherche.' : 'Aucun produit en stock pour le moment.'}
                            </td>
                        </tr>
                    ) : (
                        produitsFiltres.map(prod => {
                            const id = prod.id || prod._id;
                            const stock = Number(prod.stock_actuel) || 0;
                            const estAlerte = stock <= (prod.stock_seuil || 5);
                            const estEnEdition = editionId === id;

                            return (
                                <tr key={id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '12px', color: '#666', fontFamily: 'monospace' }}>{prod.code_barre || 'N/A'}</td>
                                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{prod.nom}</td>
                                    <td style={{ padding: '12px', textAlign: 'right' }}>
                                        {estEnEdition ? (
                                            <input type="number" value={editPrixAchat} onChange={e => setEditPrixAchat(e.target.value)} style={{ width: '80px', padding: '5px' }} />
                                        ) : `${Number(prod.prix_achat || 0).toLocaleString('fr-FR')} FCFA`}
                                    </td>
                                    <td style={{ padding: '12px', color: '#28a745', fontWeight: 'bold', textAlign: 'right' }}>
                                        {estEnEdition ? (
                                            <input type="number" value={editPrixVente} onChange={e => setEditPrixVente(e.target.value)} style={{ width: '80px', padding: '5px' }} />
                                        ) : `${Number(prod.prix_vente || 0).toLocaleString('fr-FR')} FCFA`}
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'center' }}>
                                        {estEnEdition ? (
                                            <input type="number" value={editStock} onChange={e => setEditStock(e.target.value)} style={{ width: '60px', padding: '5px' }} />
                                        ) : (
                                            <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', backgroundColor: estAlerte ? '#f8d7da' : '#d4edda', color: estAlerte ? '#721c24' : '#155724', fontWeight: 'bold' }}>
                                                {stock} unité(s) {estAlerte && '⚠️ (Critique)'}
                                            </span>
                                        )}
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'center' }}>
                                        {estEnEdition ? (
                                            <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                                                <button onClick={() => sauvegarderEdition(id)} style={{ padding: '5px 10px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Enregistrer</button>
                                                <button onClick={annulerEdition} style={{ padding: '5px 10px', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Annuler</button>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                                                <button onClick={() => demarrerEdition(prod)} style={{ padding: '5px 10px', backgroundColor: '#ffc107', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Modifier</button>
                                                <button onClick={() => handleSupprimer(prod)} style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>🗑️</button>
                                            </div>
                                        )}
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