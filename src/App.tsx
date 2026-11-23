import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  BeaconCard,
  DispatchPanel,
  FinalePanel,
  FlightPanel,
  PreflightPanel,
  WinchPanel,
} from './components/Panels'
import { ProfilePanel } from './components/ProfilePanel'
import { Scene } from './components/Scene'
import { useReducedMotion } from './components/useReducedMotion'
import { getBeacon, playthrough } from './content/beacons'
import { copy } from './content/copy'
import { codeUrl } from './content/profile'
import { usePlaythrough, type Controls } from './game/loop'
import type { GameState, Phase } from './game/types'

function announcementFor(state: GameState): string {
  switch (state.phase) {
    case 'beacon': {
      const beacon = getBeacon(state.collectedIds.at(-1)!)
      return copy.announcements.beacon(beacon.name, beacon.headline)
    }
    case 'winch':
      return copy.announcements.winch
    case 'finale':
      return copy.announcements.finale
    case 'flight':
      return state.notice ? copy.flight[state.notice] : ''
    default:
      return ''
  }
}

/**
 * After each step the pressed button disappears. Move focus to the next action (or the finale
 * heading, or the panel while flying), but only if focus was in the game or got lost: never pull
 * it out of the profile dialog or the header. The first render leaves focus alone.
 */
function useFocusFollowsPhase(phase: Phase) {
  const panelRef = useRef<HTMLDivElement>(null)
  const actionRef = useRef<HTMLButtonElement>(null)
  const finaleRef = useRef<HTMLHeadingElement>(null)
  const previousPhase = useRef(phase)

  useLayoutEffect(() => {
    if (previousPhase.current === phase) return
    previousPhase.current = phase
    const panel = panelRef.current
    if (!panel) return
    const active = document.activeElement
    const lost = !active || active === document.body
    if (!lost && !panel.contains(active)) return
    ;(actionRef.current ?? finaleRef.current ?? panel).focus()
  }, [phase])

  return { panelRef, actionRef, finaleRef }
}

const STEER_KEYS: Record<string, 'climb' | 'descend'> = {
  ArrowUp: 'climb',
  w: 'climb',
  W: 'climb',
  ArrowDown: 'descend',
  s: 'descend',
  S: 'descend',
}

/** Arrow keys and W/S steer while flying, unless a dialog is open. */
function useSteeringKeys(active: boolean, controls: Controls) {
  useEffect(() => {
    if (!active) return
    const onKey = (event: KeyboardEvent) => {
      const move = STEER_KEYS[event.key]
      if (!move || event.altKey || event.ctrlKey || event.metaKey) return
      event.preventDefault()
      controls[move]()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, controls])
}

export function App() {
  const reducedMotion = useReducedMotion()
  const { state, controls } = usePlaythrough(playthrough)
  const [profileOpen, setProfileOpen] = useState(false)
  const openProfile = () => setProfileOpen(true)
  const { phase } = state
  const { panelRef, actionRef, finaleRef } = useFocusFollowsPhase(phase)
  useSteeringKeys(phase === 'flight' && !profileOpen, controls)

  return (
    <div className="app">
      <header className="site-header">
        <div>
          <h1 className="site-header__title">{copy.title}</h1>
          <p className="site-header__subtitle">{copy.subtitle}</p>
        </div>
        <button type="button" className="button button--secondary" onClick={openProfile}>
          {copy.actions.meetOliver}
        </button>
      </header>

      <main className="game">
        <div className="stage">
          <Scene state={state} label={copy.sceneLabel} reducedMotion={reducedMotion} />

          <p role="status" className="visually-hidden">
            {announcementFor(state)}
          </p>

          <div ref={panelRef} className="game__panel" tabIndex={-1}>
            {phase === 'dispatch' && (
              <DispatchPanel actionRef={actionRef} onDispatch={controls.dispatchDrone} />
            )}
            {phase === 'preflight' && (
              <PreflightPanel
                actionRef={actionRef}
                checks={state.checks}
                onCheck={controls.check}
                onTakeOff={controls.takeOff}
              />
            )}
            {phase === 'flight' && (
              <FlightPanel
                collected={state.collectedIds.length}
                notice={state.notice}
                autopilot={state.autopilot}
                onClimb={controls.climb}
                onDescend={controls.descend}
                onAutopilot={controls.toggleAutopilot}
              />
            )}
            {phase === 'beacon' && (
              <BeaconCard
                actionRef={actionRef}
                beacon={getBeacon(state.collectedIds.at(-1)!)}
                onContinue={controls.continueFlight}
              />
            )}
            {phase === 'winch' && (
              <WinchPanel actionRef={actionRef} winch={state.winch} onLower={controls.lower} />
            )}
            {phase === 'finale' && (
              <FinalePanel
                headingRef={finaleRef}
                codeUrl={codeUrl}
                onMeetOliver={openProfile}
                onReplay={controls.replay}
              />
            )}
          </div>
        </div>
      </main>

      <footer className="site-footer">
        <p>{copy.footer}</p>
      </footer>

      <ProfilePanel open={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  )
}
