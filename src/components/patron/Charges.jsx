import React, { useState, useEffect, useCallback } from 'react';
import { fetchApi } from '../../config/api';

export default function Charges() {
    const [charges, setCharges] = useState([]);
    const [libelle, setLibelle] = useState('');
    const [montant, setMontant] = useState('');
    const [categorie, setCategorie] = useState('Personnel');
    const [message, setMessage] = useState('');
    const [enEnvoi, setEnEnvoi] = useState(false);

    const chargerCharges = useCallback(async () => {
        try {
            const data = await fetchApi('/api/patron/charges');
            setCharges(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Erreur chargement charges :', err);
        }
    }, []);

    useEffect(() => {
        chargerCharges();
    }, [chargerCharges]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!libelle || !montant) {
            alert('Veuillez remplir tous les champs obligatoires.');
            return;
        }

        setEnEnvoi(true);

        try {
            const data = await fetchApi('/api/patron/charges', {
                method: 'POST',
                body: JSON.stringify({ libelle, montant: parseFloat(montant), categorie })
            });

            setMessage(data.message || 'Charge enregistrée avec succès !');
            setLibelle('');
            setMontant('');
            setCategorie('Personnel');
            chargerCharges();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error('Erreur :', err);
        } finally {
            setEnEnvoi(false);
        }
    };

    const totalCharges = charges.reduce((sum, c) => sum + (Number(c.montant) || 0), 0);

    // Fonction d'attribution des couleurs pour chaque catégorie SYSCOHADA
    const getBadgeStyle = (cat) => {
        switch (cat) {
            case 'Personnel':
                return { background: '#cce5ff', color: '#004085' };
            case 'Transport':
                return { background: '#e2e3e5', color: '#383d41' };
            case 'Impôts et Taxes':
                return { background: '#f8d7da', color: '#721c24' };
            case 'Services Extérieurs':
                return { background: '#fff3cd', color: '#856404' };
            default:
                return { background: '#e9ecef', color: '#495057' };
        }
    };

    return (
        <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #ddd' }}>
            <h3 style={{ marginTop: 0, color: '#333' }}>Gestion des Charges d'Exploitation (Classe 6 SYSCOHADA)</h3>
            <p style={{ color: '#666', marginBottom: '20px' }}>Enregistrez ici les salaires, frais de transport, taxes municipales, factures et autres dépenses courantes.</p>

            {/* Encadré du total des charges */}
            <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', borderLeft: '5px solid #ffc107', marginBottom: '25px' }}>
                <h4 style={{ margin: '0 0 5px 0', color: '#555', fontSize: '14px' }}>Total Cumulé des Charges</h4>
                <h2 style={{ margin: 0, color: '#d39e00', fontSize: '22px' }}>
                    {totalCharges.toLocaleString('fr-FR')} FCFA
                </h2>
            </div>

            {message && <p style={{ color: '#28a745', fontWeight: 'bold', marginBottom: '15px' }}>{message}</p>}

            {/* Formulaire d'ajout */}
            <form onSubmit={handleSubmit} style={{ background: '#fcf8e3', padding: '20px', borderRadius: '8px', border: '1px solid #faebcc', marginBottom: '30px', display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div style={{ flex: '2', minWidth: '200px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Libellé (ex: Salaire gérant, Taxe mairie, Électricité...)</label>
                    <input 
                        type="text" 
                        value={libelle} 
                        onChange={(e) => setLibelle(e.target.value)} 
                        placeholder="Ex: Facture CEET / CIE ou Salaire Caissier" 
                        style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
                        required
                    />
                </div>

                <div style={{ flex: '1', minWidth: '130px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Montant (FCFA)</label>
                    <input 
                        type="number" 
                        value={montant} 
                        onChange={(e) => setMontant(e.target.value)} 
                        placeholder="0" 
                        style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
                        required
                    />
                </div>

                <div style={{ flex: '1', minWidth: '150px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '13px' }}>Catégorie SYSCOHADA</label>
                    <select value={categorie} onChange={(e) => setCategorie(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}>
                        <option value="Personnel">Personnel (Salaires)</option>
                        <option value="Transport">Transport</option>
                        <option value="Impôts et Taxes">Impôts et Taxes (Mairie)</option>
                        <option value="Services Extérieurs">Services Extérieurs (Électricité, Eau, Loyer)</option>
                        <option value="Divers">Autres Charges</option>
                    </select>
                </div>

                <div>
                    <button 
                        type="submit" 
                        disabled={enEnvoi}
                        style={{ 
                            padding: '10px 20px', 
                            background: enEnvoi ? '#6c757d' : '#28a745', 
                            color: '#fff', 
                            border: 'none', 
                            borderRadius: '4px', 
                            cursor: enEnvoi ? 'not-allowed' : 'pointer', 
                            fontWeight: 'bold' 
                        }}
                    >
                        {enEnvoi ? 'Enregistrement...' : 'Ajouter la Charge'}
                    </button>
                </div>
            </form>

            {/* Historique des charges */}
            <h4 style={{ color: '#333', marginBottom: '10px' }}>Historique des Charges Enregistrées</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #ddd', textAlign: 'left' }}>
                        <th style={{ padding: '10px' }}>Date</th>
                        <th style={{ padding: '10px' }}>Libellé</th>
                        <th style={{ padding: '10px' }}>Catégorie</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>Montant</th>
                    </tr>
                </thead>
                <tbody>
                    {charges.length === 0 ? (
                        <tr>
                            <td colSpan="4" style={{ padding: '15px', textAlign: 'center', color: '#666' }}>Aucune charge enregistrée pour le moment.</td>
                        </tr>
                    ) : (
                        charges.map((c, index) => (
                            <tr key={c.id || c._id || index} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '10px', color: '#666', fontSize: '13px' }}>
                                    {c.date_charge || c.createdAt ? new Date(c.date_charge || c.createdAt).toLocaleDateString('fr-FR') : 'Récemment'}
                                </td>
                                <td style={{ padding: '10px', fontWeight: 'bold' }}>{c.libelle}</td>
                                <td style={{ padding: '10px' }}>
                                    <span style={{ 
                                        padding: '4px 8px', 
                                        borderRadius: '4px', 
                                        fontSize: '12px', 
                                        fontWeight: 'bold',
                                        ...getBadgeStyle(c.categorie)
                                    }}>
                                        {c.categorie || 'Général'}
                                    </span>
                                </td>
                                <td style={{ padding: '10px', color: '#dc3545', fontWeight: 'bold', textAlign: 'right' }}>
                                    {Number(c.montant).toLocaleString('fr-FR')} FCFA
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}