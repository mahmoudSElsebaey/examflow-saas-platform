# ExamFlow

**Multi-Tenant SaaS Platform for Online Examinations, Assessments, Question Banks & Student Performance Analytics**

Production-ready educational SaaS built with the MERN stack (MongoDB, Express, React, Node.js) + TypeScript.

> Status: **PHASE 2 — Design System & Landing Page** completed.

---

## 🎯 Project Vision

ExamFlow is a true multi-tenant SaaS platform that allows educational institutions, academies, training centers, and individual teachers to:

- Create and manage Question Banks
- Build Courses and Subjects
- Design sophisticated Exams with sections, pools, randomization, and advanced settings
- Deliver secure online examinations with auto-save, server-side timing, and recovery
- Grade automatically and manually (with rubrics)
- Provide rich analytics and performance insights
- Issue verifiable Certificates
- Manage students, groups, and roles

The platform is **white-label ready** and domain-agnostic.

---

## 🏗️ Architecture Overview

### High-Level Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React + Vite  │────▶│  Express API    │────▶│   MongoDB       │
│   (TypeScript)  │     │  (TypeScript)   │     │   Atlas         │
│   + Tailwind    │     │  + JWT Auth     │     │                 │
│   + RTK Query   │     │  + Multi-tenant │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Core Principles

- **Modular Monolith** — clean boundaries, easy to extract later
- **Multi-tenant isolation** enforced at every protected resource
- **Feature-based frontend organization**
- **Service-layer business logic** on the backend
- **Centralized Design System + Theme Tokens**
- **i18n-ready** (Arabic + English, RTL/LTR)
- **Security-first**: Helmet, CORS, rate limiting, Zod, RBAC

### Current Folder Structure

```
examflow-saas-platform/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/              # Design System primitives
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Label.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── Alert.tsx
│   │   │   │   ├── Spinner.tsx
│   │   │   │   ├── EmptyState.tsx
│   │   │   │   ├── Container.tsx
│   │   │   │   └── index.ts
│   │   │   └── landing/         # Landing page sections
│   │   │       ├── Navbar.tsx
│   │   │       ├── Hero.tsx
│   │   │       ├── Features.tsx
│   │   │       ├── HowItWorks.tsx
│   │   │       ├── Pricing.tsx
│   │   │       ├── CTA.tsx
│   │   │       └── Footer.tsx
│   │   ├── config/app.ts        # Centralized branding & config
│   │   ├── pages/LandingPage.tsx
│   │   ├── lib/utils.ts
│   │   ├── App.tsx              # React Router setup
│   │   └── index.css            # Design Tokens (Tailwind v4 @theme)
│   └── ...
├── server/
│   └── src/                     # Express + TS API (health endpoint ready)
├── .env.example
└── README.md
```

---

## 🎨 Design System (Phase 2)

### Tokens
All colors, radius, shadows, and typography live in `client/src/index.css` under `@theme`. Change `--color-primary` once and the entire UI updates.

### UI Primitives
| Component | Variants / Notes |
|-----------|------------------|
| Button | primary, secondary, outline, ghost, danger, success + sizes |
| Input | error state, focus ring |
| Label | accessible form labels |
| Card | Header, Title, Description, Content, Footer |
| Badge | default, secondary, outline, success, warning, error, info |
| Alert | default, success, warning, error, info |
| Spinner | sm / md / lg |
| EmptyState | icon + title + description + action |
| Container | sm / md / lg / xl / full |

### Landing Page
- Sticky responsive Navbar (desktop + mobile menu)
- Hero with clear value proposition & dual CTAs
- Features grid (8 core capabilities)
- How it works (4-step flow)
- Pricing (3 tiers: Starter / Professional / Enterprise)
- Full-width CTA band
- Multi-column Footer with brand + links

---

## 🛠️ Technology Stack

**Frontend**
- React 19 + TypeScript
- Vite 8
- Tailwind CSS v4 + Design Tokens
- React Router
- Redux Toolkit + RTK Query (ready)
- React Hook Form + Zod
- i18next (ready)
- class-variance-authority + clsx + tailwind-merge
- Lucide React

**Backend**
- Node.js + Express 5 + TypeScript
- Zod, Helmet, CORS, Morgan
- JWT + bcryptjs (ready for Phase 3)

---

## 🚀 Getting Started

```bash
git clone https://github.com/mahmoudSElsebaey/examflow-saas-platform.git
cd examflow-saas-platform

# Client
cd client && npm install && npm run dev
# → http://localhost:5173

# Server (separate terminal)
cd server && npm install && cp ../.env.example .env && npm run dev
# → http://localhost:5000/api/v1/health
```

---

## 🛣️ Development Roadmap

| Phase | Name | Focus | Status |
|-------|------|-------|--------|
| 0 | Discovery & Architecture | Architecture, roadmap, domain model | ✅ Done |
| 1 | Project Initialization | Scaffold, TS, Tailwind, Design Tokens, App Config | ✅ Done |
| 2 | Design System & Landing Page | Full UI kit + professional landing | ✅ Done |
| 3 | Authentication | Full auth flows + RBAC | Pending |
| 4 | Multi-Tenant Organizations | Orgs, memberships, isolation | Pending |
| 5 | Courses | Subjects, topics, groups | Pending |
| 6 | Question Bank | CRUD, types, versioning, import | Pending |
| 7 | Exam Builder | Sections, pools, settings, scheduling | Pending |
| 8 | Exam Engine | Timer, auto-save, navigation, recovery | Pending |
| 9 | Grading & Results | Auto + manual, rubrics, feedback | Pending |
| 10 | Analytics | Student / Teacher / Org dashboards | Pending |
| 11 | Certificates & Notifications | Certificates + in-app/email | Pending |
| 12 | SaaS Billing | Plans, subscriptions, limits, payments | Pending |
| 13 | Advanced Features | Redis, jobs, AI, live monitoring | Later |
| 14 | Production Hardening | Security, perf, a11y audit | Pending |
| 15 | Production Deployment | Vercel + backend + Atlas | Pending |

---

## 📌 Next Step

**PHASE 3 — Authentication**

Will implement:
- Register / Login / Logout / Refresh token
- Forgot & Reset Password
- Email verification (structure)
- JWT access + refresh strategy
- Protected routes (frontend + backend)
- Basic RBAC foundation

---

## License

Private / All rights reserved.

---

**ExamFlow** — Built to be a real production SaaS, not a tutorial project.
