# ExamFlow

**Multi-Tenant SaaS Platform for Online Examinations & Assessments**

> Status: **CORE PRODUCT COMPLETION — Part 1 (Dashboard + Workspace Nav)** done.

## Core completion

| Part | Status |
|------|--------|
| 1 Dashboard + Organization workspace navigation | ✅ |
| 2+ Short answer, autosave, results, certificates… | ⏳ |

### Part 1

- Role-aware Dashboard (staff vs student)
- **Open workspace** into the organization
- **OrgWorkspaceNav** (role-filtered): Overview · Courses · Banks · Exams · Students · Analytics · Certificates · Members · Settings
- Routes: `/students`, `/members`, `/settings`
- Content deep-links: `?tab=courses|banks|questions`

```bash
cd client && npm install && npm run dev
cd server && npm install && npm run dev
```

**ExamFlow** — Smart Assessments. Real Insights.
