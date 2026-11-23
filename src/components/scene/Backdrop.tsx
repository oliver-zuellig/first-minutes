import { useId } from 'react'
import '../scene.css'

const TILE = 480
const GROUND_Y = 232

type HouseTone = 'birch' | 'ochre' | 'sea' | 'rust'

type HouseProps = {
  /** Left edge of the wall. */
  x: number
  w: number
  h: number
  roof: number
  tone: HouseTone
  chimney?: boolean
  /** Ground line the house stands on (defaults to the scene ground line). */
  base?: number
}

/** Flat pitched-roof house standing on the ground line. Shared by Backdrop and Destination. */
function House({ x, w, h, roof, tone, chimney = false, base = GROUND_Y }: HouseProps) {
  const top = base - h
  const windows = w >= 40 ? [x + w * 0.18, x + w * 0.66] : [x + w * 0.2]
  const door = w >= 40 ? x + w * 0.43 : x + w * 0.58
  return (
    <g>
      {chimney && (
        <rect
          className="scene-roof"
          x={x + w * 0.68}
          y={top - roof * 0.9}
          width={4}
          height={roof}
        />
      )}
      <rect className={`scene-wall--${tone}`} x={x} y={top} width={w} height={h} />
      <path
        className="scene-roof"
        d={`M${x - 3} ${top + 1}L${x + w / 2} ${top - roof}L${x + w + 3} ${top + 1}Z`}
      />
      {windows.map((wx) => (
        <rect
          key={wx}
          className="scene-window"
          x={wx}
          y={top + Math.min(7, h * 0.25)}
          width={6}
          height={7}
          rx={1}
        />
      ))}
      <rect className="scene-door" x={door} y={base - 11} width={6} height={11} rx={1} />
    </g>
  )
}

/** Two-tone flat pine tree of height `h` standing on the ground line. */
function Pine({ x, h, base = GROUND_Y }: { x: number; h: number; base?: number }) {
  const half = h * 0.26
  const foot = base - 3
  return (
    <g>
      <rect className="scene-trunk" x={x - 1.5} y={foot - 1} width={3} height={4} />
      <path
        className="scene-pine"
        d={`M${x - half} ${foot}L${x} ${base - h}L${x + half} ${foot}Z`}
      />
      <path className="scene-pine-shade" d={`M${x} ${base - h}L${x + half} ${foot}H${x}Z`} />
    </g>
  )
}

function Cloud({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g className="scene-cloud" transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-26} y={-2} width={52} height={10} rx={5} />
      <circle cx={-8} cy={-2} r={8} />
      <circle cx={7} cy={-5} r={10} />
    </g>
  )
}

const FAR_TREES: readonly [number, number][] = [
  [52, 186],
  [61, 184],
  [70, 186],
  [214, 196],
  [298, 186],
  [306, 184],
  [314, 185],
  [430, 194],
  [438, 195],
]

/** Distant hills, tree lines and clouds; one 480px tile. */
function FarTile() {
  return (
    <g>
      <Cloud x={92} y={56} s={1} />
      <Cloud x={262} y={102} s={0.6} />
      <Cloud x={350} y={36} s={0.8} />
      <path
        className="scene-hill-far"
        d="M0 172C50 172 80 150 130 150S210 178 260 176S340 146 390 152S450 172 480 172V232H0Z"
      />
      {FAR_TREES.map(([tx, ty]) => (
        <path
          key={tx}
          className="scene-tree-far"
          d={`M${tx - 3.5} ${ty + 6}L${tx} ${ty - 10}L${tx + 3.5} ${ty + 6}Z`}
        />
      ))}
      <path
        className="scene-hill-mid"
        d="M0 198C40 198 70 184 120 186S200 204 250 200S330 182 380 188S450 198 480 198V232H0Z"
      />
    </g>
  )
}

const HOUSES: readonly HouseProps[] = [
  { x: 34, w: 40, h: 24, roof: 16, tone: 'birch', chimney: true },
  { x: 122, w: 30, h: 28, roof: 14, tone: 'rust' },
  { x: 168, w: 50, h: 22, roof: 18, tone: 'sea' },
  { x: 254, w: 28, h: 32, roof: 14, tone: 'birch' },
  { x: 332, w: 44, h: 24, roof: 17, tone: 'ochre', chimney: true },
  { x: 392, w: 32, h: 28, roof: 14, tone: 'birch' },
]

const PINES: readonly [number, number][] = [
  [16, 44],
  [86, 36],
  [99, 50],
  [234, 42],
  [298, 54],
  [311, 38],
  [442, 46],
  [459, 34],
]

/** Near town: houses, pines and ground details; one 480px tile. */
function NearTile() {
  return (
    <g>
      {HOUSES.map((house) => (
        <House key={house.x} {...house} />
      ))}
      {PINES.map(([px, ph]) => (
        <Pine key={px} x={px} h={ph} />
      ))}
      {Array.from({ length: 12 }, (_, i) => (
        <rect
          key={i}
          className="scene-road-mark"
          x={i * 40 + 8}
          y={251.25}
          width={16}
          height={1.5}
          rx={0.75}
        />
      ))}
    </g>
  )
}

/** Wraps a layer offset into one tile width, so two side-by-side tiles loop seamlessly. */
function wrap(distance: number) {
  const shift = distance % TILE
  return shift < 0 ? shift + TILE : shift
}

/**
 * Full 480x270 sky with parallax far hills (0.3x) and near town (1x) over a ground strip from
 * y 232 down. `offset` is the distance flown in px.
 */
export function Backdrop({ offset }: { offset: number }) {
  const skyId = `${useId()}-sky`
  const far = -wrap(offset * 0.3)
  const near = -wrap(offset)
  return (
    <g aria-hidden="true">
      <defs>
        <linearGradient id={skyId} x1="0" y1="0" x2="0" y2="1">
          <stop className="scene-sky-top" offset="0" />
          <stop className="scene-sky-bottom" offset="0.85" />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={TILE} height={270} fill={`url(#${skyId})`} />
      <circle className="scene-sun" cx={392} cy={74} r={22} />
      <g transform={`translate(${far} 0)`}>
        <FarTile />
        <g transform={`translate(${TILE} 0)`}>
          <FarTile />
        </g>
      </g>
      <rect className="scene-ground" x={0} y={GROUND_Y} width={TILE} height={270 - GROUND_Y} />
      <rect className="scene-ground-edge" x={0} y={GROUND_Y} width={TILE} height={3} />
      <rect className="scene-road" x={0} y={246} width={TILE} height={10} />
      <g transform={`translate(${near} 0)`}>
        <NearTile />
        <g transform={`translate(${TILE} 0)`}>
          <NearTile />
        </g>
      </g>
    </g>
  )
}
