// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { ipcRenderer, contextBridge } from "electron";

// expose a function called print token that takes a string and passes it to the main.ts file function called searchSuppliers
contextBridge.exposeInMainWorld("api", {
  searchSuppliers: (supplier: string, token: string) => {
    console.log('api is running 😁')
    const res = ipcRenderer.send("search-suppliers", supplier, token);
    console.log('res', res)
  },
});