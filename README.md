# ExamFlow

> Status: **Phases 7–9** — Billing (mock), Platform Admin, Launch hardening

## Highlights

- **Billing**: free / professional / enterprise limits; usage + mock plan change
- **Admin**: `/app/admin` for `super_admin` — metrics, suspend/activate orgs
- **Hardening**: global rate limit, health (db + uptime), docs under `docs/`

### Promote super admin

```js
db.users.updateOne({ email: "you@example.com" }, { $set: { role: "super_admin" } })
```

```bash
cd server && npm install && npm run typecheck && npm run build
cd client && npm install && npm run build
```

**ExamFlow** — Smart Assessments. Real Insights.
