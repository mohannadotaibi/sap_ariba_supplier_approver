// a class to initaite the ariba rest api with a constructor and couple of functions
import { headers as aribaCommonHeaders } from './includes/commons';
import { cleanWorkspaceResponse, getSupplierParams } from './includes/utilities'
import fetch from 'node-fetch';
import logger from '../../utilities/logger';
import * as dotenv from 'dotenv';
dotenv.config();

export class AribaRestApi {
	private token: string ;
	private baseURL: string  = `${process.env.API_BASE_URL}/SM/rest`;

	constructor(token: string ) {
		this.token = token;
	}

	// Exported Methods
	async searchSuppliers (customParams: Partial<ParamsArray>): Promise<any[]> {
		try {
			const searchResponse = await this.post('searchSuppliers', getSupplierParams(customParams));
	
			if (searchResponse.suppliers.length > 0) {
				const supplierDetails = await Promise.all(
					searchResponse.suppliers.map((supplier: Supplier) => this.getSupplierDetails(supplier))
				);
				return supplierDetails;
			}
	
			return [];
	
		} 
		catch (error: any) {
			this.handleError(error, 'Error searching suppliers');
		}
	};

	async approveVendor (taskId: string): Promise<any> {
		logger.info(`api/main.ts: Approving taskId  ${taskId}`);
	
		try {
			return await this.post('updateTask', {
				taskId,
				taskAction: 'Approve',
			});
	
		} catch (error) {
			this.handleError(error, 'Error approving vendor');
		}
	
	};

	// Private Methods

	private async getSupplierDetails (supplier: Supplier): Promise<SupplierDetails> {
		try {
	
			logger.info(`Requesting supplier details: ${supplier.smVendorId}`);
			const vendorDetails = await this.queryVendor(supplier.smVendorId);
	
			logger.info(`Requesting registrations: ${supplier.smVendorId}`);
			const registrations = await this.queryRegistrations(supplier.smVendorId);
	
			logger.info(`Requesting workspace: ${registrations.registrations[0].statusId}`);
			const workspace = await this.getSMWorkspace(registrations.registrations[0].statusId);
			
			const cleanWorkspaceInfo = cleanWorkspaceResponse(workspace.workspace);
			const tasks = cleanWorkspaceInfo.tasks;
			
			logger.info(`Requesting registrations`);
            const externalRegistrationTask = await this.getQuestionnaire(tasks, 'Supplier Registration Questionnaire');
            const internalRegistrationTask = await this.getQuestionnaire(tasks, 'Internal Registration Questionnaire');
			
			return {
                supplier,
                vendor: vendorDetails,
                registrations,
                workspace,
                cleanWorkspaceInfo,
                tasks,
                externalRegistrationTask,
                internalRegistrationTask
            };

		} catch (error: any) {
			this.handleError(error, 'Error getting supplier details');
		}
	
	};

	private async getQuestionnaire(tasks: any[], documentName: string): Promise<any> {
        const task = tasks.find(task => task.documentName === documentName);

        if (task) {
            logger.info(`Requesting ${documentName}: ${task.documentId}`);
            task.questionnaire = await this.deprecatedGetQuestionnaireIncludePrevious(task.documentId);
        }

        return task;
    }

	private async queryVendor  (vendorId: string): Promise<any> {
		return this.get('queryVendor', {
			smVendorId: vendorId,
			includeInactive: 'true',
		});
	};

	private async getSMWorkspace (workspaceId: string): Promise<any> {
		return this.get('getSMWorkspace',{
			wsId: workspaceId,
			includeInactiveDocuments: 'false',
		});
	};
	
	private async queryRegistrations (vendorId: string): Promise<any> {
		return this.post('queryRegistration', {
			includeInactive: true,
			isRetrievePreviousWorkspaces: false,
			registrations: [{smVendorId: vendorId,},],
		});
	};

	private async deprecatedGetQuestionnaireIncludePrevious  (docId: string): Promise<any> {
		return this.get('deprecatedGetQuestionnaireIncludePrevious', {
			docId,
			viewMode: 'View',
			includePreviousResponse: 'true',
			returnLatestDocIfArchived: 'false',
		});
	};
	
	private async get(endpoint: string, data?: Record<string, string>): Promise<any> {
		const url = this.constructURL(endpoint, data);
		logger.info(`Making a GET request to ${url}`);

		try {
			const response = await fetch(url, {
				method: 'GET',
				headers: this.getHeaders(),
			});

			return await this.handleResponse(response, endpoint);

		} 
		catch (error) {
			this.handleError(error, `Error in GET ${endpoint}`);
		}
	}

	private async post(endpoint: string, data: any): Promise<any> {
		const url = this.constructURL(endpoint);
        logger.info(`Making a POST request to ${url} with Params: ${JSON.stringify(data)}`);
		logger.info(`Used headers are ${JSON.stringify(this.getHeaders())}`)

		try {
			const response = await fetch(url, {
				method: 'POST',
				headers: this.getHeaders(),
                body: JSON.stringify(data),
			});

			return await this.handleResponse(response, endpoint);
		} 
		catch (error) {
			this.handleError(error, `Error in POST ${endpoint}`);
		}
	}

	private constructURL(endpoint: string, data?: Record<string, string>): string {
        const urlSearchParams = data ? new URLSearchParams(data).toString() : '';
        return `${this.baseURL}/${endpoint}?realm=JCD${urlSearchParams ? `&${urlSearchParams}` : ''}`;
    }

	private getHeaders(): Record<string, string> {
        return {
            ...aribaCommonHeaders,
            'Content-Type': 'application/json',
            'x-auth-token': this.token,
        };
    }

	private async handleResponse(response: Response, endpoint: string): Promise<any> {
        if (!response.ok) {
            if (response.status === 401) {
                await this.refreshToken();
                throw new Error('TokenExpired');
            } else {
                const error = await response.json();
                throw new Error(`Error in ${endpoint}: ${JSON.stringify(error)}`);
            }
        }
        return await response.json();
    }

	private handleError(error: any, message: string): never {
        logger.error(`api/main.ts: ${message}:`, error.message);
        throw new Error(`'api/main.ts: ${message}: ${error.message}`);
    }

	async getToken(){
		return this.token;
	}

	async refreshToken() {
		try {
			const response = await fetch(`${this.baseURL}/internal/refreshtoken`, {
				method: 'GET',
				headers: this.getHeaders(),
			});

			if (response.ok) {
				console.log('before response getting header x-auth-token')
				const newToken = response.headers.get('x-auth-token');
				console.log('after response getting header x-auth-token')
				if (newToken) {
					this.token = newToken;
					logger.info(`Token refreshed: ${this.token}`);
				} 
				else {
					throw new Error('No token found in response');
				}
			} 
			else {
				throw new Error('Failed to refresh token');
			}
		} 
		catch (error) {
			this.handleError(error, 'Failed to refresh token');
		}
	}
}