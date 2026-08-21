# ExamFlow

**Multi-Tenant SaaS Platform for Online Examinations & Assessments**

> Status: **PHASE 10 — Production Deployment** completed.

## Roadmap

| Phase | Status |
|-------|--------|
| 0–3.5 Architecture → Auth → i18n | ✅ |
| 4 Premium UI/UX | ✅ |
| 5 Organizations | ✅ |
| 6 Courses & Question Banks | ✅ |
| 7 Exam Builder & Engine | ✅ |
| 8 Analytics & Certificates | ✅ |
| 9 Polish & UX | ✅ |
| 10 Production Deployment | ✅ |

## Stack

- **Client:** React 19 · Vite · TypeScript · Tailwind · i18n (EN/AR + RTL)
- **Server:** Express 5 · TypeScript · MongoDB · JWT · Zod
- **Deploy:** Docker Compose · Nginx SPA + API proxy

## Run with Docker

```bash
cp .env.example .env
# set DATABASE_URL and JWT secrets
docker compose up -d --build
```

- Web: http://localhost:8080
- API: http://localhost:5000/api/v1/health

See [DEPLOY.md](./DEPLOY.md) for the production checklist.

## Local dev

```bash
cd server && npm install && npm run dev
cd client && npm install && npm run dev
```

**ExamFlow** — Smart Assessments. Real Insights.
