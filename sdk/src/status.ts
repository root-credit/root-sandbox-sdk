import type { PayinRail, PayoutRail, TransferStatus } from './types.js'

/**
 * Map a raw Root status to a friendly UI label.
 *
 * Use `statusLabel(payout.status)` directly in JSX; it returns one of:
 * `Queued`, `Sent to bank`, `Processing`, `Paid`, `Failed`, `Canceled`,
 * `Under review`, or the raw status as a fallback.
 */
export function statusLabel(status: string): string {
  switch (status) {
    case 'created':
    case 'approved':
      return 'Queued'
    case 'initiated':
      return 'Sent to bank'
    case 'processing':
      return 'Processing'
    case 'debited':
    case 'settled':
      return 'Paid'
    case 'failed':
      return 'Failed'
    case 'canceled':
      return 'Canceled'
    case 'needs_review':
      return 'Under review'
    default:
      return status
  }
}

/** Statuses a transfer cannot move out of. Useful as a poller stop condition. */
export const TERMINAL_STATUSES = new Set<TransferStatus>([
  'debited',
  'settled',
  'failed',
  'canceled',
])

export function isTerminal(status: string): boolean {
  return TERMINAL_STATUSES.has(status as TransferStatus)
}

/** True only for the success terminals (`settled` or `debited`). */
export function isSuccess(status: string): boolean {
  return status === 'debited' || status === 'settled'
}

/**
 * Returns the success terminal for a given rail/direction.
 *
 * - ACH payouts complete with `debited`.
 * - Everything else completes with `settled`.
 */
export function terminalForRail(
  rail: PayoutRail | PayinRail,
  direction: 'payout' | 'payin' = 'payout',
): 'settled' | 'debited' {
  if (direction === 'payin') return 'settled'
  if (rail === 'standard_ach' || rail === 'same_day_ach') return 'debited'
  return 'settled'
}
