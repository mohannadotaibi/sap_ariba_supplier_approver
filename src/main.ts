import Storage from './utilities/storage';
import { ipcMain, app, BrowserWindow } from 'electron';
import { searchSuppliers, approveVendor } from './api';
import path from 'path';
import * as dotenv from "dotenv";

const myStorage = new Storage('../../data.json');

dotenv.config();

console.log('main.ts');
console.log('env token', process.env.TOKEN)


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

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
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
  try {
    const approvedVendor = await approveVendor(taskId, token);
    event.reply('search-suppliers-reply', approvedVendor);
    console.log('approvedVendor', approvedVendor)

  } catch (error) {
    console.error('my error')
    event.reply('search-suppliers-reply', { error: error.message });
  }
});