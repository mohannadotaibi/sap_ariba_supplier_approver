import { log } from 'winston';
import logger from '../utilities/logger';
import { makeRequest, commonParams } from './commons';

const queryVendor = async (vendorId: string, token: string): Promise<any> => {
    return makeRequest('queryVendor', null, token, 'GET', {
        smVendorId: vendorId,
        includeInactive: 'true',
    });
};

const cleanWorkspaceResponse = (response: string): any => {
    return JSON.parse(response);
};

const getSMWorkspace = async (workspaceId: string, token: string): Promise<any> => {
    return makeRequest('getSMWorkspace', null, token, 'GET', {
        wsId: workspaceId,
        includeInactiveDocuments: 'false',
    });
};

const queryRegistrations = async (vendorId: string, token: string): Promise<any> => {
    const params = {
        includeInactive: true,
        isRetrievePreviousWorkspaces: false,
        registrations: [
            {
                smVendorId: vendorId,
            },
        ],
    };
    return makeRequest('queryRegistration', params, token);
};


const getSupplierParams = (customParams: Partial<ParamsArray>): ParamsArray => {
    return { ...commonParams, ...customParams };
};

const getSupplierDetails = async (supplier: any, token: string): Promise<any> => {
    try {

        logger.info('api/main.ts: requesting supplier details' + supplier.smVendorId, token)
        const vendorDetails = await queryVendor(supplier.smVendorId, token);

        logger.info('api/main.ts: requesting registrations' + supplier.smVendorId, token)
        const registrations = await queryRegistrations(supplier.smVendorId, token);

        logger.info(`api/main.ts: requesting workspace ${registrations.registrations[0].statusId} ${token}`)
        const workspace = await getSMWorkspace(registrations.registrations[0].statusId, token);
        console.log('api/main.ts: got the results')

        const cleanWorkspaceInfo = cleanWorkspaceResponse(workspace.workspace);
        const tasks = cleanWorkspaceInfo.tasks;
        

        /* Getting External Questionnaire */
        console.log('api/main.ts: searching for external questionnaire')
        
        const externalRegistrationTask = tasks.find((task: any) => task.documentName === 'Supplier Registration Questionnaire');
        
        if (externalRegistrationTask != undefined) {
            logger.info(`api/main.ts: requesting external questionnaire ${externalRegistrationTask.documentId} ${token}`)
            externalRegistrationTask.questionnaire = await deprecatedGetQuestionnaireIncludePrevious(externalRegistrationTask.documentId, token);
        }

        /* Getting Internal Questionnaire */
        console.log('api/main.ts: searching for internal questionnaire')

        const internalRegistrationTask = tasks.find((task: any) => task.documentName === 'Internal Registration Questionnaire'); 

        if (internalRegistrationTask != undefined) {
            logger.info(`api/main.ts: requesting internal questionnaire ${internalRegistrationTask.documentId} ${token}`)
            internalRegistrationTask.questionnaire = await deprecatedGetQuestionnaireIncludePrevious(internalRegistrationTask.documentId, token);
        }


        return {
            supplier: supplier,
            vendor: vendorDetails,
            registrations: registrations,
            workspace: workspace,
            cleanWorkspaceInfo: cleanWorkspaceInfo,
            tasks,
            externalRegistrationTask: externalRegistrationTask,
            internalRegistrationTask: internalRegistrationTask
        };
    } catch (error) {
        logger.error('api/main.ts: Error getting supplier details:', error);
        throw new Error('api/main.ts: Failed to get supplier details');
    }

};

const deprecatedGetQuestionnaireIncludePrevious = async (docId: string, token: string): Promise<any> => {
    try {

        const params = {
            docId,
            viewMode: 'View',
            includePreviousResponse: 'true',
            returnLatestDocIfArchived: 'false',
        };

        return makeRequest('deprecatedGetQuestionnaireIncludePrevious', null, token, 'GET', params);

    } catch (error) {
        logger.error('api/main.ts: Error getting questionnaire:', error);
        throw new Error('api/main.ts: Failed to get questionnaire');
    }


};

export const searchSuppliers = async (customParams: Partial<ParamsArray>, token: string): Promise<any[]> => {
    try {

        const params = getSupplierParams(customParams);
        const searchResponse = await makeRequest('searchSuppliers', params, token);

        if (searchResponse.suppliers.length > 0) {
            const supplierDetails = await Promise.all(
                searchResponse.suppliers.map((supplier: any) => getSupplierDetails(supplier, token))
            );
            return supplierDetails;
        }

        return [];

    } 
    catch (error) {
        logger.error('api/main.ts: Error searching suppliers:', error);
        if (error.message === "TokenExpired") {
            throw new Error('TokenExpired');
        }
        else {
            throw new Error('api/main.ts: Failed to search suppliers');
        }
    }


};

export const approveVendor = async (taskId: string, token: string): Promise<any> => {
    logger.info('api/main.ts: Approving taskId ariba.ts', taskId);

    try {

        const params = {
            taskId,
            taskAction: 'Approve',
        };
        return makeRequest('updateTask', params, token, 'POST');

    } catch (error) {
        logger.error('api/main.ts: Error approving vendor:', error);
        throw new Error('api/main.ts: Failed to approve vendor');
    }

};
