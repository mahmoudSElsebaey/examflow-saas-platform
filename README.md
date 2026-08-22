# ExamFlow

> Status: **Phase 05 complete** — Stripe Billing (Checkout + Webhook + Portal)

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

## Phase 05 highlights

- **Billing modes**: `auto` (Stripe if key present, else mock), `mock`, `stripe`.
- **Stripe Checkout** for professional / enterprise; plan applied via webhook.
- **Customer Portal** for subscription management.
- Org fields: `stripeCustomerId`, `stripeSubscriptionId`.
- Health: `billingMode`, `stripeConfigured`.

## Setup

```bash
cp .env.example .env
# DATABASE_URL, JWT secrets
# optional: EMAIL_*, STRIPE_*

cd server && npm install && npm run dev
cd client && npm install && npm run dev
```

Docker: see `DEPLOY.md`.

## Testing Phase 05

1. Without Stripe keys → mock plan switch still works.
2. Set `STRIPE_SECRET_KEY` + price IDs → Upgrade opens Checkout.
3. Configure webhook `POST /api/v1/billing/webhook` → plan updates after payment.
4. Portal button appears when org has a Stripe customer.

## Next phase

**Phase 06** — when ordered (see product backlog).

**ExamFlow** — Smart Assessments. Real Insights.
