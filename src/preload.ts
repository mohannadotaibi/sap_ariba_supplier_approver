import { ipcRenderer, contextBridge } from "electron";

let searchSuppliersPromiseResolver: any;

ipcRenderer.on('search-suppliers-reply', (event, res) => {
    if (searchSuppliersPromiseResolver) {
        searchSuppliersPromiseResolver(res);
    }
});




contextBridge.exposeInMainWorld("api", {
    searchSuppliers: (supplier: string, token: string) => new Promise((resolve) => {
        searchSuppliersPromiseResolver = resolve;
        ipcRenderer.send("search-suppliers", supplier, token);
    }),
    saveInputs: (data: any) => ipcRenderer.send('save-inputs', data),
    loadInputs: () => {
        return new Promise((resolve) => {
            ipcRenderer.once('load-inputs-reply', (event, data) => resolve(data));
            ipcRenderer.send('load-inputs');
        });
    },

});