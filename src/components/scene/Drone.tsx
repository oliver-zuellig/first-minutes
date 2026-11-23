import { AedBox } from './AedBox'
import '../scene.css'

type DroneProps = {
  x: number
  y: number
  wobble: boolean
  /** Cable length in px below the body; 0 keeps the box tucked under the body. */
  cable: number
  carrying: boolean
}

/** Bottom edge of the drone body in local coordinates; the cable starts here. */
const BODY_BOTTOM = 5

/**
 * Generic side-view quadcopter (~60px wide), centered on x, y. Optionally carries the AED box
 * on a cable. The position eases between lanes via a CSS transition on the outer group.
 */
export function Drone({ x, y, wobble, cable, carrying }: DroneProps) {
  const length = Math.max(0, cable)
  const tiltClass = wobble ? 'scene-drone-tilt scene-drone--wobble' : 'scene-drone-tilt'
  return (
    <g
      aria-hidden="true"
      className="scene-drone"
      style={{ transform: `translate(${x}px, ${y}px)` }}
    >
      {carrying && (
        <g>
          {length > 0 && (
            <line
              className="scene-cable"
              x1={0}
              y1={BODY_BOTTOM}
              x2={0}
              y2={BODY_BOTTOM + length}
            />
          )}
          <AedBox x={0} y={BODY_BOTTOM + length} />
        </g>
      )}
      <g className={tiltClass}>
        <path className="scene-drone-skid" d="M-8 4L-12 11M-16 11H-7M8 4L12 11M7 11H16" />
        <rect className="scene-drone-arm" x={-22} y={-8} width={44} height={2.5} rx={1.25} />
        <rect className="scene-drone-arm" x={-21} y={-12} width={2} height={5} />
        <rect className="scene-drone-arm" x={19} y={-12} width={2} height={5} />
        <ellipse className="scene-rotor-disc" cx={-20} cy={-12.5} rx={11} ry={2} />
        <ellipse className="scene-rotor-disc" cx={20} cy={-12.5} rx={11} ry={2} />
        <rect className="scene-rotor" x={-30} y={-13.5} width={20} height={2} rx={1} />
        <rect className="scene-rotor" x={10} y={-13.5} width={20} height={2} rx={1} />
        <rect className="scene-drone-body" x={-15} y={-6} width={30} height={11} rx={5.5} />
        <path className="scene-drone-shell" d="M-11-4.2H9.5A3.5 3.5 0 0 1 13-1.5H-12.5Z" />
        <circle className="scene-drone-light" cx={12} cy={1.5} r={1.5} />
      </g>
    </g>
  )
}
