import { ipcRenderer, contextBridge } from "electron";

// Define types for resolvers
type PromiseResolver<T> = (value: T) => void;
type SupplierResponse = any;
type VendorResponse = any;

let searchSuppliersPromiseResolver: PromiseResolver<SupplierResponse> | null = null;
let approveVendorPromiseResolver: PromiseResolver<VendorResponse> | null = null;
let refreshTokenPromiseResolver: PromiseResolver<string> | null = null;

// Handle search-suppliers reply
ipcRenderer.on('search-suppliers-reply', (event, res: SupplierResponse) => {
    if (searchSuppliersPromiseResolver) {
        searchSuppliersPromiseResolver(res);
        searchSuppliersPromiseResolver = null;
    }
});

// Handle approve-vendor reply
ipcRenderer.on('approve-vendor-reply', (event, res: VendorResponse) => {
    if (approveVendorPromiseResolver) {
        approveVendorPromiseResolver(res);
        approveVendorPromiseResolver = null; // Clear the resolver
    }
});

ipcRenderer.on('token-refreshed', (event, token: string) => {
    if (refreshTokenPromiseResolver) {
        refreshTokenPromiseResolver(token);
        refreshTokenPromiseResolver = null;
    }
});

// Expose protected methods that allow the renderer process to use the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("api", {
    searchSuppliers: (supplier: string, token: string): Promise<SupplierResponse> => {
        return new Promise((resolve) => {
            searchSuppliersPromiseResolver = resolve;
            ipcRenderer.send('search-suppliers', { supplier, token });
        });
    },

    approveVendor: (taskId: string, token: string): Promise<VendorResponse> => {
        return new Promise((resolve) => {
            approveVendorPromiseResolver = resolve;
            ipcRenderer.send('approve-vendor', { taskId, token });
        });
    },

    refreshToken: (token: string): Promise<string> => {
        return new Promise((resolve) => {
            refreshTokenPromiseResolver = resolve;
            ipcRenderer.send('refresh-token', token);
        });
    },

    openLoginWindow: (): void => {
        ipcRenderer.send('open-login-window');
    },

    receiveToken: (callback: (token: string) => void): void => {
        ipcRenderer.on('token-received', (event, token: string) => callback(token));
    },
});