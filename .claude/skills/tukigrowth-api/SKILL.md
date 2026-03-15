---
name: tukigrowth-api
description: >
  Complete reference for the TukiGrowth REST API v1. Use this skill when the user asks how to consume the API, what endpoints exist, how to authenticate, what fields an endpoint accepts, how to create/list/update/delete entities, or how to integrate TukiGrowth with external systems. Also triggers when the user asks for curl examples, code to consume the API, or help understanding API errors.
---

# TukiGrowth REST API v1

TukiGrowth exposes ~115 REST endpoints that act as thin proxies over Convex functions. Each route only validates auth → calls Convex → formats response. Business logic lives in Convex.

---

## Authentication

All `/api/v1/*` endpoints require the `X-API-Key` header.

```bash
X-API-Key: tg_abc123...
```

**How to get an API key:**
1. Log in to the app
2. Go to Settings → API Keys
3. Create a new key (the full value is shown only once)

**Internal flow:**
1. SHA-256 hash of the header value
2. Lookup in Convex `apiKeys` table (by_key_hash index)
3. Generate RS256 JWT for that user
4. Execute the Convex operation authenticated as that user

Keys can have an optional `expiresAt`. Expired or deactivated keys return 401.

**Key management endpoints** (require web session, not API key):
- `GET /api/keys` — list your keys (keyHash never returned)
- `POST /api/keys` — create key (`{ name, expiresAt? }`) → returns full value once
- `DELETE /api/keys/{id}` — revoke key

---

## Response Format

```json
// List
{ "data": [...], "total": 42 }

// Single entity (GET, POST, PATCH)
{ "data": { ...fields } }

// Successful DELETE
{ "data": { "id": "..." } }

// Error
{ "error": "Human-readable message", "code": "NOT_FOUND" }
```

**Error codes:**
| Code | HTTP | Cause |
|------|------|-------|
| `UNAUTHORIZED` | 401 | Missing, invalid, or expired API key |
| `FORBIDDEN` | 403 | Insufficient permission on that resource |
| `NOT_FOUND` | 404 | Resource not found |
| `BAD_REQUEST` | 400 | Invalid body or params |
| `CONFLICT` | 409 | Duplicate (e.g. slug already exists) |
| `INTERNAL_ERROR` | 500 | Internal server error |

---

## Pagination

All list endpoints accept query params:
- `?page=1` (default: 1)
- `?limit=20` (default varies by endpoint)

---

## Base URL Pattern

```
/api/v1/organizations/{orgId}/clients/{clientId}/{module}/{resource}
```

All IDs are Convex IDs (opaque strings like `"jd7abc123..."`).

---

## Endpoints by Module

### Organizations

```
GET    /api/v1/organizations                     → list user's organizations
POST   /api/v1/organizations                     → create organization
GET    /api/v1/organizations/{orgId}             → get organization
PATCH  /api/v1/organizations/{orgId}             → update (name, status)
```

**POST body:**
```json
{ "name": "My Agency", "slug": "my-agency" }
```

#### Organization Members

```
GET    /api/v1/organizations/{orgId}/members              → list members
POST   /api/v1/organizations/{orgId}/members              → invite member
PATCH  /api/v1/organizations/{orgId}/members/{userId}     → change role
DELETE /api/v1/organizations/{orgId}/members/{userId}     → remove member
```

**POST body:** `{ "email": "user@example.com", "role": "editor" }`
**Available roles:** `admin`, `editor`, `approver`, `commenter`, `viewer`

---

### Clients

```
GET    /api/v1/organizations/{orgId}/clients              → list (?status=active|paused|archived)
POST   /api/v1/organizations/{orgId}/clients              → create client
GET    /api/v1/organizations/{orgId}/clients/{clientId}   → get client
PATCH  /api/v1/organizations/{orgId}/clients/{clientId}   → update
DELETE /api/v1/organizations/{orgId}/clients/{clientId}   → delete
```

#### Client Modules

```
GET    .../clients/{clientId}/modules             → list enabled/disabled modules
PATCH  .../clients/{clientId}/modules             → toggle module ({ module, enabled })
```

**Available modules:** `strategy`, `content_briefs`, `planning_rrss`, `planning_website`, `content_assets`, `ecommerce`, `services`, `ads`, `email`

