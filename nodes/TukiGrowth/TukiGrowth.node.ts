import {
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
	NodeApiError,
	NodeOperationError,
	JsonObject,
} from 'n8n-workflow';

const BASE_URL = 'https://app.tukigrowth.com/api/v1';

function buildCreateBody(resource: string, ef: IExecuteFunctions, i: number): Record<string, any> {
	const additionalFields = ef.getNodeParameter('additionalFields', i, {}) as Record<string, any>;
	const body: Record<string, any> = {};

	if (resource === 'objective') {
		body.title = ef.getNodeParameter('title', i) as string;
		body.type = ef.getNodeParameter('objType', i) as string;
	} else if (resource === 'audience') {
		body.name = ef.getNodeParameter('name', i) as string;
	} else if (resource === 'painPoint') {
		body.title = ef.getNodeParameter('title', i) as string;
		body.severity = ef.getNodeParameter('severity', i) as string;
	} else if (resource === 'contentBrief') {
		body.title = ef.getNodeParameter('title', i) as string;
		body.funnelLevel = ef.getNodeParameter('funnelLevel', i) as string;
	} else if (resource === 'socialMedia') {
		body.title = ef.getNodeParameter('title', i) as string;
		body.channel = ef.getNodeParameter('channel', i) as string;
		body.contentType = ef.getNodeParameter('contentType', i) as string;
	} else if (resource === 'websiteContent') {
		body.title = ef.getNodeParameter('title', i) as string;
		body.contentType = ef.getNodeParameter('wcContentType', i) as string;
	} else if (resource === 'asset') {
		body.name = ef.getNodeParameter('name', i) as string;
		body.url = ef.getNodeParameter('assetUrl', i) as string;
		body.type = ef.getNodeParameter('assetType', i) as string;
	} else if (resource === 'product') {
		body.name = ef.getNodeParameter('name', i) as string;
		body.price = ef.getNodeParameter('price', i) as number;
		body.status = ef.getNodeParameter('productStatus', i) as string;
	} else if (resource === 'customer') {
		body.email = ef.getNodeParameter('email', i) as string;
	} else if (resource === 'order') {
		const orderDate = ef.getNodeParameter('orderDate', i) as string;
		body.orderDate = orderDate ? new Date(orderDate).getTime() : Date.now();
		body.status = ef.getNodeParameter('orderStatus', i) as string;
		body.totalAmount = ef.getNodeParameter('totalAmount', i) as number;
	} else if (resource === 'campaign') {
		body.name = ef.getNodeParameter('name', i) as string;
		body.platform = ef.getNodeParameter('platform', i) as string;
		body.monthlyBudget = ef.getNodeParameter('monthlyBudget', i) as number;
		body.status = ef.getNodeParameter('campaignStatus', i) as string;
	} else if (resource === 'newsletter') {
		body.subject = ef.getNodeParameter('subject', i) as string;
		body.status = ef.getNodeParameter('newsletterStatus', i) as string;
	} else if (resource === 'comment') {
		body.body = ef.getNodeParameter('commentBody', i) as string;
	}

	return { ...body, ...additionalFields };
}

function buildUpdateBody(resource: string, ef: IExecuteFunctions, i: number): Record<string, any> {
	const additionalFields = ef.getNodeParameter('additionalFields', i, {}) as Record<string, any>;
	const body: Record<string, any> = {};

	if (['objective', 'painPoint', 'contentBrief'].includes(resource)) {
		const title = ef.getNodeParameter('title', i, '') as string;
		if (title) body.title = title;
	} else if (['audience', 'asset', 'product', 'campaign'].includes(resource)) {
		const name = ef.getNodeParameter('name', i, '') as string;
		if (name) body.name = name;
	} else if (resource === 'socialMedia' || resource === 'websiteContent') {
		const title = ef.getNodeParameter('title', i, '') as string;
		if (title) body.title = title;
	} else if (resource === 'newsletter') {
		const subject = ef.getNodeParameter('subject', i, '') as string;
		if (subject) body.subject = subject;
	} else if (resource === 'comment') {
		body.body = ef.getNodeParameter('commentBody', i) as string;
		body.isResolved = ef.getNodeParameter('isResolved', i, false) as boolean;
	}

	return { ...body, ...additionalFields };
}

