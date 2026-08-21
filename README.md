# ExamFlow

**Multi-Tenant SaaS Platform for Online Examinations, Assessments, Question Banks & Student Performance Analytics**

> Status: **PHASE 3.5 — Internationalization & RTL/LTR** completed.

---

## i18n (Phase 3.5)

- **Languages:** English (`en`, LTR) · Arabic (`ar`, RTL)
- **Stack:** `i18next` + `react-i18next` + `i18next-browser-languagedetector`
- **Files:** `client/src/i18n/locales/{en,ar}/translation.json`
- **Direction:** `document.documentElement.dir` / `lang` updated on language change
- **Persistence:** `localStorage` key `examflow_lang`
- **Fallback:** browser language → Arabic if `ar*`, else English
- **Switcher:** Navbar, Footer, Auth headers, Dashboard

### Run

```bash
cd client && npm install && npm run dev
```

Toggle language with the switcher. No full page reload required.

---

## Roadmap

| Phase | Name | Status |
|-------|------|--------|
| 0 | Discovery & Architecture | ✅ Done |
| 1 | Project Initialization | ✅ Done |
| 2 | Design System & Landing Page | ✅ Done |
| 3 | Authentication | ✅ Done |
| 3.5 | Internationalization & RTL/LTR | ✅ Done |
| 4 | Multi-Tenant Organizations | Pending |

---

**ExamFlow** — Production SaaS, not a tutorial.
