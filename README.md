# ExamFlow

**Multi-Tenant SaaS Platform for Online Examinations & Assessments**

> Status: **PHASE 6 — Courses & Question Banks** completed.

## Features by phase

| Phase | Status |
|-------|--------|
| 0–3.5 Architecture → Auth → i18n | ✅ |
| 4 Premium UI/UX (Scholar Glow) | ✅ |
| 5 Multi-Tenant Organizations | ✅ |
| 6 Courses & Question Banks | ✅ |
| 7+ Exam engine | Pending |

## Content APIs (tenant-scoped)

`/api/v1/organizations/:orgId/courses`
`/api/v1/organizations/:orgId/banks`
`/api/v1/organizations/:orgId/banks/:bankId/questions`

## Run

```bash
cd client && npm install && npm run dev
cd server && npm install && npm run dev
# DATABASE_URL in server/.env
```

**ExamFlow** — Smart Assessments. Real Insights.
