import '../scene.css'

const HEART =
  'M0 3.4C-1.3 1.8-4.8-0.3-4.8-2.5C-4.8-4.1-3.5-5.1-2.2-5.1C-1.2-5.1-0.4-4.5 0-3.8C0.4-4.5 1.2-5.1 2.2-5.1C3.5-5.1 4.8-4.1 4.8-2.5C4.8-0.3 1.3 1.8 0 3.4Z'
const BOLT = 'M0.7-4.3L-1.7-0.7H-0.2L-0.9 2.1L1.7-1.5H0.2Z'

/** Generic AED case (18x14): green box, white heart with a small bolt. Centered on x, top at y. */
export function AedBox({ x, y }: { x: number; y: number }) {
  return (
    <g aria-hidden="true" transform={`translate(${x} ${y})`}>
      <path className="scene-aed-handle" d="M-3.5 1V-1.2H3.5V1" />
      <rect className="scene-aed-shade" x={-9} y={0} width={18} height={14} rx={2.5} />
      <rect className="scene-aed" x={-9} y={0} width={18} height={12.5} rx={2.5} />
      <g transform="translate(0 7.6)">
        <path className="scene-aed-heart" d={HEART} />
        <path className="scene-aed-bolt" d={BOLT} />
      </g>
    </g>
  )
}
