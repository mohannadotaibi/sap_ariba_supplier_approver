

const baseURL = 'https://s1.mn2.ariba.com/SM/rest';

const commonParams: paramsArray = {
    activeType: "active",
    batchSize: 5,
    categoryCode: [],
    certCondition: {},
    departmentCode: [],
    filterOutDisqualifiedMatrix: false,
    includeFacet: true,
    includeLegalAddress: false,
    includeMatrix: false,
    includeOrderingAddresses: true,
    includeRemittanceAddresses: true,
    isBulkQualification: false,
    isErpIntegrated: null,
    isFactory: false,
    isMQEnhancementFlow: false,
    keyword: "",
    mainVendorsOnly: true,
    overallRiskScoreLevel: [],
    preferredLevel: [],
    purchasingUnitCodes: [],
    qualificationStatus: [],
    realmName: "JCD",
    regionCode: [],
    registrationStatus: [],
    registrationUpdateStatus: [],
    searchQualificationAndRegistrationStatusAsAWhole: false,
    smProcessStatus: [],
    smVendorIds: [],
    spqFilterAnswerRequests: [],
    
};

const commonHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
    'X-Permitted-Cross-Domain-Policies': 'master-only',
    'sec-ch-ua': '"Not/A)Brand";v="99", "Google Chrome";v="115", "Chromium";v="115"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
};

const getSupplierParams = (customParams: any) =>{
    return { ...commonParams, ...customParams };
}

const refreshToken = async (token: string) =>{
    const url = `${baseURL}/internal/refreshtoken?realm=JCD`;

    const headers = {
        ...commonHeaders,
        'x-auth-token': token,
    };

    const response = await fetch(url, {
        method: 'GET',
        headers,
    });

    if (response.ok) {
        token = response.headers.get('x-auth-token');
        console.log('got new token', token)
    } else {
        console.error('Failed to refresh token');
    }
}

const makeRequest = async (endpoint: string, params: any, token: string, requestMethod ='POST', urlParams?: any) => {
    // combine the url params from a json object to a string so it can be appended in the url
    let urlSearchParams: any;
    
    if (urlParams) {
        console.log('urlParams', urlParams);
        urlSearchParams = new URLSearchParams(urlParams); //urlParams.map((param: string | number) => `${param}=${params[param]}`).join('&');
    }
   
    // Check if the data exists in the local JSON database
    const url = `${baseURL}/${endpoint}?realm=JCD&${urlSearchParams}`;

    const headers = {
        ...commonHeaders,
        'Content-Type': 'application/json',
        'x-auth-token': token,
    };

    refreshToken(token); // Refresh the token before making the request

    try {
        const response = await fetch(url, {
            method: requestMethod,
            headers,
            body: params? JSON.stringify(params): null,
        });

        if (!response.ok) {
            // if error code is 401 it means the token has expired
            if (response.status === 401) {
                console.log('Token expired, refreshing...');
                throw new Error('TokenExpired');
            }
            else {
                console.log(response);
                throw new Error(`Error in ${endpoint}: ${response.status} ${response.statusText}`);
            }
        }

        const data = await response.json();
        return data;
    } 
    catch (error) {
        console.error(`Error in ${endpoint}:`, error.message);
        throw error;
    }
}



const queryVendor = async (vendorId: string, token: string) => {
    const params = {}; //getSupplierParams({ smVendorIds: [vendorId] });
    return makeRequest('queryVendor', null, token, 'GET', {
        'smVendorId': vendorId,
        'includeInactive': 'true'
    });
}

// takes a string which has double quotes escaped and returns it with double quotes unescaped as an object
const cleanWorkspaceResponse = (response: string) => {
    const cleanedResponse = response.replace(/\\/g, '');
    return JSON.parse(cleanedResponse);
}

const getSMWorkspace = async(workspaceId: string, token: string) => {
    const params = {};

    return makeRequest(`getSMWorkspace`, null, token, 'GET', {
        'wsId': workspaceId,
        'includeInactiveDocuments': 'false'
    });
}

const queryRegistrations = async(vendorId: string, token:string ) => {
    const params = {
        "includeInactive": true,
        "isRetrievePreviousWorkspaces": false,
        "registrations": [
          {
            "smVendorId": vendorId
          }
        ]
      }
    return makeRequest('queryRegistration', params, token);
}

export const searchSuppliers = async (customParams: any, token:string) => {
    const params = getSupplierParams({ ...customParams });
    const suppliers = await makeRequest('searchSuppliers', params, token);
    const vendor = await queryVendor(suppliers.suppliers[0].smVendorId, token);
    const registrations = await queryRegistrations(suppliers.suppliers[0].smVendorId, token);
    const workspace = await getSMWorkspace(registrations.registrations[0].statusId, token);
    const cleanWorkspaceInfo = cleanWorkspaceResponse(workspace.workspace);
    const tasksOnly = cleanWorkspaceInfo.tasks;
    const registrationTaskOnlyNumber = tasksOnly.find((task: any) => task.documentName === "Supplier Registration Questionnaire").id;

    const response = {
        suppliers: suppliers,
        vendor: vendor,
        registrations: registrations,
        workspace: workspace,
        cleanWorkspaceInfo: cleanWorkspaceInfo,
        tasks: tasksOnly,
        registrationTaskId: registrationTaskOnlyNumber,
    }

    return response;
}

export const approveVendor = async (taskId: string, token: string) => {
    console.log('approving taskId ariba.ts', taskId);
    
    const params = {
        "taskId": taskId,
        "taskAction": "Approve"
    };
    return makeRequest('updateTask', params, token, 'POST');
}

