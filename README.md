# ExamFlow

> Status: **Phase 04 complete** — Email Provider + Event Notifications

Multi-tenant assessment SaaS (MERN). Organizations, courses, question banks, exams, grading, certificates, analytics, mock billing, platform admin.

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
| Stripe | Not started |

## Phase 04 highlights

- **Resend** email provider when `EMAIL_PROVIDER=resend` + `RESEND_API_KEY` (fallback: log).
- Templates: verify, reset, invite, exam published, results ready, certificate issued.
- In-app notifications on: exam publish, result ready, certificate issued, grading needed, org invite.
- Health endpoint reports `emailProvider` / `emailConfigured`.

## Available roles (membership)

| Role | Sees |
|------|------|
| owner / admin | Full workspace + members + settings + billing |
| teacher / examiner | Content, exams, grading, students, analytics, certificates |
| student | Overview, **Learn**, available exams, certificates |

Platform `super_admin` → `/app/admin`.

## Setup

```bash
cp .env.example .env
# set DATABASE_URL, JWT secrets
# optional: EMAIL_PROVIDER=resend and RESEND_API_KEY

cd server && npm install && npm run dev
cd client && npm install && npm run dev
```

Docker: see `DEPLOY.md`.

## Testing Phase 04

1. Publish an exam → students get in-app notification (and email if Resend configured).
2. Submit auto-graded exam → student `result_ready` notification.
3. Short-answer submit → staff `grading_needed`; after grade → student `result_ready`.
4. Pass + certificate → `certificate_issued` notification + email.
5. `GET /api/v1/health` → check `emailProvider`.

## Next phase

**Phase 05** — when ordered (see product backlog).

**ExamFlow** — Smart Assessments. Real Insights.
