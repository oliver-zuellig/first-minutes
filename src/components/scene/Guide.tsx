import type { CSSProperties } from 'react'
import '../scene.css'

/** Beyond this x the beacon is not on screen yet (also on phones, where the sides are cropped). */
const EDGE_X = 412
/** The arrow sits just in front of the drone; the guide line starts behind it. */
const ARROW_DX = 44
const LINE_DX = 56
const BEACON_RADIUS = 14
/** Nudges the arrow toward its tip; the down arrow is the mirrored up arrow. */
const NUDGE = { '--nudge': '-3px' } as CSSProperties

type Props = {
  readonly droneX: number
  readonly droneY: number
  readonly beaconX: number
  readonly beaconY: number
  readonly direction: 'up' | 'down' | 'hold'
}

/**
 * Shows the pilot where to fly: an arrow in front of the drone toward the beacon's lane, a dashed
 * line to the beacon once it is in view, and a marker at the right edge while it is still ahead.
 */
export function Guide({ droneX, droneY, beaconX, beaconY, direction }: Props) {
  const inView = beaconX <= EDGE_X
  const lineEnd = beaconX - BEACON_RADIUS
  const lineStart = droneX + (direction === 'hold' ? ARROW_DX - 10 : LINE_DX)

  return (
    <g aria-hidden="true">
      {inView && lineEnd > lineStart && (
        <path className="scene-guide-line" d={`M${lineStart} ${droneY} L${lineEnd} ${beaconY}`} />
      )}
      {!inView && (
        <path className="scene-guide-edge" d={`M${EDGE_X + 10} ${beaconY} l-12 -8 v16 z`} />
      )}
      {direction !== 'hold' && (
        <g
          transform={`translate(${droneX + ARROW_DX} ${droneY}) scale(1 ${direction === 'up' ? 1 : -1})`}
        >
          <path className="scene-guide-arrow" style={NUDGE} d="M0 -11 l9 9 h-5 v9 h-8 v-9 h-5 z" />
        </g>
      )}
    </g>
  )
}
