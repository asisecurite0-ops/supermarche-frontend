import React, { useState, useEffect, useCallback } from 'react';
import { fetchApi } from '../../config/api';

export default function Immobilisations() {
    const [immobilisations, setImmobilisations] = useState([]);
    const [libelle, setLibelle] = useState('');
    const [valeur, setValeur] = useState('');
    const [duree, setDuree] = useState(5);
    const [dateAcquisition, setDateAcquisition] = useState(new Date().toISOString().split('T')[0]);
    const [message, setMessage] = useState('');
    const [erreur, setErreur] = useState('');
    const [enEnvoi, setEnEnvoi] = useState(false);
    const [chargement, setChargement] = useState(true);

    const chargerImmobilisations = useCallback(async () => {
        setChargement(true);
        setErreur('');
        try {
            let data;
            try {
                data = await fetchApi('/api/proprietaire/immobilisations');
            } catch (err) {
                // Route de repli
                data = await fetchApi('/api/immobilisations');
            }
            const liste = Array.isArray(data) ? data : (data.immobilisations || data.data || []);
            setImmobilisations(liste);
        } catch (err) {
            console.error('Erreur lors du chargement :', err);
            setErreur('Impossible de charger les immobilisations.');
        } finally {
            setChargement(false);
        }
    }, []);

    useEffect(() => {
        chargerImmobilisations();
    }, [chargerImmobilisations]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!libelle || !valeur) return;

        setEnEnvoi(true);
        setMessage('');
        setErreur('');

        try {
            const bodyData = { 
                libelle, 
                valeur_acquisition: parseFloat(valeur), 
                duree_vie_ans: parseInt(duree, 10),
                date_acquisition: dateAcquisition || new Date().toISOString()
            };

            let data;
            try {
                data = await fetchApi('/api/proprietaire/immobilisations', {
                    method: 'POST',
                    body: JSON.stringify(bodyData)
                });
            } catch (err) {
                // Route de repli
                data = await fetchApi('/api/immobilisations', {
                    method: 'POST',
                    body: JSON.stringify(bodyData)
                });
            }

            setMessage(data.message || 'Immobilisation enregistrée avec succès !');
            setLibelle('');
            setValeur('');
            setDuree(5);
            setDateAcquisition(new Date().toISOString().split('T')[0]);
            chargerImmobilisations();
            setTimeout(() => setMessage(''), 4000);
        } catch (err) {
            console.error('Erreur :', err);
            setErreur(err.message || 'Erreur lors de l\'enregistrement de l\'équipement.');
        } finally {
            setEnEnvoi(false);
        }
    };

    const supprimerImmobilisation = async (id) => {
        if (!window.confirm('Voulez-vous vraiment supprimer cet équipement ?')) return;

        try {
            try {
                await fetchApi(`/api/proprietaire/immobilisations/${id}`, { method: 'DELETE' });
            } catch (err) {
                // Route de repli
                await fetchApi(`/api/immobilisations/${id}`, { method: 'DELETE' });
            }

            setMessage('Équipement supprimé !');
            chargerImmobilisations();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error(err);
            setErreur('Impossible de supprimer l\'élément.');
        }
    };

    // Calculs de synthèse SYSCOHADA
    const totalImmo = immobilisations.reduce((acc, item) => acc + (Number(item.valeur_acquisition) || 0), 0);
    
    const totalAmortissementAnnuel = immobilisations.reduce((acc, item) => {
        const val = Number(item.valeur_acquisition) || 0;
        const ans = Number(item.duree_vie_ans) || 1;
        return acc + (val / ans);
    }, 0);

    // Calcul de la VNC (Valeur Nette Comptable) globale estimée
    const totalVNC = immobilisations.reduce((acc, item) => {
        const val = Number(item.valeur_acquisition) || 0;
        const ans = Number(item.duree_vie_ans) || 1;
        const dateAcq = new Date(item.date_acquisition || item.createdAt || Date.now());
        const anneesEcoulees = Math.max(0, (new Date() - dateAcq) / (1000 * 60 * 60 * 24 * 365.25));
        const amortCumule = Math.min(val, (val / ans) * anneesEcoulees);
        return acc + Math.max(0, val - amortCumule);
    }, 0);

    if (chargement) return <p style={{ padding: '20px', textAlign: 'center' }}>Chargement du registre des immobilisations...</p>;

    return (
        <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <div>
                    <h3 style={{ margin: 0, color: '#333' }}>🏢 Actif Immobilisé (Classe 2 SYSCOHADA)</h3>
                    <p style={{ color: '#666', margin: '5px 0 0 0', fontSize: '14px' }}>
                        Suivi du matériel durable : frigos, rayonnages, caisses enregistreuses, véhicules.
                    </p>
                </div>
                <button 
                    onClick={chargerImmobilisations}
                    style={{ padding: '8px 14px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    🔄 Actualiser
                </button>
            </div>

            {/* Cartes de synthèse financière */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', marginBottom: '25px' }}>
                <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '8px', borderLeft: '5px solid #17a2b8' }}>
                    <h4 style={{ margin: '0 0 5px 0', color: '#555', fontSize: '13px' }}>VALEUR BRUTE TOTALE</h4>
                    <h2 style={{ margin: 0, color: '#17a2b8', fontSize: '20px' }}>
                        {totalImmo.toLocaleString('fr-FR')} FCFA
                    </h2>
                </div>

                <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', borderLeft: '5px solid #6c757d' }}>
                    <h4 style={{ margin: '0 0 5px 0', color: '#555', fontSize: '13px' }}>AMORTISSEMENT ANNUEL</h4>
                    <h2 style={{ margin: 0, color: '#555', fontSize: '20px' }}>
                        {Math.round(totalAmortissementAnnuel).toLocaleString('fr-FR')} FCFA / an
                    </h2>
                </div>

                <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '8px', borderLeft: '5px solid #28a745' }}>
                    <h4 style={{ margin: '0 0 5px 0', color: '#555', fontSize: '13px' }}>VALEUR NETTE COMPTABLE (VNC)</h4>
                    <h2 style={{ margin: 0, color: '#28a745', fontSize: '20px' }}>
                        {Math.round(totalVNC).toLocaleString('fr-FR')} FCFA
                    </h2>
                </div>
            </div>

            {message && (
                <div style={{ background: '#d4edda', color: '#155724', padding: '12px 15px', borderRadius: '4px', marginBottom: '15px', fontWeight: 'bold' }}>
                    ✅ {message}
                </div>
            )}

            {erreur && (
                <div style={{ background: '#f8d7da', color: '#721c24', padding: '12px 15px', borderRadius: '4px', marginBottom: '15px', fontWeight: 'bold' }}>
                    ⚠️ {erreur}
                </div>
            )}

            {/* Formulaire d'enregistrement */}
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '10px', marginBottom: '25px', background: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '1px solid #e9ecef', alignItems: 'flex-end' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>Désignation / Équipement</label>
                    <input
                        type="text"
                        placeholder="Ex: Vitrine réfrigérée..."
                        value={libelle}
                        onChange={e => setLibelle(e.target.value)}
                        required
                        style={{ width: '100%', padding: '9px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>Prix d'achat (FCFA)</label>
                    <input
                        type="number"
                        placeholder="0"
                        value={valeur}
                        onChange={e => setValeur(e.target.value)}
                        required
                        min="0"
                        style={{ width: '100%', padding: '9px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>Durée (Ans)</label>
                    <input
                        type="number"
                        placeholder="5"
                        value={duree}
                        onChange={e => setDuree(e.target.value)}
                        required
                        min="1"
                        style={{ width: '100%', padding: '9px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>Date Acquisition</label>
                    <input
                        type="date"
                        value={dateAcquisition}
                        onChange={e => setDateAcquisition(e.target.value)}
                        style={{ width: '100%', padding: '9px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                </div>

                <div>
                    <button 
                        type="submit" 
                        disabled={enEnvoi}
                        style={{ 
                            padding: '10px 18px', 
                            background: enEnvoi ? '#6c757d' : '#17a2b8', 
                            color: '#fff', 
                            border: 'none', 
                            borderRadius: '4px', 
                            cursor: enEnvoi ? 'not-allowed' : 'pointer', 
                            fontWeight: 'bold' 
                        }}
                    >
                        {enEnvoi ? 'Envoi...' : '+ Ajouter'}
                    </button>
                </div>
            </form>

            {/* Tableau du journal des immobilisations */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                    <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #ddd', textAlign: 'left' }}>
                        <th style={{ padding: '10px' }}>Équipement</th>
                        <th style={{ padding: '10px' }}>Date d'Achat</th>
                        <th style={{ padding: '10px', textAlign: 'center' }}>Durée</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>Amort. / An</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>Valeur Brute</th>
                        <th style={{ padding: '10px', textAlign: 'center' }}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {immobilisations.length === 0 ? (
                        <tr>
                            <td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                                Aucun équipement immobilisé enregistré pour le moment.
                            </td>
                        </tr>
                    ) : (
                        immobilisations.map(item => {
                            const id = item.id || item._id;
                            const val = Number(item.valeur_acquisition) || 0;
                            const ans = Number(item.duree_vie_ans) || 1;
                            const amortAn = val / ans;

                            return (
                                <tr key={id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '10px', fontWeight: 'bold', color: '#333' }}>{item.libelle}</td>
                                    <td style={{ padding: '10px', color: '#666', fontSize: '13px' }}>
                                        {item.date_acquisition ? new Date(item.date_acquisition).toLocaleDateString('fr-FR') : 'Date non définie'}
                                    </td>
                                    <td style={{ padding: '10px', textAlign: 'center' }}>{ans} ans</td>
                                    <td style={{ padding: '10px', color: '#6c757d', textAlign: 'right' }}>
                                        {Math.round(amortAn).toLocaleString('fr-FR')} FCFA
                                    </td>
                                    <td style={{ padding: '10px', color: '#17a2b8', fontWeight: 'bold', textAlign: 'right' }}>
                                        {val.toLocaleString('fr-FR')} FCFA
                                    </td>
                                    <td style={{ padding: '10px', textAlign: 'center' }}>
                                        <button
                                            onClick={() => supprimerImmobilisation(id)}
                                            style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                                        >
                                            🗑️
                                        </button>
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