import type { AxiosHeaders, AxiosRequestHeaders } from 'axios'

const BULK_API_LOG_PREFIX = '[B2B Bulk API]'

export const serializeAxiosHeaders = (
  headers: AxiosRequestHeaders | AxiosHeaders | undefined
): Record<string, string> => {
  if (!headers) {
    return {}
  }

  if (headers instanceof Headers) {
    return serializeHeaders(headers)
  }

  if (typeof (headers as AxiosHeaders).forEach === 'function') {
    const serialized: Record<string, string> = {}

    ;(headers as AxiosHeaders).forEach((value: string, key: string) => {
      if (value != null) {
        serialized[key] = String(value)
      }
    })

    return serialized
  }

  return serializeHeaders(headers as Record<string, unknown>)
}

export const serializeRequestBody = (body: unknown): unknown => {
  if (body == null) {
    return null
  }

  if (body instanceof FormData) {
    const entries: Record<string, string> = {}

    body.forEach((value, key) => {
      entries[key] =
        value instanceof File
          ? `[File: ${value.name}, ${value.size} bytes, ${value.type || 'unknown'}]`
          : String(value)
    })

    return entries
  }

  return body
}

export const serializeHeaders = (
  headers: Headers | Record<string, unknown> | undefined
): Record<string, string> => {
  if (!headers) {
    return {}
  }

  if (headers instanceof Headers) {
    const serialized: Record<string, string> = {}

    headers.forEach((value, key) => {
      serialized[key] = value
    })

    return serialized
  }

  return Object.entries(headers).reduce<Record<string, string>>(
    (acc, [key, value]) => {
      if (value == null) {
        return acc
      }

      acc[key] = Array.isArray(value) ? value.join(', ') : String(value)

      return acc
    },
    {}
  )
}

export const logBulkApiRequest = (
  scope: 'Import' | 'Export' | 'Export Download',
  payload: {
    method?: string
    url: string
    account?: string
    hasAuthToken?: boolean
    headers?: Headers | Record<string, unknown>
    body?: unknown
  }
) => {
  console.log(`${BULK_API_LOG_PREFIX} ${scope} Request`, {
    method: payload.method?.toUpperCase() ?? 'GET',
    url: payload.url,
    account: payload.account,
    hasAuthToken: payload.hasAuthToken,
    headers: serializeHeaders(payload.headers),
    body: serializeRequestBody(payload.body),
  })
}

export const logBulkApiResponse = (
  scope: 'Import' | 'Export' | 'Export Download',
  payload: {
    method?: string
    url: string
    status: number
    statusText?: string
    body: unknown
  }
) => {
  console.log(`${BULK_API_LOG_PREFIX} ${scope} Response`, {
    method: payload.method?.toUpperCase() ?? 'GET',
    url: payload.url,
    status: payload.status,
    statusText: payload.statusText,
    body: payload.body,
  })
}

export const parseResponseBodyForLog = async (
  response: Response
): Promise<unknown> => {
  try {
    const text = await response.clone().text()

    if (!text.trim()) {
      return null
    }

    try {
      return JSON.parse(text)
    } catch {
      return text
    }
  } catch {
    return null
  }
}
