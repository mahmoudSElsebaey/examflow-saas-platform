# ExamFlow — Backup & Recovery

## MongoDB

1. Atlas: enable continuous / daily snapshots.
2. Self-hosted: `mongodump --uri="$DATABASE_URL" --out="/backups/examflow-$(date +%Y%m%d)"`
3. Store dumps in object storage with retention.

## Recovery drill

1. Restore dump to staging.
2. Point staging `DATABASE_URL` at restored DB.
3. Verify `/api/v1/health` and smoke login + exam flow.

## Targets

- RPO ≤ 24h (ops minimum) / ≤ 1h (Atlas paid)
- RTO ≤ 4h
