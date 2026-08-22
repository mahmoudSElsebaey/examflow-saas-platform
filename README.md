# ExamFlow

> Status: **Phase 06 complete** — Student Progress + Analytics history

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

## Phase 06 highlights

- Fixed `GET /analytics/me` (`getStudentHistory`) — was broken.
- **LessonProgress** model: viewed / completed per user per lesson.
- Auto-mark **viewed** when opening a lesson; **Mark complete** in Learn UI.
- Student **My progress** page: exam history + lesson progress.
- Nav: `progress` for students and staff.

## Setup

```bash
cp .env.example .env
cd server && npm install && npm run dev
cd client && npm install && npm run dev
```

## Testing Phase 06

1. Open a lesson in Learn → progress viewed is recorded.
2. Click Mark complete → status completed.
3. Open **My progress** → see attempts + lessons.
4. `GET /api/v1/organizations/:orgId/analytics/me` returns history.

## Next phase

**Phase 07** — when ordered (see product backlog).

**ExamFlow** — Smart Assessments. Real Insights.
