# ExamFlow — Multi-tenant Assessment SaaS MVP

**Smart Assessments. Real Insights.**

ExamFlow is a full-stack **EdTech SaaS MVP** for schools, training centers, and online educators. Organizations create courses and question banks, build timed exams, deliver them to students, grade (auto + manual), issue certificates, and track analytics — with **English / Arabic** and full **RTL** support.

| | |
|---|---|
| **Live Client** | [client-indol-beta-85.vercel.app](https://client-indol-beta-85.vercel.app) |
| **Live API** | [server-phi-navy-82.vercel.app](https://server-phi-navy-82.vercel.app/api/v1/health) |
| **Stack** | React + TypeScript · Node/Express · MongoDB · Tailwind · JWT · Stripe · Resend |
| **Repo layout** | Monorepo: `client/` + `server/` |

---

## Table of contents

1. [What it does](#what-it-does)
2. [Product features](#product-features)
3. [Architecture](#architecture)
4. [Repository structure](#repository-structure)
5. [Tech stack](#tech-stack)
6. [Design system & UI](#design-system--ui)
7. [Internationalization (i18n)](#internationalization-i18n)
8. [Roles & permissions](#roles--permissions)
9. [Local setup](#local-setup)
10. [Environment variables](#environment-variables)
11. [Demo seed accounts](#demo-seed-accounts)
12. [API overview](#api-overview)
13. [Testing](#testing)
14. [Deployment](#deployment)
15. [Docker](#docker)
16. [Roadmap / backlog](#roadmap--backlog)

---

## What it does

ExamFlow solves the end-to-end assessment workflow inside one multi-tenant product:

1. **Organization** signs up and invites teachers / examiners / students  
2. **Teachers** build curriculum (subjects → topics → lessons) and question banks  
3. **Examiners / teachers** assemble exams, publish them, and monitor integrity signals  
4. **Students** study lessons, take timed exams (autosave), and receive results  
5. **Staff** manually grade short answers when needed  
6. **System** issues certificates, sends email notifications, and enforces plan limits via billing  

Everything is isolated per organization (tenant).

---

## Product features

| Area | Capabilities |
|------|----------------|
| **Auth** | Register, login, JWT access + refresh cookie, email verify, forgot/reset password |
| **Multi-tenant orgs** | Create org, members, roles, invites (including pending email invites), leave, transfer ownership |
| **Curriculum** | Courses → Subjects → Topics → Lessons + student progress |
| **Question banks** | MCQ single/multiple, true/false, short answer; tags, difficulty, points |
| **Exams** | Builder, publish/draft, time limits, shuffle, max attempts, question snapshot |
| **Exam engine** | Timed take, autosave, submit, auto-grade + manual grading queue |
| **Security signals** | Focus loss, tab switch, paste counts (integrity metadata on attempts) |
| **Certificates** | Issue on pass, public verify by code |
| **Analytics** | Org-level stats + CSV export |
| **Search** | Org-wide search across exams, questions, courses, banks, members |
| **Notifications** | In-app + email (Resend or log adapter) |
| **Billing** | Stripe Checkout / Customer Portal / webhooks, or **mock** mode for demos |
| **Platform admin** | Super-admin surface for platform operations |
| **i18n** | English + Arabic with RTL/LTR layout switching |
| **White-label** | Branding (logo, primary color), design tokens ready for rebrand |

---

## Architecture

```
┌─────────────────────┐         HTTPS / JSON          ┌─────────────────────┐
│  Client (Vite SPA)  │ ────────────────────────────► │  Server (Express)    │
│  React + TS         │ ◄──────────────────────────── │  REST /api/v1/*      │
│  Tailwind + i18next │     JWT Bearer + cookies      │  Zod validation      │
└─────────────────────┘                               └──────────┬──────────┘
                                                                 │
                                                                 ▼
                                                      ┌─────────────────────┐
                                                      │  MongoDB (Atlas)    │
                                                      │  Mongoose models    │
                                                      └─────────────────────┘
                                                                 │
                    ┌────────────────┬───────────────────────────┼──────────────┐
                    ▼                ▼                           ▼              ▼
               Resend email    Stripe Billing              (optional)     Vercel / Docker
```

**Tenancy model:** membership role is the source of truth for tenant access. Org-scoped routes use middleware that resolves the membership and checks permissions.

**Auth model:** short-lived access token (Authorization header) + httpOnly refresh cookie (`SameSite=None; Secure` in production for cross-origin client/API).

---

## Repository structure

```
examflow-saas-platform/
├── client/                 # Vite + React SPA
│   ├── src/
│   │   ├── components/     # Shared UI
│   │   ├── config/         # appConfig (branding, API base, feature flags)
│   │   ├── features/       # Domain modules (auth, exams, content, billing…)
│   │   ├── i18n/           # EN/AR dictionaries + RTL
│   │   ├── pages/          # Route-level pages
│   │   └── lib/            # Helpers
│   ├── public/
│   └── package.json
├── server/                 # Express API
│   ├── api/                # Vercel serverless entry
│   ├── src/
│   │   ├── config/         # env, database, plans
│   │   ├── controllers/
│   │   ├── middlewares/    # auth, tenant, validate, errors
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/
│   │   ├── services/       # Business logic
│   │   ├── validators/     # Zod schemas
│   │   ├── scripts/seed.ts # Rich demo data
│   │   ├── app.ts          # Express app
│   │   └── index.ts        # Long-running server entry
│   ├── vercel.json
│   └── package.json
├── docs/                   # Extra docs (usage, security, launch…)
├── docker-compose.yml
├── DEPLOY.md
└── README.md               # You are here
```

---

## Tech stack

### Client
- **React 19** + **TypeScript**
- **Vite**
- **Tailwind CSS** (design tokens / utility-first)
- **i18next** (EN/AR + direction)
- **React Router**
- Fetch-based API modules per feature (`credentials: 'include'`)

### Server
- **Node.js** + **Express 5**
- **TypeScript** (`tsc` → `dist/`)
- **MongoDB** + **Mongoose**
- **JWT** (access + refresh)
- **Zod** request validation
- **bcryptjs** password hashing
- **Stripe** (optional; mock billing fallback)
- **Resend** email (or `log` provider)
- **Helmet**, **CORS**, **rate-limit**, **cookie-parser**

---

## Design system & UI

- Central branding in `client/src/config/app.ts` (`APP_NAME`, logo, tagline, feature flags).
- Tailwind-based components with consistent spacing, surfaces, and primary color from org branding when available.
- Org workspace layout unifies navigation for content, exams, analytics, certificates, billing, search, activity, and students.
- Landing / marketing sections + authenticated app shell.
- Responsive layouts for desktop and mobile exam taking.

---

## Internationalization (i18n)

- Languages: **English** and **Arabic**
- Direction: `ltr` / `rtl` switched with language
- Strings live under `client/src/i18n`
- Server messages are mostly English; UI is fully localized

---

## Roles & permissions

| Role | Typical access |
|------|----------------|
| **Platform super_admin** | Platform admin APIs |
| **Owner** | Full org control, billing, transfer ownership |
| **Teacher** | Curriculum, banks, exams, content |
| **Examiner** | Grading, exam monitoring |
| **Student** | Learn portal, take exams, certificates |

Permissions are centralized in `server/src/lib/permissions.ts` (unit-tested).

---

## Local setup

### Prerequisites
- Node.js 20+
- MongoDB (local or Atlas)

### 1) Clone & env

```bash
git clone https://github.com/mahmoudSElsebaey/examflow-saas-platform.git
cd examflow-saas-platform
cp .env.example .env
# edit DATABASE_URL, JWT secrets, CORS/CLIENT URLs
```

### 2) Server

```bash
cd server
npm install
npm run seed    # optional rich demo data
npm run dev     # http://localhost:5000
```

Health check: [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health)

### 3) Client

```bash
cd client
npm install
npm run dev     # http://localhost:5173
```

Vite proxies `/api` → `http://localhost:5000` in development.  
For production builds set `VITE_API_URL=https://your-api.example.com/api/v1`.

---

## Environment variables

### Server (required in production)

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | MongoDB connection string |
| `JWT_ACCESS_SECRET` | ≥ 32 chars, not a default placeholder |
| `JWT_REFRESH_SECRET` | ≥ 32 chars, not a default placeholder |
| `CLIENT_URL` | Frontend origin (cookies / links) |
| `CORS_ORIGINS` | Comma-separated allowed origins |

### Server (optional)

| Variable | Description |
|----------|-------------|
| `EMAIL_PROVIDER` | `log` (default) or `resend` |
| `RESEND_API_KEY` | Resend API key |
| `EMAIL_FROM` | From header |
| `BILLING_MODE` | `auto` \| `mock` \| `stripe` |
| `STRIPE_SECRET_KEY` | Stripe secret |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret |
| `STRIPE_PRICE_PROFESSIONAL` / `ENTERPRISE` | Price IDs |

### Client

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Full API base, e.g. `https://server.vercel.app/api/v1` |

> `VITE_*` variables are baked in at **build time**. Change them → redeploy the client.

---

## Demo seed accounts

```bash
cd server && npm run seed
```

Password for **all** accounts: `Demo1234!`

| Email | Role |
|-------|------|
| `admin@demo.examflow` | Platform admin |
| `owner@demo.examflow` | Owner — Demo Academy |
| `teacher@demo.examflow` … `teacher5@demo.examflow` | Teachers |
| `examiner1@demo.examflow` … `examiner5@demo.examflow` | Examiners |
| `student@demo.examflow` … `student8@demo.examflow` | Students |

Seed creates courses, subjects, topics, lessons, banks, questions, published exams, attempts, certificates, notifications, and activity logs.

---

## API overview

Base path: `/api/v1`

| Prefix | Purpose |
|--------|---------|
| `GET /health` | Health, DB state, billing mode |
| `/auth/*` | register, login, refresh, logout, me, verify, reset |
| `/organizations/*` | CRUD org, members, invites, leave, transfer |
| `/organizations/:orgId/*` | content, exams, analytics, certificates, search, activity, billing |
| `/notifications` | User notifications |
| `/admin` | Platform admin |
| `/public/*` | Public certificate verify, etc. |
| `POST /billing/webhook` | Stripe webhooks (raw body) |

Responses follow a consistent shape:

```json
{ "success": true, "message": "...", "data": { } }
```

---

## Testing

### Unit tests (server)

Permissions module uses Node’s built-in test runner:

```bash
cd server
npm test
# or: npx tsx --test src/**/*.test.ts
```

### Typecheck

```bash
cd server && npm run typecheck
cd client && npx tsc --noEmit
```

### Manual QA checklist

- [ ] Register / login / refresh / logout  
- [ ] Create org, invite member, accept invite  
- [ ] Create course → subject → topic → lesson  
- [ ] Create bank + questions (all types)  
- [ ] Build exam, publish, take as student, submit  
- [ ] Manual grade short answer  
- [ ] Certificate issued + public verify  
- [ ] Switch language EN ↔ AR (RTL)  
- [ ] Billing mock or Stripe test mode  

### E2E

Playwright/Cypress suite is on the backlog (not required for MVP demo).

---

## Deployment

### Recommended split (current production)

| App | Platform | Notes |
|-----|----------|--------|
| **Client** | Vercel | Root Directory = `client`, set `VITE_API_URL` |
| **Server** | Vercel Serverless | Root Directory = `server`, entry `api/index.ts` |

**Server env must include:** `DATABASE_URL`, strong JWTs, `CLIENT_URL`, `CORS_ORIGINS` matching the client origin.

**MongoDB Atlas:** allow network access for Vercel (e.g. `0.0.0.0/0` for demos).

**CORS:** client origin must be listed or requests will succeed on the server but fail in the browser.

See also [`DEPLOY.md`](./DEPLOY.md).

### Alternative hosts for API

Railway, Render, Fly.io, or Docker on a VPS are better for long-running Node if you outgrow serverless limits.

---

## Docker

```bash
cp .env.example .env
# set DATABASE_URL + JWT secrets
docker compose up -d --build
```

| Service | URL |
|---------|-----|
| Web (nginx → SPA + `/api` proxy) | http://localhost:8080 |
| API direct | http://localhost:5000/api/v1/health |

---

## Roadmap / backlog

- [ ] E2E suite (Playwright/Cypress)
- [ ] Object storage for logos (S3) instead of data URLs
- [ ] PDF certificate download polish
- [ ] Invite revoke UI + auto-accept on register
- [ ] Transfer ownership confirmation email
- [ ] Production launch checklist automation

---

## License

UNLICENSED — private project by [Mahmoud Salah Elsebaey](https://github.com/mahmoudSElsebaey).

---

**ExamFlow** — Multi-tenant assessment SaaS MVP for modern education.
