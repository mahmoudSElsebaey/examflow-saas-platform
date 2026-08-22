# ExamFlow

**Multi-Tenant SaaS Platform for Online Examinations & Assessments**

> Status: **Phase 2 — Manual Grading** complete

## Phases

| Phase | Status |
|-------|--------|
| CORE PRODUCT COMPLETION | ✅ |
| P0 Stabilization | ✅ |
| P1 Auth lifecycle | ✅ |
| **P2 Manual grading** | ✅ |

### Phase 2
- Short-answer answers store `manualScore`, `feedback`, `gradedBy`
- `needsManualGrading` on attempts after submit
- Staff queue: `GET .../grading/queue`
- Grade: `PATCH .../grading/attempts/:id`
- UI: Organization → Grading
- Re-score + optional certificate issue when fully graded & passed

```bash
cd server && npm install && npm run typecheck && npm run build
cd client && npm install && npm run build
```

**ExamFlow** — Smart Assessments. Real Insights.
