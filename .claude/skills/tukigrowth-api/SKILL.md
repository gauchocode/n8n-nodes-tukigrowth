---
name: tukigrowth-api
description: >
  Complete reference for the TukiGrowth REST API v1. v2.1 keeps the updated
  endpoint inventory from v2 and adds operational guidance (params, enums,
  payload hints, and edge-case notes) to reduce integration errors.
---

# TukiGrowth REST API v1 (v2.1)

This skill is the operational guide for consuming TukiGrowth public API routes.

Authoritative contract sources:
- OpenAPI JSON: `/api/docs/spec`
- Swagger UI: `/api/docs`
- Spec implementation: `application/app/api/docs/spec/route.ts`

If there is any mismatch between this document and live behavior, treat
`/api/docs/spec` as source of truth.

## Authentication

All `/api/v1/*` endpoints require `X-API-Key`.

```bash
X-API-Key: tg_xxxxxxxxxxxxxxxxx
```

How keys work:
1. Client sends raw key in `X-API-Key`
2. API hashes key and looks up active key record
3. API executes operations as the key owner
4. Expired/revoked keys fail with `401`

API key management endpoints (session-authenticated, not API-key authenticated):
- `POST /api/keys` - create key (`{ name }`)
- `GET /api/keys` - list keys
- `DELETE /api/keys/{id}` - revoke key

## Global Response Shape

```json
{ "data": [...] , "total": 20 }
```

```json
{ "data": { "_id": "..." } }
```

```json
{ "error": "Message", "code": "BAD_REQUEST" }
```

Common error codes:
- `UNAUTHORIZED` (401)
- `FORBIDDEN` (403)
- `NOT_FOUND` (404)
- `BAD_REQUEST` (400)
- `CONFLICT` (409)
- `INTERNAL_ERROR` (500)

## Base URL Pattern

Most resources are nested under:

```text
/api/v1/organizations/{orgId}/clients/{clientId}/...
```

IDs are Convex IDs (opaque strings).

## Important API Changes (Current)

- Portfolio endpoint naming changed from `offer-units` to `portfolio-items`
- Strategy scope fields now use `scopeType: brand | portfolio_item`
- `offerUnitId` was replaced by `portfolioItemId`
- Business context now includes expanded strategic qualifiers (for example
  `industryCategory`, `audienceType`, `primaryGoal`, `salesMotion`,
  `businessStage`, maturity flags, and boolean capability flags)
- New strategy resources are available: `strategies`,
  `strategies/{id}/activate`, `strategies/{id}/archive`,
  `strategies/{id}/set-primary`, `pillars`, and `initiatives`
- New CRM and planning extras exist: lead bulk actions, lead restore,
  ephemerides bulk/by-month/upcoming, PR opportunities bulk

## Endpoint Inventory

### System and Auth

- `GET /api/health`
- `POST /api/auth/register`

### Organizations

- `GET /api/v1/organizations`
- `POST /api/v1/organizations`
- `GET /api/v1/organizations/{orgId}`
- `PATCH /api/v1/organizations/{orgId}`
- `GET /api/v1/organizations/{orgId}/activity`

Organization members:
- `GET /api/v1/organizations/{orgId}/members`
- `POST /api/v1/organizations/{orgId}/members`
- `PATCH /api/v1/organizations/{orgId}/members/{userId}`
- `DELETE /api/v1/organizations/{orgId}/members/{userId}`

### Clients

- `GET /api/v1/organizations/{orgId}/clients`
- `POST /api/v1/organizations/{orgId}/clients`
- `GET /api/v1/organizations/{orgId}/clients/{clientId}`
- `PATCH /api/v1/organizations/{orgId}/clients/{clientId}`
- `DELETE /api/v1/organizations/{orgId}/clients/{clientId}`

Client modules:
- `GET /api/v1/organizations/{orgId}/clients/{clientId}/modules`
- `PATCH /api/v1/organizations/{orgId}/clients/{clientId}/modules`

Client activity:
- `GET /api/v1/organizations/{orgId}/clients/{clientId}/activity`

Client members:
- `GET /api/v1/organizations/{orgId}/clients/{clientId}/members`
- `POST /api/v1/organizations/{orgId}/clients/{clientId}/members`
- `PATCH /api/v1/organizations/{orgId}/clients/{clientId}/members/{memberId}`
- `DELETE /api/v1/organizations/{orgId}/clients/{clientId}/members/{memberId}`

Business context:
- `GET /api/v1/organizations/{orgId}/clients/{clientId}/business-context`
- `PUT /api/v1/organizations/{orgId}/clients/{clientId}/business-context`

