# ExamFlow

**Multi-Tenant SaaS Platform for Online Examinations & Assessments**

> Status: **PHASE 7 — Exam Builder & Exam Engine** completed.

## Roadmap

| Phase | Status |
|-------|--------|
| 0–3.5 Architecture → Auth → i18n | ✅ |
| 4 Premium UI/UX | ✅ |
| 5 Organizations | ✅ |
| 6 Courses & Question Banks | ✅ |
| 7 Exam Builder & Engine | ✅ |
| 8+ Analytics / Certificates | Pending |

## Exam APIs

`/api/v1/organizations/:orgId/exams`
`/api/v1/organizations/:orgId/exams/:examId/publish`
`/api/v1/organizations/:orgId/exams/:examId/attempts`
`/api/v1/organizations/:orgId/attempts/:attemptId`
`/api/v1/organizations/:orgId/attempts/:attemptId/submit`

Features: draft/publish, question snapshot, shuffle, timer, auto-grade objective items, max attempts.

## Run

```bash
cd client && npm install && npm run dev
cd server && npm install && npm run dev
# DATABASE_URL in server/.env
```

**ExamFlow** — Smart Assessments. Real Insights.
