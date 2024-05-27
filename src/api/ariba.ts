import logger from '../utilities/logger';
import { makeRequest, refreshToken, commonParams, queryVendor, cleanWorkspaceResponse, getSMWorkspace, queryRegistrations } from './utils';

const getSupplierParams = (customParams: Partial<ParamsArray>): ParamsArray => {
  return { ...commonParams, ...customParams };
};


const getSupplierDetails = async (supplier: any, token: string): Promise<any> => {
  try {

    const vendorDetails = await queryVendor(supplier.smVendorId, token);
    const registrations = await queryRegistrations(supplier.smVendorId, token);
    const workspace = await getSMWorkspace(registrations.registrations[0].statusId, token);
    const cleanWorkspaceInfo = cleanWorkspaceResponse(workspace.workspace);
    const tasks = cleanWorkspaceInfo.tasks;
    const registrationTaskId = tasks.find((task: any) => task.documentName === 'Supplier Registration Questionnaire').id;
    const registrationDocumentId = tasks.find((task: any) => task.documentName === 'Supplier Registration Questionnaire').documentId;
    const questionnaire = await deprecatedGetQuestionnaireIncludePrevious(registrationDocumentId, token);

    return {
      supplier,
      vendor: vendorDetails,
      registrations,
      workspace,
      cleanWorkspaceInfo,
      tasks,
      registrationTaskId,
      questionnaire,
    };
  } catch (error) {
    logger.error('Error getting supplier details:', error);
    throw new Error('Failed to get supplier details');
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
    logger.error('Error getting questionnaire:', error);
    throw new Error('Failed to get questionnaire');
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

  } catch (error) {
    logger.error('Error searching suppliers:', error);
    throw new Error('Failed to search suppliers');
  }


};

export const approveVendor = async (taskId: string, token: string): Promise<any> => {
  logger.info('Approving taskId ariba.ts', taskId);

  try {

    const params = {
      taskId,
      taskAction: 'Approve',
    };
    return makeRequest('updateTask', params, token, 'POST');

  } catch (error) {
    logger.error('Error approving vendor:', error);
    throw new Error('Failed to approve vendor');
  }

};
