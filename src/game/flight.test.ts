import { describe, expect, it } from 'vitest'
import {
  BEACONS,
  FIRST_BEACON_AT,
  GAP,
  SLOW_MS,
  SPEED,
  autopilotLane,
  createFlight,
  steer,
  stepFlight,
  type Flight,
  type FlightEvent,
} from './flight'

const FRAME = 16

/** Steps the flight frame by frame until an event fires (or gives up after `maxMs`). */
function flyUntilEvent(
  flight: Flight,
  pilot: (f: Flight) => Flight = (f) => f,
  maxMs = 20_000,
): { flight: Flight; event: FlightEvent } {
  let current = flight
  for (let t = 0; t < maxMs; t += FRAME) {
    const result = stepFlight(pilot(current), FRAME)
    current = result.flight
    if (result.event) return { flight: current, event: result.event }
  }
  throw new Error('no event')
}

const onAutopilot = (f: Flight): Flight => ({ ...f, lane: autopilotLane(f) })

describe('stepFlight', () => {
  it('starts in the middle lane before the first beacon', () => {
    const flight = createFlight()
    expect(flight.lane).toBe(1)
    expect(flight.distance).toBe(0)
    expect(flight.approach?.index).toBe(0)
    expect(flight.approach?.beaconAt).toBe(FIRST_BEACON_AT)
  })

  it('moves forward with the elapsed time', () => {
    const { flight, event } = stepFlight(createFlight(), 1000)
    expect(flight.distance).toBe(SPEED)
    expect(event).toBeNull()
  })

  it('wobbles and slows down when it meets an obstacle in its lane', () => {
    const start = createFlight()
    const approach = start.approach!
    const inObstacleLane = { ...start, lane: approach.obstacleLane }
    const { flight, event } = flyUntilEvent(inObstacleLane)
    expect(event).toEqual({ type: 'hit', kind: approach.obstacleKind })
    expect(flight.slowMs).toBe(SLOW_MS)

    const slowed = stepFlight(flight, 100).flight
    expect(slowed.distance - flight.distance).toBeLessThan((SPEED * 100) / 1000)
  })

  it('collects the beacon when it is in the beacon lane, after dodging the obstacle', () => {
    let flight = createFlight()
    const { beaconLane, obstacleAt } = flight.approach!
    // Dodge first: one lane up.
    flight = steer(flight, 'up')
    while (flight.distance < obstacleAt) flight = stepFlight(flight, FRAME).flight
    flight = { ...flight, lane: beaconLane }
    const result = flyUntilEvent(flight)
    expect(result.event).toEqual({ type: 'collected', index: 0 })
    expect(result.flight.approach?.index).toBe(1)
  })

  it('circles back to a missed beacon instead of failing', () => {
    const start = createFlight()
    const wrongLane = (start.approach!.beaconLane + 1) % 3
    const pilot = (f: Flight): Flight => ({ ...f, lane: wrongLane as Flight['lane'] })
    // Skip the obstacle event if the wrong lane happens to hold it.
    let result = flyUntilEvent(start, pilot)
    if (result.event?.type === 'hit') result = flyUntilEvent(result.flight, pilot)
    expect(result.event).toEqual({ type: 'missed' })
    expect(result.flight.approach?.index).toBe(0)
    expect(result.flight.approach!.beaconAt).toBeCloseTo(result.flight.distance + GAP, 5)
  })

  it('flies the whole route on autopilot: every beacon, no obstacle, then arrival', () => {
    let flight = createFlight()
    const events: FlightEvent[] = []
    for (let i = 0; i < BEACONS + 1; i++) {
      const result = flyUntilEvent(flight, onAutopilot)
      events.push(result.event)
      flight = result.flight
    }
    expect(events).toEqual([
      { type: 'collected', index: 0 },
      { type: 'collected', index: 1 },
      { type: 'collected', index: 2 },
      { type: 'arrived' },
    ])
    expect(flight.approach).toBeNull()
    expect(flight.distance).toBe(flight.destinationAt)
  })

  it('stays put after arrival', () => {
    let flight = createFlight()
    for (let i = 0; i < BEACONS + 1; i++) flight = flyUntilEvent(flight, onAutopilot).flight
    const after = stepFlight(flight, 1000)
    expect(after.flight.distance).toBe(flight.distance)
    expect(after.event).toBeNull()
  })
})

describe('steer', () => {
  it('moves one lane and stops at the edges', () => {
    const flight = createFlight()
    expect(steer(flight, 'up').lane).toBe(0)
    expect(steer(steer(flight, 'up'), 'up').lane).toBe(0)
    expect(steer(flight, 'down').lane).toBe(2)
    expect(steer(steer(flight, 'down'), 'down').lane).toBe(2)
  })
})
