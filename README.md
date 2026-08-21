# ExamFlow

**Multi-Tenant SaaS Platform for Online Examinations, Assessments, Question Banks & Student Performance Analytics**

Production-ready educational SaaS built with the MERN stack (MongoDB, Express, React, Node.js) + TypeScript.

> Status: **PHASE 0 — Discovery & Architecture** completed.

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

### Proposed Folder Structure

```
examflow-saas-platform/
├── client/                     # Frontend (Vite + React + TS)
│   ├── public/
│   ├── src/
│   │   ├── app/                # App providers, store setup
│   │   ├── components/         # Shared UI components (Design System)
│   │   ├── features/           # Feature modules (auth, exams, questions...)
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/           # RTK Query APIs
│   │   ├── store/
│   │   ├── routes/
│   │   ├── lib/
│   │   ├── config/             # App configuration & branding
│   │   ├── theme/              # Design tokens & theme
│   │   ├── types/
│   │   ├── assets/
│   │   └── i18n/
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── server/                     # Backend (Express + TS)
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── services/           # Business logic
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middlewares/        # auth, tenant, rbac, validation, error
│   │   ├── validators/         # Zod schemas
│   │   ├── utils/
│   │   ├── types/
│   │   ├── jobs/               # Background jobs (later)
│   │   └── integrations/       # Email, payments, storage
│   ├── package.json
│   └── tsconfig.json
│
├── docs/                       # Architecture, ADRs, API docs
├── .github/                    # CI/CD workflows (later)
├── .env.example
├── README.md
└── package.json                # Root workspace (optional)
```

---

## 🗄️ Database Domain Model (High-Level)

Core entities (MongoDB + Mongoose):

| Entity              | Purpose                                      |
|---------------------|----------------------------------------------|
| User                | Global users                                 |
| Organization        | Tenant                                       |
| Membership          | User ↔ Organization + Role                   |
| Role / Permission   | RBAC                                         |
| Course / Subject / Topic | Educational structure                   |
| StudentGroup        | Groups of students                           |
| QuestionBank        | Collection of questions                      |
| Question + QuestionVersion | Versioned questions (critical)         |
| Exam + ExamSection + ExamQuestion | Exam definition                    |
| ExamAttempt         | Student taking an exam                       |
| StudentAnswer       | Answers + auto-save                          |
| Result / ManualGrade / Rubric | Grading                           |
| Certificate         | Issued certificates + verification           |
| Notification        | In-app + email                               |
| Invitation          | Org / course invites                         |
| Plan / Subscription / Payment / Invoice | SaaS billing                  |
| AuditLog            | Security & compliance                        |
| SupportTicket       | Support                                      |

**Key design decisions:**
- Question versioning: Old exams keep the exact version used at creation time.
- Tenant isolation: Every tenant-scoped document carries `organizationId`. Middleware + service layer always enforce it.
- Soft deletes + audit trails where needed.

---

## 🔐 Authentication & Authorization Strategy

- JWT Access Token (short-lived) + Refresh Token (httpOnly / secure strategy)
- Register / Login / Logout / Refresh / Forgot & Reset Password / Email Verification
- Role-Based Access Control (RBAC) + fine-grained Permissions
- Roles: Super Admin, Organization Owner, Teacher, Examiner/Assistant, Student (Parent later)
- Never trust frontend claims — always re-validate on backend

---

## 🎨 Design System & Branding Strategy

- Centralized `config/app.ts` for APP_NAME, logo, languages, contact, social links
- Design tokens in CSS variables / Tailwind theme extension:
  - Colors: primary, secondary, accent, neutral, success, warning, error, info
  - Typography, spacing, radius, shadows
- No hardcoded colors in components
- Fully responsive (mobile-first where it matters: exam taking UI, dashboards)
- Accessibility: semantic HTML, keyboard nav, focus states, ARIA, contrast
- i18n: Arabic + English from day one with RTL/LTR support

---

## 🛣️ Development Roadmap

| Phase | Name                              | Focus                                      | Status      |
|-------|-----------------------------------|--------------------------------------------|-------------|
| 0     | Discovery & Architecture          | This document                              | ✅ Done     |
| 1     | Project Initialization            | Scaffold, TS, lint, theme, config          | Pending     |
| 2     | Design System & Landing Page      | Full UI kit + professional landing         | Pending     |
| 3     | Authentication                    | Full auth flows + RBAC                     | Pending     |
| 4     | Multi-Tenant Organizations        | Orgs, memberships, isolation               | Pending     |
| 5     | Courses                           | Subjects, topics, groups                   | Pending     |
| 6     | Question Bank                     | CRUD, types, versioning, import            | Pending     |
| 7     | Exam Builder                      | Sections, pools, settings, scheduling      | Pending     |
| 8     | Exam Engine                       | Timer, auto-save, navigation, recovery     | Pending     |
| 9     | Grading & Results                 | Auto + manual, rubrics, feedback           | Pending     |
| 10    | Analytics                         | Student / Teacher / Org dashboards         | Pending     |
| 11    | Certificates & Notifications      | Certificates + in-app/email                | Pending     |
| 12    | SaaS Billing                      | Plans, subscriptions, limits, payments     | Pending     |
| 13    | Advanced Features                 | Redis, jobs, AI, live monitoring...        | Later       |
| 14    | Production Hardening              | Security, perf, a11y audit                 | Pending     |
| 15    | Production Deployment             | Vercel + backend hosting + Atlas           | Pending     |

---

## 🛠️ Technology Stack (Planned)

**Frontend**
- React 19 + TypeScript
- Vite
- Tailwind CSS + custom Design System
- React Router
- Redux Toolkit + RTK Query
- React Hook Form + Zod
- i18next (or equivalent)

**Backend**
- Node.js + Express + TypeScript
- MongoDB + Mongoose
- JWT + Refresh Tokens
- Zod validation
- Helmet, CORS, rate-limiting

**Infra & Services**
- MongoDB Atlas
- Cloudinary (or S3-compatible) for media
- Redis (later phases)
- Email provider (Resend / SendGrid / etc.)
- Payment provider (Stripe preferred, provider-agnostic interface)
- Frontend: Vercel
- Backend: Railway / Render / Fly.io / VPS (decision in Phase 15)

---

## 🔒 Security Strategy

- Password hashing (bcrypt / argon2)
- Short-lived access tokens + refresh token rotation
- Strict CORS + Helmet
- Rate limiting on auth and sensitive endpoints
- Input validation on every request (Zod)
- Tenant isolation middleware
- RBAC + Permission checks in services
- File upload validation & size limits
- Audit logs for critical actions
- No secrets in code; `.env.example` documented
- Production: no stack traces, centralized error handler

---

## 🚀 Deployment Strategy (High-Level)

1. MongoDB Atlas (production cluster)
2. Frontend → Vercel (preview + production)
3. Backend → chosen PaaS or container host
4. Environment variables managed securely
5. CI via GitHub Actions (lint, typecheck, test, build)
6. Full end-to-end production smoke tests before calling it Production Ready

---

## 📁 Current Repository State

- Repository created empty on 2026-08-21
- Default branch: `main`
- This README is the first commit (PHASE 0)

---

## 📌 Next Step

**PHASE 1 — Project Initialization**

Will create:
- `client/` and `server/` scaffolds
- TypeScript configuration
- ESLint + Prettier
- Tailwind + Design tokens foundation
- App configuration system
- Base folder structure
- `.env.example`
- Root tooling

---

## License

Private / All rights reserved (to be decided by owner).

---

**ExamFlow** — Built to be a real production SaaS, not a tutorial project.
