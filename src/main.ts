import { app, BrowserWindow, ipcMain, Notification } from 'electron';
import { useStore } from './store/main';
import { searchSuppliers, approveVendor } from './api/main';
import logger from './utilities/logger';
import path from 'path';
import { refreshToken } from './api/commons';
import * as dotenv from 'dotenv';
dotenv.config();

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

  mainWindow.webContents.openDevTools();
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
};

// IPC event handlers
// Search suppliers event handler
ipcMain.on('search-suppliers', async (event, supplier: string, token: string) => {
  try {
    const response = await searchSuppliers({ keyword: supplier }, token);
    event.reply('search-suppliers-reply', response);

  } 
  catch (error) {
    logger.error('main.ts: Error searching suppliers from ipc main:', error);
    if (error.message === 'TokenExpired') {
      new Notification({
        title: 'Session Expired',
        body: 'Your session has expired. Please log in again.',
      }).show();
      event.reply('search-suppliers-reply', { error: 'TokenExpired' });
      

    }
    else{
      event.reply('search-suppliers-reply', { error: 'Failed to search suppliers 02' });
    }
    
  }
});

// Approve vendor event handler
ipcMain.on('approve-vendor', async (event, taskId: string, token: string) => {
  logger.info('main.ts: Approve vendor called with:', taskId, token);

  try {
    const approvedVendor = await approveVendor(taskId, token);
    logger.info('main.ts: Approved vendor:', approvedVendor);
    event.reply('approve-vendor-reply', approvedVendor);
  } catch (error) {
    logger.error('main.ts: Error approving vendor:', error);
    event.reply('approve-vendor-reply', { error: 'Failed to approve vendor' });
  }
});

// Open login window event handler
ipcMain.on('open-login-window', () => {
  let loginWindow: BrowserWindow | null = new BrowserWindow({
    width: 800,
    height: 600,
    parent: mainWindow,
    modal: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
    },
  });
  loginWindow.loadURL(process.env.LOGIN_URL);

  loginWindow.webContents.session.webRequest.onHeadersReceived(
    { urls: [`${process.env.API_BASE_URL}/*`] },
    (details, callback) => {
      if (details.responseHeaders['x-auth-token']) {
        const authToken = details.responseHeaders['x-auth-token'][0];
        console.log('main.ts: x-auth-token:', authToken);
        mainWindow?.webContents.send('token-received', authToken);
        loginWindow?.close();
      }
      callback({ cancel: false });
    }
  );

  loginWindow.on('closed', () => {
    loginWindow = null;
  });
});

ipcMain.on('refresh-token', async (event, token: string) => {
  try { 
    const newToken = await refreshToken(token);
    event.reply('token-refreshed', newToken);
  } catch (error) {
    logger.error('main.ts: Error refreshing token:', error);
    event.reply('token-refreshed', { error: 'Failed to refresh token' });
  }
}
);

// Quit the app when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Re-create a window when the app is activated (macOS).
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Create the main application window when Electron is ready.
app.on('ready', () =>{
  createWindow();
  logger.info('main.ts: App ready');
});


  

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}