Portfolio items (renamed from offer units):
- `GET /api/v1/organizations/{orgId}/clients/{clientId}/portfolio-items`
- `POST /api/v1/organizations/{orgId}/clients/{clientId}/portfolio-items`
- `GET /api/v1/organizations/{orgId}/clients/{clientId}/portfolio-items/{id}`
- `PATCH /api/v1/organizations/{orgId}/clients/{clientId}/portfolio-items/{id}`
- `DELETE /api/v1/organizations/{orgId}/clients/{clientId}/portfolio-items/{id}`

Comments:
- `GET /api/v1/organizations/{orgId}/clients/{clientId}/comments`
- `POST /api/v1/organizations/{orgId}/clients/{clientId}/comments`
- `PATCH /api/v1/organizations/{orgId}/clients/{clientId}/comments/{id}`
- `DELETE /api/v1/organizations/{orgId}/clients/{clientId}/comments/{id}`
- `POST /api/v1/organizations/{orgId}/clients/{clientId}/comments/{id}/resolve`

### Strategy

Objectives:
- `GET /api/v1/organizations/{orgId}/clients/{clientId}/strategy/objectives`
- `POST /api/v1/organizations/{orgId}/clients/{clientId}/strategy/objectives`
- `GET /api/v1/organizations/{orgId}/clients/{clientId}/strategy/objectives/{id}`
- `PATCH /api/v1/organizations/{orgId}/clients/{clientId}/strategy/objectives/{id}`
- `DELETE /api/v1/organizations/{orgId}/clients/{clientId}/strategy/objectives/{id}`

Audiences:
- `GET /api/v1/organizations/{orgId}/clients/{clientId}/strategy/audiences`
- `POST /api/v1/organizations/{orgId}/clients/{clientId}/strategy/audiences`
- `GET /api/v1/organizations/{orgId}/clients/{clientId}/strategy/audiences/{id}`
- `PATCH /api/v1/organizations/{orgId}/clients/{clientId}/strategy/audiences/{id}`
- `DELETE /api/v1/organizations/{orgId}/clients/{clientId}/strategy/audiences/{id}`

Pain points:
- `GET /api/v1/organizations/{orgId}/clients/{clientId}/strategy/pain-points`
- `POST /api/v1/organizations/{orgId}/clients/{clientId}/strategy/pain-points`
- `GET /api/v1/organizations/{orgId}/clients/{clientId}/strategy/pain-points/{id}`
- `PATCH /api/v1/organizations/{orgId}/clients/{clientId}/strategy/pain-points/{id}`
- `DELETE /api/v1/organizations/{orgId}/clients/{clientId}/strategy/pain-points/{id}`

Strategies:
- `GET /api/v1/organizations/{orgId}/clients/{clientId}/strategy/strategies`
- `POST /api/v1/organizations/{orgId}/clients/{clientId}/strategy/strategies`
- `GET /api/v1/organizations/{orgId}/clients/{clientId}/strategy/strategies/{id}`
- `PATCH /api/v1/organizations/{orgId}/clients/{clientId}/strategy/strategies/{id}`
- `POST /api/v1/organizations/{orgId}/clients/{clientId}/strategy/strategies/{id}/activate`
- `POST /api/v1/organizations/{orgId}/clients/{clientId}/strategy/strategies/{id}/archive`
- `POST /api/v1/organizations/{orgId}/clients/{clientId}/strategy/strategies/{id}/set-primary`

Pillars:
- `GET /api/v1/organizations/{orgId}/clients/{clientId}/strategy/pillars`
- `POST /api/v1/organizations/{orgId}/clients/{clientId}/strategy/pillars`
- `DELETE /api/v1/organizations/{orgId}/clients/{clientId}/strategy/pillars/{pillarId}`

Initiatives:
- `GET /api/v1/organizations/{orgId}/clients/{clientId}/strategy/initiatives`
- `POST /api/v1/organizations/{orgId}/clients/{clientId}/strategy/initiatives`
- `GET /api/v1/organizations/{orgId}/clients/{clientId}/strategy/initiatives/{id}`
- `PATCH /api/v1/organizations/{orgId}/clients/{clientId}/strategy/initiatives/{id}`
- `DELETE /api/v1/organizations/{orgId}/clients/{clientId}/strategy/initiatives/{id}`

### Content

Briefs:
- `GET /api/v1/organizations/{orgId}/clients/{clientId}/content/briefs`
- `POST /api/v1/organizations/{orgId}/clients/{clientId}/content/briefs`
- `GET /api/v1/organizations/{orgId}/clients/{clientId}/content/briefs/{id}`
- `PATCH /api/v1/organizations/{orgId}/clients/{clientId}/content/briefs/{id}`
- `DELETE /api/v1/organizations/{orgId}/clients/{clientId}/content/briefs/{id}`
- `POST /api/v1/organizations/{orgId}/clients/{clientId}/content/briefs/{id}/submit`

