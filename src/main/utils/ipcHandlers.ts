import { ipcMain, BrowserWindow } from 'electron';
import { searchSuppliers, approveVendor } from '../../api';
import logger from '../../utilities/logger';
import { mainWindow } from './createWindow';

// Initialize storage

// IPC event handlers


// Search suppliers event handler
ipcMain.on('search-suppliers', async (event, supplier: string, token: string) => {
  try {
    const response = await searchSuppliers({ keyword: supplier }, token);
    event.reply('search-suppliers-reply', response);
  } catch (error) {
    logger.error('Error searching suppliers:', error);
    event.reply('search-suppliers-reply', { error: 'Failed to search suppliers 02' });
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
