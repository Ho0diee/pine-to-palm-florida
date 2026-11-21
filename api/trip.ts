import { get, put } from '@vercel/blob';
import { isAuthenticated, jsonResponse } from './_auth.js';

const BLOB_PATH = 'pine-to-palm/trip-state.json';

interface StoredTripPayload {
  config: Record<string, unknown>;
  updatedAt: string;
}

export async function GET(request: Request): Promise<Response> {
  if (!isAuthenticated(request)) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  try {
    const result = await get(BLOB_PATH, {
      access: 'private',
      useCache: false,
    });

    if (!result || result.statusCode !== 200 || !result.stream) {
      return jsonResponse({ config: null, updatedAt: null });
    }

    const raw = await new Response(result.stream).text();
    const parsed = JSON.parse(raw) as StoredTripPayload;

    return jsonResponse({
      config: parsed.config ?? null,
      updatedAt: parsed.updatedAt ?? null,
    });
  } catch (err) {
    console.error('[api/trip] GET failed:', err);
    return jsonResponse({ error: 'Failed to load saved trip data.' }, 500);
  }
}

export async function PUT(request: Request): Promise<Response> {
  if (!isAuthenticated(request)) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  try {
    const body = (await request.json().catch(() => null)) as {
      config?: Record<string, unknown>;
    } | null;

    if (!body || !body.config || typeof body.config !== 'object') {
      return jsonResponse({ error: 'Invalid trip config payload.' }, 400);
    }

    const payload: StoredTripPayload = {
      config: body.config,
      updatedAt: new Date().toISOString(),
    };

    await put(BLOB_PATH, JSON.stringify(payload), {
      access: 'private',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json',
    });

    return jsonResponse({
      ok: true,
      updatedAt: payload.updatedAt,
    });
  } catch (err) {
    console.error('[api/trip] PUT failed:', err);
    return jsonResponse({ error: 'Failed to save trip data.' }, 500);
  }
}
