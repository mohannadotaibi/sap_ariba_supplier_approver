import {commonSupplierParams} from './commons'

export const cleanWorkspaceResponse = (response: string): any => {
    return JSON.parse(response);
};

export const getSupplierParams = (customParams: Partial<ParamsArray>): ParamsArray => {
    return { ...commonSupplierParams, ...customParams };
};