# 0001: Vite, React and TypeScript with an SVG scene and a pure flight step

## Context

First Minutes is a one-minute browser game that must load fast, work on phones, be accessible and deploy as a static site to GitHub Pages. It is a work sample for an application, so the code itself is read. Unlike its sibling project One More Dream it has a real-time part: the drone flies while the visitor steers.

## Decision

Vite + React + TypeScript (strict), the same tooling as One More Dream. Game state lives in a pure reducer. The flight is a pure function `stepFlight(flight, dtMs)` over a deterministic course; a `requestAnimationFrame` hook only dispatches `TICK` actions with the elapsed time. The scene is one inline SVG whose positions are derived from state on each render. No game engine, no canvas: the scene has a handful of shapes and the controls stay plain HTML buttons. Vitest + React Testing Library for unit and component tests, Playwright for one smoke test. GitHub Actions builds and deploys to Pages.

## Consequences

The whole game is testable without a browser by feeding ticks. React re-renders the small SVG every frame, which is cheap at this size; many sprites or physics would need a canvas. The Vite `base` must match the repository name (`/first-minutes/`).
