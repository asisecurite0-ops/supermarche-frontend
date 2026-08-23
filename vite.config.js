import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import obfuscator from 'rollup-plugin-obfuscator';

export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';

  return {
    base: './', // Corrige le chargement des assets sous Electron
    plugins: [
      react(),
      // L'obfuscation s'exécute de façon optimale en mode production
      isProd && obfuscator({
        global: true,
        compact: true,
        controlFlowFlattening: false, // Désactivé par défaut si vous voulez éviter de ralentir l'exécution
        deadCodeInjection: false,
        stringArray: true,
        rotateStringArray: true,
        stringArrayThreshold: 0.75,
      }),
    ].filter(Boolean),
  };
});