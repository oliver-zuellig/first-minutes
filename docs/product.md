# Product: First Minutes

> Binding product description. Agents build from it; the owner resolves contradictions. Exact user-facing texts live in `src/content/`.

## Goal

A tiny browser drone game that accompanies Oliver Züllig's open application to Everdrone (software development). The visitor dispatches a medical delivery drone, runs a short pre-flight check, flies it across a calm Nordic town, collects three story beacons from Oliver's background, and lowers a defibrillator at the destination. The finale names the mission Oliver would like next. It is solved when a recruiter understands the page within five seconds, can finish it in 30–60 seconds, and can reach the same information without playing.

## Users and environment

Everdrone's team (engineers, founders), plus anyone viewing the public repository. Desktop and phone browsers (down to ~360 px wide), online. English only. No account, install or permissions.

## Scope

### Must (MVP)

- Dispatch: title, subtitle, a calm dispatch card (112 call, ambulance on its way, drone dispatched alongside) and a `Dispatch drone` button. `Meet Oliver` is always visible.
- Pre-flight check: three checks (wind, battery, airspace), each one tap or key press; `Take off` appears when all are done. Reflects "safety before speed".
- Flight: the drone flies on its own from left to right in three lanes. `Climb` / `Descend` (buttons, arrow keys, W/S) change lane. Beacons in a lane are collected by being in that lane; each beacon pauses the flight and shows a story card with `Continue flight`. A missed beacon comes round again. Obstacles (gust, birds, crane) in a lane cause a short wobble and slow-down, nothing more. `Autopilot` flies the route by itself. No fail state, no reflex gate, no countdown.
- Winch: at the destination the visitor lowers the AED (each click, tap or key press lowers it a step; it also lowers slowly on its own).
- Finale: "AED delivered.", the next-mission message, then `Meet Oliver`, `View the code` and `Fly again`. Never implies a job offer or endorsement.
- Profile panel ("Hi, I'm Oliver.") with photo, reachable in one click from every state, links from `src/content/links.json`.
- Accessibility: keyboard and touch, visible focus, live region announcing beacons and delivery, `prefers-reduced-motion` stops decorative motion (rotors, parallax, wobble), controls at least 44×44 px.
- Flat SVG art drawn in code, in its own components so pixel art can replace it later.
- Footer disclaimer: "An independent personal project by Oliver Züllig. Not affiliated with or endorsed by Everdrone."
- Deployed on GitHub Pages; works on direct entry and refresh.
- Unit tests for reducer, flight course, autopilot, winch, finale and replay; one browser smoke test for the full flow and mobile layout.

### Later

- Owner's pixel art replacing the SVG components.
- Opt-in original sound (default off).
- Social preview image.

### Explicitly not

- CV download, email address, phone number or home town on the site.
- Everdrone logo, wordmark, photos, brand colours or a likeness of their aircraft. No red cross emblem.
- A patient, injuries, a countdown or any pressure framing: the emergency is told through the dispatch only.
- Analytics, cookies, tracking, backend, leaderboards.
- Invented skills, credentials or URLs.

## Constraints

- Static site, no runtime calls to third parties.
- All assets original.
- Making the repository public and publishing the site happen with the owner's go.

## Phases

| Phase       | Content                                                                | Done when                                         |
| ----------- | ---------------------------------------------------------------------- | ------------------------------------------------- |
| M1 Playable | Scaffold, reducer, flight course, content, SVG scene, all phases, a11y | Full playthrough works; unit tests green          |
| M2 Publish  | Playwright smoke test, Pages workflow, README, live check with owner   | Live URL works including refresh; links verified  |
