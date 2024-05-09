import { ipcRenderer, contextBridge } from "electron";

contextBridge.exposeInMainWorld("api", {
    searchSuppliers: async (supplier: string, token: string) => {
        const res = await ipcRenderer.send("search-suppliers", supplier, token);
        ipcRenderer.on('search-suppliers-reply', (event, res) => {
                console.log('preload', res)
                return res;
            }
        )
    },
});