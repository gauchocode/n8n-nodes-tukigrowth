# n8n-nodes-tukigrowth

[n8n](https://n8n.io) community node for [TukiGrowth](https://tukigrowth.com) API.

TukiGrowth is a marketing strategy and content planning platform. This node allows you to interact with organizations, clients, portfolio items, strategy resources, content, CRM, ecommerce, and more.

## Installation

### In n8n Community Nodes

1. Go to **Settings** > **Community Nodes**
2. Select **Install**
3. Enter `n8n-nodes-tukigrowth`
4. Click **Install**

### Manual Installation

```bash
cd ~/.n8n/custom
npm install n8n-nodes-tukigrowth
```

## Credentials

To use this node, you need a TukiGrowth API key:

1. Log in to your TukiGrowth account
2. Go to **Settings** > **API Keys**
3. Create a new API key
4. Copy the key (starts with `tg_`)

In n8n:
1. Go to **Credentials**
2. Click **Add Credential**
3. Search for "TukiGrowth API"
4. Paste your API key
5. Save

## AI Agent Support

This node can be used as a tool in n8n AI Agent workflows. Simply add it to your AI Agent's tools to enable the agent to interact with TukiGrowth resources.

## API v1 Alignment Notes

- Auth header is `X-API-Key`
- Base path pattern is `/api/v1/organizations/{orgId}/clients/{clientId}/...`
- `offer-units` was replaced by `portfolio-items`
- Strategy scope now uses `scopeType` (`brand` or `portfolio_item`) and `portfolioItemId`

## Supported Resources & Operations

| Resource | List | Get | Create | Update | Delete |
|----------|:----:|:---:|:------:|:------:|:------:|
| Organization | ✅ | ✅ | ✅ | ✅ | ❌ |
| Client | ✅ | ✅ | ✅ | ✅ | ✅ |
| Business Context | ❌ | ✅ | ❌ | ✅ | ❌ |
| Portfolio Item | ✅ | ✅ | ✅ | ✅ | ✅ |
| Objective | ✅ | ✅ | ✅ | ✅ | ✅ |
| Audience | ✅ | ✅ | ✅ | ✅ | ✅ |
| Pain Point | ✅ | ✅ | ✅ | ✅ | ✅ |
| Content Brief | ✅ | ✅ | ✅ | ✅ | ✅ |
| Social Media Post | ✅ | ✅ | ✅ | ✅ | ✅ |
| Website Content | ✅ | ✅ | ✅ | ✅ | ✅ |
| Asset | ✅ | ✅ | ✅ | ✅ | ✅ |
| Product | ✅ | ✅ | ✅ | ✅ | ✅ |
| Customer | ✅ | ✅ | ✅ | ✅ | ✅ |
| Order | ✅ | ✅ | ✅ | ✅ | ✅ |
| Ad Campaign | ✅ | ✅ | ✅ | ✅ | ✅ |
| Newsletter | ✅ | ✅ | ✅ | ✅ | ✅ |
| Comment | ✅ | ❌ | ✅ | ✅ | ✅ |

### Organization

Manage organizations (top-level entities).

| Operation | Description |
|-----------|-------------|
| List | Get all organizations |
| Get | Get a single organization by ID |
| Create | Create a new organization |
| Update | Update an organization |

**Create/Update Fields:**
- Name (required for create)
- Slug (required for create, URL-friendly identifier)
- Status (active, paused, archived)

### Client

Manage clients within an organization.

| Operation | Description |
|-----------|-------------|
| List | Get all clients for an organization |
| Get | Get a single client by ID |
| Create | Create a new client |
| Update | Update a client |
| Delete | Delete a client |

**Create Fields:**
- Name (required)
- Slug (required)
- Business Type (required: `ecommerce`, `services`, `mixed`, `other`)
- Website URL (optional)
- Timezone (optional)
- Primary Language (optional)
- Channels (optional)

### Portfolio Item

Manage portfolio items for a client.

| Operation | Description |
|-----------|-------------|
| List | Get all portfolio items |
| Get | Get a portfolio item by ID |
| Create | Create a new portfolio item |
| Update | Update a portfolio item |
| Delete | Delete a portfolio item |

**Create Fields:**
- Name (required)
- Description (optional)
- Category (optional)
- Status (optional)

### Business Context

Manage the business context for a client (strategic information).

| Operation | Description |
|-----------|-------------|
| Get | Get the business context for a client |
| Update | Update the business context |

**Update Fields:**
- Value Proposition
- Target Audience
- Competitive Advantage
- Key Differentiators
- Brand Voice

### Objective

Manage marketing objectives for a client.

| Operation | Description |
|-----------|-------------|
| List | Get all objectives |
| Get | Get an objective by ID |
| Create | Create a new objective |
| Update | Update an objective |
| Delete | Delete an objective |

**Create Fields:**
- Title (required)
- Type (required)
- Scope Type (optional: `brand` or `portfolio_item`)
- Portfolio Item ID (optional)
- Intent Type (optional)

### Audience

Manage target audiences for a client.

| Operation | Description |
|-----------|-------------|
| List | Get all audiences |
| Get | Get an audience by ID |
| Create | Create a new audience |
| Update | Update an audience |
| Delete | Delete an audience |

**Create Fields:**
- Name (required)
- Description (optional)
- Scope Type (optional: `brand` or `portfolio_item`)
- Portfolio Item ID (optional)
- Demographics (optional)
- Pain Points (optional)
- Goals (optional)

### Pain Point

Manage customer pain points for a client.

| Operation | Description |
|-----------|-------------|
| List | Get all pain points |
| Get | Get a pain point by ID |
| Create | Create a new pain point |
| Update | Update a pain point |
| Delete | Delete a pain point |

**Create Fields:**
- Title (required)
- Severity (low, medium, high, critical)
- Scope Type (optional: `brand` or `portfolio_item`)
- Portfolio Item ID (optional)
- Description (optional)

### Content Brief

Manage content briefs for a client.

| Operation | Description |
|-----------|-------------|
| List | Get all content briefs |
| Get | Get a content brief by ID |
| Create | Create a new content brief |
| Update | Update a content brief |
| Delete | Delete a content brief |

**Create Fields:**
- Title (required)
- Funnel Level (awareness, consideration, conversion, retention)
- Description (optional)
- Target Keywords (optional)
- Content Type (optional)

### Social Media Post

Manage social media posts for a client.

| Operation | Description |
|-----------|-------------|
| List | Get all social media posts |
| Get | Get a social media post by ID |
| Create | Create a new social media post |
| Update | Update a social media post |
| Delete | Delete a social media post |

**Create Fields:**
- Title (required)
- Channel (linkedin, twitter, instagram, facebook, tiktok, youtube)
- Content Type (post, story, reel, carousel)
- Content (optional)
- Scheduled Date (optional)

### Website Content

Manage website content for a client.

| Operation | Description |
|-----------|-------------|
| List | Get all website content |
| Get | Get website content by ID |
| Create | Create new website content |
| Update | Update website content |
| Delete | Delete website content |

**Create Fields:**
- Title (required)
- Content Type (landing_page, blog_post, product_page, about_page, faq)
- Content (optional)
- URL (optional)
- Meta Description (optional)

### Asset

Manage digital assets for a client.

| Operation | Description |
|-----------|-------------|
| List | Get all assets |
| Get | Get an asset by ID |
| Create | Create a new asset |
| Update | Update an asset |
| Delete | Delete an asset |

**Create Fields:**
- Name (required)
- URL (required)
- Type (image, video, document, audio, other)
- Description (optional)

### Product

Manage products for a client.

| Operation | Description |
|-----------|-------------|
| List | Get all products |
| Get | Get a product by ID |
| Create | Create a new product |
| Update | Update a product |
| Delete | Delete a product |

**Create Fields:**
- Name (required)
- Description (optional)
- Price (required)
- Category (optional)
- SKU (optional)
- Variant (optional)
- Industry (optional)
- Rating (optional)
- Review Count (optional)
- Raw Content (optional)

### Customer

Manage customers for a client.

| Operation | Description |
|-----------|-------------|
| List | Get all customers |
| Get | Get a customer by ID |
| Create | Create a new customer |
| Update | Update a customer |
| Delete | Delete a customer |

**Create Fields:**
- Name (required)
- Email (optional)
- Phone (optional)
- Company (optional)

### Order

Manage orders for a client.

| Operation | Description |
|-----------|-------------|
| List | Get all orders |
| Get | Get an order by ID |
| Create | Create a new order |
| Update | Update an order |
| Delete | Delete an order |

**Create Fields:**
- Customer ID (required)
- Products (optional)
- Total (optional)
- Status (optional)

### Ad Campaign

Manage advertising campaigns for a client.

| Operation | Description |
|-----------|-------------|
| List | Get all ad campaigns |
| Get | Get an ad campaign by ID |
| Create | Create a new ad campaign |
| Update | Update an ad campaign |
| Delete | Delete an ad campaign |

**Create Fields:**
- Name (required)
- Platform (google, facebook, instagram, linkedin, tiktok)
- Budget (optional)
- Start Date (optional)
- End Date (optional)
- Status (optional)

### Newsletter

Manage newsletters for a client.

| Operation | Description |
|-----------|-------------|
| List | Get all newsletters |
| Get | Get a newsletter by ID |
| Create | Create a new newsletter |
| Update | Update a newsletter |
| Delete | Delete a newsletter |

**Create Fields:**
- Subject (required)
- Content (optional)
- Scheduled Date (optional)
- Status (optional)

### Comment

Manage comments on resources.

| Operation | Description |
|-----------|-------------|
| List | Get all comments |
| Create | Create a new comment |
| Update | Update a comment |
| Delete | Delete a comment |

**Create Fields:**
- Body (required)
- Resource Type (optional)
- Resource ID (optional)

**Update Fields:**
- Body
- Is Resolved (boolean)

## Example Usage

### Create a Client

1. Add a **TukiGrowth** node to your workflow
2. Select **Client** as the resource
3. Select **Create** as the operation
4. Select the **Organization**
5. Fill in the required fields:
   - Name
6. Optionally add:
   - Code
   - Website
   - Industry

### List Content Briefs

1. Add a **TukiGrowth** node
2. Select **Content Brief** > **List**
3. Select the **Organization** and **Client**
4. The node will return all content briefs for that client

### Create a Social Media Post

1. Add a **TukiGrowth** node
2. Select **Social Media Post** > **Create**
3. Select the **Organization** and **Client**
4. Fill in:
   - Title
   - Channel (e.g., LinkedIn, Twitter)
   - Content Type (post, carousel, etc.)
   - Content

## Development

This project uses Docker for builds:

```bash
# Build
docker compose run build

# Publish
docker compose run publish
```

## License

MIT

## Support

- [TukiGrowth Documentation](https://app.tukigrowth.com/api-docs)
- [GitHub Issues](https://github.com/broobe/n8n-nodes-tukigrowth/issues)
