---
type: qa-findings
agent: qa
status: active
createdAt: 2026-11-07T10:34:47.978Z
updatedAt: 2026-11-07T10:34:47.978Z
tags: []
---

# QA Findings

Append-only log of findings across QA runs. Most-recent appended at bottom.

## Run 3af462dc-14bb-4027-a5da-6b80d1ecd3b5 — 2026-11-07T10:34:47.978Z

- [CRITICAL/flow] Public landing page / is completely unavailable because Vite rejects the preview hostname (route: /)
  - Suggested fix: Add the exact preview hostname (or the platform-approved preview host pattern) to server.allowedHosts in /home/user/client/vite.config.ts, then redeploy and rerun QA.
- [INFO/visual] Desktop and mobile landing-page responsiveness could not be evaluated because both viewports render only the host-block message (route: /)
  - Suggested fix: Resolve the allowedHosts blocker first, then repeat visual checks at desktop and mobile breakpoints.
- [INFO/a11y] Language switching, RTL, Swiper controls, anchors, CTAs, keyboard access, and reduced-motion behavior are unreachable (route: /)
  - Suggested fix: After restoring public access, rerun the complete interaction and accessibility matrix on the rendered landing page.
