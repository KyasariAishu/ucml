// import { getAccessToken } from "./tokenStorage.js";

// export async function getDevices(page = 1) {
//   const res = await fetch(`/api/devices/?page=${page}`, {
//     headers: { Authorization: `Bearer ${getAccessToken()}` },
//   });
//   if (!res.ok) throw new Error("Could not load devices.");
//   return res.json(); // { count, next, previous, results }
// }


import { getAccessToken } from "./tokenStorage.js";

export async function getDevices(page = 1) {
  const res = await fetch(`/api/devices/?page=${page}`, {
    headers: { Authorization: `Bearer ${getAccessToken()}` },
  });
  if (!res.ok) throw new Error("Could not load devices.");
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
  return res.json(); // job, status PENDING
}

export async function getConfigJob(jobId) {
  const res = await fetch(`/api/config-jobs/${jobId}/`, {
    headers: { Authorization: `Bearer ${getAccessToken()}` },
  });
  if (!res.ok) throw new Error("Could not fetch job status.");
  return res.json();
}