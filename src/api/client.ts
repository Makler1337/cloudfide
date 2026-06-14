import { ApiError } from './errors'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5001'

type SearchParamValue = string | number | boolean | undefined | null
export type SearchParams = Record<string, SearchParamValue>

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  signal?: AbortSignal
  searchParams?: SearchParams
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const url = new URL(path, BASE_URL)

  if (options.searchParams) {
    for (const [key, value] of Object.entries(options.searchParams)) {
      if (value === undefined || value === null || value === '') continue
      url.searchParams.set(key, String(value))
    }
  }

  const response = await fetch(url, {
    method: options.method ?? 'GET',
    headers: options.body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  })

  if (response.status === 204) {
    return undefined as T
  }

  const payload: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    throw new ApiError(response.status, extractMessage(payload, response), extractDetails(payload))
  }

  return payload as T
}

function extractMessage(payload: unknown, response: Response): string {
  if (payload && typeof payload === 'object' && 'message' in payload) {
    const message = (payload as { message?: unknown }).message
    if (typeof message === 'string' && message.length > 0) return message
  }
  return response.statusText || `Request failed with status ${response.status}`
}

function extractDetails(payload: unknown): unknown {
  if (payload && typeof payload === 'object' && 'details' in payload) {
    return (payload as { details?: unknown }).details
  }
  return undefined
}
