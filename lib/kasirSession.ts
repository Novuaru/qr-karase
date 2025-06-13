// lib/kasirSession.ts
export function getKasirFromStorage() {
  const raw = localStorage.getItem('kasir');
  return raw ? JSON.parse(raw) : null;
}

export function getShiftIdFromStorage() {
  return localStorage.getItem('shift_id');
}

export function clearKasirSession() {
  localStorage.removeItem('kasir');
  localStorage.removeItem('shift_id');
}
