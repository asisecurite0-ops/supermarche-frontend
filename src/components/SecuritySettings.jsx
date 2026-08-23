import React, { useState, useEffect, useCallback } from 'react';
import { fetchApi } from '../config/api';

const SecuritySettings = () => {
    const [cleActivation, setCleActivation] = useState('');
    const [licenceInfo, setLicenceInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const verifierLicence = useCallback(async () => {
        try {
            const data = await fetchApi('/api/licence/verifier');
            setLicenceInfo(data);
        } catch (err) {
            console.error('Erreur lors de la vérification de la licence:', err);
        }
    }, []);

    useEffect(() => {
        verifierLicence();
    }, [verifierLicence]);

    const handleActivation = async (e) => {
        e.preventDefault();
        
        if (!cleActivation.trim()) {
            setMessage({ type: 'erreur', text: "Veuillez saisir une clé d'activation." });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const data = await fetchApi('/api/licence/activer', {
                method: 'POST',
                body: JSON.stringify({ cle: cleActivation }),
            });

            if (data.success) {
                setMessage({ type: 'succes', text: data.message || "Licence activée avec succès !" });
                setCleActivation('');
                verifierLicence();
            } else {
                setMessage({ type: 'erreur', text: data.erreur || "Clé d'activation incorrecte." });
            }
        } catch (err) {
            setMessage({ 
                type: 'erreur', 
                text: err.message || "Impossible de contacter le serveur. Vérifiez que le backend est démarré." 
            });
        } finally {
            setLoading(false);
        }
    };

    const isActif = licenceInfo?.mode === 'ACTIF';

    return (
        <div style={{ maxWidth: '650px', margin: '30px auto', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            
            {/* 1. Carte de Statut */}
            {licenceInfo && (
                <div style={{
                    padding: '16px 20px',
                    borderRadius: '12px',
                    marginBottom: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    border: '1px solid',
                    backgroundColor: isActif ? '#ecfdf5' : licenceInfo.autorise ? '#fffbeb' : '#fef2f2',
                    borderColor: isActif ? '#a7f3d0' : licenceInfo.autorise ? '#fde68a' : '#fecaca',
                    color: isActif ? '#065f46' : licenceInfo.autorise ? '#92400e' : '#991b1b',
                }}>
                    <span style={{ fontSize: '24px' }}>
                        {isActif ? '🛡️' : licenceInfo.autorise ? '⏳' : '⚠️'}
                    </span>
                    <div>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600' }}>
                            {isActif 
                                ? 'Licence Illimitée Active' 
                                : licenceInfo.autorise 
                                    ? 'Période d\'Essai en Cours' 
                                    : 'Licence Expirée'}
                        </h4>
                        <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
                            {isActif && 'Votre application est activée sans limitation de durée.'}
                            {!isActif && licenceInfo.autorise && `Il vous reste ${licenceInfo.joursRestants} jour(s) d'essai.`}
                            {!licenceInfo.autorise && licenceInfo.erreur}
                        </p>
                    </div>
                </div>
            )}

            {/* 2. Formulaire Principal */}
            <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e2e8f0',
                overflow: 'hidden'
            }}>
                {/* Entête */}
                <div style={{
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                    padding: '24px',
                    color: '#ffffff'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '24px' }}>🔑</span>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>Activation du Logiciel</h2>
                            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#94a3b8' }}>
                                Entrez votre clé maître pour débloquer toutes les fonctionnalités.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Corps */}
                <div style={{ padding: '28px' }}>
                    <form onSubmit={handleActivation}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: '600',
                                color: '#334155',
                                marginBottom: '8px'
                            }}>
                                Clé d'activation
                            </label>
                            <input
                                type="text"
                                value={cleActivation}
                                onChange={(e) => setCleActivation(e.target.value)}
                                placeholder="ex: Genesisbase64"
                                disabled={loading || isActif}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    borderRadius: '10px',
                                    border: '1px solid #cbd5e1',
                                    backgroundColor: isActif ? '#f1f5f9' : '#f8fafc',
                                    fontSize: '15px',
                                    fontFamily: 'monospace',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || isActif}
                            style={{
                                width: '100%',
                                padding: '14px',
                                borderRadius: '10px',
                                border: 'none',
                                backgroundColor: isActif ? '#cbd5e1' : '#0284c7',
                                color: isActif ? '#64748b' : '#ffffff',
                                fontSize: '15px',
                                fontWeight: '600',
                                cursor: isActif || loading ? 'not-allowed' : 'pointer',
                                transition: 'background-color 0.2s'
                            }}
                        >
                            {loading ? 'Vérification en cours...' : isActif ? 'Logiciel Déjà Activé' : 'Activer la licence définitive'}
                        </button>
                    </form>

                    {/* Messages de réponse */}
                    {message.text && (
                        <div style={{
                            marginTop: '20px',
                            padding: '14px',
                            borderRadius: '10px',
                            fontSize: '14px',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            backgroundColor: message.type === 'succes' ? '#ecfdf5' : '#fef2f2',
                            color: message.type === 'succes' ? '#065f46' : '#991b1b',
                            border: `1px solid ${message.type === 'succes' ? '#a7f3d0' : '#fecaca'}`
                        }}>
                            <span>{message.type === 'succes' ? '✅' : '❌'}</span>
                            <span>{message.text}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SecuritySettings;