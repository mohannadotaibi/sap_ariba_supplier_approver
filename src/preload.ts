import { ipcRenderer, contextBridge } from "electron";
//import logger from "./utilities/logger";
let searchSuppliersPromiseResolver: any;
let approveVendorPromiseResolver: any;

ipcRenderer.on('search-suppliers-reply', (event, res) => {
    //logger.debug(`Received search-suppliers-reply: ${JSON.stringify(res)}`)
    if (searchSuppliersPromiseResolver) {
        searchSuppliersPromiseResolver(res);
    }
});

ipcRenderer.on('approve-vendor-reply', (event, res) => {
    //logger.debug(`Received approve-vendor-reply: ${JSON.stringify(res)}`)
    if (approveVendorPromiseResolver) {
        approveVendorPromiseResolver(res);
    }
});

contextBridge.exposeInMainWorld("api", {
    searchSuppliers: (supplier: string, token: string) => new Promise((resolve) => {
        searchSuppliersPromiseResolver = resolve;
        
        //logger.debug(`Sending search-suppliers: ${supplier}`)
        ipcRenderer.send("search-suppliers", supplier, token);
    }),

    openLoginWindow: () => {
        ipcRenderer.send('open-login-window');
    },

    receiveToken: (callback: (token: string) => void) => {
        ipcRenderer.on('token-received', (event, token) => callback(token));
    },

    
    approveVendor: (taskId:string, token: string) => new Promise((resolve) => {
        approveVendorPromiseResolver = resolve;
        
        //logger.debug(`Sending approve-vendor: ${taskId}`)
        ipcRenderer.send("approve-vendor", taskId, token);
    }),
    
    saveInputs: (data: any) => {
       // logger.debug(`Sending save-inputs: ${JSON.stringify(data)}`)
        ipcRenderer.send('save-inputs', data)
    },
    
    loadInputs: () => {
        return new Promise((resolve) => {
            ipcRenderer.once('load-inputs-reply', (event, data) => {
              //  logger.debug(`Received load-inputs-reply: ${JSON.stringify(data)}`)
                resolve(data)
            });
            //logger.debug('Sending load-inputs')
            ipcRenderer.send('load-inputs');
        });
    },

});