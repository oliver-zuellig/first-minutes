import '../scene.css'

const GROUND_Y = 232

type ObstacleProps = { kind: 'gust' | 'birds' | 'crane'; x: number; y: number }

/** Swirling wind lines, roughly 44x26 around the origin. */
function Gust() {
  return (
    <>
      <path
        className="scene-gust-line scene-gust-line--grey"
        d="M-22-7H6C11.5-7 14-10.5 12.5-13.5C11-16 7-15.5 6.5-12.5"
      />
      <path
        className="scene-gust-line scene-gust-line--white"
        d="M-18 1H16C21.5 1 23.5 5 21.5 8C19.5 10.5 15.5 9.5 15.5 7"
      />
      <path className="scene-gust-line scene-gust-line--grey" d="M-14 9H2C5 9 6.5 11 5.5 13" />
    </>
  )
}

const WING = 'M-6 0Q-3-4 0 0Q3-4 6 0'

/** Three small birds in a loose flock, roughly 40x18 around the origin. */
function Birds() {
  return (
    <>
      <path className="scene-bird" d={WING} transform="translate(-12 -4)" />
      <path className="scene-bird" d={WING} transform="translate(6 -9) scale(0.85)" />
      <path className="scene-bird" d={WING} transform="translate(12 6) scale(0.9)" />
    </>
  )
}

/** Tower crane: jib at local y 0, mast reaching down `height` px to the ground. */
function Crane({ height }: { height: number }) {
  const mastTop = -10
  const mastBottom = Math.max(height, 8)
  const step = 8
  const zigzag: string[] = []
  for (let yy = mastTop, i = 0; yy < mastBottom; yy += step, i++) {
    const next = Math.min(yy + step, mastBottom)
    zigzag.push(i % 2 === 0 ? `M-2.5 ${yy}L2.5 ${next}` : `M2.5 ${yy}L-2.5 ${next}`)
  }
  return (
    <>
      {/* Mast */}
      <rect className="scene-crane" x={-3.5} y={mastTop} width={7} height={mastBottom - mastTop} />
      <path className="scene-crane-lattice" d={zigzag.join('')} />
      <rect className="scene-crane-shade" x={-6} y={mastBottom - 3} width={12} height={3} />
      {/* Apex and tie lines */}
      <path className="scene-crane" d="M-2.5-1L0-12L2.5-1Z" />
      <path className="scene-crane-line" d="M0-12L-24-1M0-12L18-1" />
      {/* Jib and counter-jib */}
      <rect className="scene-crane" x={-26} y={-2} width={46} height={4} rx={1} />
      <path
        className="scene-crane-lattice"
        d="M-24-2L-20 2L-16-2L-12 2L-8-2L-4 2M4 2L8-2L12 2L16-2"
      />
      <rect className="scene-crane-weight" x={12} y={2} width={8} height={6} rx={1} />
      {/* Cab */}
      <rect className="scene-crane-shade" x={-7} y={2} width={6} height={6} rx={1} />
      {/* Hook */}
      <path className="scene-crane-line" d="M-19 2V16" />
      <path className="scene-crane-line" d="M-19 16V19A2 2 0 0 1-23 19" />
    </>
  )
}

/** An obstacle the drone must dodge, about 40px wide around x, centered on lane y. */
export function Obstacle({ kind, x, y }: ObstacleProps) {
  return (
    <g aria-hidden="true" transform={`translate(${x} ${y})`}>
      {kind === 'gust' && <Gust />}
      {kind === 'birds' && <Birds />}
      {kind === 'crane' && <Crane height={GROUND_Y - y} />}
    </g>
  )
}
