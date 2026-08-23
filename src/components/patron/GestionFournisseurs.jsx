import React, { useState, useEffect, useCallback } from 'react';
import { fetchApi } from '../../config/api';

export default function GestionFournisseurs() {
    const [fournisseurs, setFournisseurs] = useState([]);
    const [nouveauFournisseur, setNouveauFournisseur] = useState({ nom: '', contact: '', email: '', adresse: '' });
    const [fournisseurEnEdition, setFournisseurEnEdition] = useState(null);
    const [recherche, setRecherche] = useState('');
    const [message, setMessage] = useState('');
    const [erreur, setErreur] = useState('');
    const [chargement, setChargement] = useState(true);
    const [enEnvoi, setEnEnvoi] = useState(false);

    const chargerFournisseurs = useCallback(async () => {
        setChargement(true);
        try {
            const data = await fetchApi('/api/fournisseurs');
            const liste = Array.isArray(data) ? data : (data.fournisseurs || data.data || []);
            setFournisseurs(liste);
        } catch (err) {
            console.error('Erreur chargement fournisseurs:', err);
            setErreur('Impossible de charger la liste des fournisseurs.');
        } finally {
            setChargement(false);
        }
    }, []);

    useEffect(() => {
        chargerFournisseurs();
    }, [chargerFournisseurs]);

    const handleAjouterOuModifier = async (e) => {
        e.preventDefault();
        setMessage('');
        setErreur('');
        setEnEnvoi(true);

        const estEdition = Boolean(fournisseurEnEdition);
        const id = fournisseurEnEdition?.id || fournisseurEnEdition?._id;
        
        const endpoint = estEdition 
            ? `/api/fournisseurs/${id}`
            : '/api/fournisseurs';
        
        const method = estEdition ? 'PUT' : 'POST';

        const payload = {
            ...nouveauFournisseur,
            telephone: nouveauFournisseur.contact 
        };

        try {
            await fetchApi(endpoint, {
                method: method,
                body: JSON.stringify(payload)
            });

            setMessage(estEdition ? 'Fournisseur modifié avec succès !' : 'Fournisseur ajouté avec succès !');
            setNouveauFournisseur({ nom: '', contact: '', email: '', adresse: '' });
            setFournisseurEnEdition(null);
            chargerFournisseurs();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setErreur(err.message || "Erreur lors de l'enregistrement.");
        } finally {
            setEnEnvoi(false);
        }
    };

    const handleEditer = (fournisseur) => {
        setFournisseurEnEdition(fournisseur);
        setNouveauFournisseur({
            nom: fournisseur.nom || '',
            contact: fournisseur.contact || fournisseur.telephone || '',
            email: fournisseur.email || '',
            adresse: fournisseur.adresse || ''
        });
    };

    const handleAnnulerEdition = () => {
        setFournisseurEnEdition(null);
        setNouveauFournisseur({ nom: '', contact: '', email: '', adresse: '' });
    };

    const handleSupprimer = async (fournisseur) => {
        const id = fournisseur.id || fournisseur._id;
        if (!window.confirm(`Voulez-vous vraiment supprimer le fournisseur "${fournisseur.nom}" ?`)) return;

        try {
            await fetchApi(`/api/fournisseurs/${id}`, {
                method: 'DELETE'
            });

            setMessage('Fournisseur supprimé avec succès.');
            chargerFournisseurs();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setErreur(err.message || 'Erreur lors de la suppression.');
        }
    };

    const fournisseursFiltres = fournisseurs.filter(f => {
        const terme = recherche.toLowerCase();
        const nom = (f.nom || '').toLowerCase();
        const contact = (f.contact || f.telephone || '').toLowerCase();
        const adresse = (f.adresse || '').toLowerCase();
        return nom.includes(terme) || contact.includes(terme) || adresse.includes(terme);
    });

    if (chargement) return <p style={{ padding: '20px' }}>Chargement du répertoire fournisseurs...</p>;

    return (
        <div style={{ marginTop: '20px', background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
            <h3 style={{ marginTop: 0, color: '#333' }}>Gestion des Fournisseurs et Partenaires (Classe 4 SYSCOHADA)</h3>
            <p style={{ color: '#666', marginBottom: '20px' }}>Enregistrez et consultez les coordonnées de vos partenaires commerciaux.</p>

            {message && <div style={{ backgroundColor: '#d4edda', color: '#155724', padding: '10px 15px', marginBottom: '15px', borderRadius: '4px', fontWeight: 'bold' }}>{message}</div>}
            {erreur && <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '10px 15px', marginBottom: '15px', borderRadius: '4px', fontWeight: 'bold' }}>{erreur}</div>}

            {/* Formulaire */}
            <form onSubmit={handleAjouterOuModifier} style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '25px', border: '1px solid #e9ecef' }}>
                <h4 style={{ margin: '0 0 10px 0', color: fournisseurEnEdition ? '#d39e00' : '#28a745' }}>
                    {fournisseurEnEdition ? `✏️ Modifier : ${fournisseurEnEdition.nom}` : '➕ Enregistrer un Nouveau Fournisseur'}
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr)) auto', gap: '10px', alignItems: 'end' }}>
                    <input 
                        type="text" 
                        placeholder="Nom du fournisseur *" 
                        value={nouveauFournisseur.nom} 
                        onChange={e => setNouveauFournisseur({...nouveauFournisseur, nom: e.target.value})}
                        required
                        style={{ padding: '9px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                    <input 
                        type="text" 
                        placeholder="Téléphone / Contact *" 
                        value={nouveauFournisseur.contact} 
                        onChange={e => setNouveauFournisseur({...nouveauFournisseur, contact: e.target.value})}
                        required
                        style={{ padding: '9px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                    <input 
                        type="email" 
                        placeholder="Email (optionnel)" 
                        value={nouveauFournisseur.email} 
                        onChange={e => setNouveauFournisseur({...nouveauFournisseur, email: e.target.value})}
                        style={{ padding: '9px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                    <input 
                        type="text" 
                        placeholder="Adresse / Ville" 
                        value={nouveauFournisseur.adresse} 
                        onChange={e => setNouveauFournisseur({...nouveauFournisseur, adresse: e.target.value})}
                        style={{ padding: '9px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                    <div style={{ display: 'flex', gap: '5px' }}>
                        <button 
                            type="submit" 
                            disabled={enEnvoi}
                            style={{ 
                                backgroundColor: enEnvoi ? '#6c757d' : (fournisseurEnEdition ? '#ffc107' : '#28a745'), 
                                color: fournisseurEnEdition ? '#000' : 'white', 
                                border: 'none', 
                                padding: '9px 15px',
                                borderRadius: '4px', 
                                cursor: enEnvoi ? 'not-allowed' : 'pointer', 
                                fontWeight: 'bold' 
                            }}
                        >
                            {enEnvoi ? 'Enregistrement...' : (fournisseurEnEdition ? 'Mettre à jour' : 'Ajouter')}
                        </button>
                        {fournisseurEnEdition && (
                            <button 
                                type="button" 
                                onClick={handleAnnulerEdition}
                                style={{ backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '9px 12px', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                Annuler
                            </button>
                        )}
                    </div>
                </div>
            </form>

            {/* Barre de recherche */}
            <div style={{ marginBottom: '15px' }}>
                <input 
                    type="text" 
                    placeholder="🔍 Rechercher un fournisseur par nom, contact ou adresse..." 
                    value={recherche} 
                    onChange={e => setRecherche(e.target.value)}
                    style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
                />
            </div>

            {/* Tableau */}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #ddd', textAlign: 'left' }}>
                        <th style={{ padding: '10px' }}>Fournisseur</th>
                        <th style={{ padding: '10px' }}>Contact</th>
                        <th style={{ padding: '10px' }}>Email</th>
                        <th style={{ padding: '10px' }}>Adresse</th>
                        <th style={{ padding: '10px', textAlign: 'center' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {fournisseursFiltres.length === 0 ? (
                        <tr>
                            <td colSpan="5" style={{ padding: '15px', textAlign: 'center', color: '#666' }}>
                                {recherche ? 'Aucun fournisseur ne correspond à votre recherche.' : 'Aucun fournisseur enregistré.'}
                            </td>
                        </tr>
                    ) : (
                        fournisseursFiltres.map(f => {
                            const id = f.id || f._id;
                            const tel = f.contact || f.telephone;
                            return (
                                <tr key={id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '10px', fontWeight: 'bold', color: '#333' }}>{f.nom}</td>
                                    <td style={{ padding: '10px' }}>
                                        {tel ? (
                                            <a href={`tel:${tel}`} style={{ color: '#007bff', textDecoration: 'none' }}>{tel}</a>
                                        ) : '-'}
                                    </td>
                                    <td style={{ padding: '10px' }}>
                                        {f.email ? (
                                            <a href={`mailto:${f.email}`} style={{ color: '#007bff', textDecoration: 'none' }}>{f.email}</a>
                                        ) : (
                                            <span style={{ color: '#aaa' }}>-</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '10px', color: '#555' }}>{f.adresse || '-'}</td>
                                    <td style={{ padding: '10px', textAlign: 'center' }}>
                                        <button 
                                            onClick={() => handleEditer(f)}
                                            style={{ backgroundColor: '#ffc107', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', marginRight: '5px', fontWeight: 'bold' }}
                                        >
                                            ✏️ Éditer
                                        </button>
                                        <button 
                                            onClick={() => handleSupprimer(f)}
                                            style={{ backgroundColor: '#dc3545', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
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