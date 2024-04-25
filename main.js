// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require('electron/main')
const path = require('node:path')
const {searchSuppliers} = require('./api/ariba')

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 600,
    
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })
  mainWindow.webContents.openDevTools();

  mainWindow.loadFile('index.html')
}

app.whenReady().then(() => {
  ipcMain.handle('ping', () => 'pong')

  ipcMain.handle('searchSuppliers', async (params) => {
    console.log('searchSuppliersFromMain', params)
    return await searchSuppliers(params)
  })


  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.