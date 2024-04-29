// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { IpcRenderer, contextBridge } from "electron";

// expose a function called print token that takes a string and passes it to the main.ts file function called searchSuppliers
contextBridge.exposeInMainWorld("api", {
  searchSuppliers: (token: string) => {
    const ipcRenderer: IpcRenderer = window.require("electron").ipcRenderer;
    ipcRenderer.send("search-suppliers", token);
  },
});