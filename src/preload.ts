import { ipcRenderer, contextBridge } from "electron";

let searchSuppliersPromiseResolver: any;
let approveVendorPromiseResolver: any;

ipcRenderer.on('search-suppliers-reply', (event, res) => {
    if (searchSuppliersPromiseResolver) {
        searchSuppliersPromiseResolver(res);
    }
});

ipcRenderer.on('approve-vendor-reply', (event, res) => {
    if (approveVendorPromiseResolver) {
        approveVendorPromiseResolver(res);
    }
});


contextBridge.exposeInMainWorld("api", {
    searchSuppliers: (supplier: string, token: string) => new Promise((resolve) => {
        searchSuppliersPromiseResolver = resolve;
        ipcRenderer.send("search-suppliers", supplier, token);
    }),
    
    approveVendor: (taskId:string, token: string) => new Promise((resolve) => {
        approveVendorPromiseResolver = resolve;
        ipcRenderer.send("approve-vendor", taskId, token);
    }),
    
    saveInputs: (data: any) => ipcRenderer.send('save-inputs', data),
    
    loadInputs: () => {
        return new Promise((resolve) => {
            ipcRenderer.once('load-inputs-reply', (event, data) => resolve(data));
            ipcRenderer.send('load-inputs');
        });
    },

});