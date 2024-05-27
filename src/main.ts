import path from 'path';
import { ipcMain, app, BrowserWindow } from 'electron';
import { searchSuppliers, approveVendor } from './api';
import Storage from './utilities/storage';
import logger from './utilities/logger';
import * as dotenv from "dotenv";
dotenv.config();
const myStorage = new Storage('../../data/data.json');


logger.info(`main.ts, env token ${process.env.TOKEN}`)

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

app.on('ready', createWindow);

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


// ipc Functions
ipcMain.on('save-inputs', async (event, data) => {
  try {
    await myStorage.save(data);
    console.log('data written', data)
  }
  catch (error) {
    console.error('Failed to save inputs', error);
  }

});

ipcMain.on('load-inputs', async (event) => {
  try {
    const data = await myStorage.load();
    event.reply('load-inputs-reply', JSON.parse(JSON.stringify(data))); // Ensure data is serializable
  } catch (error) {
    console.error('Failed to send load inputs', error);
    event.reply('load-inputs-reply', {}); // Send empty object on error 
  }
});

// create the search-suppliers function that will be called from the preload.ts file
ipcMain.on('search-suppliers', async (event, supplier, token) => {
  try {
    const response = await searchSuppliers({
      keyword: supplier,

    }, token);

    event.reply('search-suppliers-reply', response);
  } catch (error) {
    event.reply('search-suppliers-reply', { error: error.message });
  }
});

ipcMain.on('approve-vendor', async (event, taskId, token) => {
  logger.log('Approve vendor called with:', taskId, token); // Log to check parameters

  try {
    const approvedVendor = await approveVendor(taskId, token);
    logger.info('Approved vendor:', approvedVendor); // Log the response
    event.reply('approve-vendor-reply', approvedVendor);

  } catch (error) {
    logger.error('Error in approve vendor:', error);
    event.reply('approve-vendor-reply', { error: error.message });
  }
});

ipcMain.on('open-login-window', () => {
  let loginWindow = new BrowserWindow({
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
    const url = loginWindow.webContents.getURL();
    //console.log('Current URL:', url);


    // Not Needed, user may input user and pass in window
    // if (url.includes('adfs.jcd.com.sa')) {
    //   try {
    //     await loginWindow.webContents.executeJavaScript(`
    //       if (document.querySelector('#userNameInput') && document.querySelector('#passwordInput')) {
    //         document.querySelector('#userNameInput').value = '';
    //         document.querySelector('#passwordInput').value = '';
    //         document.querySelector('#loginForm').submit();
    //       } else {
    //         throw 'Login form elements not found.';
    //       }
    //     `);
    //   } catch (error) {
    //     console.error('Error executing script:', error);
    //   }
    // }

  });

  loginWindow.webContents.session.webRequest.onHeadersReceived({ urls: ['*://s1.mn2.ariba.com/*'] }, (details, callback) => {
    if (details.responseHeaders['x-auth-token']) {
      const authToken = details.responseHeaders['x-auth-token'][0];
      console.log('x-auth-token:', authToken);
      // Optionally send token back to renderer process or store it
      // Example: mainWindow.webContents.send('token', authToken);
      mainWindow.webContents.send('token-received', authToken);
      loginWindow.close(); 

    }
    callback({ cancel: false });
  });


  loginWindow.webContents.on('did-navigate', (event, url) => {
    //console.log('Navigated to:', url);
  });



  loginWindow.on('closed', () => {
    loginWindow = null;
  });

})