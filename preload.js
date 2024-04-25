const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  ping: () => ipcRenderer.invoke('ping')

  // we can also expose variables, not just functions
})

contextBridge.exposeInMainWorld('api', {
  searchSuppliers: (customParams) => {
    console.log('searchSuppliers', customParams)
    ipcRenderer.invoke('searchSuppliers', customParams)
  } 
})