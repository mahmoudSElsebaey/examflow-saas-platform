# ExamFlow — Security Notes

## Implemented

- Helmet, CORS allowlist, JWT + httpOnly refresh, bcrypt, Zod validation
- Auth rate limit + global API rate limit (500 / 15m)
- Tenant isolation via membership middleware
- Plan limits; super_admin gated `/api/v1/admin/*`

## Production

- Strong JWT secrets (≥ 32 chars), required `DATABASE_URL`
- HTTPS + secure cookies
- Restrict CORS; rotate secrets on compromise
