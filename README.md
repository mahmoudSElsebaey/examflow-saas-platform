# ExamFlow

> Status: **Phase 01 complete** — Product UX + Navigation + Role Experiences

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
| Subjects / Topics / Lessons | Not started |
| Stripe / real email | Not started |

## Phase 01 highlights

- Role-aware **OrgExamsPage**: students see available exams only; staff see builder/publish.
- Shared **OrgWorkspaceLayout** (header + branded nav).
- Nav includes **grading** + **billing** for appropriate roles.
- Footer cleaned (no dead product links).
- App home + Platform Admin links in header for `super_admin`.

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

## Testing Phase 01

1. Register / login as owner → create org → open workspace → see full nav.
2. Invite a user as **student** → login as student → open org → **Exams** shows available only (no Create).
3. As teacher publish an exam → student sees it under Available exams → Start.
4. Switch language AR/EN and check RTL nav.
5. As `super_admin` user see Platform admin in header.

## Next phase

**Phase 02** — Content Hierarchy (Subjects / Topics / Lessons) when ordered.

**ExamFlow** — Smart Assessments. Real Insights.
