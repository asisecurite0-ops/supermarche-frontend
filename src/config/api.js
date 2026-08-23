// URL de base de l'API Backend (Vite / React)
export const API_URL = import.meta.env.VITE_API_URL || 'https://supermarche-backend.onrender.com';

/**
 * Client API centralisé pour effectuer des requêtes HTTP sécurisées.
 * - Injection automatique du Token JWT (Bearer)
 * - Support natif des requêtes JSON et FormData (fichiers)
 * - Gestion centralisée des erreurs HTTP et expiration de session (401)
 */
export async function fetchApi(endpoint, options = {}) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_URL}${cleanEndpoint}`;

  // Récupération du token d'authentification
  const token = localStorage.getItem('token');

  // En-têtes de base
  const headers = {
    ...options.headers,
  };

  // Ajout automatique du jeton Bearer si présent
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Ne pas ajouter 'Content-Type': 'application/json' si c'est un FormData (upload de fichier)
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);

    // Redirection automatique si le jeton est expiré ou invalide
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('utilisateur');
      
      // Empêche les boucles de redirection sur la page de connexion
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      throw new Error('Session expirée. Veuillez vous reconnecter.');
    }

    // Extraction du contenu de la réponse
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Gestion des erreurs HTTP (4xx, 5xx)
    if (!response.ok) {
      const messageErreur = typeof data === 'object' && data?.message 
        ? data.message 
        : `Erreur API (${response.status}): ${response.statusText}`;
      throw new Error(messageErreur);
    }

    return data;

  } catch (error) {
    console.error(`[API Error] ${options.method || 'GET'} ${cleanEndpoint} :`, error.message);
    throw error;
  }
}