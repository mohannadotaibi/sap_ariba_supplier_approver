import { ipcMain, BrowserWindow } from 'electron';
import { searchSuppliers, approveVendor } from '../../api';
import Storage from '../../utilities/storage';
import logger from '../../utilities/logger';
import { mainWindow } from './createWindow';

// Initialize storage
const myStorage = new Storage('../../data/data.json');

// IPC event handlers

// Save inputs event handler
ipcMain.on('save-inputs', async (event, data) => {
  try {
    await myStorage.save(data);
    console.log('Data written', data);
  } catch (error) {
    logger.error('Failed to save inputs:', error);
    event.reply('save-inputs-reply', { error: 'Failed to save inputs' });
  }
});

// Load inputs event handler
ipcMain.on('load-inputs', async (event) => {
  try {
    const data = await myStorage.load();
    event.reply('load-inputs-reply', JSON.parse(JSON.stringify(data))); // Ensure data is serializable
  } catch (error) {
    logger.error('Failed to load inputs:', error);
    event.reply('load-inputs-reply', { error: 'Failed to load inputs' });
  }
});

// Search suppliers event handler
ipcMain.on('search-suppliers', async (event, supplier: string, token: string) => {
  try {
    const response = await searchSuppliers({ keyword: supplier }, token);
    event.reply('search-suppliers-reply', response);
  } catch (error) {
    logger.error('Error searching suppliers:', error);
    event.reply('search-suppliers-reply', { error: 'Failed to search suppliers' });
  }
});

// Approve vendor event handler
ipcMain.on('approve-vendor', async (event, taskId: string, token: string) => {
  logger.info('Approve vendor called with:', taskId, token);

  try {
    const approvedVendor = await approveVendor(taskId, token);
    logger.info('Approved vendor:', approvedVendor);
    event.reply('approve-vendor-reply', approvedVendor);
  } catch (error) {
    logger.error('Error approving vendor:', error);
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
  loginWindow.loadURL('http://jcd.sourcing.mn2.ariba.com/');

  loginWindow.webContents.on('did-finish-load', async () => {
    const url = loginWindow!.webContents.getURL();
  });

  loginWindow.webContents.session.webRequest.onHeadersReceived(
    { urls: ['*://s1.mn2.ariba.com/*'] },
    (details, callback) => {
      if (details.responseHeaders['x-auth-token']) {
        const authToken = details.responseHeaders['x-auth-token'][0];
        console.log('x-auth-token:', authToken);
        mainWindow!.webContents.send('token-received', authToken);
        loginWindow!.close();
      }
      callback({ cancel: false });
    }
  );

  loginWindow.on('closed', () => {
    loginWindow = null;
  });
});
