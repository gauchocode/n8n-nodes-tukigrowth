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
	} else if (resource === 'ephemeris') {
		body.title = ef.getNodeParameter('ephemerisTitle', i) as string;
		body.date = ef.getNodeParameter('ephemerisDate', i) as string;
	} else if (resource === 'category') {
		body.name = ef.getNodeParameter('name', i) as string;
		body.slug = ef.getNodeParameter('categorySlug', i) as string;
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
	} else if (resource === 'service') {
		body.name = ef.getNodeParameter('name', i) as string;
		body.priceFrom = ef.getNodeParameter('priceFrom', i) as number;
		body.billingType = ef.getNodeParameter('billingType', i) as string;
	} else if (resource === 'package') {
		body.name = ef.getNodeParameter('name', i) as string;
		body.monthlyFee = ef.getNodeParameter('monthlyFee', i) as number;
	} else if (resource === 'project') {
		body.name = ef.getNodeParameter('name', i) as string;
		body.status = ef.getNodeParameter('projectStatus', i) as string;
	} else if (resource === 'campaign') {
		body.name = ef.getNodeParameter('name', i) as string;
		body.platform = ef.getNodeParameter('platform', i) as string;
		body.monthlyBudget = ef.getNodeParameter('monthlyBudget', i) as number;
		body.status = ef.getNodeParameter('campaignStatus', i) as string;
	} else if (resource === 'ad') {
		body.headline = ef.getNodeParameter('headline', i) as string;
		body.status = ef.getNodeParameter('adStatus', i) as string;
	} else if (resource === 'keyword') {
		body.keyword = ef.getNodeParameter('keywordValue', i) as string;
		body.type = ef.getNodeParameter('keywordType', i) as string;
	} else if (resource === 'newsletter') {
		body.subject = ef.getNodeParameter('subject', i) as string;
		body.status = ef.getNodeParameter('newsletterStatus', i) as string;
	} else if (resource === 'emailReport') {
		body.sent = ef.getNodeParameter('sent', i) as number;
		body.delivered = ef.getNodeParameter('delivered', i) as number;
		body.opens = ef.getNodeParameter('opens', i) as number;
		body.uniqueOpens = ef.getNodeParameter('uniqueOpens', i) as number;
		body.clicks = ef.getNodeParameter('clicks', i) as number;
		body.uniqueClicks = ef.getNodeParameter('uniqueClicks', i) as number;
		body.bouncesSoft = ef.getNodeParameter('bouncesSoft', i) as number;
		body.bouncesHard = ef.getNodeParameter('bouncesHard', i) as number;
		body.unsubscribes = ef.getNodeParameter('unsubscribes', i) as number;
	} else if (resource === 'opportunity') {
		body.title = ef.getNodeParameter('title', i) as string;
		body.type = ef.getNodeParameter('opportunityType', i) as string;
	} else if (resource === 'comment') {
		body.body = ef.getNodeParameter('commentBody', i) as string;
	} else if (resource === 'referenceContent') {
		body.title = ef.getNodeParameter('referenceContentTitle', i) as string;
		body.mediaType = ef.getNodeParameter('referenceContentMediaType', i) as string;
		body.priority = ef.getNodeParameter('referenceContentPriority', i) as string;
	}

	return { ...body, ...additionalFields };
}

