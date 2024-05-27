import path from 'path';
import { BrowserWindow } from 'electron';

let mainWindow: BrowserWindow | null = null;

// Function to create the main application window
export const createWindow = (): void => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, './preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const devServerUrl = process.env.MAIN_WINDOW_VITE_DEV_SERVER_URL;
  const mainWindowName = process.env.MAIN_WINDOW_VITE_NAME;

  if (devServerUrl) {
    mainWindow.loadURL(devServerUrl);
  } else if (mainWindowName) {
    mainWindow.loadFile(path.join(__dirname, `../../renderer/${mainWindowName}/index.html`));
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../index.html'));
  }

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
};

// Export the mainWindow to use in other modules
export { mainWindow };
