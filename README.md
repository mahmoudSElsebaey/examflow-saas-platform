# ExamFlow

**Multi-Tenant SaaS Platform for Online Examinations, Assessments, Question Banks & Student Performance Analytics**

Production-ready educational SaaS built with the MERN stack (MongoDB, Express, React, Node.js) + TypeScript.

> Status: **PHASE 3 — Authentication** completed.

---

## 🎯 Project Vision

ExamFlow is a true multi-tenant SaaS platform for educational institutions, academies, and teachers to create question banks, design exams, deliver secure assessments, grade, analyze performance, and issue certificates.

---

## 🏗️ Architecture

Modular Monolith · Multi-tenant isolation · Feature-based frontend · Service-layer backend · Centralized Design System · i18n-ready · Security-first

```
client/  → React 19 + Vite + Tailwind v4 + Auth pages
server/  → Express 5 + TypeScript + Mongoose + JWT Auth
```

---

## 🔐 Authentication (Phase 3)

### Backend (`/api/v1/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Create account |
| POST | `/login` | Login (access token + httpOnly refresh cookie) |
| POST | `/refresh` | Rotate tokens |
| POST | `/logout` | Revoke refresh token |
| GET | `/me` | Current user |
| POST | `/forgot-password` | Request reset |
| POST | `/reset-password` | Reset with token |

**Security:** bcrypt (12 rounds), JWT access + rotating refresh (hashed in DB), httpOnly cookies, rate limiting, Zod validation, RBAC roles (`super_admin`, `org_owner`, `teacher`, `examiner`, `student`), `authenticate` + `authorize` middlewares.

### Frontend
- Login / Register / Forgot Password pages
- AuthContext (session restore + silent refresh)
- ProtectedRoute for `/app`
- Dashboard placeholder

> Set `DATABASE_URL` in `server/.env` for full auth against MongoDB Atlas.

---

## 🚀 Getting Started

```bash
git clone https://github.com/mahmoudSElsebaey/examflow-saas-platform.git
cd examflow-saas-platform

cd server && npm install && cp .env.example .env
# Edit .env → DATABASE_URL, JWT secrets
npm run dev

cd ../client && npm install && npm run dev
```

- Landing: http://localhost:5173
- Auth: `/login`, `/register`, `/forgot-password`
- Protected: `/app`

---

## 🛣️ Roadmap

| Phase | Name | Status |
|-------|------|--------|
| 0 | Discovery & Architecture | ✅ Done |
| 1 | Project Initialization | ✅ Done |
| 2 | Design System & Landing Page | ✅ Done |
| 3 | Authentication | ✅ Done |
| 4 | Multi-Tenant Organizations | Pending |
| 5–15 | Courses → Deploy | Pending |

---

## 📌 Next Step

**PHASE 4 — Multi-Tenant Organizations**

Organization model, memberships, tenant middleware, invites, org-scoped roles.

---

**ExamFlow** — Built to be a real production SaaS, not a tutorial project.
