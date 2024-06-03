import { ipcRenderer, contextBridge } from "electron";

// Define types for resolvers
let searchSuppliersPromiseResolver: ((value: any) => void) | null = null;
let approveVendorPromiseResolver: ((value: any) => void) | null = null;

// Handle search-suppliers reply
ipcRenderer.on('search-suppliers-reply', (event, res) => {
    //logger.debug(`Received search-suppliers-reply: ${JSON.stringify(res)}`)
    if (searchSuppliersPromiseResolver) {
        searchSuppliersPromiseResolver(res);
    }
});

// Handle approve-vendor reply
ipcRenderer.on('approve-vendor-reply', (event, res) => {
    //logger.debug(`Received approve-vendor-reply: ${JSON.stringify(res)}`)
    if (approveVendorPromiseResolver) {
        approveVendorPromiseResolver(res);
    }
});

// Expose protected methods that allow the renderer process to use the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("api", {
    searchSuppliers: (supplier: string, token: string): Promise<any> =>
        new Promise((resolve) => {
            searchSuppliersPromiseResolver = resolve;
            ipcRenderer.send('search-suppliers', supplier, token);
        }),


    openLoginWindow: (): void => {
        ipcRenderer.send('open-login-window');
    },

    receiveToken: (callback: (token: string) => void): void => {
        ipcRenderer.on('token-received', (event, token) => callback(token));
    },



    approveVendor: (taskId: string, token: string): Promise<any> =>
        new Promise((resolve) => {
            approveVendorPromiseResolver = resolve;
            ipcRenderer.send('approve-vendor', taskId, token);
        }),

});