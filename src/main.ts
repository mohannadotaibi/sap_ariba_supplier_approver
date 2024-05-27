import { app, BrowserWindow } from 'electron';
import { createWindow } from './main/utils/createWindow';
import './main/utils/ipcHandlers';


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
app.on('ready', createWindow);

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}
