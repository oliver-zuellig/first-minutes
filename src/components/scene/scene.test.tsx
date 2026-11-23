import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { describe, expect, it } from 'vitest'
import { AedBox } from './AedBox'
import { Backdrop } from './Backdrop'
import { Beacon } from './Beacon'
import { Destination } from './Destination'
import { Drone } from './Drone'
import { Guide } from './Guide'
import { Obstacle } from './Obstacle'

const cases: [string, () => ReactElement][] = [
  ['Backdrop', () => <Backdrop offset={1234} />],
  ['Drone', () => <Drone x={110} y={125} wobble={false} cable={0} carrying={false} />],
  ['Drone carrying with wobble', () => <Drone x={110} y={70} wobble cable={40} carrying />],
  ['AedBox', () => <AedBox x={200} y={218} />],
  ['Obstacle gust', () => <Obstacle kind="gust" x={300} y={70} />],
  ['Obstacle birds', () => <Obstacle kind="birds" x={300} y={125} />],
  ['Obstacle crane', () => <Obstacle kind="crane" x={300} y={180} />],
  ['Beacon', () => <Beacon x={250} y={125} />],
  ['Destination', () => <Destination x={380} />],
  [
    'Guide ahead',
    () => <Guide droneX={110} droneY={125} beaconX={600} beaconY={70} direction="up" />,
  ],
  [
    'Guide in view',
    () => <Guide droneX={110} droneY={125} beaconX={300} beaconY={125} direction="hold" />,
  ],
]

describe('scene artwork', () => {
  it.each(cases)('%s renders a decorative root group', (_name, draw) => {
    const { container } = render(<svg viewBox="0 0 480 270">{draw()}</svg>)
    const root = container.querySelector('svg > g')
    expect(root).not.toBeNull()
    expect(root).toHaveAttribute('aria-hidden', 'true')
  })

  it('uses unique gradient ids per instance', () => {
    const { container } = render(
      <svg>
        <Backdrop offset={0} />
        <Backdrop offset={10} />
        <Beacon x={0} y={0} />
        <Beacon x={10} y={0} />
      </svg>,
    )
    const ids = [...container.querySelectorAll('[id]')].map((el) => el.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('hangs the AED box below the drone body by the cable length', () => {
    const { container } = render(
      <svg>
        <Drone x={110} y={125} wobble={false} cable={30} carrying />
      </svg>,
    )
    expect(container.querySelector('line.scene-cable')).toHaveAttribute('y2', '35')
  })
})
