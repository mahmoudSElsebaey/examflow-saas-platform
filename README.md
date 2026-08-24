# ExamFlow

> Status: **Phase 15 complete** — Phases 12–15 shipped (leave/transfer, pending invites, logo upload, demo seed)

Multi-tenant assessment SaaS (MERN).

## Current Status (product surface)

| Area | Status |
|------|--------|
| Auth + JWT + verify/reset | Done |
| Multi-tenant orgs + roles | Done |
| Design System + i18n EN/AR + RTL | Done |
| Courses / Banks / Questions / Curriculum | Done |
| Exams + take + auto/manual grading | Done |
| Certificates + public verify | Done |
| Analytics + CSV export | Done |
| Search (org-wide) | Done |
| Notifications + email (Resend) | Done |
| Stripe billing (+ mock fallback) | Done |
| Platform admin | Done |
| Exam security / integrity | Done |
| Team management (role/suspend/remove) | Done |
| Activity audit log | Done |
| Leave org + transfer ownership | Done (Phase 12) |
| Pending email invites (unregistered) | Done (Phase 13) |
| Logo file upload (data URL) + branding | Done (Phase 14) |
| Demo seed script | Done (Phase 15) |

## Phases 12–15 summary

### Phase 12 — Leave & Transfer
- `POST /organizations/:orgId/leave` (non-owner)
- `POST /organizations/:orgId/transfer-ownership` `{ newOwnerMembershipId }` (owner only)
- Settings UI: leave button; transfer list for owner

### Phase 13 — Pending invites
- Model `OrgInvite` + token (14-day expiry)
- Invite unknown email → pending invite + email link `/register?invite=TOKEN`
- `POST /organizations/accept-invite` `{ token }`
- `GET /organizations/:orgId/invites`

### Phase 14 — Logo upload
- Settings: file picker → data URL (max ~200KB)
- Server accepts `http(s)` or `data:image/…` for `logoUrl`

### Phase 15 — Seed
```bash
cd server && npm run seed
```
Accounts (password `Demo1234!`): `owner@demo.examflow`, `teacher@demo.examflow`, `student@demo.examflow` — org **Demo Academy**.

## Setup

```bash
cp .env.example .env
cd server && npm install && npm run seed && npm run dev
cd client && npm install && npm run dev
```

## Remaining backlog (optional Phase 16+)

- E2E test suite (Playwright/Cypress)
- Object storage for logos (S3) instead of data URLs
- PDF certificate download polish
- Invite revoke UI + accept on register page auto-wire
- Transfer ownership confirmation email
- Production launch checklist automation

**ExamFlow** — Smart Assessments. Real Insights.
