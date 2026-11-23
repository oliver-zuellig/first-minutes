import { useEffect, useMemo, useReducer } from 'react'
import { WINCH_FULL, WINCH_TICK_STEP, createInitialState, gameReducer } from './reducer'
import type { CheckId, GameAction, GameState } from './types'

/** Time the winch needs to lower the AED on its own, from top to ground. */
export const WINCH_AUTO_MS = 6000

/** Dispatches a TICK with the elapsed time on every animation frame while `active`. */
function useFrames(active: boolean, dispatch: (action: GameAction) => void) {
  useEffect(() => {
    if (!active) return
    let last: number | null = null
    let id = requestAnimationFrame(function frame(now) {
      if (last !== null) dispatch({ type: 'TICK', dtMs: now - last })
      last = now
      id = requestAnimationFrame(frame)
    })
    return () => cancelAnimationFrame(id)
  }, [active, dispatch])
}

/** Lowers the AED slowly on its own while `active`. */
function useWinchTicks(active: boolean, dispatch: (action: GameAction) => void) {
  useEffect(() => {
    if (!active) return
    const id = setInterval(
      () => dispatch({ type: 'WINCH_TICK' }),
      (WINCH_AUTO_MS * WINCH_TICK_STEP) / WINCH_FULL,
    )
    return () => clearInterval(id)
  }, [active, dispatch])
}

export type Controls = {
  readonly dispatchDrone: () => void
  readonly check: (check: CheckId) => void
  readonly takeOff: () => void
  readonly climb: () => void
  readonly descend: () => void
  readonly toggleAutopilot: () => void
  readonly continueFlight: () => void
  readonly lower: () => void
  readonly replay: () => void
}

/**
 * Owns the game state for one visit, plus the frame loop and winch timer that move it.
 * Frames and timers only dispatch actions; the reducer decides what happens.
 */
export function usePlaythrough(playthrough: readonly string[]): {
  state: GameState
  controls: Controls
} {
  const [state, dispatch] = useReducer(gameReducer, playthrough, createInitialState)

  useFrames(state.phase === 'flight', dispatch)
  useWinchTicks(state.phase === 'winch', dispatch)

  const controls = useMemo<Controls>(
    () => ({
      dispatchDrone: () => dispatch({ type: 'DISPATCH' }),
      check: (check: CheckId) => dispatch({ type: 'CHECK', check }),
      takeOff: () => dispatch({ type: 'TAKE_OFF' }),
      climb: () => dispatch({ type: 'STEER', direction: 'up' }),
      descend: () => dispatch({ type: 'STEER', direction: 'down' }),
      toggleAutopilot: () => dispatch({ type: 'TOGGLE_AUTOPILOT' }),
      continueFlight: () => dispatch({ type: 'CONTINUE' }),
      lower: () => dispatch({ type: 'LOWER' }),
      replay: () => dispatch({ type: 'REPLAY' }),
    }),
    [],
  )

  return { state, controls }
}
