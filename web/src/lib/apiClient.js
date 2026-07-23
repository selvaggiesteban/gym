// Cliente API para la app GYM.
// Backend: NestJS en http://localhost:3000/api (cookies httpOnly).

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000';

const FULL_BASE = `${API_BASE_URL.replace(/\/$/, '')}/api`;

const refresh = async () => {
  const r = await fetch(`${FULL_BASE}/auth/refresh`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' } });
  if (!r.ok) throw new Error('refresh_failed');
  return r.json();
};

export async function api(path, options = {}) {
  const url = path.startsWith('http') ? path : `${FULL_BASE}${path.startsWith('/') ? path : `/${path}`}`;
  const opts = { credentials: 'include', ...options };
  if (opts.body && typeof opts.body !== 'string' && !(opts.body instanceof FormData)) {
    opts.headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
    opts.body = JSON.stringify(opts.body);
  }
  let r = await fetch(url, opts);
  if (r.status === 401 && !path.includes('/auth/')) {
    try { await refresh(); } catch (e) { throw new Error('unauthorized'); }
    r = await fetch(url, opts);
  }
  if (!r.ok) {
    let msg = `HTTP ${r.status}`;
    try { const data = await r.json(); msg = data.message || msg; } catch (e) {}
    throw new Error(msg);
  }
  if (r.status === 204) return null;
  const ct = r.headers.get('Content-Type') || '';
  return ct.includes('application/json') ? r.json() : r.text();
}
