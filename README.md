# ExamFlow

**Multi-Tenant SaaS Platform for Online Examinations & Assessments**

> Status: **Phase 0 + Phase 1** (Stabilization + Auth lifecycle)

## Recent phases

| Phase | Status |
|-------|--------|
| CORE PRODUCT COMPLETION | ✅ |
| **P0 Core Stabilization** | ✅ permissions module, tenant clarity, unit tests |
| **P1 Auth Lifecycle** | ✅ verify email, reset password page, email adapter, invite email |

### Phase 0
- `server/src/lib/permissions.ts` — single source for org staff/admin checks
- Unit tests: `npm test` in server
- Membership role remains source of truth inside tenants

### Phase 1
- Email adapter (`email.service`) — logs in dev
- `POST /auth/verify-email`, `POST /auth/resend-verification`
- Client: `/verify-email`, `/reset-password`
- Dashboard banner when email not verified
- Org invite sends notification email (dev log)

```bash
cd server && npm install && npm test && npm run typecheck && npm run build
cd client && npm install && npm run build
```

**ExamFlow** — Smart Assessments. Real Insights.
