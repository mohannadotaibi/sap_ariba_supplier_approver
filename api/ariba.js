let token = "c";
const baseURL = 'https://s1.mn2.ariba.com/SM/rest';

const commonParams = {
    includeLegalAddress: true,
    categoryCode: [],
    regionCode: [],
    departmentCode: [],
    includeOrderingAddresses: true,
    includeRemittanceAddresses: true,
    purchasingUnitCodes: [],
    realmName: "JCD",
    smVendorIds: [],
    filterOutDisqualifiedMatrix: false,
    includeMatrix: false,
    searchQualificationAndRegistrationStatusAsAWhole: false,
    isErpIntegrated: null,
    keyword: "",
    qualificationStatus: [],
    preferredLevel: [],
    spqFilterAnswerRequests: [],
    certCondition: {},
    overallRiskScoreLevel: [],
    smProcessStatus: [],
    isFactory: false,
    activeType: "active",
    includeFacet: true,
    mainVendorsOnly: true,
    isBulkQualification: false,
    isMQEnhancementFlow: false,

};

function getSupplierParams(customParams) {
    return { ...commonParams, ...customParams };
}

const commonHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
    'X-Permitted-Cross-Domain-Policies': 'master-only',
    'sec-ch-ua': '"Not/A)Brand";v="99", "Google Chrome";v="115", "Chromium";v="115"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
};


async function refreshToken() {
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

async function makeRequest(endpoint, params) {
    // Check if the data exists in the local JSON database
    const url = `${baseURL}/${endpoint}?realm=JCD`;

    const headers = {
        ...commonHeaders,
        'Content-Type': 'application/json',
        'x-auth-token': token,
    };

    refreshToken(); // Refresh the token before making the request

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(params),
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

async function searchSuppliers(customParams) {
    console.log(customParams)
    const params = getSupplierParams({ ...customParams });
    console.log(params)
  
    return makeRequest('searchSuppliers', params);
}

module.exports = {
    searchSuppliers
}