#### Client Members

```
GET    .../clients/{clientId}/members
POST   .../clients/{clientId}/members             → { email, roleOverride }
PATCH  .../clients/{clientId}/members/{memberId}  → { role }
DELETE .../clients/{clientId}/members/{memberId}
```

#### Activity & Comments

```
GET    .../clients/{clientId}/activity            → activity logs (?limit=20)
GET    .../clients/{clientId}/comments            → comments (?tableName=&recordId= to filter by record)
POST   .../clients/{clientId}/comments            → create comment
PATCH  .../clients/{clientId}/comments/{id}       → edit (body, isResolved)
DELETE .../clients/{clientId}/comments/{id}       → delete
POST   .../clients/{clientId}/comments/{id}/resolve → resolve ({ isResolved: true|false })
```

**Organization-level activity:**
```
GET    /api/v1/organizations/{orgId}/activity     → org activity logs (?limit=20)
```

---

### Business Context Module

Single document per client (no list, no resource ID).

```
GET  .../clients/{clientId}/business-context   → get business context
PUT  .../clients/{clientId}/business-context   → create or update (upsert)
```

> If the client has no saved context yet, `GET` returns `{}`.

**PUT body** — all fields are optional:
```json
{
  "companyDescription": "",
  "missionStatement": "",
  "visionStatement": "",
  "valuePropositon": "",
  "competitiveAdvantages": ["advantage 1", "advantage 2"],
  "targetMarketSummary": "",
  "toneOfVoice": "",
  "communicationStyle": "formal|semiformal|informal|technical|friendly",
  "brandKeywords": ["innovation", "quality"],
  "industry": "",
  "mainProducts": "",
  "differentiators": "",
  "definitions": [{ "term": "MQL", "definition": "Marketing Qualified Lead" }]
}
```

---

### Strategy Module

#### Objectives

```
GET    .../strategy/objectives
POST   .../strategy/objectives
GET    .../strategy/objectives/{id}
PATCH  .../strategy/objectives/{id}
DELETE .../strategy/objectives/{id}
```

#### Target Audiences

```
GET    .../strategy/audiences
POST   .../strategy/audiences
GET    .../strategy/audiences/{id}
PATCH  .../strategy/audiences/{id}
DELETE .../strategy/audiences/{id}
```

**Audience pain points (many-to-many):**
```
GET    .../strategy/audiences/{id}/pain-points              → list links with pain point details
POST   .../strategy/audiences/{id}/pain-points              → { painPointId, relevanceScore (1-10) }
PATCH  .../strategy/audiences/{id}/pain-points              → { linkId, relevanceScore }
DELETE .../strategy/audiences/{id}/pain-points?linkId={id}  → remove link
```

#### Pain Points (library)

```
GET    .../strategy/pain-points
POST   .../strategy/pain-points
GET    .../strategy/pain-points/{id}
PATCH  .../strategy/pain-points/{id}
DELETE .../strategy/pain-points/{id}
```

---

### Content Module

#### Briefs

```
GET    .../content/briefs
POST   .../content/briefs
GET    .../content/briefs/{id}
PATCH  .../content/briefs/{id}
DELETE .../content/briefs/{id}
POST   .../content/briefs/{id}/submit   → submit for review
```

#### Social Media (RRSS)

```
GET    .../content/rrss
POST   .../content/rrss
GET    .../content/rrss/{id}
PATCH  .../content/rrss/{id}
DELETE .../content/rrss/{id}
```

#### Website Content

```
GET    .../content/website
POST   .../content/website
GET    .../content/website/{id}
PATCH  .../content/website/{id}
DELETE .../content/website/{id}
```

#### Assets (Media)

```
GET    .../content/assets
POST   .../content/assets
GET    .../content/assets/{id}
PATCH  .../content/assets/{id}
DELETE .../content/assets/{id}
```

---

### E-commerce Module

#### Categories

```
GET    .../ecommerce/categories            → (?parentId= for subcategories)
POST   .../ecommerce/categories
GET    .../ecommerce/categories/{id}
PATCH  .../ecommerce/categories/{id}
DELETE .../ecommerce/categories/{id}
```

