import { commonHeaders } from './commonHeaders';
import logger from '../../utilities/logger';

const baseURL = 'https://s1.mn2.ariba.com/SM/rest';

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

const makeRequest = async ( endpoint: string,  params: any,  token: string,  requestMethod: 'GET' | 'POST' = 'POST',  urlParams?: Record<string, string>): Promise<any> => {
  let urlSearchParams: string;

  if (urlParams) {
    logger.info('urlParams', urlParams);
    urlSearchParams = new URLSearchParams(urlParams).toString();
  }

  const url = `${baseURL}/${endpoint}?realm=JCD&${urlSearchParams}`;

  const headers = {
    ...commonHeaders,
    'Content-Type': 'application/json',
    'x-auth-token': token,
  };

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

export { refreshToken, makeRequest };
