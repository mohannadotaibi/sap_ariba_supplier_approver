import { ipcRenderer, contextBridge } from "electron";

// Define types for resolvers
let searchSuppliersPromiseResolver: ((value: any) => void) | null = null;
let approveVendorPromiseResolver: ((value: any) => void) | null = null;
let refreshTokenPromiseResolver: ((value: any) => void) | null = null;

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

ipcRenderer.on('token-refreshed', (event, token) => {
    if (refreshTokenPromiseResolver) {
        refreshTokenPromiseResolver(token);
    }
});

// Expose protected methods that allow the renderer process to use the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("api", {
    searchSuppliers: (supplier: string, token: string): Promise<any> =>{
        return new Promise((resolve) => {
            searchSuppliersPromiseResolver = resolve;
            ipcRenderer.send('search-suppliers', supplier, token);
        })
    },

    openLoginWindow: (): void => {
        ipcRenderer.send('open-login-window');
    },

    refreshToken: (token: string): Promise<string> => {
        return new Promise((resolve) => {
            ipcRenderer.send('refresh-token', token);
            refreshTokenPromiseResolver = resolve;
        }
    )},

    receiveToken: (callback: (token: string) => void): void => {
        ipcRenderer.on('token-received', (event, token) => callback(token));
    },

    approveVendor: (taskId: string, token: string): Promise<any> =>{
        return new Promise((resolve) => {
            approveVendorPromiseResolver = resolve;
            ipcRenderer.send('approve-vendor', taskId, token);
        })
    }
});