import { DEFAULT_POLLING, RAIL_POLLING } from './constants.js'
import { isTerminal } from './status.js'
import type { PayinRail, PayoutRail, TransferStatus } from './types.js'

export interface WaitForTerminalOptions<T> {
  /**
   * Rail of the transfer. Drives the default poll interval/timeout.
   * If omitted, the SDK uses a 2s × 60s fallback.
   */
  rail?: PayoutRail | PayinRail
  /** Override the per-poll interval (ms). */
  intervalMs?: number
  /** Absolute timeout (ms) before throwing `RootPollTimeoutError`. */
  timeoutMs?: number
  /** Called on every poll with the latest snapshot. */
  onUpdate?: (snapshot: T) => void
  /** Cancel polling externally. */
  signal?: AbortSignal
  /**
   * Custom terminal predicate. By default any of `settled`, `debited`,
   * `failed`, `canceled` is treated as terminal.
   */
  isTerminal?: (snapshot: T) => boolean
}

export class RootPollTimeoutError extends Error {
  /** Last snapshot fetched before the timeout fired. */
  lastSnapshot: unknown
  constructor(lastSnapshot: unknown, timeoutMs: number) {
    const status =
      lastSnapshot && typeof lastSnapshot === 'object'
        ? (lastSnapshot as { status?: string }).status
        : undefined
    super(
      `Polling timed out after ${timeoutMs}ms (last status: ${status ?? 'unknown'}).`,
    )
    this.name = 'RootPollTimeoutError'
    this.lastSnapshot = lastSnapshot
  }
}

/**
 * Poll `getter()` until the snapshot reaches a terminal status (or the
 * provided custom predicate returns true). Resolves to the final snapshot.
 *
 * Generic enough to use with payouts, payins, or any object with a `status` field.
 */
export async function waitForTerminal<T extends { status: TransferStatus }>(
  getter: () => Promise<T>,
  opts: WaitForTerminalOptions<T> = {},
): Promise<T> {
  const policy = opts.rail ? RAIL_POLLING[opts.rail as PayoutRail] : undefined
  const intervalMs = opts.intervalMs ?? policy?.intervalMs ?? DEFAULT_POLLING.intervalMs
  const timeoutMs = opts.timeoutMs ?? policy?.timeoutMs ?? DEFAULT_POLLING.timeoutMs
  const isDone = opts.isTerminal ?? ((s: T) => isTerminal(s.status))

  const deadline = Date.now() + timeoutMs
  let snapshot: T = await getter()
  opts.onUpdate?.(snapshot)
  if (isDone(snapshot)) return snapshot

  while (Date.now() < deadline) {
    if (opts.signal?.aborted) {
      throw new DOMException('Polling aborted', 'AbortError')
    }
    await sleep(intervalMs, opts.signal)
    snapshot = await getter()
    opts.onUpdate?.(snapshot)
    if (isDone(snapshot)) return snapshot
  }
  throw new RootPollTimeoutError(snapshot, timeoutMs)
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Polling aborted', 'AbortError'))
      return
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    const onAbort = () => {
      clearTimeout(timer)
      reject(new DOMException('Polling aborted', 'AbortError'))
    }
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}
