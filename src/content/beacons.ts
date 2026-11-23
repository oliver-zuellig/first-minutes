import type { Beacon } from './types'

export const beacons: readonly Beacon[] = [
  {
    id: 'javascript',
    name: 'Beacon 1 · JavaScript',
    headline: 'Familiar airspace',
    story:
      'JavaScript and Node.js have been part of my daily work for years. I still enjoy discovering what else I can build with them.',
  },
  {
    id: 'control-system',
    name: 'Beacon 2 · Control systems',
    headline: 'Software that runs real things',
    story:
      'I moved our building management control system onto Docker and built the pipeline to deliver and update it. I learned that the work does not end when software is released.',
  },
  {
    id: 'sweden',
    name: 'Beacon 3 · Sweden',
    headline: 'Already in Sweden',
    story: 'Five years ago, living in Sweden felt far away. Now my family and I call Sweden home.',
  },
  {
    id: 'curious-bug',
    name: 'Beacon · Curious bug',
    headline: 'A bug? Of course.',
    story:
      "Sometimes the interesting part starts when something doesn't work. I like understanding why.",
  },
]

/** The three beacons of a playthrough, in order. */
export const playthrough: readonly string[] = ['javascript', 'control-system', 'sweden']

export function getBeacon(id: string): Beacon {
  const found = beacons.find((b) => b.id === id)
  if (!found) throw new Error(`Unknown beacon: ${id}`)
  return found
}
