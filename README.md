# ExamFlow

> Status: **Phase 07 complete** — Exam Security + Attempt Integrity

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

## Phase 07 highlights

- Exam policies: `trackTabSwitch`, `trackPaste`, `warnOnLeave`, `showResultsImmediately`, `resultsDelayMinutes`.
- Attempt integrity counters: `focusLossCount`, `tabSwitchCount`, `pasteCount` + event log.
- API: `POST /attempts/:attemptId/security-events`.
- Client `useExamSecurity` monitors visibility / blur / paste / leave during in-progress attempts.
- Results delay: students see locked results until delay elapses; staff always see full review.

## Setup

```bash
cp .env.example .env
cd server && npm install && npm run dev
cd client && npm install && npm run dev
```

## Testing Phase 07

1. Start an exam attempt as a student.
2. Switch tabs / blur window → events recorded (check attempt.security).
3. Paste into short answer → pasteCount increases.
4. Create exam with `showResultsImmediately: false` and `resultsDelayMinutes: 60` → student results locked after submit.
5. Staff grading view still sees full scores.

## Next phase

**Phase 08** — when ordered (see product backlog).

**ExamFlow** — Smart Assessments. Real Insights.
