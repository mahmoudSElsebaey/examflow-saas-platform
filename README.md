# ExamFlow

**Multi-Tenant SaaS Platform for Online Examinations & Assessments**

> Status: **PHASE 8 — Analytics & Certificates** completed.

## Roadmap

| Phase | Status |
|-------|--------|
| 0–3.5 Architecture → Auth → i18n | ✅ |
| 4 Premium UI/UX | ✅ |
| 5 Organizations | ✅ |
| 6 Courses & Question Banks | ✅ |
| 7 Exam Builder & Engine | ✅ |
| 8 Analytics & Certificates | ✅ |

## New APIs

- `GET /api/v1/organizations/:orgId/analytics`
- `GET /api/v1/organizations/:orgId/exams/:examId/analytics`
- `GET/POST certificates` under org; `POST .../attempts/:id/certificate`
- `GET /api/v1/public/certificates/verify/:code`

## Run

```bash
cd client && npm install && npm run dev
cd server && npm install && npm run dev
```

**ExamFlow** — Smart Assessments. Real Insights.
