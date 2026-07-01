import { BULK_EXPORT_API_PATH } from './bulkApiPaths'

export { BULK_EXPORT_API_PATH, BULK_IMPORT_API_PATH } from './bulkApiPaths'

export const buildBulkExportUrl = (
  account: string,
  exportId?: string
): string => {
  const path = exportId
    ? `${BULK_EXPORT_API_PATH}${encodeURIComponent(exportId)}/`
    : BULK_EXPORT_API_PATH

  return `${path}?an=${encodeURIComponent(account)}`
}

export const resolveBulkImportFileUrl = (linkToFile: string): string => {
  if (/^https?:\/\//i.test(linkToFile)) {
    try {
      const url = new URL(linkToFile)

      if (url.pathname.startsWith('/api/b2b/')) {
        return `${url.pathname}${url.search}`
      }
    } catch {
      return linkToFile
    }

    return linkToFile
  }

  if (linkToFile.startsWith('/')) {
    return linkToFile
  }

  return `/${linkToFile}`
}

export const appendBulkApiAccountQuery = (
  url: string,
  account: string
): string => {
  if (url.includes('an=')) {
    return url
  }

  const separator = url.includes('?') ? '&' : '?'

  return `${url}${separator}an=${encodeURIComponent(account)}`
}

export const isSameOriginBulkApiUrl = (url: string): boolean => {
  if (url.startsWith('/api/b2b/')) {
    return true
  }

  if (typeof window === 'undefined') {
    return false
  }

  try {
    const parsed = new URL(url, window.location.origin)

    return (
      parsed.origin === window.location.origin &&
      parsed.pathname.startsWith('/api/b2b/')
    )
  } catch {
    return false
  }
}

export const getExportDownloadHref = (
  linkToFile: string,
  account: string
): string => {
  const resolved = resolveBulkImportFileUrl(linkToFile)

  if (/^https?:\/\//i.test(resolved)) {
    return resolved
  }

  return appendBulkApiAccountQuery(resolved, account)
}

export const openExternalDownloadUrl = (url: string): void => {
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.target = '_blank'
  anchor.rel = 'noopener noreferrer'
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
}
