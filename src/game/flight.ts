/**
 * The flight as a pure, deterministic course. Distances are in scene pixels, time in ms.
 *
 * The route has one approach per beacon: an obstacle sits halfway in the beacon's lane, so the
 * pilot dodges and comes back. A missed beacon comes round again; an obstacle only slows the
 * drone down for a moment. After the last beacon the destination follows.
 */

export type Lane = 0 | 1 | 2
export type ObstacleKind = 'gust' | 'birds' | 'crane'

export type Approach = {
  /** Which beacon of the route this approach leads to, from 0. */
  readonly index: number
  readonly beaconAt: number
  readonly beaconLane: Lane
  readonly obstacleAt: number
  readonly obstacleLane: Lane
  readonly obstacleKind: ObstacleKind
  /** The drone has passed the obstacle (hit or not). */
  readonly obstaclePassed: boolean
}

export type Flight = {
  readonly distance: number
  /** 0 is the highest lane. */
  readonly lane: Lane
  /** Remaining slow-down after an obstacle. */
  readonly slowMs: number
  /** The approach to the next beacon, or null once all beacons are collected. */
  readonly approach: Approach | null
  /** Set once all beacons are collected. */
  readonly destinationAt: number | null
}

export type FlightEvent =
  | { readonly type: 'collected'; readonly index: number }
  | { readonly type: 'missed' }
  | { readonly type: 'hit'; readonly kind: ObstacleKind }
  | { readonly type: 'arrived' }
  | null

export const BEACONS = 3
/** Scene pixels per second. */
export const SPEED = 110
export const SLOW_FACTOR = 0.4
export const SLOW_MS = 1200
/** Distance between one beacon and the next (and from a miss to its second chance). */
export const GAP = 440
export const FIRST_BEACON_AT = 520
/** How far ahead the autopilot looks for an obstacle in its lane. */
export const AUTOPILOT_LOOKAHEAD = 150

const BEACON_LANES: readonly Lane[] = [1, 0, 2]
/** Each lane has its own kind of obstacle: birds up high, gusts in the middle, cranes low. */
const OBSTACLE_BY_LANE: Record<Lane, ObstacleKind> = { 0: 'birds', 1: 'gust', 2: 'crane' }

function createApproach(index: number, beaconAt: number): Approach {
  const beaconLane = BEACON_LANES[index % BEACON_LANES.length]!
  return {
    index,
    beaconAt,
    beaconLane,
    obstacleAt: beaconAt - GAP / 2,
    obstacleLane: beaconLane,
    obstacleKind: OBSTACLE_BY_LANE[beaconLane],
    obstaclePassed: false,
  }
}

export function createFlight(): Flight {
  return {
    distance: 0,
    lane: 1,
    slowMs: 0,
    approach: createApproach(0, FIRST_BEACON_AT),
    destinationAt: null,
  }
}

export function steer(flight: Flight, direction: 'up' | 'down'): Flight {
  const lane = Math.min(2, Math.max(0, flight.lane + (direction === 'up' ? -1 : 1))) as Lane
  return lane === flight.lane ? flight : { ...flight, lane }
}

/** The lane the autopilot wants: the beacon's lane, except while an obstacle there is close. */
export function autopilotLane(flight: Flight): Lane {
  const { approach } = flight
  if (!approach) return flight.lane
  const obstacleAhead =
    !approach.obstaclePassed && approach.obstacleAt - flight.distance < AUTOPILOT_LOOKAHEAD
  if (!obstacleAhead) return approach.beaconLane
  return approach.obstacleLane === 1 ? 0 : 1
}

/** Advances the flight by `dtMs`. Fires at most one event per step. */
export function stepFlight(flight: Flight, dtMs: number): { flight: Flight; event: FlightEvent } {
  if (flight.destinationAt !== null && flight.distance >= flight.destinationAt)
    return { flight, event: null }

  const speed = flight.slowMs > 0 ? SPEED * SLOW_FACTOR : SPEED
  const moved: Flight = {
    ...flight,
    distance: flight.distance + (speed * dtMs) / 1000,
    slowMs: Math.max(0, flight.slowMs - dtMs),
  }
  const { approach, distance, lane } = moved

  if (approach && !approach.obstaclePassed && distance >= approach.obstacleAt) {
    const passed = { ...moved, approach: { ...approach, obstaclePassed: true } }
    if (lane !== approach.obstacleLane) return { flight: passed, event: null }
    return {
      flight: { ...passed, slowMs: SLOW_MS },
      event: { type: 'hit', kind: approach.obstacleKind },
    }
  }

  if (approach && distance >= approach.beaconAt) {
    if (lane !== approach.beaconLane)
      return {
        flight: { ...moved, approach: createApproach(approach.index, distance + GAP) },
        event: { type: 'missed' },
      }
    const next = approach.index + 1
    const last = next >= BEACONS
    return {
      flight: {
        ...moved,
        approach: last ? null : createApproach(next, distance + GAP),
        destinationAt: last ? distance + GAP : null,
      },
      event: { type: 'collected', index: approach.index },
    }
  }

  if (moved.destinationAt !== null && distance >= moved.destinationAt)
    return { flight: { ...moved, distance: moved.destinationAt }, event: { type: 'arrived' } }

  return { flight: moved, event: null }
}
