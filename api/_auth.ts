import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

const COOKIE_NAME = 'pine_palm_session';
const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 30; // 30 days

function sha256(value: string): Buffer {
  return createHash('sha256').update(value, 'utf8').digest();
}

function getAppPassword(): string {
  const pw = process.env.APP_PASSWORD;
  if (!pw) {
    throw new Error('APP_PASSWORD environment variable is not configured.');
  }
  return pw;
}

function getSessionSecret(): string {
  return process.env.SESSION_SECRET || getAppPassword();
}

function signPayload(payload: string): string {
  return createHmac('sha256', getSessionSecret())
    .update(payload)
    .digest('base64url');
}

export function verifyPassword(input: string): boolean {
  const expected = getAppPassword();
  return timingSafeEqual(sha256(input), sha256(expected));
}

export function createSessionCookie(request: Request): string {
  const expiresAt = Date.now() + SESSION_MAX_AGE_SEC * 1000;
  const payload = `v1.${expiresAt}`;
  const sig = signPayload(payload);
  const token = `${payload}.${sig}`;

  const isHttps =
    request.url.startsWith('https://') ||
    request.headers.get('x-forwarded-proto') === 'https';

  const parts = [
    `${COOKIE_NAME}=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${SESSION_MAX_AGE_SEC}`,
  ];
  if (isHttps) parts.push('Secure');
  return parts.join('; ');
}

export function clearSessionCookie(request: Request): string {
  const isHttps =
    request.url.startsWith('https://') ||
    request.headers.get('x-forwarded-proto') === 'https';

  const parts = [
    `${COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
  ];
  if (isHttps) parts.push('Secure');
  return parts.join('; ');
}

export function isAuthenticated(request: Request): boolean {
  try {
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) return false;

    const cookies = cookieHeader.split(';').map((c) => c.trim());
    const match = cookies.find((c) => c.startsWith(`${COOKIE_NAME}=`));
    if (!match) return false;

    const token = match.slice(COOKIE_NAME.length + 1);
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    const [version, expiresStr, sig] = parts;
    if (version !== 'v1') return false;

    const expiresAt = Number(expiresStr);
    if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;

    const expectedSig = signPayload(`${version}.${expiresStr}`);
    const sigBuf = Buffer.from(sig, 'utf8');
    const expectedBuf = Buffer.from(expectedSig, 'utf8');
    if (sigBuf.length !== expectedBuf.length) return false;

    return timingSafeEqual(sigBuf, expectedBuf);
  } catch (err) {
    console.error('[auth] Session verification error:', err);
    return false;
  }
}

export function jsonResponse(
  body: unknown,
  status = 200,
  extraHeaders: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store, max-age=0',
      ...extraHeaders,
    },
  });
}
