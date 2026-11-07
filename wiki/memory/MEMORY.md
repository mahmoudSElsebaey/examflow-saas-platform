# Project Memory

One durable fact per bullet — decisions, preferences, constraints, gotchas.
Newest at the bottom. Curate in place: update what changed, delete what is
wrong, merge duplicates, flag contradictions with ⚠️. Use ⛔ for hard
"never do this" rules. When this file passes ~200 lines, consolidate detail
into topic files in this folder and keep a one-line pointer here.
Detail pages: `<topic>.md` next to this file. Journal: `log.md` (append-only).
Never store secrets, API keys, or tokens here.

## Facts
- Task: Review the public landing page only (route /). Check desktop and mobile responsiveness, Arabic/English language switching and RTL layout, Swiper pagination/autoplay/navigation, image loading, navbar anchors, pricing/CTA links, keyboard acc… — Outcome: I’m starting the landing-page QA pass now, scoped strictly to `/`. I’ll verify the agreed requirements, then exercise desktop/mobile behavior, localization and RTL, carousel controls, links, accessibility, motion preferences, images, and console/network health. The preview is currently rejecting its own public hostname before the landing page renders. I’m capturing the browser and HTTP evidence now, then I’ll check whether any client-side behavior is reachable at all under desktop, mobile, keyboard, and reduced-motion settings. The blocker is consistent at both 1440×900 and 390×844, including with `prefers-reduced-motion: reduce`; the delivered document contains no app controls, links, imag… #run-summary (qa-agent, 2026-11-07) <!-- productos-run:p9pdrmyc47iwclaszdcc7fle -->
