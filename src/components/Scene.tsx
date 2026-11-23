import type { Lane } from '../game/flight'
import { WINCH_FULL } from '../game/reducer'
import type { GameState } from '../game/types'
import { AedBox } from './scene/AedBox'
import { Backdrop } from './scene/Backdrop'
import { Beacon } from './scene/Beacon'
import { Destination } from './scene/Destination'
import { Drone } from './scene/Drone'
import { Obstacle } from './scene/Obstacle'

/** Scene coordinates: the SVG view box is 480 × 270, the ground line at y = 232. */
const DRONE_X = 110
const LANE_Y: Record<Lane, number> = { 0: 70, 1: 125, 2: 180 }
/** Centre of the destination marker, where the AED box comes to rest. */
const MARKER_Y = 238
const PARKED_Y = 214
const HOVER_Y = 110
/** Cable length at which the AED box rests on the marker (box hangs 5 below the body, 14 tall). */
const CABLE_TO_GROUND = MARKER_Y - HOVER_Y - 19
const AED_HEIGHT = 14

type Props = {
  readonly state: GameState
  readonly label: string
  /** Stops the parallax scroll; the drone still moves through the route. */
  readonly reducedMotion: boolean
}

function droneY(state: GameState): number {
  switch (state.phase) {
    case 'dispatch':
    case 'preflight':
      return PARKED_Y
    case 'winch':
    case 'finale':
      return HOVER_Y
    default:
      return LANE_Y[state.flight.lane]
  }
}

/** The whole picture, derived from state on each render. Positions never feed back into state. */
export function Scene({ state, label, reducedMotion }: Props) {
  const { flight, phase } = state
  const ahead = (at: number) => DRONE_X + at - flight.distance
  const { approach, destinationAt } = flight
  const delivered = phase === 'finale'
  const airborne = phase !== 'dispatch' && phase !== 'preflight'
  const cable = phase === 'winch' ? (state.winch / WINCH_FULL) * CABLE_TO_GROUND : 0

  return (
    <svg
      className="scene"
      viewBox="0 0 480 270"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={label}
    >
      <Backdrop offset={reducedMotion ? 0 : flight.distance} />
      {destinationAt !== null && <Destination x={ahead(destinationAt)} />}
      {approach && airborne && (
        <>
          <Obstacle
            kind={approach.obstacleKind}
            x={ahead(approach.obstacleAt)}
            y={LANE_Y[approach.obstacleLane]}
          />
          <Beacon x={ahead(approach.beaconAt)} y={LANE_Y[approach.beaconLane]} />
        </>
      )}
      {delivered && <AedBox x={DRONE_X} y={MARKER_Y - AED_HEIGHT} />}
      <Drone
        x={DRONE_X}
        y={droneY(state)}
        wobble={phase === 'flight' && flight.slowMs > 0}
        cable={cable}
        carrying={!delivered}
      />
    </svg>
  )
}
