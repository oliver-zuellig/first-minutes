# First Minutes

A small drone game about getting there first. Dispatch a delivery drone, run the pre-flight check, fly through three beacons from my story and lower a defibrillator where it is needed.

**Play it:** https://oliver-zuellig.github.io/first-minutes/

An independent personal project by Oliver Züllig. Not affiliated with or endorsed by Everdrone.

Built with Vite, React and TypeScript. No game engine, no canvas, no tracking, font self-hosted. The scene is flat SVG drawn in code. Deployed to GitHub Pages on every push to `main`.

## How it works

- `src/game/flight.ts`: the flight as a pure, deterministic course. `stepFlight(flight, dtMs)` moves the drone, collects beacons, applies obstacles and arrives. A missed beacon comes round again; nothing can fail.
- `src/game/reducer.ts`: the state machine (dispatch → pre-flight → flight ⇄ beacon → winch → finale). Frames and timers only dispatch actions.
- `src/game/loop.ts`: the `requestAnimationFrame` loop and winch timer.
- `src/components/Scene.tsx`: derives the SVG picture from state; the shapes live in `src/components/scene/`.
- Texts live in `src/content/`.

## Run locally

Requires Node 24 (see `.nvmrc`).

```sh
npm ci
npm run dev       # http://localhost:5173/first-minutes/
npm test
npm run test:e2e  # browser smoke test (first: npx playwright install chromium)
npm run build
```

## How this was built

I built this with AI coding agents in a deliberately structured workflow: a binding product description (`docs/product.md`), architecture decisions (`docs/adr/`), coding standards, test-first changes and a pre-push quality gate (`.githooks/`). `AGENTS.md` is the brief the agents work from. Every change was reviewed and decided by me.
