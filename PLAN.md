# n8n Node for TukiGrowth

## Status
- **Phase**: Implementation
- **Last Updated**: 2026-03-06

## Final Scope

| Resource | List | Get | Create | Update |
|----------|------|-----|--------|--------|
| Conversations | ✅ | ✅ | ✅ | ✅ |
| Contacts | ✅ | ✅ | ✅ | ✅ |
| Teams | ✅ | ✅ | ✅ | ✅ |
| Projects | ✅ | ✅ | ✅ | ✅ |
| Clients | ✅ | ✅ | ✅ | ✅ |
| Sources | ✅ | ✅ | ✅ | ✅ |
| Conversation Types | ✅ | - | - | - |

**Not included (for now):**
- Bulk operations
- Delete operations

**Base URL**: `https://app.tukigrowth.com/api/v1` (fixed)

## Authentication

- API Key via header `Authorization: Bearer tuki_xxx`
- Configured in n8n credentials

## Project Structure

```
n8n-nodes-tukigrowth/
├── package.json
├── tsconfig.json
├── nodes/
│   └── TukiGrowth/
│       └── TukiGrowth.node.ts
├── credentials/
│   └── TukiGrowthApi.credentials.ts
└── README.md
```
