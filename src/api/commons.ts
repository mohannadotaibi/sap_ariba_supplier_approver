import logger from '../utilities/logger';

const baseURL = 'https://s1.mn2.ariba.com/SM/rest';

const commonHeaders = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
  'X-Permitted-Cross-Domain-Policies': 'master-only',
  'sec-ch-ua': '"Not/A)Brand";v="99", "Google Chrome";v="115", "Chromium";v="115"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
};

const commonParams: ParamsArray = {
  activeType: 'active',
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
  keyword: '',
  mainVendorsOnly: true,
  overallRiskScoreLevel: [],
  preferredLevel: [],
  purchasingUnitCodes: [],
  qualificationStatus: [],
  realmName: 'JCD',
  regionCode: [],
  registrationStatus: [],
  registrationUpdateStatus: [],
  searchQualificationAndRegistrationStatusAsAWhole: false,
  smProcessStatus: [],
  smVendorIds: [],
  spqFilterAnswerRequests: [],
};

const refreshToken = async (token: string): Promise<string> => {
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
    token = response.headers.get('x-auth-token') || token;
    logger.info('Got new token', token);
  } else {
    logger.error('Failed to refresh token');
  }

  return token;
};


const makeRequest = async (endpoint: string, params: any, token: string, requestMethod: 'GET' | 'POST' = 'POST', urlParams?: Record<string, string>): Promise<any> => {
  let urlSearchParams: string;

  if (urlParams) {
    //logger.info('urlParams', urlParams);
    urlSearchParams = new URLSearchParams(urlParams).toString();
  }

  // shouldn't add urlSearchParams if it's empty or undefined
  const url = urlSearchParams ? `${baseURL}/${endpoint}?realm=JCD&${urlSearchParams}` : `${baseURL}/${endpoint}?realm=JCD`;

  const headers = {
    ...commonHeaders,
    'Content-Type': 'application/json',
    'x-auth-token': token,
  };
  const paramsString = params ? JSON.stringify(params) : 'none provided';

  logger.log('info', `Making request to ${url} with ${requestMethod} method and Params: ${paramsString}`);

  try {
    const response = await fetch(url, {
      method: requestMethod,
      headers,
      body: params ? JSON.stringify(params) : null,
    });

    if (!response.ok) {
      if (response.status === 401) {
        logger.info('Token expired, refreshing...');
        throw new Error('TokenExpired');
      } else {
        logger.info(response);
        throw new Error(`Error in ${endpoint}: ${response.status} ${response.statusText}`);
      }
    }

    const data = await response.json();
    return data;
  } catch (error) {
    logger.error(`Error in ${endpoint}:`, error.message);
    throw error;
  }
};


export { commonHeaders, commonParams, refreshToken, makeRequest };
