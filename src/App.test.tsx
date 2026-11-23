import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from './App'
import { getBeacon, playthrough } from './content/beacons'
import { copy } from './content/copy'
import { codeUrl, profile } from './content/profile'
import { WINCH_FULL, WINCH_STEP } from './game/reducer'

type User = ReturnType<typeof userEvent.setup>

function setup(): User {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
  render(<App />)
  return user
}

function button(name: string) {
  return screen.getByRole('button', { name })
}

/** Advances the fake clock in frame-sized steps, so the flight loop runs like in a browser. */
function fly(ms: number) {
  for (let t = 0; t < ms; t += 16) act(() => void vi.advanceTimersByTime(16))
}

async function takeOff(user: User) {
  await user.click(button(copy.actions.dispatch))
  for (const label of Object.values(copy.preflight.checks)) await user.click(button(label))
  await user.click(button(copy.actions.takeOff))
}

/** Flies on autopilot until the next beacon card or the winch shows up. */
function flyToNextStop() {
  for (let i = 0; i < 400; i++) {
    if (screen.queryByRole('article') || screen.queryByRole('progressbar')) return
    fly(100)
  }
  throw new Error('the drone never arrived anywhere')
}

beforeEach(() => {
  vi.useFakeTimers({
    shouldAdvanceTime: true,
    toFake: [
      'setTimeout',
      'clearTimeout',
      'setInterval',
      'clearInterval',
      'requestAnimationFrame',
      'cancelAnimationFrame',
      'performance',
      'Date',
    ],
  })
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('App', () => {
  it('shows the dispatch with title, the dispatch button and the disclaimer', () => {
    setup()
    expect(screen.getByRole('heading', { level: 1, name: copy.title })).toBeInTheDocument()
    for (const line of copy.dispatch.lines) expect(screen.getByText(line)).toBeInTheDocument()
    expect(button(copy.actions.dispatch)).toBeInTheDocument()
    expect(screen.getByText(copy.footer)).toBeInTheDocument()
  })

  it('offers take-off only after every pre-flight check, then focuses it', async () => {
    const user = setup()
    await user.click(button(copy.actions.dispatch))
    const checks = Object.values(copy.preflight.checks)
    expect(button(checks[0]!)).toHaveFocus()
    for (const label of checks.slice(0, -1)) await user.click(button(label))
    expect(screen.queryByRole('button', { name: copy.actions.takeOff })).not.toBeInTheDocument()
    await user.click(button(checks.at(-1)!))
    expect(button(checks[0]!)).toHaveAttribute('aria-pressed', 'true')
    expect(button(copy.actions.takeOff)).toHaveFocus()
  })

  it('flies through three beacons on autopilot, lowers the AED and replays', async () => {
    const user = setup()
    await takeOff(user)
    await user.click(button(copy.actions.autopilot))
    expect(button(copy.actions.autopilot)).toHaveAttribute('aria-pressed', 'true')

    for (const id of playthrough) {
      flyToNextStop()
      const card = screen.getByRole('article')
      const beacon = getBeacon(id)
      expect(within(card).getByRole('heading', { name: beacon.headline })).toBeInTheDocument()
      expect(screen.getByRole('status')).toHaveTextContent(beacon.headline)
      expect(button(copy.actions.continueFlight)).toHaveFocus()
      await user.click(button(copy.actions.continueFlight))
    }

    flyToNextStop()
    expect(screen.getByRole('progressbar', { name: copy.winch.meter })).toBeInTheDocument()
    for (let i = 0; i < WINCH_FULL / WINCH_STEP; i++) await user.click(button(copy.actions.lower))

    expect(screen.getByRole('heading', { name: copy.finale.headline })).toHaveFocus()
    for (const line of copy.finale.lines) expect(screen.getByText(line)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: copy.actions.viewCode })).toHaveAttribute(
      'href',
      codeUrl,
    )

    await user.click(button(copy.actions.replay))
    expect(button(copy.actions.dispatch)).toBeInTheDocument()
  })

  it('steers with the arrow keys and hands over from the autopilot', async () => {
    const user = setup()
    await takeOff(user)
    await user.click(button(copy.actions.autopilot))
    await user.keyboard('{ArrowUp}')
    expect(button(copy.actions.autopilot)).toHaveAttribute('aria-pressed', 'false')
  })

  it('lowers the AED on its own if nobody presses', async () => {
    const user = setup()
    await takeOff(user)
    await user.click(button(copy.actions.autopilot))
    for (let i = 0; i < playthrough.length; i++) {
      flyToNextStop()
      await user.click(button(copy.actions.continueFlight))
    }
    flyToNextStop()
    fly(7000)
    expect(screen.getByRole('heading', { name: copy.finale.headline })).toBeInTheDocument()
  })

  it('opens the profile from the header at any time and returns focus', async () => {
    const user = setup()
    await takeOff(user)
    const opener = within(screen.getByRole('banner')).getByRole('button', {
      name: copy.actions.meetOliver,
    })
    await user.click(opener)
    expect(screen.getByRole('dialog', { name: profile.heading })).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(opener).toHaveFocus()
  })
})