#### Products

```
GET    .../ecommerce/products
POST   .../ecommerce/products
GET    .../ecommerce/products/{id}
PATCH  .../ecommerce/products/{id}
DELETE .../ecommerce/products/{id}
```

#### Customers

```
GET    .../ecommerce/customers
POST   .../ecommerce/customers
GET    .../ecommerce/customers/{id}
PATCH  .../ecommerce/customers/{id}
DELETE .../ecommerce/customers/{id}
```

#### Orders

```
GET    .../ecommerce/orders               → (?status= ?customerId= to filter)
POST   .../ecommerce/orders
GET    .../ecommerce/orders/{id}
PATCH  .../ecommerce/orders/{id}
DELETE .../ecommerce/orders/{id}
```

---

### Services Module

#### Services

```
GET    .../services/services
POST   .../services/services
GET    .../services/services/{id}
PATCH  .../services/services/{id}
DELETE .../services/services/{id}
```

#### Packages

```
GET    .../services/packages
POST   .../services/packages
GET    .../services/packages/{id}
PATCH  .../services/packages/{id}
DELETE .../services/packages/{id}
```

#### Projects

```
GET    .../services/projects
POST   .../services/projects
GET    .../services/projects/{id}
PATCH  .../services/projects/{id}
DELETE .../services/projects/{id}
```

---

### Ads Module

#### Campaigns

```
GET    .../ads/campaigns
POST   .../ads/campaigns
GET    .../ads/campaigns/{id}
PATCH  .../ads/campaigns/{id}
DELETE .../ads/campaigns/{id}
```

#### Ads

```
GET    .../ads/ads
POST   .../ads/ads
GET    .../ads/ads/{id}
PATCH  .../ads/ads/{id}
DELETE .../ads/ads/{id}
```

**Ad keywords (many-to-many):**
```
GET    .../ads/ads/{id}/keywords              → list linked keywords
POST   .../ads/ads/{id}/keywords              → { keywordId } to link
DELETE .../ads/ads/{id}/keywords?linkId={id}  → unlink keyword
```

#### Keywords (library)

```
GET    .../ads/keywords
POST   .../ads/keywords
GET    .../ads/keywords/{id}
PATCH  .../ads/keywords/{id}
DELETE .../ads/keywords/{id}
```

---

### Email Module

#### Newsletters

```
GET    .../email/newsletters
POST   .../email/newsletters
GET    .../email/newsletters/{id}
PATCH  .../email/newsletters/{id}
DELETE .../email/newsletters/{id}
```

#### Reports

```
GET    .../email/reports
POST   .../email/reports
GET    .../email/reports/{id}
PATCH  .../email/reports/{id}
DELETE .../email/reports/{id}
```

---

## Usage Examples

### List organizations

```bash
curl https://tuapp.com/api/v1/organizations \
  -H "X-API-Key: tg_abc123..."
```

### Create a client

```bash
curl -X POST https://tuapp.com/api/v1/organizations/ORG_ID/clients \
  -H "X-API-Key: tg_abc123..." \
  -H "Content-Type: application/json" \
  -d '{ "name": "Example Brand", "slug": "example-brand" }'
```

### List products with pagination

```bash
curl "https://tuapp.com/api/v1/organizations/ORG_ID/clients/CLIENT_ID/ecommerce/products?page=1&limit=50" \
  -H "X-API-Key: tg_abc123..."
```

### Link a pain point to an audience

```bash
# 1. Create the pain point in the library
curl -X POST .../strategy/pain-points \
  -H "X-API-Key: ..." \
  -H "Content-Type: application/json" \
  -d '{ "description": "No online visibility" }'

# 2. Link it to the audience with a relevance score
curl -X POST .../strategy/audiences/AUDIENCE_ID/pain-points \
  -H "X-API-Key: ..." \
  -H "Content-Type: application/json" \
  -d '{ "painPointId": "PAIN_POINT_ID", "relevanceScore": 8 }'
```

### Filter orders by status

```bash
curl ".../ecommerce/orders?status=pending" \
  -H "X-API-Key: ..."
```

---

## Key Notes

