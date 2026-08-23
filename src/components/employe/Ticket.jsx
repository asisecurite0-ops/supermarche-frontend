import React from 'react';

export default function Ticket({ vente }) {
    if (!vente) return null;

    // Normalisation de la liste des articles (panier ou articles)
    const listeArticles = vente.articles || vente.panier || [];

    // Extraction souple de l'ID de la vente
    const idVente = vente.id || vente._id || vente.venteId || 'N/A';

    // Formatage propre de la date
    const dateVenteFormatted = vente.date_vente 
        ? (isNaN(new Date(vente.date_vente).getTime()) ? vente.date_vente : new Date(vente.date_vente).toLocaleString('fr-FR'))
        : new Date().toLocaleString('fr-FR');

    // Calcul de secours pour le montant total si non renseigné au niveau supérieur
    const totalCalcule = listeArticles.reduce((acc, item) => {
        const pu = Number(item.prix_vente ?? item.prix_unitaire ?? item.prix ?? 0);
        const qte = Number(item.quantite) || 1;
        return acc + (pu * qte);
    }, 0);

    const montantTotalNet = Number(vente.montant_total ?? totalCalcule);

    return (
        <div id="section-a-imprimer" style={{ fontFamily: 'monospace', width: '80mm', padding: '10px', background: '#fff', color: '#000', margin: '0 auto' }}>
            {/* Directives d'impression dédiées aux imprimantes reçus/thermiques 80mm */}
            <style>
                {`
                    @media print {
                        @page {
                            margin: 0;
                            size: auto;
                        }
                        body * {
                            visibility: hidden !important;
                        }
                        #section-a-imprimer, #section-a-imprimer * {
                            visibility: visible !important;
                        }
                        #section-a-imprimer {
                            position: absolute !important;
                            left: 0 !important;
                            top: 0 !important;
                            width: 80mm !important;
                            padding: 5mm !important;
                            font-size: 11px !important;
                        }
                    }
                `}
            </style>

            {/* En-tête Magasin */}
            <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>SUPERMARCHÉ APP</h3>
                <p style={{ margin: '2px 0', fontSize: '11px' }}>123 Rue du Commerce, Abidjan</p>
                <p style={{ margin: '2px 0', fontSize: '11px' }}>Tél : +225 07 00 00 00 00</p>
            </div>

            {/* Informations Vente & Caissier */}
            <div style={{ borderBottom: '1px dashed #000', borderTop: '1px dashed #000', padding: '6px 0', marginBottom: '8px', fontSize: '11px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Ticket N° :</span>
                    <strong>#{idVente}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Date :</span>
                    <span>{dateVenteFormatted}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Caissier(e) :</span>
                    <span>{vente.employe_nom || vente.agent_nom || 'Caissier'}</span>
                </div>
            </div>

            {/* Liste des articles */}
            <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse', marginBottom: '8px' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid #000' }}>
                        <th style={{ textAlign: 'left', paddingBottom: '3px' }}>Article</th>
                        <th style={{ textAlign: 'center', paddingBottom: '3px' }}>Qté</th>
                        <th style={{ textAlign: 'right', paddingBottom: '3px' }}>Total</th>
                    </tr>
                </thead>
                <tbody>
                    {listeArticles.length > 0 ? (
                        listeArticles.map((item, index) => {
                            const pu = Number(item.prix_vente ?? item.prix_unitaire ?? item.prix ?? 0);
                            const qte = Number(item.quantite) || 1;
                            const totalLigne = pu * qte;

                            return (
                                <tr key={index}>
                                    <td style={{ padding: '2px 0', maxWidth: '120px', wordBreak: 'break-word' }}>
                                        {item.nom || item.designation || 'Article'}
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '2px 0' }}>{qte}</td>
                                    <td style={{ textAlign: 'right', padding: '2px 0' }}>
                                        {totalLigne.toLocaleString('fr-FR')} F
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan="3" style={{ textAlign: 'center', padding: '5px 0' }}>Aucun article</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Récapitulatif du Paiement */}
            <div style={{ borderTop: '1px dashed #000', paddingTop: '6px', fontSize: '11px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 'bold' }}>
                    <span>TOTAL NET :</span>
                    <span>{montantTotalNet.toLocaleString('fr-FR')} FCFA</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                    <span>Mode de Règlement :</span>
                    <span>{vente.mode_paiement || 'Espèces'}</span>
                </div>

                {(vente.mode_paiement === 'Espèces' || !vente.mode_paiement) && vente.montant_recu ? (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                            <span>Montant Reçu :</span>
                            <span>{Number(vente.montant_recu).toLocaleString('fr-FR')} FCFA</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                            <span>Monnaie Rendue :</span>
                            <span>{Number(vente.monnaie_rendue || 0).toLocaleString('fr-FR')} FCFA</span>
                        </div>
                    </>
                ) : null}
            </div>

            {/* Pied de page */}
            <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '10px' }}>
                <p style={{ margin: 0, fontWeight: 'bold' }}>Merci de votre confiance !</p>
                <p style={{ margin: '2px 0' }}>Les articles vendus ne sont ni repris ni échangés.</p>
                <p style={{ margin: '2px 0' }}>À bientôt dans votre supermarché !</p>
            </div>
        </div>
    );
}