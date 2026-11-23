import { describe, expect, it } from 'vitest'
import { GAP } from './flight'
import {
  CHECKS,
  MAX_FRAME_MS,
  WINCH_FULL,
  WINCH_STEP,
  WINCH_TICK_STEP,
  createInitialState,
  gameReducer,
} from './reducer'
import type { GameAction, GameState } from './types'

const playthrough = ['a', 'b', 'c'] as const

function run(state: GameState, ...actions: GameAction[]): GameState {
  return actions.reduce(gameReducer, state)
}

const ready = run(
  createInitialState(playthrough),
  { type: 'DISPATCH' },
  ...CHECKS.map((check): GameAction => ({ type: 'CHECK', check })),
)
const flying = run(ready, { type: 'TAKE_OFF' })

/** Ticks frame by frame until the phase changes or the time runs out. */
function flyUntilPhaseChange(state: GameState, maxMs = 30_000): GameState {
  let current = state
  for (let t = 0; t < maxMs && current.phase === state.phase; t += 16)
    current = gameReducer(current, { type: 'TICK', dtMs: 16 })
  return current
}

function flyToWinch(state: GameState): GameState {
  let current = run(state, { type: 'TOGGLE_AUTOPILOT' })
  while (current.phase !== 'winch') {
    current = flyUntilPhaseChange(current)
    if (current.phase === 'beacon') current = run(current, { type: 'CONTINUE' })
  }
  return current
}

describe('gameReducer', () => {
  it('starts at dispatch with nothing collected', () => {
    const state = createInitialState(playthrough)
    expect(state.phase).toBe('dispatch')
    expect(state.checks).toEqual([])
    expect(state.collectedIds).toEqual([])
  })

  it('takes off only after all pre-flight checks', () => {
    const preflight = run(createInitialState(playthrough), { type: 'DISPATCH' })
    expect(preflight.phase).toBe('preflight')
    const twoChecks = run(
      preflight,
      { type: 'CHECK', check: 'wind' },
      { type: 'CHECK', check: 'battery' },
    )
    expect(run(twoChecks, { type: 'TAKE_OFF' })).toBe(twoChecks)
    expect(flying.phase).toBe('flight')
  })

  it('counts a check once', () => {
    const once = run(ready, { type: 'CHECK', check: 'wind' })
    expect(once).toBe(ready)
  })

  it('does not fly before take-off', () => {
    expect(run(ready, { type: 'TICK', dtMs: 16 })).toBe(ready)
    expect(run(ready, { type: 'STEER', direction: 'up' })).toBe(ready)
  })

  it('steers between lanes while flying', () => {
    expect(run(flying, { type: 'STEER', direction: 'up' }).flight.lane).toBe(0)
    expect(run(flying, { type: 'STEER', direction: 'down' }).flight.lane).toBe(2)
  })

  it('hands control back from the autopilot when the visitor steers', () => {
    const auto = run(flying, { type: 'TOGGLE_AUTOPILOT' })
    expect(auto.autopilot).toBe(true)
    expect(run(auto, { type: 'STEER', direction: 'up' }).autopilot).toBe(false)
  })

  it('caps long frames so a background tab cannot skip the route', () => {
    const after = run(flying, { type: 'TICK', dtMs: 5000 })
    const capped = run(flying, { type: 'TICK', dtMs: MAX_FRAME_MS })
    expect(after.flight.distance).toBe(capped.flight.distance)
  })

  it('pauses on each beacon in order, then reaches the winch on autopilot', () => {
    let state = run(flying, { type: 'TOGGLE_AUTOPILOT' })
    const collected: string[] = []
    for (let i = 0; i < playthrough.length; i++) {
      state = flyUntilPhaseChange(state)
      expect(state.phase).toBe('beacon')
      collected.push(state.collectedIds.at(-1)!)
      // Paused: frames do nothing while the card is open.
      expect(run(state, { type: 'TICK', dtMs: 16 })).toBe(state)
      state = run(state, { type: 'CONTINUE' })
    }
    expect(collected).toEqual(['a', 'b', 'c'])
    expect(flyUntilPhaseChange(state).phase).toBe('winch')
  })

  it('notes a hit obstacle and clears the note once the slow-down is over', () => {
    // The first obstacle sits in the middle lane, where the drone starts.
    let state = flying
    while (state.notice !== 'hit') state = run(state, { type: 'TICK', dtMs: 16 })
    expect(state.phase).toBe('flight')
    while (state.notice === 'hit') state = run(state, { type: 'TICK', dtMs: 16 })
    expect(state.notice).toBeNull()
  })

  it('notes a missed beacon and keeps flying', () => {
    let state = run(flying, { type: 'STEER', direction: 'down' })
    const firstBeaconAt = state.flight.approach!.beaconAt
    while (state.notice !== 'missed') state = run(state, { type: 'TICK', dtMs: 16 })
    expect(state.phase).toBe('flight')
    expect(state.collectedIds).toEqual([])
    expect(state.flight.approach!.beaconAt).toBeGreaterThan(firstBeaconAt + GAP / 2)
  })

  it('lowers the AED by presses and on its own, then shows the finale', () => {
    const winch = flyToWinch(flying)
    const pressed = run(winch, { type: 'LOWER' })
    expect(pressed.winch).toBe(WINCH_STEP)
    expect(run(pressed, { type: 'WINCH_TICK' }).winch).toBe(WINCH_STEP + WINCH_TICK_STEP)
    const presses = Array.from({ length: WINCH_FULL / WINCH_STEP }, (): GameAction => ({
      type: 'LOWER',
    }))
    const done = run(winch, ...presses)
    expect(done.phase).toBe('finale')
    expect(done.winch).toBe(WINCH_FULL)
    expect(run(done, { type: 'LOWER' })).toBe(done)
  })

  it('replays from the finale with a fresh state', () => {
    const winch = flyToWinch(flying)
    const done = run(winch, ...Array.from({ length: 10 }, (): GameAction => ({ type: 'LOWER' })))
    expect(run(done, { type: 'REPLAY' })).toEqual(createInitialState(playthrough))
  })

  it('ignores replay before the finale', () => {
    expect(run(flying, { type: 'REPLAY' })).toBe(flying)
  })
})

describe('createInitialState', () => {
  it('rejects a playthrough without exactly three distinct beacons', () => {
    expect(() => createInitialState(['a', 'b'])).toThrow()
    expect(() => createInitialState(['a', 'a', 'b'])).toThrow()
  })
})
