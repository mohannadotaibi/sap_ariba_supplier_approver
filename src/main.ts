import { app, BrowserWindow, ipcMain, Notification } from 'electron';
import path from 'path';
import logger from './utilities/logger';
import { AribaRestApi } from './api/aribaRestApi';
import * as dotenv from 'dotenv';
dotenv.config();

if (!process.env.MAIN_WINDOW_VITE_DEV_SERVER_URL || !process.env.API_BASE_URL || !process.env.LOGIN_URL) {
  throw new Error('Environment variables are missing. Please check your .env file.');
}

let mainWindow: BrowserWindow | null = null;

export const createWindow = (): void => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, './preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
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
};

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('ready', () => {
  createWindow();
  logger.info('main.ts: App ready');
});

if (require('electron-squirrel-startup')) {
  app.quit();
}

// Centralized Error Handling
const handleError = (error: any, message: string, event: Electron.IpcMainEvent, replyChannel: string): void => {
  logger.error(`${message}:`, error);
  event.reply(replyChannel, { error: message });
};


// IPC event handlers
// Search suppliers event handler
ipcMain.on('search-suppliers', async (event, { supplier, token }: SearchSuppliersEvent) => {
  try {
    const ariba = new AribaRestApi(token);
    const response = await ariba.searchSuppliers({ keyword: supplier });
    event.reply('search-suppliers-reply', response);
  } catch (error) {
    handleError(error, 'Failed to search suppliers', event, 'search-suppliers-reply');
    if (error.message === 'TokenExpired') {
      new Notification({
        title: 'Session Expired',
        body: 'Your session has expired. Please log in again.'
      }).show();
    }
  }
});

// Approve vendor event handler
ipcMain.on('approve-vendor', async (event, { taskId, token }: ApproveVendorEvent) => {
  try {
    logger.info('main.ts: Approve vendor called with:', taskId, token);
    const ariba = new AribaRestApi(token);
    const approvedVendor = await ariba.approveVendor(taskId);
    logger.info('main.ts: Approved vendor:', approvedVendor);
    event.reply('approve-vendor-reply', approvedVendor);
  } catch (error) {
    handleError(error, 'Failed to approve vendor', event, 'approve-vendor-reply');
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
      webSecurity: true
    }
  });
  loginWindow.loadURL(process.env.LOGIN_URL);

  loginWindow.webContents.session.webRequest.onHeadersReceived({ urls: [`${process.env.API_BASE_URL}/*`] }, (details, callback) => {
    const authToken = details.responseHeaders['x-auth-token']?.[0];

    if (authToken) {
      logger.info('main.ts: x-auth-token received:', authToken);
      mainWindow?.webContents.send('token-received', authToken);
      loginWindow.close();
    }
    callback({ cancel: false });
  });

  loginWindow.on('closed', () => {
    loginWindow = null;
    logger.info('main.ts: Login window closed');
  });
});

ipcMain.on('refresh-token', async (event, token: string) => {
  try {
    const ariba = new AribaRestApi(token);
    await ariba.refreshToken();
    const newToken = ariba.getToken();
    event.reply('token-refreshed', newToken);
  } catch (error) {
    handleError(error, 'Failed to refresh token', event, 'token-refreshed');
  }
});