import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Import de vos styles globaux si présent
// import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
    console.error("Erreur critique : L'élément conteneur #root n'a pas été trouvé dans le fichier HTML.");
} else {
    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}