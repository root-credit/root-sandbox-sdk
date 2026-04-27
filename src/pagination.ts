import type { ListResponse } from './types.js'

export interface PaginationParams {
  cursor?: string
  limit?: number
}

/**
 * Async-iterate every page of a cursor-paginated list endpoint.
 *
 * ```ts
 * for await (const page of paginate(p => root.payouts.list({ ...p, status: 'failed' }))) {
 *   for (const payout of page.data) { ... }
 * }
 * ```
 */
export async function* paginate<T, P extends PaginationParams>(
  fetcher: (params: P) => Promise<ListResponse<T>>,
  initial?: P,
): AsyncGenerator<ListResponse<T>, void, void> {
  let params = (initial ?? ({} as P)) as P
  while (true) {
    const page = await fetcher(params)
    yield page
    if (!page.has_more || !page.next_cursor) return
    params = { ...params, cursor: page.next_cursor }
  }
}

/**
 * Convenience: collect every page into a single flat array. Use only when
 * the result set is bounded (e.g. < a few hundred items).
 */
export async function collectAll<T, P extends PaginationParams>(
  fetcher: (params: P) => Promise<ListResponse<T>>,
  initial?: P,
): Promise<T[]> {
  const out: T[] = []
  for await (const page of paginate(fetcher, initial)) {
    if (Array.isArray(page.data)) out.push(...page.data)
  }
  return out
}
