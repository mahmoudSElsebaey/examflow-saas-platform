# ExamFlow

> Status: **Phase 08 complete** — Reports & CSV Export

Multi-tenant assessment SaaS (MERN). Organizations, courses, question banks, exams, grading, certificates, analytics, billing, platform admin.

## Current Status

| Area | Status |
|------|--------|
| Auth + JWT + verify/reset | Done |
| Multi-tenant orgs + roles | Done |
| Design System (Scholar Glow) | Done |
| i18n EN/AR + RTL | Done |
| Dashboard + role-aware home | Done (Phase 01) |
| Org workspace nav (staff vs student) | Done (Phase 01) |
| Courses / Banks / Questions | Done |
| Exam builder + student available exams | Done (Phase 01 role split) |
| Auto + manual grading | Done |
| Certificates + public verify | Done |
| Analytics | Done |
| Notifications (header) | Done |
| Mock billing + plan limits | Done |
| Platform admin | Done |
| Subjects / Topics / Lessons | Done (Phase 02) |
| Student Learn (curriculum viewer) | Done (Phase 03) |
| Email provider (Resend) + event notifications | Done (Phase 04) |
| Stripe billing (Checkout / Portal / Webhook) | Done (Phase 05) |
| Student progress + history analytics | Done (Phase 06) |
| Exam security + attempt integrity | Done (Phase 07) |
| Reports & CSV export | Done (Phase 08) |

## Phase 08 highlights

- **CSV export** (staff): org-wide attempts and per-exam attempts.
- Columns include student name, scores, pass/fail, integrity counters (focus/tab/paste).
- Endpoints:
  - `GET /organizations/:orgId/analytics/export/attempts.csv`
  - `GET /organizations/:orgId/exams/:examId/analytics/export.csv`
- Analytics UI: **Export CSV** button + student names on recent attempts.
- Exam analytics enriched with `studentName` and security counts.

## Setup

```bash
cp .env.example .env
cd server && npm install && npm run dev
cd client && npm install && npm run dev
```

## Testing Phase 08

1. As owner/admin/teacher open Analytics.
2. Click **Export CSV** → file downloads with BOM for Excel.
3. Optional: `GET .../exams/:examId/analytics/export.csv` for one exam.
4. Confirm student names and integrity columns appear.

## Next phase

**Phase 09** — when ordered (see product backlog).

**ExamFlow** — Smart Assessments. Real Insights.
