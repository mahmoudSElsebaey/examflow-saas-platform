# ExamFlow

**Multi-Tenant SaaS Platform for Online Examinations & Assessments**

> Status: **CORE PRODUCT COMPLETION — Part 2 (Short answer + Auto-save)** done.

## Core completion

| Part | Status |
|------|--------|
| 1 Dashboard + Organization workspace navigation | ✅ |
| 2 Short answer + debounced auto-save | ✅ |
| 3+ Results, certificates E2E, … | ⏳ |

### Part 2

- Short-answer questions: textarea, edit, autosave as `selected[0]`
- Debounced PATCH (~700ms) on answer change
- Flush save on question change and `pagehide`
- UI status: Saving… / Saved / Save failed
- Objective auto-grade unchanged; short answers excluded (manual later)

```bash
cd client && npm install && npm run dev
cd server && npm install && npm run dev
```

**ExamFlow** — Smart Assessments. Real Insights.
