import type { Beacon } from './types'

export const beacons: readonly Beacon[] = [
  {
    id: 'paper-plane',
    name: 'Paper plane',
    headline: 'Where it all took off',
    story:
      "I've been fascinated by aviation for as long as I can remember. These days I fly drones myself.",
  },
  {
    id: 'control-system',
    name: 'Control system',
    headline: 'Still running',
    story:
      "For almost ten years I built and maintained a building control system. Software isn't done when it ships. It's done when it keeps running.",
  },
  {
    id: 'curious-bug',
    name: 'Curious bug',
    headline: 'A bug in the rotor? Of course.',
    story:
      "Sometimes the interesting part starts when something doesn't work. I like understanding why.",
  },
  // In reserve: not in the playthrough, ready to swap in.
  {
    id: 'plc-module',
    name: 'PLC module',
    headline: 'Hardware first',
    story:
      'I started as an automation technician, wiring PLCs and building automation. Then I taught myself software and never looked back.',
  },
  {
    id: 'microcontroller',
    name: 'Microcontroller',
    headline: 'Tiny chip, big curiosity',
    story:
      'In my free time I tinker with microcontrollers, cameras and drones. I like knowing how things work off the screen, too.',
  },
  {
    id: 'padlock',
    name: 'Padlock',
    headline: 'A safe flight path',
    story:
      'I completed a CAS in Cyber Security. Data deserves a safe flight path, just like drones do.',
  },
  {
    id: 'northern-tailwind',
    name: 'Northern tailwind',
    headline: 'Already in Sweden',
    story: "In July 2026, my family and I moved from Switzerland to Sweden. We're here to stay.",
  },
]

/** The three beacons of a playthrough, in order. */
export const playthrough: readonly string[] = ['paper-plane', 'control-system', 'curious-bug']

export function getBeacon(id: string): Beacon {
  const found = beacons.find((b) => b.id === id)
  if (!found) throw new Error(`Unknown beacon: ${id}`)
  return found
}
