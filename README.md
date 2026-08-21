# ExamFlow

**Multi-Tenant SaaS Platform for Online Examinations & Assessments**

> Status: **PHASE 11 — White-label Branding** completed.

## Roadmap

| Phase | Status |
|-------|--------|
| 0–9 Core product → Polish | ✅ |
| 10 Production Deployment | ✅ |
| 11 White-label Branding | ✅ |

## White-label (per organization)

- Primary color (`#RRGGBB`) applied via CSS variables in the org workspace
- Logo URL shown in header and org hub
- Owner/Admin: PATCH `/api/v1/organizations/:orgId` with `primaryColor` / `logoUrl`

## Docker

```bash
cp .env.example .env && docker compose up -d --build
```

See [DEPLOY.md](./DEPLOY.md).

**ExamFlow** — Smart Assessments. Real Insights.
