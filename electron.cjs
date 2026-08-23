const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

// 🔒 1. Verrouillage d'instance unique
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  let mainWindow = null;

  function createWindow() {
    const isDev = !app.isPackaged;

    mainWindow = new BrowserWindow({
      width: 1280,
      height: 800,
      minWidth: 1024,
      minHeight: 700,
      title: "SUPERMARCHÉ APP",
      autoHideMenuBar: true,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        devTools: isDev, // Activé uniquement en développement
        webSecurity: false,
        allowRunningInsecureContent: true,
      },
    });

    if (!isDev) {
      Menu.setApplicationMenu(null);
    }

    // 🛠️ Chargement de l'interface
    if (isDev) {
      mainWindow.loadURL('http://localhost:5173');
      mainWindow.webContents.openDevTools();
    } else {
      const pathsToTry = [
        path.join(__dirname, 'dist', 'index.html'),
        path.join(process.resourcesPath, 'app.asar', 'dist', 'index.html'),
        path.join(process.resourcesPath, 'dist', 'index.html')
      ];

      const validPath = pathsToTry.find(p => fs.existsSync(p));

      if (validPath) {
        console.log("✅ Frontend chargé depuis :", validPath);
        mainWindow.loadFile(validPath);
      } else {
        console.error("❌ Fichier index.html introuvable dans les chemins prédéfinis.");
        mainWindow.loadURL(`data:text/html, architectural error: <h2>Erreur de chargement</h2><p>Le fichier index.html est introuvable.</p>`);
      }
    }

    // 🎥 Permissions Webcam / Scanner
    mainWindow.webContents.session.setPermissionCheckHandler((webContents, permission) => {
      if (permission === 'media' || permission === 'pointerLock') return true;
      return false;
    });

    mainWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
      if (permission === 'media') return callback(true);
      return callback(false);
    });

    // 🔒 Blocage des fenêtres pop-up
    mainWindow.webContents.setWindowOpenHandler(() => {
      return { action: 'deny' };
    });

    mainWindow.on('closed', () => {
      mainWindow = null;
    });
  }

  // Gestion multi-instance
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  // Démarrage de l'application
  app.whenReady().then(() => {
    createWindow();
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
}