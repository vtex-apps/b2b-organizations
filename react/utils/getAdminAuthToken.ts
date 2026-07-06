const VTEX_ID_COOKIE_PREFIX = 'VtexIdclientAutCookie'

const readCookieValue = (
  cookies: string[],
  name: string
): string | null => {
  const cookie = cookies.find(entry => entry.startsWith(`${name}=`))

  if (!cookie) {
    return null
  }

  const value = cookie.split('=').slice(1).join('=')

  return value || null
}

export const getAdminAuthToken = (account: string): string | null => {
  if (typeof document === 'undefined') {
    return null
  }

  const cookies = document.cookie.split(';').map(cookie => cookie.trim())

  const accountCookie = readCookieValue(
    cookies,
    `${VTEX_ID_COOKIE_PREFIX}_${account}`
  )

  if (accountCookie) {
    return accountCookie
  }

  const defaultCookie = readCookieValue(cookies, VTEX_ID_COOKIE_PREFIX)

  if (defaultCookie) {
    return defaultCookie
  }

  const anyAccountCookie = cookies.find(entry =>
    entry.startsWith(`${VTEX_ID_COOKIE_PREFIX}_`)
  )

  if (anyAccountCookie) {
    return anyAccountCookie.split('=').slice(1).join('=') || null
  }

  return null
}
