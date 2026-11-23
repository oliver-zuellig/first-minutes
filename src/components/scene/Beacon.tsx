import { useId } from 'react'
import '../scene.css'

/** Glowing amber/white ring beacon (~26px across) centered on x, y, with a soft pulse. */
export function Beacon({ x, y }: { x: number; y: number }) {
  const glowId = `${useId()}-beacon-glow`
  return (
    <g aria-hidden="true" transform={`translate(${x} ${y})`}>
      <defs>
        <radialGradient id={glowId}>
          <stop className="scene-beacon-glow-inner" offset="0.35" />
          <stop className="scene-beacon-glow-outer" offset="1" />
        </radialGradient>
      </defs>
      <g className="scene-beacon">
        <circle cx={0} cy={0} r={13} fill={`url(#${glowId})`} />
        <circle className="scene-beacon-ring" cx={0} cy={0} r={8} />
        <circle className="scene-beacon-ring-inner" cx={0} cy={0} r={5.25} />
        <circle className="scene-beacon-core" cx={0} cy={0} r={2.5} />
      </g>
    </g>
  )
}
