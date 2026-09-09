import { getAccessToken } from "./tokenStorage.js";

export async function getDevices(page = 1) {
  const res = await fetch(`/api/devices/?page=${page}`, {
    headers: { Authorization: `Bearer ${getAccessToken()}` },
  });
  if (!res.ok) throw new Error("Could not load devices.");
  return res.json(); // { count, next, previous, results }
}