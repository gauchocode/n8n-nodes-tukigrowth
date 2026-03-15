import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class TukiGrowthApi implements ICredentialType {
	name = 'tukiGrowthApi';
	displayName = 'TukiGrowth API';
	documentationUrl = 'https://app.tukigrowth.com/api-docs';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Your TukiGrowth API key (starts with tg_)',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'X-API-Key': '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://app.tukigrowth.com/api/v1',
			url: '/organizations',
			method: 'GET',
		},
	};
}