- **IDs are opaque**: Convex IDs are internal strings — store them to reference resources
- **PATCH is partial**: only send the fields you want to update
- **Many-to-many relationships**: `audiences ↔ pain-points` and `ads ↔ keywords` are managed with separate link endpoints
- **Modules must be enabled**: before using a module's endpoints, verify it's active via `.../modules`
- **Rate limiting**: the registration endpoint has a 5 req/IP/10min limit; v1 endpoints currently have no rate limit
- **OpenAPI spec**: available at `/api/docs/spec` (JSON) and browsable docs at `/api/docs`
- **Auto-managed fields**: `createdAt`, `updatedAt`, `createdBy`, `updatedBy` — never send these
- **clientId / organizationId**: always come from the URL, never include in body
- **Default statuses on create**: objectives → `planned`, briefs → `idea`, social/website → `idea`, clients → `active`

---

## Request Body Fields Reference

Fields marked `*` are required. All others are optional.

### Organization

**POST** `{ name*, slug* }`

**PATCH** `{ name, status: "active"|"paused"|"archived" }`

---

### Client

**POST**
```json
{
  "name": "*",
  "slug": "*",
  "businessType": "* ecommerce|services|mixed|other",
  "websiteUrl": "",
  "timezone": "UTC",
  "primaryLanguage": "es",
  "channels": []
}
```

**PATCH** — any of the above fields plus `status: "active"|"paused"|"archived"`

---

### Organization Members

**POST** `{ "email"*: "user@example.com", "role"*: "admin|editor|approver|commenter|viewer" }`

**PATCH** `{ "role"*: "admin|editor|approver|commenter|viewer" }`

---

### Client Members

**POST** `{ "email"*: "user@example.com", "roleOverride": "admin|editor|approver|commenter|viewer" }`

**PATCH** `{ "role"*: "admin|editor|approver|commenter|viewer" }`

---

### Strategy — Objective

**POST**
```json
{
  "title": "*",
  "type": "* primary|secondary",
  "description": "",
  "startDate": 1700000000000,
  "endDate": 1700000000000,
  "kpiName": "",
  "targetValue": 0
}
```

**PATCH** — any of the above plus:
```json
{
  "status": "planned|in_progress|completed|archived",
  "currentValue": 0
}
```

---

### Strategy — Target Audience

**POST**
```json
{
  "name": "*",
  "description": "",
  "buyerPersonaName": "",
  "demographics": {},
  "psychographics": {},
  "behavioral": {}
}
```

**PATCH** — any of the above fields

---

### Strategy — Pain Point

**POST**
```json
{
  "title": "*",
  "severity": "* low|medium|high|critical",
  "group": "",
  "industry": "",
  "description": ""
}
```

**PATCH** — any of the above fields

---

### Content — Brief

**POST**
```json
{
  "title": "*",
  "funnelLevel": "* TOFU|MOFU|BOFU",
  "objectiveId": "",
  "description": "",
  "period": "",
  "formats": [],
  "comments": ""
}
```

**PATCH** — any of the above plus `status: "idea|in_progress|review|approved|rejected|archived"`

---

### Content — Social Media (RRSS)

**POST**
```json
{
  "title": "*",
  "channel": "* facebook|instagram|linkedin|x|tiktok|youtube|other",
  "contentType": "* post|reel|story|video|carousel|poll|other",
  "category": "",
  "copy": "",
  "mediaUrl": "",
  "deadline": 1700000000000,
  "publishAt": 1700000000000,
  "campaign": "",
  "region": [],
  "isPaid": false,
  "sourceLink": ""
}
```

**PATCH** — any of the above plus `status: "idea|draft|to_approve|approved|scheduled|published|discarded"`

---

### Content — Website

**POST**
```json
{
  "title": "*",
  "contentType": "* article|landing|page|faq|other",
  "urlSlug": "",
  "content": "",
  "category": "",
  "priority": "low|medium|high|critical",
  "deadline": 1700000000000,
  "publishAt": 1700000000000,
  "seoFocusKeyword": "",
  "seoMetaTitle": "",
  "seoMetaDescription": "",
  "seoKeywordsSecondary": []
}
```

**PATCH** — any of the above plus `status: "idea|draft|to_approve|approved|published|discarded"`

---

