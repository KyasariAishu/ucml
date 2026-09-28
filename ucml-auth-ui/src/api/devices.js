import { getAccessToken } from "./tokenStorage.js";

export async function getDevices(page = 1) {
  const res = await fetch(`/api/devices/?page=${page}`, {
    headers: { Authorization: `Bearer ${getAccessToken()}` },
  });
  if (!res.ok) throw new Error("Could not load devices.");
  return res.json();
}

export async function createDevice(data) {
  const res = await fetch("/api/devices/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAccessToken()}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    let body = {};
    try {
      body = await res.json();
    } catch {
      // response wasn't JSON; fall through to the generic message
    }
    // DRF returns { field_name: ["message", ...] } -- flatten it for display.
    const messages = Object.entries(body).map(
      ([field, errs]) => `${field}: ${[].concat(errs).join(" ")}`
    );
    throw new Error(messages.join(" | ") || "Could not create device.");
  }
  return res.json();
}

export async function updateDevice(id, data) {
  const res = await fetch(`/api/devices/${id}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAccessToken()}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Could not save device.");
  return res.json();
}

export async function generateConfig(deviceId) {
  const res = await fetch(`/api/devices/${deviceId}/generate-config/`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getAccessToken()}` },
  });
  if (!res.ok) throw new Error("Could not start config generation.");
  return res.json();
}

export async function getConfigJob(jobId) {
  const res = await fetch(`/api/config-jobs/${jobId}/`, {
    headers: { Authorization: `Bearer ${getAccessToken()}` },
  });
  if (!res.ok) throw new Error("Could not fetch job status.");
  return res.json();
}