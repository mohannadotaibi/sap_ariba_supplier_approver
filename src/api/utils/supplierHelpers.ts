import { makeRequest } from './requests';

const queryVendor = async (vendorId: string, token: string): Promise<any> => {
  return makeRequest('queryVendor', null, token, 'GET', {
    smVendorId: vendorId,
    includeInactive: 'true',
  });
};

const cleanWorkspaceResponse = (response: string): any => {
  const cleanedResponse = response.replace(/\\/g, '');
  return JSON.parse(cleanedResponse);
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

export { queryVendor, cleanWorkspaceResponse, getSMWorkspace, queryRegistrations };
