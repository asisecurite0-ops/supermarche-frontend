import React, { useState, useEffect, useCallback } from 'react';
import { fetchApi } from '../../config/api';

export default function CapitauxPropres() {
    const [capitaux, setCapitaux] = useState([]);
    const [libelle, setLibelle] = useState('');
    const [montant, setMontant] = useState('');
    const [type, setType] = useState('CAPITAL');
    const [message, setMessage] = useState('');
    const [chargement, setChargement] = useState(true);

    const chargerCapitaux = useCallback(async () => {
        try {
            const data = await fetchApi('/api/proprietaire/capitaux');
            setCapitaux(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Erreur chargement capitaux :', err);
        } finally {
            setChargement(false);
        }
    }, []);

    useEffect(() => {
        chargerCapitaux();
    }, [chargerCapitaux]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!libelle || !montant) return;

        try {
            const data = await fetchApi('/api/proprietaire/capitaux', {
                method: 'POST',
                body: JSON.stringify({ libelle, montant: parseFloat(montant), type })
            });

            setMessage(data.message || 'Ressource enregistrée avec succès !');
            setLibelle('');
            setMontant('');
            chargerCapitaux();

            // Effacer le message après 3 secondes
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error('Erreur ajout capital :', err);
        }
    };

    // Calcul du total des ressources durables
    const totalCapitaux = capitaux.reduce((acc, item) => acc + (Number(item.montant) || 0), 0);

    // Fonction d'attribution de couleur aux badges selon le type
    const getTypeBadgeStyle = (typeItem) => {
        switch (typeItem) {
            case 'CAPITAL':
                return { background: '#d4edda', color: '#155724' };
            case 'APPORT':
                return { background: '#cce5ff', color: '#004085' };
            case 'RESERVE':
                return { background: '#fff3cd', color: '#856404' };
            case 'EMPRUNT':
                return { background: '#f8d7da', color: '#721c24' };
            default:
                return { background: '#e9ecef', color: '#383d41' };
        }
    };

    if (chargement) return <p style={{ padding: '20px' }}>Chargement des données du propriétaire...</p>;

    return (
        <div>
            {/* Bloc Résumé */}
            <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '25px' }}>
                <h3 style={{ marginTop: 0, color: '#333' }}>Patrimoine & Ressources Durables (Classe 1 SYSCOHADA)</h3>
                <p style={{ color: '#666', marginBottom: '20px' }}>Suivi officiel du capital social, des apports de l'exploitant, des réserves et des emprunts.</p>

                <div style={{ background: '#e2f0d9', padding: '20px', borderRadius: '8px', borderLeft: '5px solid #28a745', display: 'inline-block', minWidth: '300px' }}>
                    <h4 style={{ margin: '0 0 5px 0', color: '#333', fontSize: '14px' }}>Total des Ressources Durables</h4>
                    <h1 style={{ margin: 0, color: '#28a745', fontSize: '24px' }}>
                        {totalCapitaux.toLocaleString('fr-FR')} FCFA
                    </h1>
                </div>
            </div>

            {/* Formulaire d'ajout */}
            <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '25px' }}>
                <h3 style={{ marginTop: 0, color: '#333' }}>Ajouter une Ressource / Apport</h3>
                {message && <p style={{ color: '#28a745', fontWeight: 'bold', marginBottom: '15px' }}>{message}</p>}

                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '15px' }}>
                    <input
                        type="text"
                        placeholder="Libellé (ex: Capital social initial, Apport personnel...)"
                        value={libelle}
                        onChange={e => setLibelle(e.target.value)}
                        required
                        style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                    <input
                        type="number"
                        placeholder="Montant en FCFA"
                        value={montant}
                        onChange={e => setMontant(e.target.value)}
                        required
                        style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                    <select
                        value={type}
                        onChange={e => setType(e.target.value)}
                        style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                    >
                        <option value="CAPITAL">Capital Social</option>
                        <option value="APPORT">Apport / Exploitant</option>
                        <option value="RESERVE">Réserve</option>
                        <option value="EMPRUNT">Emprunt</option>
                    </select>
                    <button type="submit" style={{ padding: '10px 20px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                        Enregistrer
                    </button>
                </form>
            </div>

            {/* Tableau de suivi */}
            <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #ddd' }}>
                <h3 style={{ marginTop: 0, color: '#333' }}>Historique des Apports & Capitaux Propres</h3>
                {capitaux.length === 0 ? (
                    <p style={{ color: '#777' }}>Aucun enregistrement pour le moment.</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #ddd', textAlign: 'left' }}>
                                <th style={{ padding: '10px' }}>Libellé</th>
                                <th style={{ padding: '10px' }}>Type (SYSCOHADA)</th>
                                <th style={{ padding: '10px' }}>Date</th>
                                <th style={{ padding: '10px', textAlign: 'right' }}>Montant</th>
                            </tr>
                        </thead>
                        <tbody>
                            {capitaux.map((item, index) => (
                                <tr key={item.id || item._id || index} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '10px', fontWeight: 'bold' }}>{item.libelle}</td>
                                    <td style={{ padding: '10px' }}>
                                        <span style={{ 
                                            padding: '4px 10px', 
                                            borderRadius: '4px', 
                                            fontSize: '12px', 
                                            fontWeight: 'bold',
                                            ...getTypeBadgeStyle(item.type)
                                        }}>
                                            {item.type}
                                        </span>
                                    </td>
                                    <td style={{ padding: '10px', fontSize: '14px', color: '#555' }}>
                                        {item.date_enregistrement || item.createdAt ? new Date(item.date_enregistrement || item.createdAt).toLocaleDateString('fr-FR') : '-'}
                                    </td>
                                    <td style={{ padding: '10px', color: '#28a745', fontWeight: 'bold', textAlign: 'right' }}>
                                        {Number(item.montant).toLocaleString('fr-FR')} FCFA
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