export class TukiGrowth implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'TukiGrowth',
		name: 'tukiGrowth',
		icon: 'file:tukigrowth.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with the TukiGrowth API',
		defaults: { name: 'TukiGrowth' },
		usableAsTool: true,
		inputs: ['main'],
		outputs: ['main'],
		credentials: [{ name: 'tukiGrowthApi', required: true }],
		properties: [
			// ─── RESOURCE ────────────────────────────────────────────────
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Organization', value: 'organization' },
					{ name: 'Client', value: 'client' },
					{ name: 'Business Context', value: 'businessContext' },
					{ name: 'Objective', value: 'objective' },
					{ name: 'Audience', value: 'audience' },
					{ name: 'Pain Point', value: 'painPoint' },
					{ name: 'Content Brief', value: 'contentBrief' },
					{ name: 'Social Media Post', value: 'socialMedia' },
					{ name: 'Website Content', value: 'websiteContent' },
					{ name: 'Asset', value: 'asset' },
					{ name: 'Product', value: 'product' },
					{ name: 'Customer', value: 'customer' },
					{ name: 'Order', value: 'order' },
					{ name: 'Ad Campaign', value: 'campaign' },
					{ name: 'Newsletter', value: 'newsletter' },
					{ name: 'Comment', value: 'comment' },
				],
				default: 'organization',
			},

			// ─── OPERATIONS ──────────────────────────────────────────────
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['organization'] } },
				options: [
					{ name: 'List', value: 'list', action: 'List organizations' },
					{ name: 'Get', value: 'get', action: 'Get an organization' },
					{ name: 'Create', value: 'create', action: 'Create an organization' },
					{ name: 'Update', value: 'update', action: 'Update an organization' },
				],
				default: 'list',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['client'] } },
				options: [
					{ name: 'List', value: 'list', action: 'List clients' },
					{ name: 'Get', value: 'get', action: 'Get a client' },
					{ name: 'Create', value: 'create', action: 'Create a client' },
					{ name: 'Update', value: 'update', action: 'Update a client' },
					{ name: 'Delete', value: 'delete', action: 'Delete a client' },
				],
				default: 'list',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['businessContext'] } },
				options: [
					{ name: 'Get', value: 'get', action: 'Get business context' },
					{ name: 'Update', value: 'update', action: 'Update business context' },
				],
				default: 'get',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['objective'] } },
				options: [
					{ name: 'List', value: 'list', action: 'List objectives' },
					{ name: 'Get', value: 'get', action: 'Get an objective' },
					{ name: 'Create', value: 'create', action: 'Create an objective' },
					{ name: 'Update', value: 'update', action: 'Update an objective' },
					{ name: 'Delete', value: 'delete', action: 'Delete an objective' },
				],
				default: 'list',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['audience'] } },
				options: [
					{ name: 'List', value: 'list', action: 'List audiences' },
					{ name: 'Get', value: 'get', action: 'Get an audience' },
					{ name: 'Create', value: 'create', action: 'Create an audience' },
					{ name: 'Update', value: 'update', action: 'Update an audience' },
					{ name: 'Delete', value: 'delete', action: 'Delete an audience' },
				],
				default: 'list',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['painPoint'] } },
				options: [
					{ name: 'List', value: 'list', action: 'List pain points' },
					{ name: 'Get', value: 'get', action: 'Get a pain point' },
					{ name: 'Create', value: 'create', action: 'Create a pain point' },
					{ name: 'Update', value: 'update', action: 'Update a pain point' },
					{ name: 'Delete', value: 'delete', action: 'Delete a pain point' },
				],
				default: 'list',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['contentBrief'] } },
				options: [
					{ name: 'List', value: 'list', action: 'List content briefs' },
					{ name: 'Get', value: 'get', action: 'Get a content brief' },
					{ name: 'Create', value: 'create', action: 'Create a content brief' },
					{ name: 'Update', value: 'update', action: 'Update a content brief' },
					{ name: 'Delete', value: 'delete', action: 'Delete a content brief' },
				],
				default: 'list',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['socialMedia'] } },
				options: [
					{ name: 'List', value: 'list', action: 'List social media posts' },
					{ name: 'Get', value: 'get', action: 'Get a social media post' },
					{ name: 'Create', value: 'create', action: 'Create a social media post' },
					{ name: 'Update', value: 'update', action: 'Update a social media post' },
					{ name: 'Delete', value: 'delete', action: 'Delete a social media post' },
				],
				default: 'list',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['websiteContent'] } },
				options: [
					{ name: 'List', value: 'list', action: 'List website content' },
					{ name: 'Get', value: 'get', action: 'Get website content' },
					{ name: 'Create', value: 'create', action: 'Create website content' },
					{ name: 'Update', value: 'update', action: 'Update website content' },
					{ name: 'Delete', value: 'delete', action: 'Delete website content' },
				],
				default: 'list',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['asset'] } },
				options: [
					{ name: 'List', value: 'list', action: 'List assets' },
					{ name: 'Get', value: 'get', action: 'Get an asset' },
					{ name: 'Create', value: 'create', action: 'Create an asset' },
					{ name: 'Update', value: 'update', action: 'Update an asset' },
					{ name: 'Delete', value: 'delete', action: 'Delete an asset' },
				],
				default: 'list',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['product'] } },
				options: [
					{ name: 'List', value: 'list', action: 'List products' },
					{ name: 'Get', value: 'get', action: 'Get a product' },
					{ name: 'Create', value: 'create', action: 'Create a product' },
					{ name: 'Update', value: 'update', action: 'Update a product' },
					{ name: 'Delete', value: 'delete', action: 'Delete a product' },
				],
				default: 'list',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['customer'] } },
				options: [
					{ name: 'List', value: 'list', action: 'List customers' },
					{ name: 'Get', value: 'get', action: 'Get a customer' },
					{ name: 'Create', value: 'create', action: 'Create a customer' },
					{ name: 'Update', value: 'update', action: 'Update a customer' },
					{ name: 'Delete', value: 'delete', action: 'Delete a customer' },
				],
				default: 'list',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['order'] } },
				options: [
					{ name: 'List', value: 'list', action: 'List orders' },
					{ name: 'Get', value: 'get', action: 'Get an order' },
					{ name: 'Create', value: 'create', action: 'Create an order' },
					{ name: 'Update', value: 'update', action: 'Update an order' },
					{ name: 'Delete', value: 'delete', action: 'Delete an order' },
				],
				default: 'list',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['campaign'] } },
				options: [
					{ name: 'List', value: 'list', action: 'List ad campaigns' },
					{ name: 'Get', value: 'get', action: 'Get an ad campaign' },
					{ name: 'Create', value: 'create', action: 'Create an ad campaign' },
					{ name: 'Update', value: 'update', action: 'Update an ad campaign' },
					{ name: 'Delete', value: 'delete', action: 'Delete an ad campaign' },
				],
				default: 'list',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['newsletter'] } },
				options: [
					{ name: 'List', value: 'list', action: 'List newsletters' },
					{ name: 'Get', value: 'get', action: 'Get a newsletter' },
					{ name: 'Create', value: 'create', action: 'Create a newsletter' },
					{ name: 'Update', value: 'update', action: 'Update a newsletter' },
					{ name: 'Delete', value: 'delete', action: 'Delete a newsletter' },
				],
				default: 'list',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['comment'] } },
				options: [
					{ name: 'List', value: 'list', action: 'List comments' },
					{ name: 'Create', value: 'create', action: 'Create a comment' },
					{ name: 'Update', value: 'update', action: 'Update a comment' },
					{ name: 'Delete', value: 'delete', action: 'Delete a comment' },
				],
				default: 'list',
			},

			// ─── SHARED: ORGANIZATION ID (dropdown) ──────────────────────
			{
				displayName: 'Organization',
				name: 'organizationId',
				type: 'options',
				typeOptions: { loadOptionsMethod: 'getOrganizations' },
				displayOptions: {
					show: {
						resource: [
							'client', 'businessContext', 'objective', 'audience', 'painPoint',
							'contentBrief', 'socialMedia', 'websiteContent', 'asset',
							'product', 'customer', 'order', 'campaign', 'newsletter', 'comment',
						],
					},
				},
				default: '',
				required: true,
				description: 'Organization to operate in',
			},

			// ─── SHARED: CLIENT ID (dropdown, for module resources) ───────
			{
				displayName: 'Client',
				name: 'clientIdSelect',
				type: 'options',
				typeOptions: { loadOptionsMethod: 'getClients' },
				displayOptions: {
					show: {
						resource: [
							'businessContext', 'objective', 'audience', 'painPoint',
							'contentBrief', 'socialMedia', 'websiteContent', 'asset',
							'product', 'customer', 'order', 'campaign', 'newsletter', 'comment',
						],
					},
				},
				default: '',
				required: true,
				description: 'Client to operate on',
			},

			// ─── ORGANIZATION FIELDS ──────────────────────────────────────
			{
				displayName: 'Organization ID',
				name: 'orgId',
				type: 'string',
				displayOptions: { show: { resource: ['organization'], operation: ['get', 'update'] } },
				default: '',
				required: true,
				description: 'ID of the organization',
			},
			{
				displayName: 'Name',
				name: 'orgName',
				type: 'string',
				displayOptions: { show: { resource: ['organization'], operation: ['create', 'update'] } },
				default: '',
				required: true,
				description: 'Organization name',
			},
			{
				displayName: 'Slug',
				name: 'orgSlug',
				type: 'string',
				displayOptions: { show: { resource: ['organization'], operation: ['create'] } },
				default: '',
				required: true,
				description: 'URL-friendly identifier',
			},
			{
				displayName: 'Status',
				name: 'orgStatus',
				type: 'options',
				options: [
					{ name: 'Active', value: 'active' },
					{ name: 'Paused', value: 'paused' },
					{ name: 'Archived', value: 'archived' },
				],
				displayOptions: { show: { resource: ['organization'], operation: ['update'] } },
				default: 'active',
			},

			// ─── CLIENT FIELDS ────────────────────────────────────────────
			{
				displayName: 'Client ID',
				name: 'clientId',
				type: 'string',
				displayOptions: { show: { resource: ['client'], operation: ['get', 'update', 'delete'] } },
				default: '',
				required: true,
				description: 'ID of the client',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				displayOptions: { show: { resource: ['client'], operation: ['create', 'update'] } },
				default: '',
				required: true,
			},
			{
				displayName: 'Slug',
				name: 'slug',
				type: 'string',
				displayOptions: { show: { resource: ['client'], operation: ['create'] } },
				default: '',
				required: true,
				description: 'URL-friendly identifier',
			},
			{
				displayName: 'Business Type',
				name: 'businessType',
				type: 'options',
				options: [
					{ name: 'Ecommerce', value: 'ecommerce' },
					{ name: 'Services', value: 'services' },
					{ name: 'Mixed', value: 'mixed' },
					{ name: 'Other', value: 'other' },
				],
				displayOptions: { show: { resource: ['client'], operation: ['create'] } },
				default: 'other',
				required: true,
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['client'], operation: ['create', 'update'] } },
				options: [
					{ displayName: 'Website URL', name: 'websiteUrl', type: 'string', default: '' },
					{ displayName: 'Timezone', name: 'timezone', type: 'string', default: 'UTC' },
					{ displayName: 'Primary Language', name: 'primaryLanguage', type: 'string', default: 'es' },
					{
						displayName: 'Status',
						name: 'status',
						type: 'options',
						options: [
							{ name: 'Active', value: 'active' },
							{ name: 'Paused', value: 'paused' },
							{ name: 'Archived', value: 'archived' },
						],
						default: 'active',
					},
				],
			},

			// ─── RECORD ID (shared Get/Update/Delete for module resources) ─
			{
				displayName: 'Record ID',
				name: 'recordId',
				type: 'string',
				displayOptions: {
					show: {
						resource: [
							'objective', 'audience', 'painPoint', 'contentBrief', 'socialMedia',
							'websiteContent', 'asset', 'product', 'customer', 'order',
							'campaign', 'newsletter', 'comment',
						],
						operation: ['get', 'update', 'delete'],
					},
				},
				default: '',
				required: true,
				description: 'ID of the record',
			},

			// ─── BUSINESS CONTEXT FIELDS ──────────────────────────────────
			{
				displayName: 'Fields to Update',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['businessContext'], operation: ['update'] } },
				options: [
					{ displayName: 'Company Description', name: 'companyDescription', type: 'string', default: '' },
					{ displayName: 'Mission Statement', name: 'missionStatement', type: 'string', default: '' },
					{ displayName: 'Vision Statement', name: 'visionStatement', type: 'string', default: '' },
					{ displayName: 'Value Proposition', name: 'valuePropositon', type: 'string', default: '' },
					{ displayName: 'Target Market Summary', name: 'targetMarketSummary', type: 'string', default: '' },
					{ displayName: 'Tone of Voice', name: 'toneOfVoice', type: 'string', default: '' },
					{ displayName: 'Industry', name: 'industry', type: 'string', default: '' },
					{ displayName: 'Main Products', name: 'mainProducts', type: 'string', default: '' },
					{ displayName: 'Differentiators', name: 'differentiators', type: 'string', default: '' },
					{
						displayName: 'Communication Style',
						name: 'communicationStyle',
						type: 'options',
						options: [
							{ name: 'Formal', value: 'formal' },
							{ name: 'Semi-Formal', value: 'semiformal' },
							{ name: 'Informal', value: 'informal' },
							{ name: 'Technical', value: 'technical' },
							{ name: 'Friendly', value: 'friendly' },
						],
						default: 'semiformal',
					},
				],
			},

			// ─── OBJECTIVE FIELDS ─────────────────────────────────────────
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['objective', 'painPoint', 'contentBrief'],
						operation: ['create', 'update'],
					},
				},
				default: '',
				required: true,
			},
			{
				displayName: 'Type',
				name: 'objType',
				type: 'options',
				options: [
					{ name: 'Primary', value: 'primary' },
					{ name: 'Secondary', value: 'secondary' },
				],
				displayOptions: { show: { resource: ['objective'], operation: ['create'] } },
				default: 'primary',
				required: true,
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['objective'], operation: ['create', 'update'] } },
				options: [
					{ displayName: 'Description', name: 'description', type: 'string', default: '' },
					{ displayName: 'KPI Name', name: 'kpiName', type: 'string', default: '' },
					{ displayName: 'Target Value', name: 'targetValue', type: 'number', default: 0 },
					{ displayName: 'Current Value', name: 'currentValue', type: 'number', default: 0 },
					{ displayName: 'Start Date', name: 'startDate', type: 'dateTime', default: '' },
					{ displayName: 'End Date', name: 'endDate', type: 'dateTime', default: '' },
					{
						displayName: 'Status',
						name: 'status',
						type: 'options',
						options: [
							{ name: 'Planned', value: 'planned' },
							{ name: 'In Progress', value: 'in_progress' },
							{ name: 'Completed', value: 'completed' },
							{ name: 'Archived', value: 'archived' },
						],
						default: 'planned',
					},
				],
			},

			// ─── AUDIENCE FIELDS ──────────────────────────────────────────
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['audience', 'asset'],
						operation: ['create', 'update'],
					},
				},
				default: '',
				required: true,
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['audience'], operation: ['create', 'update'] } },
				options: [
					{ displayName: 'Description', name: 'description', type: 'string', default: '' },
					{ displayName: 'Buyer Persona Name', name: 'buyerPersonaName', type: 'string', default: '' },
				],
			},

			// ─── PAIN POINT FIELDS ────────────────────────────────────────
			{
				displayName: 'Severity',
				name: 'severity',
				type: 'options',
				options: [
					{ name: 'Low', value: 'low' },
					{ name: 'Medium', value: 'medium' },
					{ name: 'High', value: 'high' },
					{ name: 'Critical', value: 'critical' },
				],
				displayOptions: { show: { resource: ['painPoint'], operation: ['create'] } },
				default: 'medium',
				required: true,
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['painPoint'], operation: ['create', 'update'] } },
				options: [
					{ displayName: 'Description', name: 'description', type: 'string', default: '' },
					{ displayName: 'Group', name: 'group', type: 'string', default: '' },
					{ displayName: 'Industry', name: 'industry', type: 'string', default: '' },
					{
						displayName: 'Severity',
						name: 'severity',
						type: 'options',
						options: [
							{ name: 'Low', value: 'low' }, { name: 'Medium', value: 'medium' },
							{ name: 'High', value: 'high' }, { name: 'Critical', value: 'critical' },
						],
						default: 'medium',
					},
				],
			},

			// ─── CONTENT BRIEF FIELDS ─────────────────────────────────────
			{
				displayName: 'Funnel Level',
				name: 'funnelLevel',
				type: 'options',
				options: [
					{ name: 'TOFU (Top of Funnel)', value: 'TOFU' },
					{ name: 'MOFU (Middle of Funnel)', value: 'MOFU' },
					{ name: 'BOFU (Bottom of Funnel)', value: 'BOFU' },
				],
				displayOptions: { show: { resource: ['contentBrief'], operation: ['create'] } },
				default: 'TOFU',
				required: true,
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['contentBrief'], operation: ['create', 'update'] } },
				options: [
					{ displayName: 'Description', name: 'description', type: 'string', default: '' },
					{ displayName: 'Period', name: 'period', type: 'string', default: '' },
					{ displayName: 'Comments', name: 'comments', type: 'string', default: '' },
					{ displayName: 'Objective ID', name: 'objectiveId', type: 'string', default: '' },
					{
						displayName: 'Status',
						name: 'status',
						type: 'options',
						options: [
							{ name: 'Idea', value: 'idea' }, { name: 'In Progress', value: 'in_progress' },
							{ name: 'Review', value: 'review' }, { name: 'Approved', value: 'approved' },
							{ name: 'Rejected', value: 'rejected' }, { name: 'Archived', value: 'archived' },
						],
						default: 'idea',
					},
				],
			},

			// ─── SOCIAL MEDIA FIELDS ──────────────────────────────────────
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['socialMedia', 'websiteContent'],
						operation: ['create', 'update'],
					},
				},
				default: '',
				required: true,
			},
			{
				displayName: 'Channel',
				name: 'channel',
				type: 'options',
				options: [
					{ name: 'Facebook', value: 'facebook' },
					{ name: 'Instagram', value: 'instagram' },
					{ name: 'LinkedIn', value: 'linkedin' },
					{ name: 'X (Twitter)', value: 'x' },
					{ name: 'TikTok', value: 'tiktok' },
					{ name: 'YouTube', value: 'youtube' },
					{ name: 'Other', value: 'other' },
				],
				displayOptions: { show: { resource: ['socialMedia'], operation: ['create'] } },
				default: 'instagram',
				required: true,
			},
			{
				displayName: 'Content Type',
				name: 'contentType',
				type: 'options',
				options: [
					{ name: 'Post', value: 'post' }, { name: 'Reel', value: 'reel' },
					{ name: 'Story', value: 'story' }, { name: 'Video', value: 'video' },
					{ name: 'Carousel', value: 'carousel' }, { name: 'Poll', value: 'poll' },
					{ name: 'Other', value: 'other' },
				],
				displayOptions: { show: { resource: ['socialMedia'], operation: ['create'] } },
				default: 'post',
				required: true,
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['socialMedia'], operation: ['create', 'update'] } },
				options: [
					{ displayName: 'Copy', name: 'copy', type: 'string', default: '' },
					{ displayName: 'Media URL', name: 'mediaUrl', type: 'string', default: '' },
					{ displayName: 'Campaign', name: 'campaign', type: 'string', default: '' },
					{ displayName: 'Is Paid', name: 'isPaid', type: 'boolean', default: false },
					{ displayName: 'Source Link', name: 'sourceLink', type: 'string', default: '' },
					{ displayName: 'Deadline', name: 'deadline', type: 'dateTime', default: '' },
					{ displayName: 'Publish At', name: 'publishAt', type: 'dateTime', default: '' },
					{
						displayName: 'Status',
						name: 'status',
						type: 'options',
						options: [
							{ name: 'Idea', value: 'idea' }, { name: 'Draft', value: 'draft' },
							{ name: 'To Approve', value: 'to_approve' }, { name: 'Approved', value: 'approved' },
							{ name: 'Scheduled', value: 'scheduled' }, { name: 'Published', value: 'published' },
							{ name: 'Discarded', value: 'discarded' },
						],
						default: 'idea',
					},
				],
			},

			// ─── WEBSITE CONTENT FIELDS ───────────────────────────────────
			{
				displayName: 'Content Type',
				name: 'wcContentType',
				type: 'options',
				options: [
					{ name: 'Article', value: 'article' }, { name: 'Landing', value: 'landing' },
					{ name: 'Page', value: 'page' }, { name: 'FAQ', value: 'faq' },
					{ name: 'Other', value: 'other' },
				],
				displayOptions: { show: { resource: ['websiteContent'], operation: ['create'] } },
				default: 'article',
				required: true,
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['websiteContent'], operation: ['create', 'update'] } },
				options: [
					{ displayName: 'URL Slug', name: 'urlSlug', type: 'string', default: '' },
					{ displayName: 'Content', name: 'content', type: 'string', default: '' },
					{ displayName: 'Category', name: 'category', type: 'string', default: '' },
					{ displayName: 'SEO Focus Keyword', name: 'seoFocusKeyword', type: 'string', default: '' },
					{ displayName: 'SEO Meta Title', name: 'seoMetaTitle', type: 'string', default: '' },
					{ displayName: 'SEO Meta Description', name: 'seoMetaDescription', type: 'string', default: '' },
					{ displayName: 'Deadline', name: 'deadline', type: 'dateTime', default: '' },
					{ displayName: 'Publish At', name: 'publishAt', type: 'dateTime', default: '' },
					{
						displayName: 'Priority',
						name: 'priority',
						type: 'options',
						options: [
							{ name: 'Low', value: 'low' }, { name: 'Medium', value: 'medium' },
							{ name: 'High', value: 'high' }, { name: 'Critical', value: 'critical' },
						],
						default: 'medium',
					},
					{
						displayName: 'Status',
						name: 'status',
						type: 'options',
						options: [
							{ name: 'Idea', value: 'idea' }, { name: 'Draft', value: 'draft' },
							{ name: 'To Approve', value: 'to_approve' }, { name: 'Approved', value: 'approved' },
							{ name: 'Published', value: 'published' }, { name: 'Discarded', value: 'discarded' },
						],
						default: 'idea',
					},
				],
			},

			// ─── ASSET FIELDS ─────────────────────────────────────────────
			{
				displayName: 'URL',
				name: 'assetUrl',
				type: 'string',
				displayOptions: { show: { resource: ['asset'], operation: ['create'] } },
				default: '',
				required: true,
			},
			{
				displayName: 'Type',
				name: 'assetType',
				type: 'options',
				options: [
					{ name: 'Image', value: 'image' }, { name: 'Video', value: 'video' },
					{ name: 'Document', value: 'doc' }, { name: 'Link', value: 'link' },
					{ name: 'Other', value: 'other' },
				],
				displayOptions: { show: { resource: ['asset'], operation: ['create'] } },
				default: 'image',
				required: true,
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['asset'], operation: ['create', 'update'] } },
				options: [
					{ displayName: 'Description', name: 'description', type: 'string', default: '' },
					{ displayName: 'Folder', name: 'folder', type: 'string', default: '' },
					{ displayName: 'MIME Type', name: 'mimeType', type: 'string', default: '' },
					{ displayName: 'File Size (bytes)', name: 'fileSize', type: 'number', default: 0 },
				],
			},

			// ─── PRODUCT FIELDS ───────────────────────────────────────────
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['product', 'campaign'],
						operation: ['create', 'update'],
					},
				},
				default: '',
				required: true,
			},
			{
				displayName: 'Price',
				name: 'price',
				type: 'number',
				displayOptions: { show: { resource: ['product'], operation: ['create'] } },
				default: 0,
				required: true,
			},
			{
				displayName: 'Status',
				name: 'productStatus',
				type: 'options',
				options: [
					{ name: 'Draft', value: 'draft' }, { name: 'Active', value: 'active' },
					{ name: 'Inactive', value: 'inactive' }, { name: 'Archived', value: 'archived' },
				],
				displayOptions: { show: { resource: ['product'], operation: ['create'] } },
				default: 'draft',
				required: true,
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['product'], operation: ['create', 'update'] } },
				options: [
					{ displayName: 'SKU', name: 'sku', type: 'string', default: '' },
					{ displayName: 'Description', name: 'description', type: 'string', default: '' },
					{ displayName: 'Currency', name: 'currency', type: 'string', default: 'USD' },
					{ displayName: 'Image URL', name: 'imageUrl', type: 'string', default: '' },
					{ displayName: 'SEO Title', name: 'seoTitle', type: 'string', default: '' },
					{ displayName: 'SEO Description', name: 'seoDescription', type: 'string', default: '' },
					{ displayName: 'External ID', name: 'externalId', type: 'string', default: '' },
					{
						displayName: 'Status',
						name: 'status',
						type: 'options',
						options: [
							{ name: 'Draft', value: 'draft' }, { name: 'Active', value: 'active' },
							{ name: 'Inactive', value: 'inactive' }, { name: 'Archived', value: 'archived' },
						],
						default: 'draft',
					},
				],
			},

			// ─── CUSTOMER FIELDS ──────────────────────────────────────────
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				displayOptions: { show: { resource: ['customer'], operation: ['create'] } },
				default: '',
				required: true,
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['customer'], operation: ['create', 'update'] } },
				options: [
					{ displayName: 'Email', name: 'email', type: 'string', default: '' },
					{ displayName: 'First Name', name: 'firstName', type: 'string', default: '' },
					{ displayName: 'Last Name', name: 'lastName', type: 'string', default: '' },
					{ displayName: 'Phone', name: 'phone', type: 'string', default: '' },
					{ displayName: 'City', name: 'city', type: 'string', default: '' },
					{ displayName: 'Country', name: 'country', type: 'string', default: '' },
					{ displayName: 'External ID', name: 'externalId', type: 'string', default: '' },
				],
			},

			// ─── ORDER FIELDS ─────────────────────────────────────────────
			{
				displayName: 'Order Date',
				name: 'orderDate',
				type: 'dateTime',
				displayOptions: { show: { resource: ['order'], operation: ['create'] } },
				default: '',
				required: true,
			},
			{
				displayName: 'Status',
				name: 'orderStatus',
				type: 'options',
				options: [
					{ name: 'Pending', value: 'pending' }, { name: 'Processing', value: 'processing' },
					{ name: 'Completed', value: 'completed' }, { name: 'Cancelled', value: 'cancelled' },
					{ name: 'Refunded', value: 'refunded' },
				],
				displayOptions: { show: { resource: ['order'], operation: ['create'] } },
				default: 'pending',
				required: true,
			},
			{
				displayName: 'Total Amount',
				name: 'totalAmount',
				type: 'number',
				displayOptions: { show: { resource: ['order'], operation: ['create'] } },
				default: 0,
				required: true,
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['order'], operation: ['create', 'update'] } },
				options: [
					{ displayName: 'Customer ID', name: 'customerId', type: 'string', default: '' },
					{ displayName: 'Currency', name: 'currency', type: 'string', default: 'USD' },
					{ displayName: 'External Order ID', name: 'externalOrderId', type: 'string', default: '' },
					{
						displayName: 'Status',
						name: 'status',
						type: 'options',
						options: [
							{ name: 'Pending', value: 'pending' }, { name: 'Processing', value: 'processing' },
							{ name: 'Completed', value: 'completed' }, { name: 'Cancelled', value: 'cancelled' },
							{ name: 'Refunded', value: 'refunded' },
						],
						default: 'pending',
					},
				],
			},

			// ─── AD CAMPAIGN FIELDS ───────────────────────────────────────
			{
				displayName: 'Platform',
				name: 'platform',
				type: 'options',
				options: [
					{ name: 'Meta', value: 'meta' }, { name: 'Google', value: 'google' },
					{ name: 'LinkedIn', value: 'linkedin' }, { name: 'TikTok', value: 'tiktok' },
					{ name: 'Other', value: 'other' },
				],
				displayOptions: { show: { resource: ['campaign'], operation: ['create'] } },
				default: 'meta',
				required: true,
			},
			{
				displayName: 'Monthly Budget',
				name: 'monthlyBudget',
				type: 'number',
				displayOptions: { show: { resource: ['campaign'], operation: ['create'] } },
				default: 0,
				required: true,
			},
			{
				displayName: 'Status',
				name: 'campaignStatus',
				type: 'options',
				options: [
					{ name: 'Planned', value: 'planned' }, { name: 'Active', value: 'active' },
					{ name: 'Paused', value: 'paused' }, { name: 'Finished', value: 'finished' },
				],
				displayOptions: { show: { resource: ['campaign'], operation: ['create'] } },
				default: 'planned',
				required: true,
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['campaign'], operation: ['create', 'update'] } },
				options: [
					{ displayName: 'Objective', name: 'objective', type: 'string', default: '' },
					{ displayName: 'Currency', name: 'currency', type: 'string', default: 'USD' },
					{ displayName: 'Start Date', name: 'startDate', type: 'dateTime', default: '' },
					{ displayName: 'End Date', name: 'endDate', type: 'dateTime', default: '' },
					{
						displayName: 'Status',
						name: 'status',
						type: 'options',
						options: [
							{ name: 'Planned', value: 'planned' }, { name: 'Active', value: 'active' },
							{ name: 'Paused', value: 'paused' }, { name: 'Finished', value: 'finished' },
						],
						default: 'planned',
					},
				],
			},

			// ─── NEWSLETTER FIELDS ────────────────────────────────────────
			{
				displayName: 'Subject',
				name: 'subject',
				type: 'string',
				displayOptions: { show: { resource: ['newsletter'], operation: ['create', 'update'] } },
				default: '',
				required: true,
			},
			{
				displayName: 'Status',
				name: 'newsletterStatus',
				type: 'options',
				options: [
					{ name: 'Draft', value: 'draft' }, { name: 'Scheduled', value: 'scheduled' },
					{ name: 'Sent', value: 'sent' }, { name: 'Cancelled', value: 'cancelled' },
				],
				displayOptions: { show: { resource: ['newsletter'], operation: ['create'] } },
				default: 'draft',
				required: true,
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['newsletter'], operation: ['create', 'update'] } },
				options: [
					{ displayName: 'Design URL', name: 'designUrl', type: 'string', default: '' },
					{ displayName: 'Scheduled For', name: 'scheduledFor', type: 'dateTime', default: '' },
					{ displayName: 'Provider Campaign ID', name: 'providerCampaignId', type: 'string', default: '' },
					{
						displayName: 'Status',
						name: 'status',
						type: 'options',
						options: [
							{ name: 'Draft', value: 'draft' }, { name: 'Scheduled', value: 'scheduled' },
							{ name: 'Sent', value: 'sent' }, { name: 'Cancelled', value: 'cancelled' },
						],
						default: 'draft',
					},
				],
			},

			// ─── COMMENT FIELDS ───────────────────────────────────────────
			{
				displayName: 'Body',
				name: 'commentBody',
				type: 'string',
				displayOptions: { show: { resource: ['comment'], operation: ['create', 'update'] } },
				default: '',
				required: true,
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['comment'], operation: ['create'] } },
				options: [
					{ displayName: 'Table Name', name: 'tableName', type: 'string', default: '' },
					{ displayName: 'Related Record ID', name: 'recordId', type: 'string', default: '' },
				],
			},
			{
				displayName: 'Is Resolved',
				name: 'isResolved',
				type: 'boolean',
				displayOptions: { show: { resource: ['comment'], operation: ['update'] } },
				default: false,
			},

			// ─── LIST FILTERS ─────────────────────────────────────────────
			{
				displayName: 'Filters',
				name: 'filters',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				displayOptions: {
					show: {
						resource: [
							'organization', 'client', 'objective', 'audience', 'painPoint',
							'contentBrief', 'socialMedia', 'websiteContent', 'asset',
							'product', 'customer', 'order', 'campaign', 'newsletter', 'comment',
						],
						operation: ['list'],
					},
				},
				options: [
					{ displayName: 'Page', name: 'page', type: 'number', default: 1, description: 'Page number' },
					{ displayName: 'Limit', name: 'limit', type: 'number', default: 20, description: 'Results per page' },
					{ displayName: 'Status', name: 'status', type: 'string', default: '', description: 'Filter by status' },
					{ displayName: 'Search', name: 'search', type: 'string', default: '', description: 'Search term' },
				],
			},
		],
	};

	methods = {
		loadOptions: {
			async getOrganizations(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const response = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'tukiGrowthApi',
						{ method: 'GET', url: `${BASE_URL}/organizations`, json: true },
					);
					const items: any[] = Array.isArray(response?.data) ? response.data : [];
					return items.map((o: any) => ({ name: String(o.name ?? o._id), value: String(o._id) }));
				} catch {
					return [];
				}
			},
			async getClients(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const orgId = this.getCurrentNodeParameter('organizationId') as string;
					if (!orgId) return [];
					const response = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'tukiGrowthApi',
						{ method: 'GET', url: `${BASE_URL}/organizations/${orgId}/clients`, json: true },
					);
					const items: any[] = Array.isArray(response?.data) ? response.data : [];
					return items.map((c: any) => ({ name: String(c.name ?? c._id), value: String(c._id) }));
				} catch {
					return [];
				}
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let response: any;

				// ── ORGANIZATION ──────────────────────────────────────────
				if (resource === 'organization') {
					if (operation === 'list') {
						const qs = this.getNodeParameter('filters', i, {}) as Record<string, any>;
						response = await this.helpers.httpRequestWithAuthentication.call(this, 'tukiGrowthApi', {
							method: 'GET', url: `${BASE_URL}/organizations`, qs, json: true,
						});
					} else if (operation === 'get') {
						const orgId = this.getNodeParameter('orgId', i) as string;
						response = await this.helpers.httpRequestWithAuthentication.call(this, 'tukiGrowthApi', {
							method: 'GET', url: `${BASE_URL}/organizations/${orgId}`, json: true,
						});
					} else if (operation === 'create') {
						response = await this.helpers.httpRequestWithAuthentication.call(this, 'tukiGrowthApi', {
							method: 'POST',
							url: `${BASE_URL}/organizations`,
							body: {
								name: this.getNodeParameter('orgName', i) as string,
								slug: this.getNodeParameter('orgSlug', i) as string,
							},
							json: true,
						});
					} else if (operation === 'update') {
						const orgId = this.getNodeParameter('orgId', i) as string;
						const body: Record<string, any> = {};
						const name = this.getNodeParameter('orgName', i, '') as string;
						const status = this.getNodeParameter('orgStatus', i, '') as string;
						if (name) body.name = name;
						if (status) body.status = status;
						response = await this.helpers.httpRequestWithAuthentication.call(this, 'tukiGrowthApi', {
							method: 'PATCH', url: `${BASE_URL}/organizations/${orgId}`, body, json: true,
						});
					}

				// ── CLIENT ────────────────────────────────────────────────
				} else if (resource === 'client') {
					const orgId = this.getNodeParameter('organizationId', i) as string;
					const base = `${BASE_URL}/organizations/${orgId}/clients`;

					if (operation === 'list') {
						const qs = this.getNodeParameter('filters', i, {}) as Record<string, any>;
						response = await this.helpers.httpRequestWithAuthentication.call(this, 'tukiGrowthApi', {
							method: 'GET', url: base, qs, json: true,
						});
					} else if (operation === 'get') {
						const clientId = this.getNodeParameter('clientId', i) as string;
						response = await this.helpers.httpRequestWithAuthentication.call(this, 'tukiGrowthApi', {
							method: 'GET', url: `${base}/${clientId}`, json: true,
						});
					} else if (operation === 'create') {
						const additionalFields = this.getNodeParameter('additionalFields', i, {}) as Record<string, any>;
						response = await this.helpers.httpRequestWithAuthentication.call(this, 'tukiGrowthApi', {
							method: 'POST',
							url: base,
							body: {
								name: this.getNodeParameter('name', i) as string,
								slug: this.getNodeParameter('slug', i) as string,
								businessType: this.getNodeParameter('businessType', i) as string,
								...additionalFields,
							},
							json: true,
						});
					} else if (operation === 'update') {
						const clientId = this.getNodeParameter('clientId', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i, {}) as Record<string, any>;
						const name = this.getNodeParameter('name', i, '') as string;
						const body: Record<string, any> = { ...additionalFields };
						if (name) body.name = name;
						response = await this.helpers.httpRequestWithAuthentication.call(this, 'tukiGrowthApi', {
							method: 'PATCH', url: `${base}/${clientId}`, body, json: true,
						});
					} else if (operation === 'delete') {
						const clientId = this.getNodeParameter('clientId', i) as string;
						response = await this.helpers.httpRequestWithAuthentication.call(this, 'tukiGrowthApi', {
							method: 'DELETE', url: `${base}/${clientId}`, json: true,
						});
					}

				// ── BUSINESS CONTEXT ──────────────────────────────────────
				} else if (resource === 'businessContext') {
					const orgId = this.getNodeParameter('organizationId', i) as string;
					const clientId = this.getNodeParameter('clientIdSelect', i) as string;
					const url = `${BASE_URL}/organizations/${orgId}/clients/${clientId}/business-context`;

					if (operation === 'get') {
						response = await this.helpers.httpRequestWithAuthentication.call(this, 'tukiGrowthApi', {
							method: 'GET', url, json: true,
						});
					} else if (operation === 'update') {
						const additionalFields = this.getNodeParameter('additionalFields', i, {}) as Record<string, any>;
						response = await this.helpers.httpRequestWithAuthentication.call(this, 'tukiGrowthApi', {
							method: 'PUT', url, body: additionalFields, json: true,
						});
					}

				// ── MODULE RESOURCES ──────────────────────────────────────
				} else {
					const orgId = this.getNodeParameter('organizationId', i) as string;
					const clientId = this.getNodeParameter('clientIdSelect', i) as string;
					const moduleBase = `${BASE_URL}/organizations/${orgId}/clients/${clientId}`;

					const resourcePaths: Record<string, string> = {
						objective: 'strategy/objectives',
						audience: 'strategy/audiences',
						painPoint: 'strategy/pain-points',
						contentBrief: 'content/briefs',
						socialMedia: 'content/rrss',
						websiteContent: 'content/website',
						asset: 'content/assets',
						product: 'ecommerce/products',
						customer: 'ecommerce/customers',
						order: 'ecommerce/orders',
						campaign: 'ads/campaigns',
						newsletter: 'email/newsletters',
						comment: 'comments',
					};

					const resourcePath = resourcePaths[resource];
					if (!resourcePath) {
						throw new NodeOperationError(this.getNode(), `Unknown resource: ${resource}`, { itemIndex: i });
					}

					const endpointBase = `${moduleBase}/${resourcePath}`;

					if (operation === 'list') {
						const qs = this.getNodeParameter('filters', i, {}) as Record<string, any>;
						response = await this.helpers.httpRequestWithAuthentication.call(this, 'tukiGrowthApi', {
							method: 'GET', url: endpointBase, qs, json: true,
						});
					} else if (operation === 'get') {
						const recordId = this.getNodeParameter('recordId', i) as string;
						response = await this.helpers.httpRequestWithAuthentication.call(this, 'tukiGrowthApi', {
							method: 'GET', url: `${endpointBase}/${recordId}`, json: true,
						});
					} else if (operation === 'create') {
						const body = buildCreateBody(resource, this, i);
						response = await this.helpers.httpRequestWithAuthentication.call(this, 'tukiGrowthApi', {
							method: 'POST', url: endpointBase, body, json: true,
						});
					} else if (operation === 'update') {
						const recordId = this.getNodeParameter('recordId', i) as string;
						const body = buildUpdateBody(resource, this, i);
						response = await this.helpers.httpRequestWithAuthentication.call(this, 'tukiGrowthApi', {
							method: 'PATCH', url: `${endpointBase}/${recordId}`, body, json: true,
						});
					} else if (operation === 'delete') {
						const recordId = this.getNodeParameter('recordId', i) as string;
						response = await this.helpers.httpRequestWithAuthentication.call(this, 'tukiGrowthApi', {
							method: 'DELETE', url: `${endpointBase}/${recordId}`, json: true,
						});
					}
				}

				const data = response?.data ?? response;
				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(data),
					{ itemData: { item: i } },
				);
				returnData.push(...executionData);

			} catch (error: any) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: error.message as string }, pairedItem: { item: i } });
					continue;
				}
				throw new NodeApiError(this.getNode(), error as JsonObject, { itemIndex: i });
			}
		}

		return [returnData];
	}
}
