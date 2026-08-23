// URL de base de l'API Backend sur Render
export const API_URL = import.meta.env.VITE_API_URL || 'https://supermarche-backend.onrender.com';

/**
 * Fonction utilitaire centralisée pour effectuer des appels API sécurisés.
 * Elle gère automatiquement le préfixe de l'URL et la conversion JSON.
 */
export async function fetchApi(endpoint, options = {}) {
  const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erreur API (${response.status}): ${errorText || response.statusText}`);
  }

  return response.json();
}