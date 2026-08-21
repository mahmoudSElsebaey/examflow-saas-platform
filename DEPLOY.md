# ExamFlow — Deployment Guide (Phase 10)

## Prerequisites

- Docker + Docker Compose v2
- MongoDB Atlas (or any MongoDB URI)
- Strong JWT secrets: `openssl rand -hex 32`

## Quick start (Docker)

```bash
cp .env.example .env
# Edit .env → DATABASE_URL, JWT_*, CORS_ORIGINS

docker compose up -d --build
```

| Service | URL |
|---------|-----|
| Web UI  | http://localhost:8080 |
| API health | http://localhost:5000/api/v1/health |

Nginx in `web` proxies `/api/*` → `api:5000`.

## Local development

```bash
cd server && npm install && npm run dev
cd client && npm install && npm run dev
```

Optional client env: `VITE_API_URL=http://localhost:5000/api/v1`

## Production checklist

- [ ] `NODE_ENV=production`
- [ ] Unique JWT secrets (≥ 32 chars, not defaults)
- [ ] `DATABASE_URL` on managed MongoDB
- [ ] `CORS_ORIGINS` / `CLIENT_URL` match public origin
- [ ] HTTPS at the edge (Caddy / Nginx / cloud LB)
- [ ] MongoDB backups enabled
- [ ] Healthchecks green
- [ ] Never commit `.env`

## Platforms

- **Frontend only (Vercel/Netlify):** set `VITE_API_URL` at build time.
- **API (Railway/Render/Fly):** deploy `server/` with the same env vars.
- **VPS:** `docker compose` behind TLS reverse proxy.

## Health

```bash
curl -s http://localhost:5000/api/v1/health
```
