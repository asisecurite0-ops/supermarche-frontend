import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { fetchApi } from '../../config/api';

export default function Caisse({ utilisateur }) {
    const [produits, setProduits] = useState([]);
    const [panier, setPanier] = useState([]);
    const [codeBarre, setCodeBarre] = useState('');
    const [rechercheNom, setRechercheNom] = useState('');
    const [modePaiement, setModePaiement] = useState('Espèces');
    const [montantRecu, setMontantRecu] = useState('');
    const [imprimerTicket, setImprimerTicket] = useState(true);
    const [message, setMessage] = useState('');
    const [erreur, setErreur] = useState('');
    const [enValidation, setEnValidation] = useState(false);
    
    // Scanner Webcam
    const [scannerActif, setScannerActif] = useState(false);

    const [derniereVente, setDerniereVente] = useState(null);
    const inputScanRef = useRef(null);

    const chargerProduits = useCallback(async () => {
        try {
            const data = await fetchApi('/api/produits');
            const liste = Array.isArray(data) ? data : (data.produits || data.data || []);
            setProduits(liste);
        } catch (err) {
            console.error('Erreur chargement produits :', err);
            setErreur('Impossible de charger le catalogue de produits.');
        }
    }, []);

    useEffect(() => {
        chargerProduits();
        if (inputScanRef.current && !scannerActif) {
            inputScanRef.current.focus();
        }
    }, [scannerActif, chargerProduits]);

    // ÉCOUTEUR / SCANNER WEBCAM
    useEffect(() => {
        let scanner = null;
        if (scannerActif) {
            scanner = new Html5QrcodeScanner("reader", {
                fps: 10,
                qrbox: { width: 250, height: 150 }
            }, false);

            scanner.render(
                (decodedText) => {
                    const codeNettoye = decodedText.trim();
                    const produitTrouve = produits.find(p => p.code_barre === codeNettoye || p.codeBarre === codeNettoye);
                    if (produitTrouve) {
                        ajouterAuPanier(produitTrouve);
                        setMessage(`✅ Produit scanné : ${produitTrouve.nom}`);
                    } else {
                        setErreur(`Aucun produit trouvé pour le code : ${codeNettoye}`);
                    }
                    setScannerActif(false);
                    scanner.clear().catch(() => {});
                },
                () => {}
            );
        }

        return () => {
            if (scanner) {
                scanner.clear().catch(() => {});
            }
        };
    }, [scannerActif, produits]);

    const ajouterAuPanier = (produit) => {
        setErreur('');
        const idProduit = produit._id || produit.id;

        if (produit.stock_actuel <= 0 && produit.stock <= 0) {
            setErreur(`Attention : Le produit "${produit.nom}" est en rupture de stock !`);
            return;
        }

        const stockDisponible = produit.stock_actuel !== undefined ? produit.stock_actuel : (produit.stock || 0);

        setPanier(prevPanier => {
            const index = prevPanier.findIndex(item => (item._id || item.id) === idProduit);
            if (index !== -1) {
                const nouveauPanier = [...prevPanier];
                if (nouveauPanier[index].quantite < stockDisponible) {
                    nouveauPanier[index].quantite += 1;
                } else {
                    setErreur(`Stock maximum (${stockDisponible}) atteint pour ${produit.nom}.`);
                }
                return nouveauPanier;
            } else {
                return [...prevPanier, { ...produit, id: idProduit, quantite: 1, stock_actuel: stockDisponible }];
            }
        });

        setCodeBarre('');
        setRechercheNom('');
        if (inputScanRef.current && !scannerActif) inputScanRef.current.focus();
    };

    const modifierQuantite = (id, delta) => {
        setPanier(prevPanier => {
            return prevPanier.map(item => {
                if ((item._id || item.id) === id) {
                    const nouvelleQte = item.quantite + delta;
                    if (nouvelleQte <= 0) return null;
                    if (nouvelleQte > item.stock_actuel) {
                        setErreur(`Stock insuffisant (${item.stock_actuel} disponible).`);
                        return item;
                    }
                    return { ...item, quantite: nouvelleQte };
                }
                return item;
            }).filter(Boolean);
        });
    };

    const supprimerDuPanier = (id) => {
        setPanier(prevPanier => prevPanier.filter(item => (item._id || item.id) !== id));
    };

    const handleCodeBarreSubmit = (e) => {
        e.preventDefault();
        const code = codeBarre.trim();
        if (!code) return;

        const produitTrouve = produits.find(p => p.code_barre === code || p.codeBarre === code);
        if (produitTrouve) {
            ajouterAuPanier(produitTrouve);
        } else {
            setErreur(`Aucun produit trouvé avec le code-barres : ${code}`);
            setCodeBarre('');
        }
    };

    const produitsFiltres = rechercheNom.trim() === '' ? [] : produits.filter(p => 
        (p.nom && p.nom.toLowerCase().includes(rechercheNom.toLowerCase())) ||
        (p.code_barre && p.code_barre.includes(rechercheNom.trim()))
    );

    const totalPanier = panier.reduce((sum, item) => sum + ((Number(item.prix_vente) || Number(item.prix) || 0) * item.quantite), 0);
    const monnaieARendre = montantRecu ? parseFloat(montantRecu) - totalPanier : 0;

    const validerEncaissement = async () => {
        setErreur('');
        setMessage('');

        if (panier.length === 0) {
            setErreur('Le panier est vide.');
            return;
        }

        if (modePaiement === 'Espèces' && montantRecu && parseFloat(montantRecu) < totalPanier) {
            setErreur('Le montant reçu est inférieur au total à payer.');
            return;
        }

        setEnValidation(true);

        const venteData = {
            employe_id: utilisateur?.id || utilisateur?._id,
            mode_paiement: modePaiement,
            montant_total: totalPanier,
            montant_recu: montantRecu ? parseFloat(montantRecu) : totalPanier,
            monnaie_rendue: monnaieARendre > 0 ? monnaieARendre : 0,
            panier: panier.map(item => ({
                id: item._id || item.id,
                nom: item.nom,
                quantite: item.quantite,
                prix_vente: item.prix_vente || item.prix
            }))
        };

        try {
            let data;
            try {
                data = await fetchApi('/api/ventes', {
                    method: 'POST',
                    body: JSON.stringify(venteData)
                });
            } catch (err) {
                // Route de repli
                data = await fetchApi('/api/caisse/ventes', {
                    method: 'POST',
                    body: JSON.stringify(venteData)
                });
            }

            setMessage(data.message || 'Encaissement validé avec succès !');

            const recu = {
                id: data.venteId || data.id || Math.floor(100000 + Math.random() * 900000),
                date_vente: new Date().toLocaleString('fr-FR'),
                employe_nom: utilisateur?.nom || utilisateur?.prenom || 'Caissier',
                mode_paiement: modePaiement,
                montant_total: totalPanier,
                montant_recu: montantRecu ? parseFloat(montantRecu) : totalPanier,
                monnaie_rendue: monnaieARendre > 0 ? monnaieARendre : 0,
                articles: [...panier]
            };

            setDerniereVente(recu);

            if (imprimerTicket) {
                setTimeout(() => {
                    window.print();
                }, 300);
            }

            setPanier([]);
            setMontantRecu('');
            chargerProduits();
            if (inputScanRef.current) inputScanRef.current.focus();
            setTimeout(() => setMessage(''), 4000);
        } catch (err) {
            console.error('Erreur encaissement :', err);
            setErreur(err.message || 'Erreur lors de l’enregistrement de la vente.');
        } finally {
            setEnValidation(false);
        }
    };

    return (
        <div>
            <style>
                {`
                    @media screen {
                        .only-print {
                            display: none !important;
                        }
                    }
                    @media print {
                        body * {
                            visibility: hidden !important;
                        }
                        #section-ticket-caisse, #section-ticket-caisse * {
                            visibility: visible !important;
                        }
                        #section-ticket-caisse {
                            display: block !important;
                            position: absolute !important;
                            left: 0 !important;
                            top: 0 !important;
                            width: 80mm !important;
                            font-size: 12px !important;
                        }
                    }
                `}
            </style>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: '20px', fontFamily: 'Arial, sans-serif' }}>
                {/* Colonne Gauche : Saisie / Scan */}
                <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
                    <h3 style={{ marginTop: 0, color: '#333' }}>Terminal de Caisse</h3>
                    
                    {message && <div style={{ background: '#d4edda', color: '#155724', padding: '10px 15px', borderRadius: '4px', marginBottom: '15px', fontWeight: 'bold' }}>{message}</div>}
                    {erreur && <div style={{ background: '#f8d7da', color: '#721c24', padding: '10px 15px', borderRadius: '4px', marginBottom: '15px', fontWeight: 'bold' }}>{erreur}</div>}

                    {/* Douchette USB / Bluetooth */}
                    <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '6px', marginBottom: '15px', border: '1px solid #e9ecef' }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#007bff', fontSize: '14px' }}>🔍 Lecture Code-Barres (Douchette)</h4>
                        <form onSubmit={handleCodeBarreSubmit}>
                            <input
                                ref={inputScanRef}
                                type="text"
                                placeholder="Scannez ou entrez le code-barres..."
                                value={codeBarre}
                                onChange={e => setCodeBarre(e.target.value)}
                                style={{ width: '100%', padding: '12px', fontSize: '15px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </form>
                    </div>

                    {/* Option Caméra / Webcam */}
                    <div style={{ marginBottom: '20px' }}>
                        <button
                            onClick={() => setScannerActif(!scannerActif)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                backgroundColor: scannerActif ? '#dc3545' : '#17a2b8',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: '14px'
                            }}
                        >
                            {scannerActif ? '❌ Fermer la Caméra' : '📷 Activer le Scan par Caméra'}
                        </button>
                    </div>

                    {scannerActif && (
                        <div style={{ marginBottom: '20px', border: '2px dashed #17a2b8', borderRadius: '8px', padding: '10px' }}>
                            <div id="reader"></div>
                        </div>
                    )}

                    {/* Zone de recherche manuelle par nom */}
                    <div style={{ background: '#fff9db', padding: '15px', borderRadius: '6px', border: '1px solid #ffeeba' }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#856404', fontSize: '14px' }}>🔎 Recherche Manuelle</h4>
                        <input
                            type="text"
                            placeholder="Tapez le nom ou libellé de l'article..."
                            value={rechercheNom}
                            onChange={e => setRechercheNom(e.target.value)}
                            style={{ width: '100%', padding: '12px', fontSize: '15px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
                        />

                        {produitsFiltres.length > 0 && (
                            <ul style={{ listStyle: 'none', padding: 0, margin: '10px 0 0 0', maxHeight: '200px', overflowY: 'auto', border: '1px solid #ccc', background: '#fff', borderRadius: '4px' }}>
                                {produitsFiltres.map(p => {
                                    const id = p._id || p.id;
                                    const stock = p.stock_actuel !== undefined ? p.stock_actuel : (p.stock || 0);
                                    const prix = Number(p.prix_vente) || Number(p.prix) || 0;

                                    return (
                                        <li 
                                            key={id} 
                                            onClick={() => ajouterAuPanier(p)}
                                            style={{ padding: '10px', borderBottom: '1px solid #eee', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                        >
                                            <span><strong>{p.nom}</strong> ({stock} en stock)</span>
                                            <span style={{ color: '#28a745', fontWeight: 'bold' }}>{prix.toLocaleString('fr-FR')} FCFA</span>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Colonne Droite : Panier & Règlement */}
                <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                        <h3 style={{ marginTop: 0, color: '#333' }}>Panier Client</h3>
                        {panier.length === 0 ? (
                            <p style={{ color: '#666', fontStyle: 'italic', padding: '20px 0', textAlign: 'center' }}>Le panier est actuellement vide.</p>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px' }}>
                                <thead>
                                    <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #ddd', textAlign: 'left' }}>
                                        <th style={{ padding: '8px' }}>Article</th>
                                        <th style={{ padding: '8px', textAlign: 'right' }}>P.U</th>
                                        <th style={{ padding: '8px', textAlign: 'center' }}>Qté</th>
                                        <th style={{ padding: '8px', textAlign: 'right' }}>Total</th>
                                        <th style={{ padding: '8px', textAlign: 'center' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {panier.map(item => {
                                        const itemId = item._id || item.id;
                                        const prixUnit = Number(item.prix_vente) || Number(item.prix) || 0;

                                        return (
                                            <tr key={itemId} style={{ borderBottom: '1px solid #eee' }}>
                                                <td style={{ padding: '8px', fontWeight: 'bold' }}>{item.nom}</td>
                                                <td style={{ padding: '8px', textAlign: 'right' }}>{prixUnit.toLocaleString('fr-FR')}</td>
                                                <td style={{ padding: '8px', textAlign: 'center' }}>
                                                    <button onClick={() => modifierQuantite(itemId, -1)} style={{ padding: '2px 6px', border: '1px solid #ccc', borderRadius: '3px', cursor: 'pointer' }}>-</button>
                                                    <span style={{ padding: '0 8px', fontWeight: 'bold' }}>{item.quantite}</span>
                                                    <button onClick={() => modifierQuantite(itemId, 1)} style={{ padding: '2px 6px', border: '1px solid #ccc', borderRadius: '3px', cursor: 'pointer' }}>+</button>
                                                </td>
                                                <td style={{ padding: '8px', fontWeight: 'bold', textAlign: 'right' }}>
                                                    {(prixUnit * item.quantite).toLocaleString('fr-FR')} FCFA
                                                </td>
                                                <td style={{ padding: '8px', textAlign: 'center' }}>
                                                    <button onClick={() => supprimerDuPanier(itemId)} style={{ color: '#dc3545', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Bloc Synthèse & Paiement */}
                    <div style={{ borderTop: '2px solid #eee', paddingTop: '15px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Total Général :</span>
                            <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
                                {totalPanier.toLocaleString('fr-FR')} FCFA
                            </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}>Mode de Paiement</label>
                                <select 
                                    value={modePaiement} 
                                    onChange={e => setModePaiement(e.target.value)}
                                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                                >
                                    <option value="Espèces">Espèces</option>
                                    <option value="Carte Bancaire">Carte Bancaire</option>
                                    <option value="Mobile Money">Mobile Money (Wave / Orange / MTN)</option>
                                </select>
                            </div>

                            {modePaiement === 'Espèces' && (
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '12px' }}>Montant Reçu (FCFA)</label>
                                    <input 
                                        type="number"
                                        placeholder="0"
                                        value={montantRecu}
                                        onChange={e => setMontantRecu(e.target.value)}
                                        style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
                                    />
                                </div>
                            )}
                        </div>

                        {modePaiement === 'Espèces' && montantRecu && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', background: '#e9ecef', padding: '10px', borderRadius: '4px' }}>
                                <span>Monnaie à Rendre :</span>
                                <strong style={{ color: monnaieARendre >= 0 ? '#28a745' : '#dc3545' }}>
                                    {monnaieARendre.toLocaleString('fr-FR')} FCFA
                                </strong>
                            </div>
                        )}

                        <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input 
                                type="checkbox" 
                                id="checkImpression"
                                checked={imprimerTicket}
                                onChange={e => setImprimerTicket(e.target.checked)}
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                            />
                            <label htmlFor="checkImpression" style={{ fontSize: '14px', cursor: 'pointer', userSelect: 'none' }}>
                                Imprimer le ticket de caisse après validation
                            </label>
                        </div>

                        <button 
                            onClick={validerEncaissement}
                            disabled={enValidation || panier.length === 0}
                            style={{ 
                                width: '100%', 
                                padding: '14px', 
                                background: enValidation || panier.length === 0 ? '#6c757d' : '#28a745', 
                                color: '#fff', 
                                border: 'none', 
                                borderRadius: '4px', 
                                cursor: enValidation || panier.length === 0 ? 'not-allowed' : 'pointer', 
                                fontSize: '16px', 
                                fontWeight: 'bold' 
                            }}
                        >
                            {enValidation ? 'Encaissement...' : 'Valider l\'Encaissement'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Template imprimable du ticket de caisse */}
            {derniereVente && (
                <div id="section-ticket-caisse" className="only-print" style={{ fontFamily: 'monospace', width: '80mm', padding: '10px', background: '#fff', color: '#000' }}>
                    <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                        <h3 style={{ margin: 0, fontSize: '16px' }}>SUPERMARCHÉ APP</h3>
                        <p style={{ margin: '2px 0', fontSize: '11px' }}>Ticket de Caisse</p>
                    </div>

                    <div style={{ borderBottom: '1px dashed #000', paddingBottom: '6px', marginBottom: '6px', fontSize: '11px' }}>
                        <p style={{ margin: '2px 0' }}>Ticket N° : <strong>#{derniereVente.id}</strong></p>
                        <p style={{ margin: '2px 0' }}>Date : {derniereVente.date_vente}</p>
                        <p style={{ margin: '2px 0' }}>Caissier(e) : {derniereVente.employe_nom}</p>
                    </div>

                    <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse', marginBottom: '8px' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #000' }}>
                                <th style={{ textAlign: 'left', paddingBottom: '3px' }}>Article</th>
                                <th style={{ textAlign: 'center', paddingBottom: '3px' }}>Qté</th>
                                <th style={{ textAlign: 'right', paddingBottom: '3px' }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {derniereVente.articles.map((item, index) => {
                                const pu = Number(item.prix_vente) || Number(item.prix) || 0;
                                return (
                                    <tr key={index}>
                                        <td style={{ padding: '2px 0' }}>{item.nom}</td>
                                        <td style={{ textAlign: 'center', padding: '2px 0' }}>{item.quantite}</td>
                                        <td style={{ textAlign: 'right', padding: '2px 0' }}>{(pu * item.quantite).toLocaleString('fr-FR')} F</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    <div style={{ borderTop: '1px dashed #000', paddingTop: '6px', fontSize: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                            <span>TOTAL :</span>
                            <span>{derniereVente.montant_total.toLocaleString('fr-FR')} FCFA</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '2px' }}>
                            <span>Mode :</span>
                            <span>{derniereVente.mode_paiement}</span>
                        </div>
                        {derniereVente.mode_paiement === 'Espèces' && (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '2px' }}>
                                    <span>Reçu :</span>
                                    <span>{derniereVente.montant_recu.toLocaleString('fr-FR')} FCFA</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '2px' }}>
                                    <span>Rendu :</span>
                                    <span>{derniereVente.monnaie_rendue.toLocaleString('fr-FR')} FCFA</span>
                                </div>
                            </>
                        )}
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '10px' }}>
                        <p style={{ margin: 0 }}>Merci pour votre visite !</p>
                        <p style={{ margin: 0 }}>À bientôt</p>
                    </div>
                </div>
            )}
        </div>
    );
}