### Content — Asset

**POST**
```json
{
  "name": "*",
  "url": "*",
  "type": "* image|video|doc|link|other",
  "description": "",
  "fileSize": 0,
  "mimeType": "",
  "folder": "",
  "tags": []
}
```

**PATCH** `{ name, description, folder, tags }`

---

### E-commerce — Category

**POST**
```json
{
  "name": "*",
  "slug": "*",
  "description": "",
  "parentId": "",
  "externalId": ""
}
```

**PATCH** — any of the above fields

---

### E-commerce — Product

**POST**
```json
{
  "name": "*",
  "price": "*",
  "status": "* draft|active|inactive|archived",
  "categoryId": "",
  "sku": "",
  "description": "",
  "currency": "USD",
  "imageUrl": "",
  "seoTitle": "",
  "seoDescription": "",
  "focusKeyword": "",
  "externalId": ""
}
```

**PATCH** — any of the above fields

---

### E-commerce — Customer

**POST**
```json
{
  "email": "*",
  "firstName": "",
  "lastName": "",
  "phone": "",
  "city": "",
  "country": "",
  "externalId": ""
}
```

**PATCH** — any of the above fields

---

### E-commerce — Order

**POST**
```json
{
  "orderDate": "*",
  "status": "* pending|processing|completed|cancelled|refunded",
  "totalAmount": "*",
  "items": [
    { "productId": "", "quantity": 1, "unitPrice": 0 }
  ],
  "customerId": "",
  "currency": "USD",
  "externalOrderId": ""
}
```

**PATCH** `{ status, totalAmount, currency, orderDate, externalOrderId }`

---

### Services — Service

**POST**
```json
{
  "name": "*",
  "priceFrom": "*",
  "billingType": "* one_off|retainer|hourly",
  "description": "",
  "category": ""
}
```

**PATCH** — any of the above fields

---

### Services — Package

**POST**
```json
{
  "name": "*",
  "monthlyFee": "*",
  "servicesIncluded": ["*"],
  "description": "",
  "currency": "USD"
}
```

**PATCH** — any of the above fields

---

### Services — Project

**POST**
```json
{
  "name": "*",
  "status": "* active|paused|completed|cancelled",
  "servicePackageId": "",
  "notes": "",
  "startDate": 1700000000000,
  "endDate": 1700000000000
}
```

**PATCH** — any of the above fields

---

### Ads — Campaign

**POST**
```json
{
  "name": "*",
  "platform": "* meta|google|linkedin|tiktok|other",
  "monthlyBudget": "*",
  "status": "* planned|active|paused|finished",
  "objective": "",
  "currency": "USD",
  "startDate": 1700000000000,
  "endDate": 1700000000000
}
```

**PATCH** — any of the above fields

---

### Ads — Ad

**POST**
```json
{
  "headline": "*",
  "status": "* draft|to_approve|active|paused|rejected",
  "campaignId": "",
  "adGroup": "",
  "description": "",
  "url": ""
}
```

**PATCH** — any of the above fields

---

### Ads — Keyword

**POST**
```json
{
  "keyword": "*",
  "type": "* non_branded|negative|brand",
  "searchVolume": 0,
  "cpc": 0,
  "paidDifficulty": 0
}
```

**PATCH** — any of the above fields

---

### Email — Newsletter

**POST**
```json
{
  "subject": "*",
  "status": "* draft|scheduled|sent|cancelled",
  "designUrl": "",
  "scheduledFor": 1700000000000,
  "providerCampaignId": ""
}
```

**PATCH** — any of the above fields

---

### Email — Report

**POST**
```json
{
  "sent": "*",
  "delivered": "*",
  "opens": "*",
  "uniqueOpens": "*",
  "clicks": "*",
  "uniqueClicks": "*",
  "bouncesSoft": "*",
  "bouncesHard": "*",
  "unsubscribes": "*",
  "newsletterId": "",
  "providerCampaignId": "",
  "sentAt": 1700000000000
}
```

**PATCH** — any of the above fields

---

### Comments

**POST** `{ "body"*: "Comment text", "tableName": "contentBriefs", "recordId": "ID" }`

**PATCH** `{ "body": "Updated text", "isResolved": false }`
