# ExamFlow

> Status: **Phase 02 complete** — Content Hierarchy (Subjects / Topics / Lessons)

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
| Stripe / real email | Not started |

## Phase 01 highlights

- Role-aware **OrgExamsPage**: students see available exams only; staff see builder/publish.
- Shared **OrgWorkspaceLayout** (header + branded nav).
- Nav includes **grading** + **billing** for appropriate roles.
- Footer cleaned (no dead product links).
- App home + Platform Admin links in header for `super_admin`.

## Phase 02 highlights

- **Subject → Topic → Lesson** hierarchy under each Course.
- Soft-delete (archive) cascades topics/lessons when subject/topic archived.
- Staff CRUD via Content page **Curriculum** tab (tree UI + create forms).
- APIs: `GET/POST /subjects`, `/topics`, `/lessons` under org tenant.

## Available roles (membership)

| Role | Sees |
|------|------|
| owner / admin | Full workspace + members + settings + billing |
| teacher / examiner | Content, exams, grading, students, analytics, certificates |
| student | Overview, available exams, certificates |

Platform `super_admin` → `/app/admin`.

## Important routes

| Path | Who |
|------|-----|
| `/` | Public landing |
| `/app` | Authenticated dashboard |
| `/app/organizations/:orgId` | Org overview |
| `/app/organizations/:orgId/content` | Courses, curriculum, banks, questions |
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

## Testing Phase 02

1. Login as staff → org → Content → **Curriculum** tab.
2. Select a course → create Subject → create Topic under it → create Lesson.
3. Expand tree nodes; archive subject and confirm topics/lessons hidden.
4. Switch AR/EN and check RTL labels.

## Next phase

**Phase 03** — when ordered (see product backlog).

**ExamFlow** — Smart Assessments. Real Insights.
