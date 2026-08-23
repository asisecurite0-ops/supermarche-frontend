import React, { useState } from 'react';
import { fetchApi } from '../config/api';

export default function SuperAdmin() {
  const [secret, setSecret] = useState('');
  const [connecte, setConnecte] = useState(false);
  const [boutiques, setBoutiques] = useState([]);
  const [chargement, setChargement] = useState(false);
  const [actionEnCours, setActionEnCours] = useState(null);

  // Charger la liste des boutiques via l'API centralisée
  const chargerBoutiques = async (cle) => {
    if (!cle.trim()) return alert("Veuillez saisir le code secret Super-Admin.");
    
    setChargement(true);
    try {
      const data = await fetchApi(`/api/super-admin/boutiques?secret=${encodeURIComponent(cle)}`);
      setBoutiques(data);
      setConnecte(true);
    } catch (err) {
      alert(err.message || "Code secret incorrect ou accès refusé.");
    } finally {
      setChargement(false);
    }
  };

  // Valider un paiement (ajouter du temps de licence)
  const validerPaiement = async (boutiqueId, mois) => {
    setActionEnCours(boutiqueId);
    try {
      const data = await fetchApi('/api/super-admin/valider-paiement', {
        method: 'POST',
        body: JSON.stringify({ secret, boutique_id: boutiqueId, mois })
      });

      alert(data.message || "Paiement validé avec succès !");
      await chargerBoutiques(secret); // Rafraîchissement de la liste
    } catch (err) {
      alert(err.message || "Erreur lors de la validation du paiement.");
    } finally {
      setActionEnCours(null);
    }
  };

  // Déconnexion de l'interface Super-Admin
  const deconnexion = () => {
    setConnecte(false);
    setSecret('');
    setBoutiques([]);
  };

  // 1. Écran de connexion Super-Admin
  if (!connecte) {
    return (
      <div style={styles.loginCard}>
        <h2>Connexion Super-Admin</h2>
        <p style={styles.subtitle}>Espace de gestion SaaS multi-boutiques</p>
        <input 
          type="password" 
          placeholder="Code secret Super-Admin" 
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && chargerBoutiques(secret)}
          style={styles.input}
        />
        <button 
          onClick={() => chargerBoutiques(secret)} 
          disabled={chargement}
          style={styles.btnPrimary}
        >
          {chargement ? "Vérification..." : "Se connecter"}
        </button>
      </div>
    );
  }

  // 2. Écran principal de gestion
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={{ margin: 0 }}>Espace Gestionnaire SaaS (Super-Admin)</h1>
          <p style={{ margin: '5px 0 0', color: '#666' }}>
            Total boutiques : <strong>{boutiques.length}</strong>
          </p>
        </div>
        <button onClick={deconnexion} style={styles.btnDanger}>
          Déconnexion
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>Nom Boutique</th>
              <th style={styles.th}>Statut Licence</th>
              <th style={styles.th}>Expiration</th>
              <th style={styles.th}>Actions de Paiement</th>
            </tr>
          </thead>
          <tbody>
            {boutiques.length === 0 ? (
              <tr>
                <td colSpan="4" style={styles.emptyTd}>
                  Aucune boutique enregistrée dans la base de données.
                </td>
              </tr>
            ) : (
              boutiques.map((b) => (
                <tr key={b._id} style={styles.tr}>
                  <td style={styles.td}><strong>{b.nom}</strong></td>
                  <td style={styles.td}>
                    <span style={getStatutStyle(b.statutLicence)}>
                      {b.statutLicence || 'INCONNU'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {b.dateExpiration 
                      ? new Date(b.dateExpiration).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        }) 
                      : 'N/A'}
                  </td>
                  <td style={styles.td}>
                    <button 
                      onClick={() => validerPaiement(b._id, 1)} 
                      disabled={actionEnCours === b._id}
                      style={styles.btnAction}
                    >
                      +1 Mois
                    </button>
                    <button 
                      onClick={() => validerPaiement(b._id, 12)} 
                      disabled={actionEnCours === b._id}
                      style={{ ...styles.btnAction, background: '#28a745', color: '#fff' }}
                    >
                      +1 An
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Helpers CSS Inline
const getStatutStyle = (statut) => ({
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '0.85rem',
  fontWeight: 'bold',
  background: statut === 'ACTIVE' ? '#d4edda' : statut === 'ESSAI' ? '#fff3cd' : '#f8d7da',
  color: statut === 'ACTIVE' ? '#155724' : statut === 'ESSAI' ? '#856404' : '#721c24',
});

const styles = {
  container: { padding: '2rem', fontFamily: 'sans-serif' },
  loginCard: { padding: '2rem', maxWidth: '400px', margin: '80px auto', textAlign: 'center', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
  subtitle: { color: '#666', fontSize: '0.9rem', marginBottom: '20px' },
  input: { width: '100%', padding: '10px', marginBottom: '15px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' },
  btnPrimary: { width: '100%', padding: '10px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  btnDanger: { padding: '8px 16px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  btnAction: { marginRight: '8px', padding: '6px 12px', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', background: '#fff' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
  tableHeader: { background: '#f8f9fa', textAlign: 'left' },
  th: { padding: '12px', borderBottom: '2px solid #dee2e6' },
  td: { padding: '12px', borderBottom: '1px solid #dee2e6' },
  tr: { borderBottom: '1px solid #eee' },
  emptyTd: { padding: '20px', textAlign: 'center', color: '#666' }
};