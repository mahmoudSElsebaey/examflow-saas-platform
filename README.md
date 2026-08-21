# ExamFlow

**Multi-Tenant SaaS Platform for Online Examinations & Assessments**

> Status: **PHASE 5 — Multi-Tenant Organizations** completed.

## Visual Identity — "Scholar Glow"

- Primary: Deep Teal · Accent: Warm Amber · Surfaces: Warm stone
- Typography: Plus Jakarta Sans + Noto Sans Arabic
- i18n: English (LTR) / Arabic (RTL)

## Organizations (Phase 5)

- Create / list organizations (tenant workspaces)
- Membership with roles: owner, admin, teacher, examiner, student
- Invite existing users by email
- Tenant isolation via membership checks
- APIs under `/api/v1/organizations`

## Stack

React 19 · Vite · Tailwind v4 · TypeScript · i18n · Express · MongoDB · JWT

## Run

```bash
cd client && npm install && npm run dev
cd server && npm install && npm run dev
# Set DATABASE_URL in server/.env
```

## Roadmap

| Phase | Status |
|-------|--------|
| 0–3.5 Architecture → Auth → i18n | ✅ |
| 4 Premium UI/UX | ✅ |
| 5 Multi-Tenant Organizations | ✅ |
| 6+ Courses / Question banks / Exams | Pending |

---

**ExamFlow** — Smart Assessments. Real Insights.