RRSS, Website, and Reference Content:
- CRUD `.../content/rrss`
- CRUD `.../content/website`
- CRUD `.../content/reference`
- CRUD `.../content/reference/categories` (delete supports reassignment payload)

Assets:
- CRUD `.../content/assets`
- `POST .../content/assets/presign`
- `POST .../content/assets/confirm`
- `POST .../content/assets/upload`
- `POST .../content/assets/upload/bulk`

Ephemerides:
- CRUD `.../content/ephemerides`
- `GET .../content/ephemerides/by-month`
- `GET .../content/ephemerides/upcoming`
- `POST .../content/ephemerides/bulk`

### CRM

Leads:
- CRUD `.../crm/leads`
- `POST .../crm/leads/{id}/restore`
- `POST .../crm/leads/bulk`

Lead sources:
- CRUD `.../crm/lead-sources`
- Delete requires reassignment payload (`targetSourceId`)

### Ecommerce

- CRUD `.../ecommerce/categories`
- CRUD `.../ecommerce/products`
- CRUD `.../ecommerce/customers`
- CRUD `.../ecommerce/orders`

### Services

- CRUD `.../services/services`
- CRUD `.../services/packages`
- CRUD `.../services/projects`

### Ads

- CRUD `.../ads/campaigns`
- CRUD `.../ads/ads`
- CRUD `.../ads/keywords`
- `GET|POST|DELETE .../ads/ads/{id}/keywords`

### Email

- CRUD `.../email/newsletters`
- CRUD `.../email/reports`

### PR Speaking

- CRUD `.../pr-speaking/opportunities`
- `POST .../pr-speaking/opportunities/bulk`

## Query Parameters and Behavioral Notes

- List endpoints typically support `page` and `limit`.
- `PATCH` is partial update: send only fields to modify.
- URL owns scoping IDs (`organizationId`, `clientId`): do not duplicate in body.
- Server-managed fields (`createdAt`, `updatedAt`, `createdBy`, `updatedBy`) should not be sent by clients.
- Module endpoints may fail if the module is disabled for the client; check `.../clients/{clientId}/modules` first.
- Relationship links are explicit endpoints (for example ad-keyword links), not implicit nested writes.

## Notable Request Field Updates

Use these when generating examples, SDK snippets, or migration guidance.

- `CreateClientRequest`/`UpdateClientRequest` now include `entityType`,
  `businessType`, `channels`, `timezone`, and `primaryLanguage`.
- Scope-based strategy resources use `scopeType` and `portfolioItemId`:
  - `Objective`
  - `Audience`
  - `PainPoint`
  - `MarketingStrategy`
  - `StrategicInitiative`
- `Objective` also supports `intentType`.
- `BusinessContext` includes new segmentation/operating-model fields such as:
  - `industryCategory`, `audienceType`, `primaryGoal`, `salesMotion`, `businessStage`
  - `contentMaturity`, `paidMediaMaturity`
  - `hasOnlineCheckout`, `needsAppointments`, `hasSalesTeam`, `hasCatalog`
  - `channelFocus`, `aliases`
- Ecommerce `Product` payloads now expose richer merchandising fields:
  - added `variant`, `industry`, `rating`, `reviewCount`
  - keeps `seoTitle`, `seoDescription`, `focusKeyword`, `externalId`, `externalPlatform`
  - supports `rawContent` to store source markup (HTML/shortcodes) separately from plain `description`
  - legacy `imageUrl` is not part of current OpenAPI contract
- Website content supports dual representation:
  - `content` for normalized/plain content
  - `rawContent` for source content (HTML/shortcodes/native editor payload)
- `LeadsBulkRequest.action` supports: `remove`, `restore`, `update_status`, `assign`.
- `PrOpportunityBulkRequest` supports stage movement with `action: move_stage`.

## Payload and Enum Quick Reference (Operational)

Fields marked with `*` are generally required on create (validate exact schema in `/api/docs/spec`).

### Organization and Membership

- Organization create: `{ name*, slug* }`
- Organization patch status enum: `active|paused|archived`
- Member roles: `admin|editor|approver|commenter|viewer`

### Client

- Client create core: `{ name*, slug*, businessType* }`
- Common client enums:
  - `businessType`: `ecommerce|services|mixed|other`
  - `status`: `active|paused|archived`
- Client modules frequently exposed:
  - `business_context`, `strategy`, `content_briefs`, `planning_rrss`,
    `planning_website`, `planning_ephemerides`, `reference_content`,
    `content_assets`, `ecommerce`, `services`, `ads`, `email`,
    `pr_speaking`, `leads`

### Strategy

- Objectives:
  - create core: `{ title*, type* }`
  - common objective status: `planned|in_progress|completed|archived`
- Audiences:
  - create core: `{ name* }`
- Pain points:
  - create core: `{ title*, severity* }`
  - severity enum: `low|medium|high|critical`
