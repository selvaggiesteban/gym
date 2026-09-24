import * as jose from 'jose';

const encoder = new TextEncoder();

export async function signAccessToken(payload: { sub: string; email: string; role: string }, secret: string, expiresIn: string): Promise<string> {
  const key = new Uint8Array([...secret].map(c => c.charCodeAt(0)));
  return new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(key);
}

export async function signRefreshToken(payload: { sub: string; email: string; role: string }, secret: string, expiresIn: string): Promise<string> {
  const key = new Uint8Array([...secret].map(c => c.charCodeAt(0)));
  return new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(key);
}

export async function verifyToken(token: string, secret: string): Promise<jose.JWTPayload | null> {
  try {
    const key = new Uint8Array([...secret].map(c => c.charCodeAt(0)));
    const { payload } = await jose.jwtVerify(token, key);
    return payload;
  } catch {
    return null;
  }
}

export function parseCookies(header: string | null): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!header) return cookies;
  for (const pair of header.split(';')) {
    const [name, ...rest] = pair.split('=');
    if (name) cookies[name.trim()] = decodeURIComponent(rest.join('='));
  }
  return cookies;
}
