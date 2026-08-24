# ExamFlow

> Status: **Phase 11 complete** — Org Activity Audit Log

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
| Team management (role / suspend / remove) | Done (Phase 10) |
| Activity audit log | Done (Phase 11) |

## Phase 11 highlights

- **ActivityLog** model (tenant-scoped, indexed by `createdAt`).
- Non-blocking `logActivity` on:
  - member invite / role change / remove / suspend / reactivate
  - organization settings update
- API: `GET /organizations/:orgId/activity?limit=` (staff only).
- UI: `/app/organizations/:orgId/activity` with actor name, action badge, timestamp.
- Nav entry **Activity** for staff roles.

## Setup

```bash
cp .env.example .env
cd server && npm install && npm run dev
cd client && npm install && npm run dev
```

## Testing Phase 11

1. As owner/admin invite or change a member role.
2. Open **Activity** in workspace nav.
3. Confirm events appear with actor + summary.
4. Students should not see Activity nav / get 403 from API.

## Next phase

**Phase 12** — when ordered (see product backlog).

**ExamFlow** — Smart Assessments. Real Insights.
