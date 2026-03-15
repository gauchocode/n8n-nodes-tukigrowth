# n8n Node for TukiGrowth

## Status
- **Phase**: Complete
- **Last Updated**: 2026-03-15

## Final Scope

| Resource | List | Get | Create | Update | Delete |
|----------|:----:|:---:|:------:|:------:|:------:|
| Organization | ✅ | ✅ | ✅ | ✅ | ❌ |
| Client | ✅ | ✅ | ✅ | ✅ | ✅ |
| Business Context | ❌ | ✅ | ❌ | ✅ | ❌ |
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

**Base URL**: `https://app.tukigrowth.com/api/v1`

## Authentication

- API Key via header `Authorization: Bearer tuki_xxx`
- Configured in n8n credentials

## Project Structure

```
n8n-nodes-tukigrowth/
├── package.json
├── tsconfig.json
├── Dockerfile
├── docker-compose.yml
├── nodes/
│   └── TukiGrowth/
│       ├── TukiGrowth.node.ts
│       └── tukigrowth.svg
├── credentials/
│   └── TukiGrowthApi.credentials.ts
└── README.md
```

## Hierarchy

```
Organization
└── Client
    ├── Business Context
    ├── Objective
    ├── Audience
    ├── Pain Point
    ├── Content Brief
    ├── Social Media Post
    ├── Website Content
    ├── Asset
    ├── Product
    ├── Customer
    │   └── Order
    ├── Ad Campaign
    ├── Newsletter
    └── Comment
```
