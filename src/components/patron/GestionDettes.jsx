import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchApi } from '../../config/api';

export default function GestionDettes() {
    const [dettes, setDettes] = useState([]);
    const [message, setMessage] = useState('');
    const [erreur, setErreur] = useState('');
    const [chargement, setChargement] = useState(true);
    const [soumissionEnCours, setSoumissionEnCours] = useState(false);

    // Formulaire de création de dette
    const [nomFournisseur, setNomFournisseur] = useState('');
    const [montantTotal, setMontantTotal] = useState('');
    const [libelle, setLibelle] = useState('');
    const [dateEcheance, setDateEcheance] = useState('');

    // Formulaire de règlement par dette { [detteId]: { montant: '', date: '' } }
    const [saisiesPaiement, setSaisiesPaiement] = useState({});

    // Barre de recherche
    const [recherche, setRecherche] = useState('');

    const chargerDonnees = useCallback(async () => {
        setChargement(true);
        try {
            const data = await fetchApi('/api/proprietaire/dettes');
            const listeDettes = Array.isArray(data) ? data : (data.dettes || data.data || []);
            setDettes(listeDettes);
        } catch (err) {
            console.error('Erreur chargement données :', err);
            setErreur('Impossible de charger la liste des dettes.');
        } finally {
            setChargement(false);
        }
    }, []);

    useEffect(() => {
        chargerDonnees();
    }, [chargerDonnees]);

    const ajouterDette = async (e) => {
        e.preventDefault();
        setErreur('');
        setMessage('');

        if (!nomFournisseur.trim() || !montantTotal || parseFloat(montantTotal) <= 0) {
            setErreur('Veuillez saisir un nom de fournisseur et un montant valide.');
            return;
        }

        setSoumissionEnCours(true);

        const nouvelleDette = {
            nom_fournisseur: nomFournisseur.trim(),
            montant_total: parseFloat(montantTotal),
            libelle: libelle.trim() || 'Achat de marchandises à crédit',
            date_echeance: dateEcheance || null
        };

        try {
            const data = await fetchApi('/api/proprietaire/dettes', {
                method: 'POST',
                body: JSON.stringify(nouvelleDette)
            });

            setMessage(data.message || 'Dette enregistrée avec succès !');
            setNomFournisseur('');
            setMontantTotal('');
            setLibelle('');
            setDateEcheance('');
            chargerDonnees();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error(err);
            setErreur(err.message || 'Erreur lors de la création de la dette.');
        } finally {
            setSoumissionEnCours(false);
        }
    };

    const handleSaisiePaiement = (id, champ, valeur) => {
        setSaisiesPaiement(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                [champ]: valeur
            }
        }));
    };

    const marquerCommePaye = async (id, soldeRestant) => {
        const saisie = saisiesPaiement[id] || {};
        const montantAPayer = saisie.montant ? parseFloat(saisie.montant) : soldeRestant;
        const datePaiement = saisie.date || new Date().toISOString().split('T')[0];

        if (isNaN(montantAPayer) || montantAPayer <= 0) {
            alert('Veuillez entrer un montant valide.');
            return;
        }

        if (montantAPayer > soldeRestant) {
            alert('Le montant du paiement ne peut pas dépasser le reste à payer.');
            return;
        }

        try {
            const data = await fetchApi(`/api/proprietaire/dettes/${id}/payer`, {
                method: 'PUT',
                body: JSON.stringify({ 
                    montant: montantAPayer,
                    date_paiement: datePaiement 
                })
            });

            setMessage(data.message || 'Règlement enregistré avec succès !');
            setSaisiesPaiement(prev => ({ ...prev, [id]: { montant: '', date: '' } }));
            chargerDonnees();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error('Erreur :', err);
            alert(err.message || 'Erreur lors de l’enregistrement du règlement.');
        }
    };

    const supprimerDette = async (id) => {
        if (!window.confirm('Voulez-vous vraiment supprimer cette dette ?')) return;

        try {
            const data = await fetchApi(`/api/proprietaire/dettes/${id}`, {
                method: 'DELETE'
            });

            setMessage(data.message || 'Dette supprimée avec succès !');
            chargerDonnees();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error(err);
            alert(err.message || 'Erreur lors de la suppression.');
        }
    };

    // Calculs globaux
    const totalDettes = dettes.reduce((sum, d) => sum + (Number(d.montant_total) || 0), 0);
    const totalPaye = dettes.reduce((sum, d) => sum + (Number(d.montant_paye) || 0), 0);
    const resteADevoir = totalDettes - totalPaye;

    // Filtrage dynamique
    const dettesFiltrees = useMemo(() => {
        const terme = recherche.trim().toLowerCase();
        if (!terme) return dettes;

        return dettes.filter(dette => {
            const nom = (dette.nom_fournisseur || '').toLowerCase();
            const desc = (dette.libelle || '').toLowerCase();
            const total = Number(dette.montant_total) || 0;
            const paye = Number(dette.montant_paye) || 0;
            const reste = total - paye;
            const statut = reste <= 0 ? 'solde' : (paye > 0 ? 'partiel' : 'non paye');

            return nom.includes(terme) || desc.includes(terme) || statut.includes(terme);
        });
    }, [dettes, recherche]);

    const getStatutBadgeStyle = (statut) => {
        switch (statut?.toUpperCase()) {
            case 'SOLDE':
            case 'PAYE':
                return { background: '#d4edda', color: '#155724', label: 'PAYÉ (SOLDE)' };
            case 'PARTIEL':
                return { background: '#fff3cd', color: '#856404', label: 'PARTIEL' };
            default:
                return { background: '#f8d7da', color: '#721c24', label: 'IMPAYÉ' };
        }
    };

    if (chargement) return <p style={{ padding: '20px' }}>Chargement des dettes...</p>;

    return (
        <div style={{ background: '#fff', padding: '25px', borderRadius: '8px', border: '1px solid #ddd' }}>
            <h3 style={{ marginTop: 0, color: '#333' }}>Suivi et Apurement des Dettes (Classe 4 SYSCOHADA)</h3>
            <p style={{ color: '#666', marginBottom: '20px' }}>Gérez vos passifs circulants, dates d'échéances et réglements fournisseurs.</p>

            {message && <div style={{ background: '#d4edda', color: '#155724', padding: '10px 15px', borderRadius: '4px', marginBottom: '15px', fontWeight: 'bold' }}>{message}</div>}
            {erreur && <div style={{ background: '#f8d7da', color: '#721c24', padding: '10px 15px', borderRadius: '4px', marginBottom: '15px', fontWeight: 'bold' }}>{erreur}</div>}

            {/* Formulaire d'enregistrement */}
            <form onSubmit={ajouterDette} style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '25px', border: '1px solid #e9ecef' }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#007bff' }}>➕ Enregistrer une Nouvelle Dette / Facture Achat</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.2fr 1fr auto', gap: '10px', alignItems: 'end' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold' }}>Nom du Fournisseur</label>
                        <input 
                            type="text" 
                            placeholder="ex: Brasseries du Bénin" 
                            value={nomFournisseur}
                            onChange={e => setNomFournisseur(e.target.value)}
                            required
                            style={{ width: '100%', padding: '9px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold' }}>Montant Total (FCFA)</label>
                        <input 
                            type="number" 
                            placeholder="ex: 150000" 
                            value={montantTotal}
                            onChange={e => setMontantTotal(e.target.value)}
                            required
                            min="1"
                            style={{ width: '100%', padding: '9px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold' }}>Libellé / Description</label>
                        <input 
                            type="text" 
                            placeholder="ex: Facture N° 102" 
                            value={libelle}
                            onChange={e => setLibelle(e.target.value)}
                            style={{ width: '100%', padding: '9px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold' }}>Date Échéance</label>
                        <input 
                            type="date" 
                            value={dateEcheance}
                            onChange={e => setDateEcheance(e.target.value)}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                        />
                    </div>
                    <button 
                        type="submit"
                        disabled={soumissionEnCours}
                        style={{ padding: '10px 15px', backgroundColor: soumissionEnCours ? '#6c757d' : '#007bff', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: soumissionEnCours ? 'not-allowed' : 'pointer' }}
                    >
                        {soumissionEnCours ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                </div>
            </form>

            {/* Synthèse */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '25px' }}>
                <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', borderLeft: '5px solid #6c757d' }}>
                    <h4 style={{ margin: '0 0 5px 0', color: '#555', fontSize: '13px' }}>Total des Dettes Contractées</h4>
                    <h2 style={{ margin: 0, color: '#333', fontSize: '20px' }}>{totalDettes.toLocaleString('fr-FR')} FCFA</h2>
                </div>
                <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', borderLeft: '5px solid #28a745' }}>
                    <h4 style={{ margin: '0 0 5px 0', color: '#555', fontSize: '13px' }}>Total déjà Réglé</h4>
                    <h2 style={{ margin: 0, color: '#28a745', fontSize: '20px' }}>{totalPaye.toLocaleString('fr-FR')} FCFA</h2>
                </div>
                <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', borderLeft: '5px solid #dc3545' }}>
                    <h4 style={{ margin: '0 0 5px 0', color: '#555', fontSize: '13px' }}>Reste à Devoir (Impayé)</h4>
                    <h2 style={{ margin: 0, color: '#dc3545', fontSize: '20px' }}>{resteADevoir.toLocaleString('fr-FR')} FCFA</h2>
                </div>
            </div>

            {/* Barre de Recherche */}
            <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
                    <input 
                        type="text" 
                        placeholder="🔍 Rechercher (nom, libellé, impayé, solde)..." 
                        value={recherche}
                        onChange={e => setRecherche(e.target.value)}
                        style={{ 
                            width: '100%', 
                            padding: '10px 35px 10px 14px', 
                            borderRadius: '6px', 
                            border: '1px solid #ccc', 
                            fontSize: '14px',
                            outline: 'none',
                            boxSizing: 'border-box'
                        }}
                    />
                    {recherche && (
                        <button
                            type="button"
                            onClick={() => setRecherche('')}
                            style={{
                                position: 'absolute',
                                right: '10px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none',
                                border: 'none',
                                fontSize: '16px',
                                cursor: 'pointer',
                                color: '#999'
                            }}
                        >
                            ✕
                        </button>
                    )}
                </div>
                {recherche && (
                    <span style={{ fontSize: '13px', color: '#666', marginLeft: '10px' }}>
                        {dettesFiltrees.length} résultat(s)
                    </span>
                )}
            </div>

            {/* Tableau complet */}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #ddd', textAlign: 'left' }}>
                        <th style={{ padding: '10px' }}>Fournisseur</th>
                        <th style={{ padding: '10px' }}>Échéance</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>Montant Total</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>Montant Payé</th>
                        <th style={{ padding: '10px', textAlign: 'right' }}>Reste à Payer</th>
                        <th style={{ padding: '10px', textAlign: 'center' }}>Statut</th>
                        <th style={{ padding: '10px', textAlign: 'center' }}>Règlement / Action</th>
                    </tr>
                </thead>
                <tbody>
                    {dettesFiltrees.length === 0 ? (
                        <tr>
                            <td colSpan="7" style={{ padding: '15px', textAlign: 'center', color: '#666' }}>
                                {recherche ? 'Aucune dette ne correspond à votre recherche.' : 'Aucune dette enregistrée.'}
                            </td>
                        </tr>
                    ) : (
                        dettesFiltrees.map((dette, idx) => {
                            const detteId = dette.id || dette._id || idx;
                            const total = Number(dette.montant_total) || 0;
                            const paye = Number(dette.montant_paye) || 0;
                            const reste = total - paye;
                            const badge = getStatutBadgeStyle(reste <= 0 ? 'SOLDE' : (paye > 0 ? 'PARTIEL' : 'IMPAYE'));
                            const saisieActuelle = saisiesPaiement[detteId] || {};

                            return (
                                <tr key={detteId} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '10px', fontWeight: 'bold' }}>
                                        {dette.nom_fournisseur}
                                        {dette.libelle && <div style={{ fontSize: '11px', color: '#666', fontWeight: 'normal' }}>{dette.libelle}</div>}
                                    </td>
                                    <td style={{ padding: '10px', fontSize: '13px', color: '#555' }}>
                                        {dette.date_echeance ? new Date(dette.date_echeance).toLocaleDateString('fr-FR') : 'Non définie'}
                                    </td>
                                    <td style={{ padding: '10px', textAlign: 'right' }}>{total.toLocaleString('fr-FR')} FCFA</td>
                                    <td style={{ padding: '10px', color: '#28a745', textAlign: 'right' }}>
                                        {paye.toLocaleString('fr-FR')} FCFA
                                        {dette.date_dernier_paiement && (
                                            <div style={{ fontSize: '10px', color: '#666' }}>
                                                le {new Date(dette.date_dernier_paiement).toLocaleDateString('fr-FR')}
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ padding: '10px', color: '#dc3545', fontWeight: 'bold', textAlign: 'right' }}>
                                        {reste > 0 ? reste.toLocaleString('fr-FR') : 0} FCFA
                                    </td>
                                    <td style={{ padding: '10px', textAlign: 'center' }}>
                                        <span style={{ 
                                            padding: '4px 8px', 
                                            borderRadius: '4px', 
                                            fontSize: '11px',
                                            fontWeight: 'bold',
                                            backgroundColor: badge.background,
                                            color: badge.color
                                        }}>
                                            {badge.label}
                                        </span>
                                    </td>
                                    <td style={{ padding: '10px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', alignItems: 'center' }}>
                                            {reste > 0 ? (
                                                <>
                                                    <input 
                                                        type="number"
                                                        placeholder={`${reste}`}
                                                        value={saisieActuelle.montant || ''}
                                                        onChange={(e) => handleSaisiePaiement(detteId, 'montant', e.target.value)}
                                                        style={{ width: '80px', padding: '5px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '12px' }}
                                                    />
                                                    <input 
                                                        type="date"
                                                        value={saisieActuelle.date || ''}
                                                        onChange={(e) => handleSaisiePaiement(detteId, 'date', e.target.value)}
                                                        style={{ width: '110px', padding: '4px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '11px' }}
                                                    />
                                                    <button 
                                                        onClick={() => marquerCommePaye(detteId, reste)}
                                                        style={{ padding: '5px 10px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                                                    >
                                                        Payer
                                                    </button>
                                                </>
                                            ) : (
                                                <span style={{ color: '#28a745', fontSize: '13px', fontWeight: 'bold', marginRight: '8px' }}>✓ Payé</span>
                                            )}
                                            <button
                                                onClick={() => supprimerDette(detteId)}
                                                style={{ padding: '5px 8px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                                                title="Supprimer la dette"
                                            >
                                                🗑️
                                            </button>
                                        </div>
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