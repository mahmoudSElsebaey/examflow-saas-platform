# ExamFlow

> Status: **Phase 09 complete** — Org-wide Search

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
| Org-wide search | Done (Phase 09) |

## Phase 09 highlights

- Unified search across **exams, questions, courses, banks, members** within a tenant.
- API: `GET /organizations/:orgId/search?q=&types=exam,question,...`
- UI: `/app/organizations/:orgId/search` with type filters + nav entry for staff and students.
- Results link to the relevant workspace module.

## Setup

```bash
cp .env.example .env
cd server && npm install && npm run dev
cd client && npm install && npm run dev
```

## Testing Phase 09

1. Open **Search** in org nav.
2. Query an exam title / question stem / member email.
3. Filter by type chips.
4. Click a hit → navigates to the right module.

## Next phase

**Phase 10** — when ordered (see product backlog).

**ExamFlow** — Smart Assessments. Real Insights.
