import { BEACONS, autopilotLane, createFlight, steer, stepFlight } from './flight'
import type { CheckId, GameAction, GameState } from './types'

export const CHECKS: readonly CheckId[] = ['wind', 'battery', 'airspace']

export const WINCH_FULL = 100
/** Lowering per click, tap or key press. */
export const WINCH_STEP = 20
/** Lowering per automatic tick. */
export const WINCH_TICK_STEP = 2
/** Longest frame the flight accepts, so a background tab does not jump the drone ahead. */
export const MAX_FRAME_MS = 50

export function createInitialState(playthrough: readonly string[]): GameState {
  if (playthrough.length !== BEACONS || new Set(playthrough).size !== BEACONS) {
    throw new Error(
      `A playthrough needs ${BEACONS} distinct beacons, got: ${playthrough.join(', ')}`,
    )
  }
  return {
    phase: 'dispatch',
    playthrough,
    checks: [],
    flight: createFlight(),
    autopilot: false,
    notice: null,
    collectedIds: [],
    winch: 0,
  }
}

function tick(state: GameState, dtMs: number): GameState {
  const piloted = state.autopilot
    ? { ...state.flight, lane: autopilotLane(state.flight) }
    : state.flight
  const { flight, event } = stepFlight(piloted, Math.min(dtMs, MAX_FRAME_MS))
  const next = { ...state, flight }
  switch (event?.type) {
    case 'collected':
      return {
        ...next,
        phase: 'beacon',
        notice: null,
        collectedIds: [...state.collectedIds, state.playthrough[event.index]!],
      }
    case 'arrived':
      return { ...next, phase: 'winch', notice: null }
    case 'hit':
      return { ...next, notice: 'hit' }
    case 'missed':
      return { ...next, notice: 'missed' }
    default:
      return state.notice === 'hit' && flight.slowMs === 0 ? { ...next, notice: null } : next
  }
}

function lower(state: GameState, amount: number): GameState {
  const winch = Math.min(WINCH_FULL, state.winch + amount)
  return { ...state, winch, phase: winch >= WINCH_FULL ? 'finale' : 'winch' }
}

/**
 * Pure state machine for one playthrough. Actions that do not fit the current phase return the
 * same state object, which guards against double clicks and late frames or timers.
 */
export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'DISPATCH':
      return state.phase === 'dispatch' ? { ...state, phase: 'preflight' } : state
    case 'CHECK':
      return state.phase === 'preflight' && !state.checks.includes(action.check)
        ? { ...state, checks: [...state.checks, action.check] }
        : state
    case 'TAKE_OFF':
      return state.phase === 'preflight' && state.checks.length === CHECKS.length
        ? { ...state, phase: 'flight' }
        : state
    case 'STEER': {
      if (state.phase !== 'flight') return state
      // Steering by hand takes over from the autopilot.
      return { ...state, autopilot: false, flight: steer(state.flight, action.direction) }
    }
    case 'TOGGLE_AUTOPILOT':
      return state.phase === 'flight' || state.phase === 'beacon'
        ? { ...state, autopilot: !state.autopilot }
        : state
    case 'TICK':
      return state.phase === 'flight' ? tick(state, action.dtMs) : state
    case 'CONTINUE':
      return state.phase === 'beacon' ? { ...state, phase: 'flight' } : state
    case 'LOWER':
      return state.phase === 'winch' ? lower(state, WINCH_STEP) : state
    case 'WINCH_TICK':
      return state.phase === 'winch' ? lower(state, WINCH_TICK_STEP) : state
    case 'REPLAY':
      return state.phase === 'finale' ? createInitialState(state.playthrough) : state
  }
}
