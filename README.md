# ExamFlow

> Status: **Phase 03 complete** — Student Learning Experience

Multi-tenant assessment SaaS (MERN). Organizations, courses, question banks, exams, grading, certificates, analytics, mock billing, platform admin.

## Current Status

| Area | Status |
|------|--------|
| Auth + JWT + verify/reset | Done (email adapter logs only) |
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
| Stripe / real email | Not started |

## Phase 03 highlights

- Student **Learn** portal: Course → Subject → Topic → Lesson tree.
- Lesson reader with content + duration.
- `GET /lessons/:lessonId` for members.
- Staff can attach lesson content/duration when creating lessons.
- Nav: `learn` visible to students and staff.

## Available roles (membership)

| Role | Sees |
|------|------|
| owner / admin | Full workspace + members + settings + billing |
| teacher / examiner | Content, exams, grading, students, analytics, certificates |
| student | Overview, **Learn**, available exams, certificates |

Platform `super_admin` → `/app/admin`.

## Important routes

| Path | Who |
|------|-----|
| `/` | Public landing |
| `/app` | Authenticated dashboard |
| `/app/organizations/:orgId` | Org overview |
| `/app/organizations/:orgId/content` | Courses, curriculum, banks, questions |
| `/app/organizations/:orgId/learn` | Student/staff curriculum viewer |
| `/app/organizations/:orgId/exams` | Staff manage / Student take |
| `/app/organizations/:orgId/grading` | Staff |
| `/app/admin` | super_admin |

## Setup

```bash
cp .env.example .env
# set DATABASE_URL, JWT secrets

cd server && npm install && npm run dev
cd client && npm install && npm run dev
```

Docker: see `DEPLOY.md`.

## Testing Phase 03

1. As staff: Content → Curriculum → create subject/topic/lesson with content.
2. As student: open org → **Learn** → expand tree → open a lesson.
3. Verify AR/EN labels on Learn page.

## Next phase

**Phase 04** — when ordered (see product backlog).

**ExamFlow** — Smart Assessments. Real Insights.
