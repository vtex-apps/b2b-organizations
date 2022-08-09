// https://regex101.com/r/926sxf/1
// If you change the regex, don't forget to go to the link above, update it there and save.
const EMAIL_REGEX = /^[A-z0-9"+_-]+(?:\.[A-z0-9+_-]+)*@(?:[A-z0-9](?:[A-z0-9-]*[A-z0-9])?\.)+[A-z0-9](?:[A-z0-9-]*[A-z0-9])?$/

// https://regex101.com/r/5dVM9R/1
// If you change the regex, don't forget to go to the link above, update it there and save.
// eslint-disable-next-line no-useless-escape
const PHONE_REGEX = /^([0-9]|\(|\)|\+|\ |\-)+$/

export function validateEmail(email: string) {
  return EMAIL_REGEX.test(email)
}

export function validatePhoneNumber(phone: string) {
  return PHONE_REGEX.test(phone)
}

export function validateUserName(name: string) {
  return name.length > 0
}