function buildUpdateBody(resource: string, ef: IExecuteFunctions, i: number): Record<string, any> {
	const additionalFields = ef.getNodeParameter('additionalFields', i, {}) as Record<string, any>;
	const body: Record<string, any> = {};

	if (['objective', 'painPoint', 'contentBrief', 'ephemeris', 'opportunity', 'referenceContent'].includes(resource)) {
		const title = ef.getNodeParameter('title', i, '') as string;
		if (title) body.title = title;
	} else if (['audience', 'asset', 'product', 'campaign', 'category', 'service', 'package', 'project'].includes(resource)) {
		const name = ef.getNodeParameter('name', i, '') as string;
		if (name) body.name = name;
	} else if (resource === 'socialMedia' || resource === 'websiteContent') {
		const title = ef.getNodeParameter('title', i, '') as string;
		if (title) body.title = title;
	} else if (resource === 'newsletter') {
		const subject = ef.getNodeParameter('subject', i, '') as string;
		if (subject) body.subject = subject;
	} else if (resource === 'ad') {
		const headline = ef.getNodeParameter('headline', i, '') as string;
		if (headline) body.headline = headline;
	} else if (resource === 'keyword') {
		const keyword = ef.getNodeParameter('keywordValue', i, '') as string;
		if (keyword) body.keyword = keyword;
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
			// ─── DEBUG OPTION ─────────────────────────────────────────────
			{
				displayName: 'Debug Mode',
				name: 'debugMode',
				type: 'boolean',
				default: false,
				description: 'Whether to include debug information (endpoint URL, request body) in the output',
			},
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
					{ name: 'Ephemeris', value: 'ephemeris' },
					{ name: 'Category', value: 'category' },
					{ name: 'Product', value: 'product' },
					{ name: 'Customer', value: 'customer' },
					{ name: 'Order', value: 'order' },
					{ name: 'Service', value: 'service' },
					{ name: 'Package', value: 'package' },
					{ name: 'Project', value: 'project' },
					{ name: 'Ad Campaign', value: 'campaign' },
					{ name: 'Ad', value: 'ad' },
					{ name: 'Keyword', value: 'keyword' },
					{ name: 'Newsletter', value: 'newsletter' },
					{ name: 'Email Report', value: 'emailReport' },
					{ name: 'Opportunity', value: 'opportunity' },
					{ name: 'Comment', value: 'comment' },
					{ name: 'Organization Member', value: 'organizationMember' },
					{ name: 'Client Member', value: 'clientMember' },
					{ name: 'Audience Pain Point', value: 'audiencePainPoint' },
					{ name: 'Ad Keyword', value: 'adKeyword' },
					{ name: 'Reference Content', value: 'referenceContent' },
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
				displayOptions: { show: { resource: ['ephemeris'] } },
				options: [
					{ name: 'List', value: 'list', action: 'List ephemerides' },
					{ name: 'Get', value: 'get', action: 'Get an ephemeris' },
					{ name: 'Create', value: 'create', action: 'Create an ephemeris' },
					{ name: 'Update', value: 'update', action: 'Update an ephemeris' },
					{ name: 'Delete', value: 'delete', action: 'Delete an ephemeris' },
					{ name: 'List by Month', value: 'listByMonth', action: 'List ephemerides by month' },
					{ name: 'List Upcoming', value: 'listUpcoming', action: 'List upcoming ephemerides' },
					{ name: 'Bulk Action', value: 'bulkAction', action: 'Bulk action on ephemerides' },
				],
				default: 'list',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['category'] } },
				options: [
					{ name: 'List', value: 'list', action: 'List categories' },
					{ name: 'Get', value: 'get', action: 'Get a category' },
					{ name: 'Create', value: 'create', action: 'Create a category' },
					{ name: 'Update', value: 'update', action: 'Update a category' },
					{ name: 'Delete', value: 'delete', action: 'Delete a category' },
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
				displayOptions: { show: { resource: ['service'] } },
				options: [
					{ name: 'List', value: 'list', action: 'List services' },
					{ name: 'Get', value: 'get', action: 'Get a service' },
					{ name: 'Create', value: 'create', action: 'Create a service' },
					{ name: 'Update', value: 'update', action: 'Update a service' },
					{ name: 'Delete', value: 'delete', action: 'Delete a service' },
				],
				default: 'list',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['package'] } },
				options: [
					{ name: 'List', value: 'list', action: 'List packages' },
					{ name: 'Get', value: 'get', action: 'Get a package' },
					{ name: 'Create', value: 'create', action: 'Create a package' },
					{ name: 'Update', value: 'update', action: 'Update a package' },
					{ name: 'Delete', value: 'delete', action: 'Delete a package' },
				],
				default: 'list',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['project'] } },
				options: [
					{ name: 'List', value: 'list', action: 'List projects' },
					{ name: 'Get', value: 'get', action: 'Get a project' },
					{ name: 'Create', value: 'create', action: 'Create a project' },
					{ name: 'Update', value: 'update', action: 'Update a project' },
					{ name: 'Delete', value: 'delete', action: 'Delete a project' },
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
				displayOptions: { show: { resource: ['ad'] } },
				options: [
					{ name: 'List', value: 'list', action: 'List ads' },
					{ name: 'Get', value: 'get', action: 'Get an ad' },
					{ name: 'Create', value: 'create', action: 'Create an ad' },
					{ name: 'Update', value: 'update', action: 'Update an ad' },
					{ name: 'Delete', value: 'delete', action: 'Delete an ad' },
				],
				default: 'list',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['keyword'] } },
				options: [
					{ name: 'List', value: 'list', action: 'List keywords' },
					{ name: 'Get', value: 'get', action: 'Get a keyword' },
					{ name: 'Create', value: 'create', action: 'Create a keyword' },
					{ name: 'Update', value: 'update', action: 'Update a keyword' },
					{ name: 'Delete', value: 'delete', action: 'Delete a keyword' },
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
				displayOptions: { show: { resource: ['emailReport'] } },
				options: [
					{ name: 'List', value: 'list', action: 'List email reports' },
					{ name: 'Get', value: 'get', action: 'Get an email report' },
					{ name: 'Create', value: 'create', action: 'Create an email report' },
					{ name: 'Update', value: 'update', action: 'Update an email report' },
					{ name: 'Delete', value: 'delete', action: 'Delete an email report' },
				],
				default: 'list',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['opportunity'] } },
				options: [
					{ name: 'List', value: 'list', action: 'List opportunities' },
					{ name: 'Get', value: 'get', action: 'Get an opportunity' },
					{ name: 'Create', value: 'create', action: 'Create an opportunity' },
					{ name: 'Update', value: 'update', action: 'Update an opportunity' },
					{ name: 'Delete', value: 'delete', action: 'Delete an opportunity' },
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
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['organizationMember'] } },
				options: [
					{ name: 'List', value: 'list', action: 'List organization members' },
					{ name: 'Invite', value: 'create', action: 'Invite a member' },
					{ name: 'Update Role', value: 'update', action: 'Update member role' },
					{ name: 'Remove', value: 'delete', action: 'Remove a member' },
				],
				default: 'list',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['clientMember'] } },
				options: [
					{ name: 'List', value: 'list', action: 'List client members' },
					{ name: 'Add', value: 'create', action: 'Add a member' },
					{ name: 'Update Role', value: 'update', action: 'Update member role' },
					{ name: 'Remove', value: 'delete', action: 'Remove a member' },
				],
				default: 'list',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['audiencePainPoint'] } },
				options: [
					{ name: 'List', value: 'list', action: 'List audience pain points' },
					{ name: 'Link', value: 'create', action: 'Link a pain point' },
					{ name: 'Update Score', value: 'update', action: 'Update relevance score' },
					{ name: 'Unlink', value: 'delete', action: 'Unlink a pain point' },
				],
				default: 'list',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['adKeyword'] } },
				options: [
					{ name: 'List', value: 'list', action: 'List ad keywords' },
					{ name: 'Link', value: 'create', action: 'Link a keyword' },
					{ name: 'Unlink', value: 'delete', action: 'Unlink a keyword' },
				],
				default: 'list',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['referenceContent'] } },
				options: [
					{ name: 'List', value: 'list', action: 'List reference content' },
					{ name: 'Get', value: 'get', action: 'Get a reference content' },
					{ name: 'Create', value: 'create', action: 'Create a reference content' },
					{ name: 'Update', value: 'update', action: 'Update a reference content' },
					{ name: 'Delete', value: 'delete', action: 'Delete a reference content' },
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
							'contentBrief', 'socialMedia', 'websiteContent', 'asset', 'ephemeris',
							'category', 'product', 'customer', 'order',
							'service', 'package', 'project',
							'campaign', 'ad', 'keyword',
							'newsletter', 'emailReport', 'opportunity', 'comment',
							'organizationMember', 'clientMember', 'audiencePainPoint', 'adKeyword', 'referenceContent',
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
							'contentBrief', 'socialMedia', 'websiteContent', 'asset', 'ephemeris',
							'category', 'product', 'customer', 'order',
							'service', 'package', 'project',
							'campaign', 'ad', 'keyword',
							'newsletter', 'emailReport', 'opportunity', 'comment',
							'clientMember', 'audiencePainPoint', 'adKeyword', 'referenceContent',
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
							'websiteContent', 'asset', 'ephemeris', 'category', 'product', 'customer', 'order',
							'service', 'package', 'project', 'campaign', 'ad', 'keyword',
							'newsletter', 'emailReport', 'opportunity', 'comment',
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
						resource: ['objective', 'painPoint', 'contentBrief', 'ephemeris', 'opportunity'],
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
						resource: ['audience', 'asset', 'category', 'service', 'package', 'project'],
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

			// ─── EPHEMERIS FIELDS ────────────────────────────────────────
			{
				displayName: 'Title',
				name: 'ephemerisTitle',
				type: 'string',
				displayOptions: { show: { resource: ['ephemeris'], operation: ['create'] } },
				default: '',
				required: true,
			},
			{
				displayName: 'Date',
				name: 'ephemerisDate',
				type: 'dateTime',
				displayOptions: { show: { resource: ['ephemeris'], operation: ['create'] } },
				default: '',
				required: true,
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['ephemeris'], operation: ['create', 'update'] } },
				options: [
					{ displayName: 'Description', name: 'description', type: 'string', default: '' },
					{
						displayName: 'Status',
						name: 'status',
						type: 'options',
						options: [
							{ name: 'Active', value: 'active' },
							{ name: 'Archived', value: 'archived' },
					],
						default: 'active',
					},
				],
			},

			// ─── CATEGORY FIELDS ─────────────────────────────────────────
			{
				displayName: 'Slug',
				name: 'categorySlug',
				type: 'string',
				displayOptions: { show: { resource: ['category'], operation: ['create'] } },
				default: '',
				required: true,
				description: 'URL-friendly identifier',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['category'], operation: ['create', 'update'] } },
				options: [
					{ displayName: 'Description', name: 'description', type: 'string', default: '' },
					{ displayName: 'Parent Category ID', name: 'parentId', type: 'string', default: '' },
					{ displayName: 'External ID', name: 'externalId', type: 'string', default: '' },
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
					{ displayName: 'Category ID', name: 'categoryId', type: 'string', default: '' },
					{ displayName: 'SEO Title', name: 'seoTitle', type: 'string', default: '' },
					{ displayName: 'SEO Description', name: 'seoDescription', type: 'string', default: '' },
					{ displayName: 'Focus Keyword', name: 'focusKeyword', type: 'string', default: '' },
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

			// ─── SERVICE FIELDS ──────────────────────────────────────────
			{
				displayName: 'Price From',
				name: 'priceFrom',
				type: 'number',
				displayOptions: { show: { resource: ['service'], operation: ['create'] } },
				default: 0,
				required: true,
			},
			{
				displayName: 'Billing Type',
				name: 'billingType',
				type: 'options',
				options: [
					{ name: 'One-off', value: 'one_off' },
					{ name: 'Retainer', value: 'retainer' },
					{ name: 'Hourly', value: 'hourly' },
				],
				displayOptions: { show: { resource: ['service'], operation: ['create'] } },
				default: 'one_off',
				required: true,
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['service'], operation: ['create', 'update'] } },
				options: [
					{ displayName: 'Description', name: 'description', type: 'string', default: '' },
					{ displayName: 'Category', name: 'category', type: 'string', default: '' },
				],
			},

			// ─── PACKAGE FIELDS ──────────────────────────────────────────
			{
				displayName: 'Monthly Fee',
				name: 'monthlyFee',
				type: 'number',
				displayOptions: { show: { resource: ['package'], operation: ['create'] } },
				default: 0,
				required: true,
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['package'], operation: ['create', 'update'] } },
				options: [
					{ displayName: 'Description', name: 'description', type: 'string', default: '' },
					{ displayName: 'Currency', name: 'currency', type: 'string', default: 'USD' },
				],
			},

			// ─── PROJECT FIELDS ──────────────────────────────────────────
			{
				displayName: 'Status',
				name: 'projectStatus',
				type: 'options',
				options: [
					{ name: 'Active', value: 'active' },
					{ name: 'Paused', value: 'paused' },
					{ name: 'Completed', value: 'completed' },
					{ name: 'Cancelled', value: 'cancelled' },
				],
				displayOptions: { show: { resource: ['project'], operation: ['create'] } },
				default: 'active',
				required: true,
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['project'], operation: ['create', 'update'] } },
				options: [
					{ displayName: 'Notes', name: 'notes', type: 'string', default: '' },
					{ displayName: 'Service Package ID', name: 'servicePackageId', type: 'string', default: '' },
					{ displayName: 'Start Date', name: 'startDate', type: 'dateTime', default: '' },
					{ displayName: 'End Date', name: 'endDate', type: 'dateTime', default: '' },
					{
						displayName: 'Status',
						name: 'status',
						type: 'options',
						options: [
							{ name: 'Active', value: 'active' },
							{ name: 'Paused', value: 'paused' },
							{ name: 'Completed', value: 'completed' },
							{ name: 'Cancelled', value: 'cancelled' },
					],
						default: 'active',
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

			// ─── AD FIELDS ────────────────────────────────────────────────
			{
				displayName: 'Headline',
				name: 'headline',
				type: 'string',
				displayOptions: { show: { resource: ['ad'], operation: ['create', 'update'] } },
				default: '',
				required: true,
			},
			{
				displayName: 'Status',
				name: 'adStatus',
				type: 'options',
				options: [
					{ name: 'Draft', value: 'draft' },
					{ name: 'To Approve', value: 'to_approve' },
					{ name: 'Active', value: 'active' },
					{ name: 'Paused', value: 'paused' },
					{ name: 'Rejected', value: 'rejected' },
				],
				displayOptions: { show: { resource: ['ad'], operation: ['create'] } },
				default: 'draft',
				required: true,
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['ad'], operation: ['create', 'update'] } },
				options: [
					{ displayName: 'Campaign ID', name: 'campaignId', type: 'string', default: '' },
					{ displayName: 'Ad Group', name: 'adGroup', type: 'string', default: '' },
					{ displayName: 'Description', name: 'description', type: 'string', default: '' },
					{ displayName: 'URL', name: 'url', type: 'string', default: '' },
					{
						displayName: 'Status',
						name: 'status',
						type: 'options',
						options: [
							{ name: 'Draft', value: 'draft' },
							{ name: 'To Approve', value: 'to_approve' },
							{ name: 'Active', value: 'active' },
							{ name: 'Paused', value: 'paused' },
							{ name: 'Rejected', value: 'rejected' },
					],
						default: 'draft',
					},
				],
			},

			// ─── KEYWORD FIELDS ──────────────────────────────────────────
			{
				displayName: 'Keyword',
				name: 'keywordValue',
				type: 'string',
				displayOptions: { show: { resource: ['keyword'], operation: ['create', 'update'] } },
				default: '',
				required: true,
			},
			{
				displayName: 'Type',
				name: 'keywordType',
				type: 'options',
				options: [
					{ name: 'Non-Branded', value: 'non_branded' },
					{ name: 'Negative', value: 'negative' },
					{ name: 'Brand', value: 'brand' },
				],
				displayOptions: { show: { resource: ['keyword'], operation: ['create'] } },
				default: 'non_branded',
				required: true,
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['keyword'], operation: ['create', 'update'] } },
				options: [
					{ displayName: 'Search Volume', name: 'searchVolume', type: 'number', default: 0 },
					{ displayName: 'CPC', name: 'cpc', type: 'number', default: 0 },
					{ displayName: 'Paid Difficulty', name: 'paidDifficulty', type: 'number', default: 0 },
					{
						displayName: 'Type',
						name: 'type',
						type: 'options',
						options: [
							{ name: 'Non-Branded', value: 'non_branded' },
							{ name: 'Negative', value: 'negative' },
							{ name: 'Brand', value: 'brand' },
					],
						default: 'non_branded',
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

			// ─── EMAIL REPORT FIELDS ─────────────────────────────────────
			{
				displayName: 'Sent',
				name: 'sent',
				type: 'number',
				displayOptions: { show: { resource: ['emailReport'], operation: ['create'] } },
				default: 0,
				required: true,
			},
			{
				displayName: 'Delivered',
				name: 'delivered',
				type: 'number',
				displayOptions: { show: { resource: ['emailReport'], operation: ['create'] } },
				default: 0,
				required: true,
			},
			{
				displayName: 'Opens',
				name: 'opens',
				type: 'number',
				displayOptions: { show: { resource: ['emailReport'], operation: ['create'] } },
				default: 0,
				required: true,
			},
			{
				displayName: 'Unique Opens',
				name: 'uniqueOpens',
				type: 'number',
				displayOptions: { show: { resource: ['emailReport'], operation: ['create'] } },
				default: 0,
				required: true,
			},
			{
				displayName: 'Clicks',
				name: 'clicks',
				type: 'number',
				displayOptions: { show: { resource: ['emailReport'], operation: ['create'] } },
				default: 0,
				required: true,
			},
			{
				displayName: 'Unique Clicks',
				name: 'uniqueClicks',
				type: 'number',
				displayOptions: { show: { resource: ['emailReport'], operation: ['create'] } },
				default: 0,
				required: true,
			},
			{
				displayName: 'Soft Bounces',
				name: 'bouncesSoft',
				type: 'number',
				displayOptions: { show: { resource: ['emailReport'], operation: ['create'] } },
				default: 0,
				required: true,
			},
			{
				displayName: 'Hard Bounces',
				name: 'bouncesHard',
				type: 'number',
				displayOptions: { show: { resource: ['emailReport'], operation: ['create'] } },
				default: 0,
				required: true,
			},
			{
				displayName: 'Unsubscribes',
				name: 'unsubscribes',
				type: 'number',
				displayOptions: { show: { resource: ['emailReport'], operation: ['create'] } },
				default: 0,
				required: true,
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['emailReport'], operation: ['create', 'update'] } },
				options: [
					{ displayName: 'Newsletter ID', name: 'newsletterId', type: 'string', default: '' },
					{ displayName: 'Provider Campaign ID', name: 'providerCampaignId', type: 'string', default: '' },
					{ displayName: 'Sent At', name: 'sentAt', type: 'dateTime', default: '' },
				],
			},

			// ─── OPPORTUNITY FIELDS ───────────────────────────────────────
			{
				displayName: 'Type',
				name: 'opportunityType',
				type: 'options',
				options: [
					{ name: 'Podcast', value: 'podcast' },
					{ name: 'Event', value: 'event' },
					{ name: 'Media', value: 'media' },
					{ name: 'Speaking', value: 'speaking' },
					{ name: 'Other', value: 'other' },
				],
				displayOptions: { show: { resource: ['opportunity'], operation: ['create'] } },
				default: 'other',
				required: true,
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['opportunity'], operation: ['create', 'update'] } },
				options: [
					{ displayName: 'Description', name: 'description', type: 'string', default: '' },
					{ displayName: 'Contact Name', name: 'contactName', type: 'string', default: '' },
					{ displayName: 'Contact Email', name: 'contactEmail', type: 'string', default: '' },
					{ displayName: 'URL', name: 'url', type: 'string', default: '' },
					{ displayName: 'Date', name: 'date', type: 'dateTime', default: '' },
					{
						displayName: 'Stage',
						name: 'stage',
						type: 'options',
						options: [
							{ name: 'Identified', value: 'identified' },
							{ name: 'Outreach', value: 'outreach' },
							{ name: 'Negotiation', value: 'negotiation' },
							{ name: 'Confirmed', value: 'confirmed' },
							{ name: 'Completed', value: 'completed' },
							{ name: 'Cancelled', value: 'cancelled' },
					],
						default: 'identified',
					},
					{
						displayName: 'Type',
						name: 'type',
						type: 'options',
						options: [
							{ name: 'Podcast', value: 'podcast' },
							{ name: 'Event', value: 'event' },
							{ name: 'Media', value: 'media' },
							{ name: 'Speaking', value: 'speaking' },
							{ name: 'Other', value: 'other' },
					],
						default: 'other',
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

			// ─── ORGANIZATION MEMBER FIELDS ────────────────────────────────────
			{
				displayName: 'User ID',
				name: 'memberUserId',
				type: 'string',
				displayOptions: { show: { resource: ['organizationMember'], operation: ['update', 'delete'] } },
				default: '',
				required: true,
				description: 'ID of the user',
			},
			{
				displayName: 'Email',
				name: 'memberEmail',
				type: 'string',
				displayOptions: { show: { resource: ['organizationMember'], operation: ['create'] } },
				default: '',
				required: true,
				description: 'Email of the user to invite',
			},
			{
				displayName: 'Role',
				name: 'memberRole',
				type: 'options',
				options: [
					{ name: 'Admin', value: 'admin' },
					{ name: 'Editor', value: 'editor' },
					{ name: 'Approver', value: 'approver' },
					{ name: 'Commenter', value: 'commenter' },
					{ name: 'Viewer', value: 'viewer' },
				],
				displayOptions: { show: { resource: ['organizationMember'], operation: ['create', 'update'] } },
				default: 'viewer',
				required: true,
				description: 'Role to assign to the member',
			},

			// ─── CLIENT MEMBER FIELDS ──────────────────────────────────────────
			{
				displayName: 'Member ID',
				name: 'clientMemberId',
				type: 'string',
				displayOptions: { show: { resource: ['clientMember'], operation: ['update', 'delete'] } },
				default: '',
				required: true,
				description: 'ID of the member',
			},
			{
				displayName: 'Email',
				name: 'clientMemberEmail',
				type: 'string',
				displayOptions: { show: { resource: ['clientMember'], operation: ['create'] } },
				default: '',
				required: true,
				description: 'Email of the user to add',
			},
			{
				displayName: 'Role Override',
				name: 'roleOverride',
				type: 'options',
				options: [
					{ name: 'Admin', value: 'admin' },
					{ name: 'Editor', value: 'editor' },
					{ name: 'Approver', value: 'approver' },
					{ name: 'Commenter', value: 'commenter' },
					{ name: 'Viewer', value: 'viewer' },
				],
				displayOptions: { show: { resource: ['clientMember'], operation: ['create'] } },
				default: '',
				description: 'Override role for this client (optional)',
			},
			{
				displayName: 'Role',
				name: 'clientMemberRole',
				type: 'options',
				options: [
					{ name: 'Admin', value: 'admin' },
					{ name: 'Editor', value: 'editor' },
					{ name: 'Approver', value: 'approver' },
					{ name: 'Commenter', value: 'commenter' },
					{ name: 'Viewer', value: 'viewer' },
				],
				displayOptions: { show: { resource: ['clientMember'], operation: ['update'] } },
				default: 'viewer',
				required: true,
				description: 'Role to assign to the member',
			},

			// ─── AUDIENCE PAIN POINT FIELDS ────────────────────────────────────
			{
				displayName: 'Audience',
				name: 'audienceId',
				type: 'options',
				typeOptions: { loadOptionsMethod: 'getAudiences' },
				displayOptions: { show: { resource: ['audiencePainPoint'] } },
				default: '',
				required: true,
				description: 'Audience to manage pain points for',
			},
			{
				displayName: 'Link ID',
				name: 'painPointLinkId',
				type: 'string',
				displayOptions: { show: { resource: ['audiencePainPoint'], operation: ['update', 'delete'] } },
				default: '',
				required: true,
				description: 'ID of the pain point link',
			},
			{
				displayName: 'Pain Point',
				name: 'painPointIdToLink',
				type: 'options',
				typeOptions: { loadOptionsMethod: 'getPainPoints' },
				displayOptions: { show: { resource: ['audiencePainPoint'], operation: ['create'] } },
				default: '',
				required: true,
				description: 'Pain point to link',
			},
			{
				displayName: 'Relevance Score',
				name: 'relevanceScore',
				type: 'number',
				displayOptions: { show: { resource: ['audiencePainPoint'], operation: ['create', 'update'] } },
				default: 5,
				description: 'How relevant this pain point is (1-10)',
				typeOptions: { minValue: 1, maxValue: 10 },
			},

			// ─── AD KEYWORD FIELDS ─────────────────────────────────────────────
			{
				displayName: 'Ad',
				name: 'adIdForKeyword',
				type: 'options',
				typeOptions: { loadOptionsMethod: 'getAds' },
				displayOptions: { show: { resource: ['adKeyword'] } },
				default: '',
				required: true,
				description: 'Ad to manage keywords for',
			},
			{
				displayName: 'Link ID',
				name: 'keywordLinkId',
				type: 'string',
				displayOptions: { show: { resource: ['adKeyword'], operation: ['delete'] } },
				default: '',
				required: true,
				description: 'ID of the keyword link to remove',
			},
			{
				displayName: 'Keyword',
				name: 'keywordIdToLink',
				type: 'options',
				typeOptions: { loadOptionsMethod: 'getKeywords' },
				displayOptions: { show: { resource: ['adKeyword'], operation: ['create'] } },
				default: '',
				required: true,
				description: 'Keyword to link',
			},


		// ─── REFERENCE CONTENT FIELDS ─────────────────────────────────────────
		{
			displayName: 'Reference Content ID',
			name: 'referenceContentId',
			type: 'string',
			displayOptions: { show: { resource: ['referenceContent'], operation: ['get', 'update', 'delete'] } },
			default: '',
			required: true,
			description: 'ID of the reference reference content',
		},
		{
			displayName: 'Title',
			name: 'referenceContentTitle',
			type: 'string',
			displayOptions: { show: { resource: ['referenceContent'], operation: ['create'] } },
			default: '',
			required: true,
			description: 'Title of the reference content',
		},
		{
			displayName: 'Media Type',
			name: 'referenceContentMediaType',
			type: 'options',
			displayOptions: { show: { resource: ['referenceContent'], operation: ['create'] } },
			options: [
				{ name: 'Link', value: 'link' },
				{ name: 'Text', value: 'text' },
				{ name: 'Image', value: 'image' },
				{ name: 'Video', value: 'video' },
				{ name: 'File', value: 'file' },
			],
			default: 'link',
			required: true,
			description: 'Media type of the reference content',
		},
		{
			displayName: 'Priority',
			name: 'referenceContentPriority',
			type: 'options',
			displayOptions: { show: { resource: ['referenceContent'], operation: ['create'] } },
			options: [
				{ name: 'Low', value: 'low' },
				{ name: 'Medium', value: 'medium' },
				{ name: 'High', value: 'high' },
				{ name: 'Critical', value: 'critical' },
			],
			default: 'medium',
			required: true,
			description: 'Priority of the reference content',
		},
		{
			displayName: 'Additional Fields',
			name: 'additionalFields',
			type: 'collection',
			placeholder: 'Add Field',
			default: {},
			displayOptions: { show: { resource: ['referenceContent'], operation: ['create', 'update'] } },
			options: [
				{ displayName: 'Description', name: 'description', type: 'string', default: '' },
				{ displayName: 'URL', name: 'url', type: 'string', default: '' },
				{ displayName: 'Category ID', name: 'categoryId', type: 'string', default: '' },
				{ displayName: 'Proposed By', name: 'proposedBy', type: 'string', default: '' },
				{ displayName: 'Purpose', name: 'purpose', type: 'string', default: '' },
				{
					displayName: 'Status',
					name: 'status',
					type: 'options',
					options: [
						{ name: 'Idea', value: 'idea' },
						{ name: 'Draft', value: 'draft' },
						{ name: 'Review', value: 'review' },
						{ name: 'Approved', value: 'approved' },
						{ name: 'Archived', value: 'archived' },
					],
					default: 'idea',
				},
				{
					displayName: 'Media Type',
					name: 'mediaType',
					type: 'options',
					options: [
						{ name: 'Link', value: 'link' },
						{ name: 'Text', value: 'text' },
						{ name: 'Image', value: 'image' },
						{ name: 'Video', value: 'video' },
						{ name: 'File', value: 'file' },
					],
					default: 'link',
				},
				{
					displayName: 'Priority',
					name: 'priority',
					type: 'options',
					options: [
						{ name: 'Low', value: 'low' },
						{ name: 'Medium', value: 'medium' },
						{ name: 'High', value: 'high' },
						{ name: 'Critical', value: 'critical' },
					],
					default: 'medium',
				},
			],
		},
			// ─── EPHEMERIS BY MONTH FIELDS ─────────────────────────────────────
			{
				displayName: 'Month',
				name: 'ephemerisMonth',
				type: 'number',
				displayOptions: { show: { resource: ['ephemeris'], operation: ['listByMonth'] } },
				default: 1,
				required: true,
				description: 'Month number (1-12)',
				typeOptions: { minValue: 1, maxValue: 12 },
			},
			{
				displayName: 'Year',
				name: 'ephemerisYear',
				type: 'number',
				displayOptions: { show: { resource: ['ephemeris'], operation: ['listByMonth'] } },
				default: 2026,
				required: true,
				description: 'Year',
			},

			// ─── EPHEMERIS UPCOMING FIELDS ─────────────────────────────────────
			{
				displayName: 'Limit',
				name: 'ephemerisLimit',
				type: 'number',
				displayOptions: { show: { resource: ['ephemeris'], operation: ['listUpcoming'] } },
				default: 10,
				description: 'Maximum number of results',
			},
			{
				displayName: 'Days Ahead',
				name: 'ephemerisDaysAhead',
				type: 'number',
				displayOptions: { show: { resource: ['ephemeris'], operation: ['listUpcoming'] } },
				default: 30,
				description: 'Number of days to look ahead',
			},

			// ─── EPHEMERIS BULK FIELDS ─────────────────────────────────────────
			{
				displayName: 'Action',
				name: 'ephemerisBulkAction',
				type: 'options',
				options: [
					{ name: 'Delete', value: 'delete' },
					{ name: 'Update Status', value: 'update_status' },
				],
				displayOptions: { show: { resource: ['ephemeris'], operation: ['bulkAction'] } },
				default: 'delete',
				required: true,
				description: 'Bulk action to perform',
			},
			{
				displayName: 'IDs',
				name: 'ephemerisBulkIds',
				type: 'string',
				displayOptions: { show: { resource: ['ephemeris'], operation: ['bulkAction'] } },
				default: '',
				required: true,
				description: 'Comma-separated list of ephemeris IDs',
			},
			{
				displayName: 'Status',
				name: 'ephemerisBulkStatus',
				type: 'options',
				options: [
					{ name: 'Active', value: 'active' },
					{ name: 'Archived', value: 'archived' },
				],
				displayOptions: { show: { resource: ['ephemeris'], operation: ['bulkAction'] } },
				default: 'active',
				description: 'Status to set (only for update_status action)',
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
							'contentBrief', 'socialMedia', 'websiteContent', 'asset', 'ephemeris',
							'category', 'product', 'customer', 'order',
							'service', 'package', 'project',
							'campaign', 'ad', 'keyword',
							'newsletter', 'emailReport', 'opportunity', 'comment', 'referenceContent',
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
			async getAudiences(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const orgId = this.getCurrentNodeParameter('organizationId') as string;
					const clientId = this.getCurrentNodeParameter('clientIdSelect') as string;
					if (!orgId || !clientId) return [];
					const response = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'tukiGrowthApi',
						{ method: 'GET', url: `${BASE_URL}/organizations/${orgId}/clients/${clientId}/strategy/audiences`, json: true },
					);
					const items: any[] = Array.isArray(response?.data) ? response.data : [];
					return items.map((a: any) => ({ name: String(a.name ?? a._id), value: String(a._id) }));
				} catch {
					return [];
				}
			},
			async getPainPoints(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const orgId = this.getCurrentNodeParameter('organizationId') as string;
					const clientId = this.getCurrentNodeParameter('clientIdSelect') as string;
					if (!orgId || !clientId) return [];
					const response = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'tukiGrowthApi',
						{ method: 'GET', url: `${BASE_URL}/organizations/${orgId}/clients/${clientId}/strategy/pain-points`, json: true },
					);
					const items: any[] = Array.isArray(response?.data) ? response.data : [];
					return items.map((p: any) => ({ name: String(p.title ?? p._id), value: String(p._id) }));
				} catch {
					return [];
				}
			},
			async getAds(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const orgId = this.getCurrentNodeParameter('organizationId') as string;
					const clientId = this.getCurrentNodeParameter('clientIdSelect') as string;
					if (!orgId || !clientId) return [];
					const response = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'tukiGrowthApi',
						{ method: 'GET', url: `${BASE_URL}/organizations/${orgId}/clients/${clientId}/ads/ads`, json: true },
					);
					const items: any[] = Array.isArray(response?.data) ? response.data : [];
					return items.map((a: any) => ({ name: String(a.headline ?? a._id), value: String(a._id) }));
				} catch {
					return [];
				}
			},
			async getKeywords(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const orgId = this.getCurrentNodeParameter('organizationId') as string;
					const clientId = this.getCurrentNodeParameter('clientIdSelect') as string;
					if (!orgId || !clientId) return [];
					const response = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'tukiGrowthApi',
						{ method: 'GET', url: `${BASE_URL}/organizations/${orgId}/clients/${clientId}/ads/keywords`, json: true },
					);
					const items: any[] = Array.isArray(response?.data) ? response.data : [];
					return items.map((k: any) => ({ name: String(k.keyword ?? k._id), value: String(k._id) }));
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
		const debug = this.getNodeParameter('debug', 0, false) as boolean;

		for (let i = 0; i < items.length; i++) {
			try {
				let response: any;
				let requestDebugInfo: { url: string; method: string; body?: any; qs?: any } | null = null;

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

				// ── ORGANIZATION MEMBER ────────────────────────────────────────────
				} else if (resource === 'organizationMember') {
					const orgId = this.getNodeParameter('organizationId', i) as string;
					const base = `${BASE_URL}/organizations/${orgId}/members`;

					if (operation === 'list') {
						response = await this.helpers.httpRequestWithAuthentication.call(this, 'tukiGrowthApi', {
							method: 'GET', url: base, json: true,
						});
					} else if (operation === 'create') {
						response = await this.helpers.httpRequestWithAuthentication.call(this, 'tukiGrowthApi', {
							method: 'POST',
							url: base,
							body: {
								email: this.getNodeParameter('memberEmail', i) as string,
								role: this.getNodeParameter('memberRole', i) as string,
							},
							json: true,
						});
					} else if (operation === 'update') {
						const userId = this.getNodeParameter('memberUserId', i) as string;
						response = await this.helpers.httpRequestWithAuthentication.call(this, 'tukiGrowthApi', {
							method: 'PATCH',
							url: `${base}/${userId}`,
							body: { role: this.getNodeParameter('memberRole', i) as string },
							json: true,
						});
					} else if (operation === 'delete') {
						const userId = this.getNodeParameter('memberUserId', i) as string;
						response = await this.helpers.httpRequestWithAuthentication.call(this, 'tukiGrowthApi', {
							method: 'DELETE', url: `${base}/${userId}`, json: true,
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

				// ── CLIENT MEMBER ──────────────────────────────────────────
				} else if (resource === 'clientMember') {
					const orgId = this.getNodeParameter('organizationId', i) as string;
					const clientId = this.getNodeParameter('clientIdSelect', i) as string;
					const base = `${BASE_URL}/organizations/${orgId}/clients/${clientId}/members`;

					if (operation === 'list') {
						response = await this.helpers.httpRequestWithAuthentication.call(this, 'tukiGrowthApi', {
							method: 'GET', url: base, json: true,
						});
					} else if (operation === 'create') {
						const body: Record<string, any> = {
							email: this.getNodeParameter('clientMemberEmail', i) as string,
						};
						const roleOverride = this.getNodeParameter('roleOverride', i, '') as string;
						if (roleOverride) body.roleOverride = roleOverride;
						response = await this.helpers.httpRequestWithAuthentication.call(this, 'tukiGrowthApi', {
							method: 'POST', url: base, body, json: true,
						});
					} else if (operation === 'update') {
						const memberId = this.getNodeParameter('clientMemberId', i) as string;
						response = await this.helpers.httpRequestWithAuthentication.call(this, 'tukiGrowthApi', {
							method: 'PATCH',
							url: `${base}/${memberId}`,
							body: { role: this.getNodeParameter('clientMemberRole', i) as string },
							json: true,
						});
					} else if (operation === 'delete') {
						const memberId = this.getNodeParameter('clientMemberId', i) as string;
						response = await this.helpers.httpRequestWithAuthentication.call(this, 'tukiGrowthApi', {
							method: 'DELETE', url: `${base}/${memberId}`, json: true,
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

					// Handle audience pain points (nested resource)
					if (resource === 'audiencePainPoint') {
						const audienceId = this.getNodeParameter('audienceId', i) as string;
						const endpointBase = `${moduleBase}/strategy/audiences/${audienceId}/pain-points`;

						if (operation === 'list') {
							response = await this.helpers.httpRequestWithAuthentication.call(this, 'tukiGrowthApi', {
								method: 'GET', url: endpointBase, json: true,
							});
						} else if (operation === 'create') {
							response = await this.helpers.httpRequestWithAuthentication.call(this, 'tukiGrowthApi', {
								method: 'POST',
								url: endpointBase,
								body: {
									painPointId: this.getNodeParameter('painPointIdToLink', i) as string,
									relevanceScore: this.getNodeParameter('relevanceScore', i, 5) as number,
								},
								json: true,
							});
						} else if (operation === 'update') {
							const linkId = this.getNodeParameter('painPointLinkId', i) as string;
							response = await this.helpers.httpRequestWithAuthentication.call(this, 'tukiGrowthApi', {
								method: 'PATCH',
								url: endpointBase,
								body: {
									linkId,
									relevanceScore: this.getNodeParameter('relevanceScore', i) as number,
								},
								json: true,
							});
						} else if (operation === 'delete') {
							const linkId = this.getNodeParameter('painPointLinkId', i) as string;
							response = await this.helpers.httpRequestWithAuthentication.call(this, 'tukiGrowthApi', {
								method: 'DELETE',
								url: `${endpointBase}?linkId=${linkId}`,
								json: true,
							});
						}

					// Handle ad keywords (nested resource)
					} else if (resource === 'adKeyword') {
						const adId = this.getNodeParameter('adIdForKeyword', i) as string;
						const endpointBase = `${moduleBase}/ads/ads/${adId}/keywords`;

						if (operation === 'list') {
							response = await this.helpers.httpRequestWithAuthentication.call(this, 'tukiGrowthApi', {
								method: 'GET', url: endpointBase, json: true,
							});
						} else if (operation === 'create') {
							response = await this.helpers.httpRequestWithAuthentication.call(this, 'tukiGrowthApi', {
								method: 'POST',
								url: endpointBase,
								body: { keywordId: this.getNodeParameter('keywordIdToLink', i) as string },
								json: true,
							});
						} else if (operation === 'delete') {
							const linkId = this.getNodeParameter('keywordLinkId', i) as string;
							response = await this.helpers.httpRequestWithAuthentication.call(this, 'tukiGrowthApi', {
								method: 'DELETE',
								url: `${endpointBase}?linkId=${linkId}`,
								json: true,
							});
						}

					// Standard module resources
					} else {
						const resourcePaths: Record<string, string> = {
							objective: 'strategy/objectives',
							audience: 'strategy/audiences',
							painPoint: 'strategy/pain-points',
							contentBrief: 'content/briefs',
							socialMedia: 'content/rrss',
							websiteContent: 'content/website',
							asset: 'content/assets',
							ephemeris: 'content/ephemerides',
							category: 'ecommerce/categories',
							product: 'ecommerce/products',
							customer: 'ecommerce/customers',
							order: 'ecommerce/orders',
							service: 'services/services',
							package: 'services/packages',
							project: 'services/projects',
							campaign: 'ads/campaigns',
							ad: 'ads/ads',
							keyword: 'ads/keywords',
							newsletter: 'email/newsletters',
							emailReport: 'email/reports',
							opportunity: 'pr-speaking/opportunities',
							comment: 'comments',
							referenceContent: 'content/reference',
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
						} else if (resource === 'ephemeris') {
							// Special ephemeris operations
							if (operation === 'listByMonth') {
								const month = this.getNodeParameter('ephemerisMonth', i) as number;
								const year = this.getNodeParameter('ephemerisYear', i) as number;
								response = await this.helpers.httpRequestWithAuthentication.call(this, 'tukiGrowthApi', {
									method: 'GET',
									url: `${endpointBase}/by-month`,
									qs: { month, year },
									json: true,
								});
							} else if (operation === 'listUpcoming') {
								const limit = this.getNodeParameter('ephemerisLimit', i, 10) as number;
								const daysAhead = this.getNodeParameter('ephemerisDaysAhead', i, 30) as number;
								response = await this.helpers.httpRequestWithAuthentication.call(this, 'tukiGrowthApi', {
									method: 'GET',
									url: `${endpointBase}/upcoming`,
									qs: { limit, daysAhead },
									json: true,
								});
							} else if (operation === 'bulkAction') {
								const action = this.getNodeParameter('ephemerisBulkAction', i) as string;
								const idsStr = this.getNodeParameter('ephemerisBulkIds', i) as string;
								const ids = idsStr.split(',').map((id) => id.trim());
								const body: Record<string, any> = { action, ids };
								if (action === 'update_status') {
									body.status = this.getNodeParameter('ephemerisBulkStatus', i) as string;
								}
								response = await this.helpers.httpRequestWithAuthentication.call(this, 'tukiGrowthApi', {
									method: 'POST',
									url: `${endpointBase}/bulk`,
									body,
									json: true,
								});
							}
						}
					}
				}

				const data = response?.data ?? response;
				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(data),
					{ itemData: { item: i } },
				);
				// Add debug info if enabled
				if (debug && requestDebugInfo) {
					for (const item of executionData) {
						item.json._debug = requestDebugInfo;
					}
				}
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
