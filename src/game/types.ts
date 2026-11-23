import type { Flight } from './flight'

export type Phase = 'dispatch' | 'preflight' | 'flight' | 'beacon' | 'winch' | 'finale'

export type CheckId = 'wind' | 'battery' | 'airspace'

/** A short note under the scene after something happened in flight. */
export type FlightNotice = 'hit' | 'missed' | null

export type GameState = {
  readonly phase: Phase
  /** The story beacons of this playthrough, in order. */
  readonly playthrough: readonly string[]
  readonly checks: readonly CheckId[]
  readonly flight: Flight
  readonly autopilot: boolean
  readonly notice: FlightNotice
  readonly collectedIds: readonly string[]
  /** How far the AED is lowered, from 0 to `WINCH_FULL`. */
  readonly winch: number
}

export type GameAction =
  | { type: 'DISPATCH' }
  | { type: 'CHECK'; check: CheckId }
  | { type: 'TAKE_OFF' }
  | { type: 'STEER'; direction: 'up' | 'down' }
  | { type: 'TOGGLE_AUTOPILOT' }
  /** Dispatched every animation frame while flying. */
  | { type: 'TICK'; dtMs: number }
  /** Closes a beacon card and flies on. */
  | { type: 'CONTINUE' }
  /** Lowers the AED a step. */
  | { type: 'LOWER' }
  /** Slow automatic lowering, dispatched by a timer. */
  | { type: 'WINCH_TICK' }
  | { type: 'REPLAY' }
