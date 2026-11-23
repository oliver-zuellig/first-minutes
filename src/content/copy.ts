import type { CheckId } from '../game/types'

/**
 * The company this version of the game is for. A version for another company changes this and
 * the finale lines; the footer disclaimer follows automatically.
 */
export const company = 'Everdrone'

export const copy = {
  title: 'First Minutes',
  subtitle: 'A small drone game about getting there first.',
  dispatch: {
    label: 'Dispatch centre',
    lines: [
      '112 call received: suspected cardiac arrest.',
      'Ambulance on its way.',
      'A drone with a defibrillator can fly ahead.',
    ],
  },
  preflight: {
    heading: 'Pre-flight check',
    intro: 'Safety first. Tick each check before take-off.',
    checks: {
      wind: 'Wind within limits',
      battery: 'Battery full',
      airspace: 'Airspace cleared',
    } satisfies Record<CheckId, string>,
  },
  actions: {
    dispatch: 'Dispatch drone',
    takeOff: 'Take off',
    climb: 'Climb',
    descend: 'Descend',
    autopilot: 'Autopilot',
    continueFlight: 'Continue flight',
    lower: 'Lower AED',
    meetOliver: 'Meet Oliver',
    viewCode: 'View the code',
    replay: 'Fly again',
  },
  flight: {
    hint: 'Fly through the glowing beacons. Climb or descend to dodge what is in your lane.',
    keys: 'Keys: ↑ / ↓ or W / S',
    hit: 'Small detour. The drone steadies itself.',
    missed: 'Beacon missed. Circling back for it.',
    progress: (collected: number, total: number) => `Beacons ${collected} of ${total}`,
  },
  winch: {
    hint: 'On site. Lower the defibrillator gently.',
    meter: 'Winch',
  },
  finale: {
    label: 'LiveView',
    headline: 'AED delivered.',
    lines: [
      'In the first minutes, every minute counts.',
      `The mission I'd like next: building the software behind those minutes, at ${company}.`,
      'Thanks for flying with me.',
    ],
  },
  /** Texts for the polite live region. */
  announcements: {
    beacon: (name: string, headline: string) => `${name}. ${headline}`,
    winch: 'Arrived on site. Ready to lower the defibrillator.',
    finale: 'AED delivered.',
  },
  sceneLabel: 'A delivery drone over a small town',
  footer: `An independent personal project by Oliver Züllig. Not affiliated with or endorsed by ${company}.`,
} as const
