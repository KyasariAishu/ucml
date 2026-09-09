// Small wrapper around localStorage for the JWT pair.
// NOTE: localStorage is fine for a mockup/dev project. For a real
// production app, storing tokens in an httpOnly cookie is safer against
// XSS -- worth revisiting once this is more than a mockup.

const ACCESS_KEY = "ucml_access_token";
const REFRESH_KEY = "ucml_refresh_token";

export function saveTokens({ access, refresh }) {
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export function isLoggedIn() {
  return Boolean(getAccessToken());
}