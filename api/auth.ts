import {
  clearSessionCookie,
  createSessionCookie,
  isAuthenticated,
  jsonResponse,
  verifyPassword,
} from './_auth.js';

export async function GET(request: Request): Promise<Response> {
  try {
    return jsonResponse({ authenticated: isAuthenticated(request) });
  } catch (err) {
    console.error('[api/auth] GET failed:', err);
    return jsonResponse({ error: 'Authentication service error' }, 500);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      password?: string;
      action?: string;
    };

    if (body.action === 'logout') {
      return jsonResponse(
        { authenticated: false },
        200,
        { 'Set-Cookie': clearSessionCookie(request) }
      );
    }

    const password = typeof body.password === 'string' ? body.password.trim() : '';
    if (!password) {
      return jsonResponse({ error: 'Please enter the trip password.' }, 400);
    }

    if (!verifyPassword(password)) {
      return jsonResponse({ error: 'Incorrect password. Please try again.' }, 401);
    }

    return jsonResponse(
      { authenticated: true },
      200,
      { 'Set-Cookie': createSessionCookie(request) }
    );
  } catch (err) {
    console.error('[api/auth] POST failed:', err);
    return jsonResponse({ error: 'Authentication failed' }, 500);
  }
}
