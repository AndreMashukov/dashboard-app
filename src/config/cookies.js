import Cookies from 'js-cookie'
import {isProd} from '../common/constants'

const domain = isProd ? window.location.hostname : null

const expires = 1826

export function get(name, options = {}) {
  return Cookies.get(name, {domain, ...options})
}

export function set(name, value, options = {}) {
  if (!value) return
  return Cookies.set(name, value, {domain, expires, secure: true, sameSite: 'strict', ...options})
}

export function remove(name, options = {}) {
  return Cookies.remove(name, {domain, ...options})
}
