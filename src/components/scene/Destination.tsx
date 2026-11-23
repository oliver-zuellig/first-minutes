import '../scene.css'

/** Vertical center of the landing marker on the lawn. */
const MARKER_Y = 238

/**
 * The delivery address: a painted ring-and-dot landing marker on the lawn, next to a small fence,
 * in front of whichever house of the town scrolls past. The marker is centered on x at y 238.
 */
export function Destination({ x }: { x: number }) {
  return (
    <g aria-hidden="true">
      <rect className="scene-fence" x={x - 44} y={226} width={24} height={1.5} />
      {[-44, -36, -28, -20].map((dx) => (
        <rect key={dx} className="scene-fence" x={x + dx} y={223} width={2} height={10} rx={0.5} />
      ))}
      <ellipse className="scene-marker" cx={x} cy={MARKER_Y} rx={17} ry={4.5} />
      <ellipse className="scene-marker-ring" cx={x} cy={MARKER_Y} rx={12} ry={3} />
      <ellipse className="scene-marker-dot" cx={x} cy={MARKER_Y} rx={3} ry={0.9} />
    </g>
  )
}
