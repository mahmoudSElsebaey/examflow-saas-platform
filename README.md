# ExamFlow

**Multi-Tenant SaaS Platform for Online Examinations, Assessments, Question Banks & Student Performance Analytics**

Production-ready educational SaaS built with the MERN stack (MongoDB, Express, React, Node.js) + TypeScript.

> Status: **PHASE 1 — Project Initialization** completed.

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

The platform is **white-label ready** and domain-agnostic (Mathematics, Languages, Programming, Science, Corporate Training, etc.).

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
         │                       │                       │
         │                       ▼                       │
         │              ┌─────────────────┐              │
         └─────────────▶│  Redis (cache / │◀─────────────┘
                        │  sessions / jobs)│
                        └─────────────────┘
                                 │
                        ┌─────────────────┐
                        │  Cloudinary /   │
                        │  Object Storage │
                        └─────────────────┘
```

### Core Principles

- **Modular Monolith** (not microservices) — clean boundaries, easy to extract later
- **Multi-tenant isolation** enforced at every protected resource (never trust frontend `organizationId`)
- **Feature-based frontend organization**
- **Service-layer business logic** on the backend
- **Centralized Design System + Theme Tokens**
- **i18n-ready** (Arabic + English from day one, RTL/LTR)
- **Security-first**: Helmet, CORS, rate limiting, input validation (Zod), password hashing, RBAC + Permissions

### Current Folder Structure

```
examflow-saas-platform/
├── client/                     # Frontend (Vite + React + TS)
│   ├── public/
│   ├── src/
│   │   ├── app/
│   │   ├── components/         # Shared UI (Design System)
│   │   │   └── ui/             # Button, etc.
│   │   ├── config/             # Centralized app config & branding
│   │   ├── features/
│   │   ├── hooks/
│   │   ├── i18n/
│   │   ├── layouts/
│   │   ├── lib/                # utils (cn, etc.)
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── store/
│   │   ├── theme/
│   │   ├── types/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css           # Design Tokens (Tailwind v4 @theme)
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig*.json
│
├── server/                     # Backend (Express + TS)
│   ├── src/
│   │   ├── config/             # Env validation (Zod)
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── routes/             # health.routes
│   │   ├── middlewares/        # errorHandler, etc.
│   │   ├── validators/
│   │   ├── utils/              # apiResponse
│   │   ├── types/
│   │   ├── jobs/
│   │   ├── integrations/
│   │   ├── app.ts
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
│
├── .env.example
├── .gitignore
├── .editorconfig
├── .prettierrc
└── README.md
```

---

## 🛠️ Technology Stack

**Frontend**
- React 19 + TypeScript
- Vite 8
- Tailwind CSS v4 + custom Design Tokens (`@theme`)
- React Router
- Redux Toolkit + RTK Query (ready)
- React Hook Form + Zod
- i18next (ready)
- class-variance-authority + clsx + tailwind-merge
- Lucide React

**Backend**
- Node.js + Express 5 + TypeScript
- Zod (env + validation)
- Helmet, CORS, Morgan, Cookie-Parser
- JWT + bcryptjs (ready for Phase 3)
- Mongoose (to be added in Phase 3/4)

**Infra (planned)**
- MongoDB Atlas
- Cloudinary / S3-compatible
- Redis (later)
- Vercel (frontend)
- Railway / Render / Fly.io (backend)

---

## 🎨 Design System Foundation

- **Centralized tokens** in `client/src/index.css` via Tailwind v4 `@theme`
- Colors: primary, secondary, accent, success, warning, error, info, neutrals
- Typography, radius, shadows defined once
- `Button` component with variants (primary, secondary, outline, ghost, danger, success) and sizes
- Utility `cn()` for safe class merging
- App branding centralized in `client/src/config/app.ts`

Change the primary color in one place (`--color-primary`) and the whole UI updates.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm 10+

### Installation

```bash
# Clone
git clone https://github.com/mahmoudSElsebaey/examflow-saas-platform.git
cd examflow-saas-platform

# Client
cd client
npm install
cp ../.env.example .env   # optional – set VITE_API_URL if needed

# Server
cd ../server
npm install
cp ../.env.example .env
```

### Development

```bash
# Terminal 1 – Backend
cd server
npm run dev
# → http://localhost:5000/api/v1/health

# Terminal 2 – Frontend
cd client
npm run dev
# → http://localhost:5173
```

### Health Check
```bash
curl http://localhost:5000/api/v1/health
```

---

## 🛣️ Development Roadmap

| Phase | Name | Focus | Status |
|-------|------|-------|--------|
| 0 | Discovery & Architecture | Architecture, roadmap, domain model | ✅ Done |
| 1 | Project Initialization | Scaffold, TS, Tailwind, Design Tokens, App Config | ✅ Done |
| 2 | Design System & Landing Page | Full UI kit + professional landing | Pending |
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
| 13 | Advanced Features | Redis, jobs, AI, live monitoring... | Later |
| 14 | Production Hardening | Security, perf, a11y audit | Pending |
| 15 | Production Deployment | Vercel + backend hosting + Atlas | Pending |

---

## 🔒 Security Strategy

- Password hashing (bcrypt)
- Short-lived access tokens + refresh token rotation
- Strict CORS + Helmet
- Rate limiting on auth and sensitive endpoints (Phase 3+)
- Input validation on every request (Zod)
- Tenant isolation middleware
- RBAC + Permission checks in services
- File upload validation & size limits
- Audit logs for critical actions
- No secrets in code; `.env.example` documented
- Production: no stack traces, centralized error handler

---

## 📌 Next Step

**PHASE 2 — Design System & Landing Page**

Will create:
- Complete set of UI primitives (Input, Card, Badge, Dialog, Alert, Table, Tabs, etc.)
- Professional Landing Page (Navbar, Hero, Features, Pricing teaser, Footer)
- Responsive navigation
- Empty / Loading / Error states
- Accessibility polish

---

## License

Private / All rights reserved (to be decided by owner).

---

**ExamFlow** — Built to be a real production SaaS, not a tutorial project.
