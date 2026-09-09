import { saveTokens, getAccessToken, clearTokens } from "./tokenStorage";

const BASE_URL = "/api/auth";

// Helper: turn a non-OK response into a readable error message.
// DRF error bodies vary in shape depending on what went wrong, so this
// tries a few common ones before falling back to a generic message.
async function toError(res) {
  let body;
  try {
    body = await res.json();
  } catch {
    return new Error(`Request failed (${res.status})`);
  }
  const message =
    body.detail ||
    body.email?.[0] ||
    body.password?.[0] ||
    body.non_field_errors?.[0] ||
    "Something went wrong.";
  return new Error(message);
}

export async function register({ name, email, password }) {
  const res = await fetch(`${BASE_URL}/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, full_name: name, password }),
  });
  if (!res.ok) throw await toError(res);
  return res.json();
}

export async function login({ email, password }) {
  const res = await fetch(`${BASE_URL}/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: email, password }),
  });
  if (!res.ok) throw await toError(res);
  const data = await res.json(); // { access, refresh }
  saveTokens(data);
  return data;
}

export async function getMe() {
  const res = await fetch(`${BASE_URL}/me/`, {
    headers: { Authorization: `Bearer ${getAccessToken()}` },
  });
  if (!res.ok) throw await toError(res);
  return res.json(); // { id, email, full_name, date_joined }
}

export function logout() {
  clearTokens();
}