require('dotenv').config();
import { ipcMain, app, BrowserWindow } from 'electron';
import { searchSuppliers } from './api';
import path from 'path';

console.log('main.ts');
console.log('env token', process.env.TOKEN)

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
  const suppliers = await searchSuppliers({keyword: supplier}, token);
  console.log(suppliers)
  event.reply('search-suppliers-reply', suppliers);
});