import { ensureArray } from '@/lib/api/arrays'
import { getApiBaseUrl } from '@/lib/config/api'

export class HttpError extends Error {
  status: number
  body: unknown

  constructor(message: string, status: number, body: unknown) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.body = body
  }
}

export type ApiEnvelope<T> =
  | { data: T[] }
  | { items: T[] }
  | { result: T[] }
  | { [key: string]: unknown }

async function parseJsonSafe(res: Response): Promise<unknown> {
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit
): Promise<unknown> {
  const base = getApiBaseUrl()
  const url = path.startsWith('http') ? path : `${base}${path.startsWith('/') ? '' : '/'}${path}`

  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  })

  const body = await parseJsonSafe(res)
  if (!res.ok) {
    throw new HttpError(`Request failed: ${res.status} ${res.statusText}`, res.status, body)
  }

  return body
}

/**
 * Extracts an array from common API response shapes, while enforcing array output.
 *
 * Supported shapes:
 * - raw array: [...]
 * - envelope: { data: [...] } | { items: [...] } | { result: [...] }
 * - keyed: { [key]: [...] } (when key provided)
 * - single: { ... } (wrapped into array)
 */
export function extractArray<T>(body: unknown, key?: string): T[] {
  if (Array.isArray(body)) return body as T[]
  if (body && typeof body === 'object') {
    const obj = body as Record<string, unknown>

    if (key && key in obj) return ensureArray(obj[key] as T | T[])
    if ('data' in obj) return ensureArray(obj.data as T | T[])
    if ('items' in obj) return ensureArray(obj.items as T | T[])
    if ('result' in obj) return ensureArray(obj.result as T | T[])
  }

  return ensureArray(body as T | T[])
}