- Strategies (marketing strategies):
  - create core: `{ name* }`
  - lifecycle status: `draft|active|archived`
  - no hard delete: use `.../archive`
  - activation (`.../activate`) validates required strategy completeness
- Pillars:
  - create core: `{ strategyId*, name* }`
  - `order` is auto-assigned
  - list usually needs strategy filtering
- Initiatives:
  - create core: `{ strategyId*, name* }`
  - status enum: `draft|active|paused|completed|archived`

### Content

- Briefs:
  - create core: `{ title* }`
  - funnel level enum commonly used: `TOFU|MOFU|BOFU`
- RRSS:
  - create core: `{ title*, channel*, contentType* }`
  - channel enum: `facebook|instagram|linkedin|x|tiktok|youtube|other`
  - status enum: `idea|draft|to_approve|approved|scheduled|published|discarded`
- Website:
  - create core: `{ title*, contentType* }`
  - content type enum: `article|landing|page|faq|other`
  - supports `content` and `rawContent`
- Reference content:
  - media type enum: `link|text|image|video|file`
  - priority enum: `low|medium|high|critical`
- Assets:
  - create core: `{ name*, url*, type* }`
  - type enum: `image|video|doc|link|other`
- Ephemerides:
  - list helpers: `by-month`, `upcoming`
  - bulk mutation endpoint available

### CRM

- Leads:
  - create core: `{ email* }`
  - status is often workflow-driven (`statusKey`), default commonly `new`
  - restore endpoint exists for soft-deleted leads
  - bulk actions: `remove|restore|update_status|assign`
- Lead sources:
  - create core: `{ name*, color* }`
  - delete requires `{ targetSourceId }`

### Ecommerce

- Categories:
  - create core: `{ name*, slug* }`
- Products:
  - create core: `{ name*, price* }`
  - status enum (common): `draft|active|inactive|archived`
  - use current OpenAPI fields (`variant`, `rating`, `reviewCount`, `rawContent`, etc.)
  - do not rely on legacy `imageUrl`
- Orders:
  - create core: `{ orderDate*, status*, totalAmount* }`
  - status enum: `pending|processing|completed|cancelled|refunded`

### Services

- Service create core: `{ name*, priceFrom*, billingType* }`
- Billing type enum: `one_off|retainer|hourly`
- Project status enum: `active|paused|completed|cancelled`

### Ads

- Campaign platform enum: `meta|google|linkedin|tiktok|other`
- Campaign status enum: `planned|active|paused|finished`
- Ad status enum: `draft|to_approve|active|paused|rejected`
- Keyword type enum: `non_branded|negative|brand`

### Email

- Newsletter status enum: `draft|scheduled|sent|cancelled`
- Reports are metrics payloads linked to newsletter/provider identifiers

### PR & Speaking

- Opportunity create core: `{ title*, type*, priority* }`
- Type enum: `podcast|event|media|webinar|live|other`
- Priority enum: `low|medium|high|critical`
- Stage enum:
  `idea|researching|pitched|in_conversation|confirmed|published_or_delivered|repurposed|closed`
- Bulk endpoint supports stage moves (`action: move_stage`)

## Example `curl`

```bash
curl -X POST "https://YOUR_HOST/api/v1/organizations/{orgId}/clients/{clientId}/strategy/strategies" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: tg_xxxxxxxxxxxxxxxxx" \
  -d '{
    "name": "Q3 Growth Plan",
    "scopeType": "portfolio_item",
    "portfolioItemId": "j57...",
    "strategyType": "demand_generation",
    "summary": "Capture more qualified leads",
    "isPrimary": true
  }'
```

## How to Answer Users with This Skill

When asked for API help:
1. Confirm auth requirements (`X-API-Key`).
2. Provide exact endpoint(s) and method(s).
3. Include required fields and enum values.
4. Return a practical request example (`curl`, JS `fetch`, or Axios).
5. Include likely error cases and quick fixes.
6. If there is ambiguity, inspect `/api/docs/spec` before replying.

## v2.1 Validation Checklist

Use this checklist whenever API routes or DTOs change.

1. Validate each listed endpoint against `/api/docs/spec`.
2. Re-check renamed resources (`portfolio-items`, scope fields).
3. Re-check bulk endpoints and special actions (`restore`, `move_stage`, etc.).
4. Re-check required fields and enums for create/update operations.
5. Keep this document in English and keep endpoint names exact.

## Maintenance Notes for Future Updates

- Whenever API routes or DTO fields change, update this skill in the same PR.
- Validate endpoint inventory against:
  - `application/app/api/v1/**/route.ts`
  - `application/app/api/docs/spec/route.ts`
- Keep naming aligned with live API (for example `portfolio-items`, not `offer-units`).
- Keep this document in English.
