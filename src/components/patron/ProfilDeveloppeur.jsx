import React, { useState } from 'react';

export default function ContactsDeveloppeur() {
  const [copied, setCopied] = useState(false);
  const email = 'asisecurite0@gmail.com';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '20px auto', padding: '0 16px', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: '#1e293b' }}>
      
      {/* 1. Header Banner Premium */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
        color: '#ffffff',
        padding: '32px 36px',
        borderRadius: '24px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
        border: '1px solid #1e293b',
        marginBottom: '28px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '20px'
      }}>
        <div style={{ flex: '1 1 300px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '700',
            backgroundColor: 'rgba(99, 102, 241, 0.2)',
            color: '#a5b4fc',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            marginBottom: '12px'
          }}>
            ⚡ Profil Ingénieur & Développeur
          </div>

          <h1 style={{ margin: '0 0 6px 0', fontSize: '32px', fontWeight: '900', letterSpacing: '-0.5px' }}>
            Mr Lekpa Arnaud
          </h1>

          <p style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '600', color: '#c7d2fe' }}>
            Développeur Informatique / Programmeur
          </p>

          <p style={{ margin: 0, fontSize: '14px', color: '#94a3b8', maxWidth: '580px', lineHeight: '1.5' }}>
            Architecture Logicielle, Web, Mobile & PC | Expert Blockchain, IA & Cybersécurité
          </p>
        </div>

        <div>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '16px',
            fontSize: '13px',
            fontWeight: '700',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            color: '#34d399',
            border: '1px solid rgba(16, 185, 129, 0.3)'
          }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#34d399', display: 'inline-block' }}></span>
            Disponible pour Projets & Audits
          </span>
        </div>
      </div>

      {/* 2. Double Colonne Principale */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '28px' }}>
        
        {/* Colonne Gauche : Compétences & Technologies */}
        <div style={{
          backgroundColor: '#ffffff',
          padding: '28px',
          borderRadius: '24px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ padding: '6px 10px', borderRadius: '10px', backgroundColor: '#e0e7ff', color: '#4f46e5', fontSize: '16px' }}>🛠️</span> 
              Compétences & Domaines d'Expertise
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              {
                icon: '🌐',
                title: 'Web, Mobile & PC',
                desc: 'Sites web modernes, applications mobiles multiplateformes et logiciels PC sur-mesure (POS / Gestion).'
              },
              {
                icon: '⛓️',
                title: 'Blockchain & Cryptomonnaies',
                desc: 'Smart Contracts, déploiement de tokens, architecture Web3 et protocoles décentralisés.'
              },
              {
                icon: '🤖',
                title: 'Intelligence Artificielle',
                desc: 'Intégration de modèles IA, automatisation avancée et algorithmes d’apprentissage.'
              },
              {
                icon: '🛡️',
                title: 'Cybersécurité & Algorithmes',
                desc: 'Algorithmes sécurisés, systèmes de chiffrement avancés et protection des données.'
              },
              {
                icon: '🔍',
                title: 'Audits de Sécurité',
                desc: 'Analyse de vulnérabilités, audits complets de code source et sécurisation d’infrastructures.'
              }
            ].map((item, index) => (
              <div key={index} style={{
                padding: '14px 16px',
                borderRadius: '16px',
                backgroundColor: '#f8fafc',
                border: '1px solid #f1f5f9',
              }}>
                <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '14px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{item.icon}</span> {item.title}
                </div>
                <p style={{ margin: 0, color: '#64748b', fontSize: '13px', lineHeight: '1.5', paddingLeft: '24px' }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Colonne Droite : Contact Direct & Boutons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Card Contact Direct */}
          <div style={{
            backgroundColor: '#ffffff',
            padding: '28px',
            borderRadius: '24px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ padding: '6px 10px', borderRadius: '10px', backgroundColor: '#d1fae5', color: '#059669', fontSize: '16px' }}>📞</span> 
                Coordonnées & Action
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Copier Email */}
              <div style={{ padding: '14px', borderRadius: '16px', backgroundColor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>Email Professionnel</span>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ color: '#1e293b', fontWeight: '600', fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email}</span>
                  <button 
                    onClick={handleCopyEmail}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '10px',
                      backgroundColor: '#4f46e5',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                  >
                    {copied ? '✓ Copié !' : 'Copier'}
                  </button>
                </div>
              </div>

              {/* Téléphones */}
              <div style={{ padding: '14px', borderRadius: '16px', backgroundColor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>Téléphone & Direct Call</span>
                <p style={{ margin: 0, color: '#0f172a', fontWeight: '800', fontSize: '14px' }}>
                  +225 05 84 99 98 71 <span style={{ color: '#cbd5e1', fontWeight: '400' }}>/</span> 01 72 32 20 11
                </p>
              </div>

              {/* Localisation */}
              <div style={{ padding: '14px', borderRadius: '16px', backgroundColor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>Localisation</span>
                <p style={{ margin: 0, color: '#1e293b', fontWeight: '600', fontSize: '14px' }}>📍 Abidjan, Côte d'Ivoire</p>
              </div>

              {/* Bouton WhatsApp */}
              <a 
                href="https://chat.whatsapp.com/GJpZFl3JY2mAtdjBo5OH4M" 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  background: 'linear-gradient(135deg, #10b981 0%, #0d9488 100%)',
                  color: '#ffffff',
                  fontWeight: '700',
                  padding: '14px',
                  borderRadius: '16px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
                }}
              >
                <span style={{ fontSize: '18px' }}>💬</span> Rejoindre le Groupe WhatsApp
              </a>

              {/* Bouton Portfolio */}
              <a 
                href="https://asisecurite0-ops.github.io/AsitTech/" 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  fontWeight: '700',
                  padding: '14px',
                  borderRadius: '16px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)'
                }}
              >
                <span style={{ fontSize: '18px' }}>🚀</span> Visiter le Portfolio (AsiTech)
              </a>
            </div>
          </div>

          {/* Card Réseaux Sociaux */}
          <div style={{
            backgroundColor: '#ffffff',
            padding: '20px',
            borderRadius: '24px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e2e8f0'
          }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '12px' }}>Rejoindre sur les Réseaux</span>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <a 
                href="https://x.com/SecuriteAs10006" 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '12px 8px',
                  borderRadius: '14px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  color: '#0f172a',
                  fontWeight: '700',
                  fontSize: '12px',
                  textDecoration: 'none'
                }}
              >
                <span style={{ fontSize: '18px', marginBottom: '2px' }}>𝕏</span>
                <span>Twitter / X</span>
              </a>

              <a 
                href="https://www.linkedin.com/in/asi-securite-b9013841b/" 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '12px 8px',
                  borderRadius: '14px',
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  color: '#1d4ed8',
                  fontWeight: '700',
                  fontSize: '12px',
                  textDecoration: 'none'
                }}
              >
                <span style={{ fontSize: '18px', marginBottom: '2px' }}>💼</span>
                <span>LinkedIn</span>
              </a>

              <a 
                href="https://discord.gg/ShHawzHwd" 
                target="_blank" 
                rel="noopener noreferrer" 
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '12px 8px',
                  borderRadius: '14px',
                  backgroundColor: '#e0e7ff',
                  border: '1px solid #c7d2fe',
                  color: '#4338ca',
                  fontWeight: '700',
                  fontSize: '12px',
                  textDecoration: 'none'
                }}
              >
                <span style={{ fontSize: '18px', marginBottom: '2px' }}>👾</span>
                <span>Discord</span>
              </a>
            </div>
          </div>

        </div>

      </div>

      {/* 3. Footer Projet Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
        color: '#ffffff',
        padding: '20px 28px',
        borderRadius: '20px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #1e293b',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        <div>
          <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#34d399', marginBottom: '4px' }}>
            ✨ Projet d'Exemple Réalisé
          </div>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '800' }}>Supermarché App (POS SYSCOHADA)</h3>
          <p style={{ margin: 0, color: '#cbd5e1', fontSize: '12px', maxWidth: '600px' }}>
            Système complet de gestion de caisse tactile, comptabilité SYSCOHADA, impression thermique 80mm et suivi de stock en temps réel.
          </p>
        </div>
        <div style={{
          padding: '8px 16px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '800',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          whiteSpace: 'nowrap'
        }}>
          Système Actif & Prêt à Déployer
        </div>
      </div>

    </div>
  );
}