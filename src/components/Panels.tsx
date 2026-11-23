import type { Ref } from 'react'
import { copy } from '../content/copy'
import type { Beacon } from '../content/types'
import { BEACONS } from '../game/flight'
import { CHECKS, WINCH_FULL } from '../game/reducer'
import type { CheckId, FlightNotice } from '../game/types'

type ActionRef = { readonly actionRef: Ref<HTMLButtonElement> }

/** Stable callback ref: React calls it once when the element mounts. */
const focusOnMount = (el: HTMLElement | null) => el?.focus()

export function DispatchPanel({ actionRef, onDispatch }: ActionRef & { onDispatch: () => void }) {
  return (
    <>
      <section className="dispatch-card" aria-label={copy.dispatch.label}>
        <p className="eyebrow">{copy.dispatch.label}</p>
        {copy.dispatch.lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </section>
      <button ref={actionRef} type="button" className="button" onClick={onDispatch}>
        {copy.actions.dispatch}
      </button>
    </>
  )
}

type PreflightProps = ActionRef & {
  checks: readonly CheckId[]
  onCheck: (check: CheckId) => void
  onTakeOff: () => void
}

/** Three checks, then take-off. Focus starts on the first check and lands on take-off. */
export function PreflightPanel({ actionRef, checks, onCheck, onTakeOff }: PreflightProps) {
  const done = checks.length === CHECKS.length
  return (
    <>
      <h2 className="panel-heading">{copy.preflight.heading}</h2>
      <p>{copy.preflight.intro}</p>
      <ul className="checklist">
        {CHECKS.map((id, i) => {
          const checked = checks.includes(id)
          return (
            <li key={id}>
              <button
                ref={i === 0 ? actionRef : undefined}
                type="button"
                className="check"
                aria-pressed={checked}
                onClick={() => onCheck(id)}
              >
                <span className="check__box" aria-hidden="true">
                  {checked ? '✓' : ''}
                </span>
                {copy.preflight.checks[id]}
              </button>
            </li>
          )
        })}
      </ul>
      {done && (
        <button type="button" className="button" onClick={onTakeOff} ref={focusOnMount}>
          {copy.actions.takeOff}
        </button>
      )}
    </>
  )
}

type FlightProps = {
  collected: number
  notice: FlightNotice
  autopilot: boolean
  onClimb: () => void
  onDescend: () => void
  onAutopilot: () => void
}

export function FlightPanel({
  collected,
  notice,
  autopilot,
  onClimb,
  onDescend,
  onAutopilot,
}: FlightProps) {
  return (
    <>
      <p className="eyebrow">{copy.flight.progress(collected, BEACONS)}</p>
      <p className="game__hint">{notice ? copy.flight[notice] : copy.flight.hint}</p>
      <div className="flight-controls">
        <button type="button" className="button button--steer" onClick={onClimb}>
          <span aria-hidden="true">▲</span> {copy.actions.climb}
        </button>
        <button type="button" className="button button--steer" onClick={onDescend}>
          <span aria-hidden="true">▼</span> {copy.actions.descend}
        </button>
        <button
          type="button"
          className="button button--secondary"
          aria-pressed={autopilot}
          onClick={onAutopilot}
        >
          {copy.actions.autopilot}
        </button>
      </div>
      <p className="game__keys">{copy.flight.keys}</p>
    </>
  )
}

export function BeaconCard({
  actionRef,
  beacon,
  onContinue,
}: ActionRef & { beacon: Beacon; onContinue: () => void }) {
  const headingId = `beacon-${beacon.id}-headline`
  return (
    <>
      <article className="beacon-card" aria-labelledby={headingId}>
        <p className="eyebrow">{beacon.name}</p>
        <h2 id={headingId} className="panel-heading">
          {beacon.headline}
        </h2>
        <p>{beacon.story}</p>
      </article>
      <button ref={actionRef} type="button" className="button" onClick={onContinue}>
        {copy.actions.continueFlight}
      </button>
    </>
  )
}

export function WinchPanel({
  actionRef,
  winch,
  onLower,
}: ActionRef & { winch: number; onLower: () => void }) {
  return (
    <>
      <p className="game__hint">{copy.winch.hint}</p>
      <div
        className="meter"
        role="progressbar"
        aria-label={copy.winch.meter}
        aria-valuemin={0}
        aria-valuemax={WINCH_FULL}
        aria-valuenow={winch}
      >
        <div className="meter__fill" style={{ width: `${(winch / WINCH_FULL) * 100}%` }} />
      </div>
      <button ref={actionRef} type="button" className="button" onClick={onLower}>
        {copy.actions.lower}
      </button>
    </>
  )
}

type FinaleProps = {
  headingRef: Ref<HTMLHeadingElement>
  codeUrl: string
  onMeetOliver: () => void
  onReplay: () => void
}

export function FinalePanel({ headingRef, codeUrl, onMeetOliver, onReplay }: FinaleProps) {
  return (
    <section className="finale" aria-labelledby="finale-headline">
      <p className="eyebrow eyebrow--live">
        <span className="live-dot" aria-hidden="true" /> {copy.finale.label}
      </p>
      <h2 ref={headingRef} id="finale-headline" className="finale__headline" tabIndex={-1}>
        {copy.finale.headline}
      </h2>
      <div className="finale__message">
        {copy.finale.lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
      <div className="finale__actions">
        <button type="button" className="button" onClick={onMeetOliver}>
          {copy.actions.meetOliver}
        </button>
        {codeUrl && (
          <a className="button button--secondary" href={codeUrl}>
            {copy.actions.viewCode}
          </a>
        )}
        <button type="button" className="button button--secondary" onClick={onReplay}>
          {copy.actions.replay}
        </button>
      </div>
    </section>
  )
}
