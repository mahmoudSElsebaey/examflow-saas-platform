---
type: qa-report
agent: qa
status: fail
createdAt: 2026-11-07T10:34:53.742Z
updatedAt: 2026-11-07T10:34:53.742Z
runId: 3af462dc-14bb-4027-a5da-6b80d1ecd3b5
---

# QA Report — FAIL

## Summary

The public landing page fails before the application loads: the preview URL returns HTTP 403 because Vite rejects the public preview hostname. The failure reproduced at 1440×900 and 390×844, including with reduced motion enabled; the page exposed no application links, controls, images, language switcher, RTL state, or Swiper UI to validate. A clean browser debug capture showed the root document and favicon both returning 403, so all requested landing-page interaction and accessibility checks remain blocked until allowedHosts is corrected and the preview is redeployed.

## Severity Counts

- Critical: 1
- High: 0
- Medium: 0
- Low: 0
- Info: 2

## Routes Tested

- `/`

See `findings.md` for the per-issue log.
