# ExamFlow

> Status: **Phase 10 complete** — Team Management (roles / suspend / remove)

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

## Phase 10 highlights

- **Update role**: `PATCH /organizations/:orgId/members/:membershipId`
- **Suspend / reactivate**: `PATCH /organizations/:orgId/members/:membershipId/status`
- **Remove member**: `DELETE /organizations/:orgId/members/:membershipId`
- Guards: cannot change/remove/suspend **owner**; cannot self-remove; owner/admin only.
- Members UI: role select, Suspend/Reactivate, Remove + confirm.
- Re-invite of suspended user reactivates membership.

## Setup

```bash
cp .env.example .env
cd server && npm install && npm run dev
cd client && npm install && npm run dev
```

## Testing Phase 10

1. As owner/admin open **Members**.
2. Change a teacher → student via the role dropdown.
3. Suspend a member → status badge updates; Reactivate works.
4. Remove a non-owner member (confirm dialog).
5. Confirm owner row has no destructive actions.

## Next phase

**Phase 11** — when ordered (see product backlog).

**ExamFlow** — Smart Assessments. Real Insights.
