import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'node:crypto';

const WHOOP_APP_PROJECT_ID = 'prj_xCax3WMhkxe6myDGAroqLLNEs68P';

// ──────────────────────────────────────────────────────────────────
// Branch 1: Vita / other n01.app-family apps bouncing through here.
// Apps set state = `<target>:<payloadB64>:<hmac>` so we can route
// tokens to the right ingest endpoint without registering a new
// redirect URI with Whoop for every subdomain.
// ──────────────────────────────────────────────────────────────────

const BOUNCE_SECRET = process.env.INTEGRATION_BOUNCE_SECRET ?? '';

function hmacSign(message: string): string {
  return createHmac('sha256', Buffer.from(BOUNCE_SECRET, 'utf8'))
    .update(message)
    .digest('base64url');
}

function hmacVerify(message: string, signature: string): boolean {
  if (!BOUNCE_SECRET) return false;
  try {
    const expected = Buffer.from(hmacSign(message), 'utf8');
    const given = Buffer.from(signature, 'utf8');
    if (expected.length !== given.length) return false;
    return timingSafeEqual(expected, given);
  } catch {
    return false;
  }
}

interface BounceTarget {
  ingestUrl: string;
  returnUrl: string;
}

const BOUNCE_TARGETS: Record<string, BounceTarget> = {
  vita: {
    ingestUrl: 'https://vita.n01.app/api/integrations/whoop/ingest',
    returnUrl: 'https://vita.n01.app/settings/integrations?connected=whoop',
  },
};

async function handleBounce(
  target: BounceTarget,
  state: string,
  code: string,
  redirectUri: string,
): Promise<NextResponse> {
  try {
    const tokenResponse = await fetch('https://api.prod.whoop.com/oauth/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: process.env.WHOOP_CLIENT_ID!,
        client_secret: process.env.WHOOP_CLIENT_SECRET!,
        redirect_uri: redirectUri,
      }),
    });
    const tokens = await tokenResponse.json();

    if (tokens.error) {
      return NextResponse.redirect(
        `${target.returnUrl.split('?')[0]}?error=${encodeURIComponent(tokens.error)}`,
      );
    }

    const payload = JSON.stringify({
      state,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresIn: tokens.expires_in,
      scope: tokens.scope ?? '',
    });
    const signature = hmacSign(payload);

    const ingestRes = await fetch(target.ingestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Vita-Signature': signature,
      },
      body: payload,
    });

    if (!ingestRes.ok) {
      const text = await ingestRes.text();
      return NextResponse.redirect(
        `${target.returnUrl.split('?')[0]}?error=${encodeURIComponent(`ingest ${ingestRes.status}: ${text.slice(0, 120)}`)}`,
      );
    }

    return NextResponse.redirect(target.returnUrl);
  } catch (err) {
    return NextResponse.redirect(
      `${target.returnUrl.split('?')[0]}?error=${encodeURIComponent((err as Error).message)}`,
    );
  }
}

// ──────────────────────────────────────────────────────────────────
// Branch 2: Original whoop-app flow — saves tokens to Vercel env.
// ──────────────────────────────────────────────────────────────────

async function updateVercelEnv(projectId: string, key: string, value: string): Promise<boolean> {
  const token = process.env.WHOOP_VERCEL_TOKEN;
  if (!token) return false;

  try {
    const listRes = await fetch(`https://api.vercel.com/v9/projects/${projectId}/env`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const { envs } = await listRes.json();
    const existing = envs?.find((e: { key: string; id: string }) => e.key === key);

    if (existing) {
      await fetch(`https://api.vercel.com/v9/projects/${projectId}/env/${existing.id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      });
    } else {
      await fetch(`https://api.vercel.com/v10/projects/${projectId}/env`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value, type: 'encrypted', target: ['production'] }),
      });
    }
    return true;
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state') ?? '';
  const error = searchParams.get('error');

  if (error) return NextResponse.json({ error }, { status: 400 });
  if (!code) return NextResponse.json({ error: 'No code' }, { status: 400 });

  // Bounce branch: state format `<target>:<payload>:<sig>`
  if (state.includes(':')) {
    const [targetKey, payloadB64, sig] = state.split(':');
    const target = BOUNCE_TARGETS[targetKey ?? ''];
    if (target && payloadB64 && sig && hmacVerify(payloadB64, sig)) {
      return handleBounce(target, state, code, process.env.WHOOP_REDIRECT_URI!);
    }
  }

  // Original whoop-app flow.
  try {
    const tokenResponse = await fetch('https://api.prod.whoop.com/oauth/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: process.env.WHOOP_CLIENT_ID!,
        client_secret: process.env.WHOOP_CLIENT_SECRET!,
        redirect_uri: process.env.WHOOP_REDIRECT_URI!,
      }),
    });

    const tokens = await tokenResponse.json();

    if (tokens.error) {
      return NextResponse.json(tokens, { status: 400 });
    }

    const savedAccess = await updateVercelEnv(WHOOP_APP_PROJECT_ID, 'WHOOP_ACCESS_TOKEN', tokens.access_token);
    const savedRefresh = await updateVercelEnv(WHOOP_APP_PROJECT_ID, 'WHOOP_REFRESH_TOKEN', tokens.refresh_token);

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>WHOOP Connected!</title>
          <style>
            body { font-family: system-ui; max-width: 600px; margin: 60px auto; padding: 20px; background: #0a0a0a; color: #fff; }
            h1 { color: #22c55e; }
            .card { background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 20px; margin: 16px 0; }
            .label { color: #71717a; font-size: 13px; margin-bottom: 4px; }
            .value { font-family: monospace; word-break: break-all; color: #22c55e; font-size: 13px; }
            .badge { display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 12px; font-weight: 600; }
            .ok { background: #052e16; color: #22c55e; }
            .warn { background: #422006; color: #f59e0b; }
            a { color: #22c55e; }
          </style>
        </head>
        <body>
          <h1>WHOOP Connected!</h1>
          <div class="card">
            <div class="label">Auto-saved to whoop-app Vercel project</div>
            <div>
              WHOOP_ACCESS_TOKEN: <span class="badge ${savedAccess ? 'ok' : 'warn'}">${savedAccess ? 'Saved' : 'Failed'}</span><br/>
              WHOOP_REFRESH_TOKEN: <span class="badge ${savedRefresh ? 'ok' : 'warn'}">${savedRefresh ? 'Saved' : 'Failed'}</span>
            </div>
          </div>
          <div class="card">
            <div class="label">Access Token</div>
            <div class="value">${tokens.access_token}</div>
          </div>
          <div class="card">
            <div class="label">Refresh Token</div>
            <div class="value">${tokens.refresh_token}</div>
          </div>
          <div class="card">
            <div class="label">Expires In</div>
            <div class="value">${tokens.expires_in}s (${Math.round(tokens.expires_in / 3600)}h)</div>
          </div>
          <p style="margin-top: 24px;">
            <a href="https://whoop.n01.app">Go to Dashboard →</a>
            ${savedAccess && savedRefresh ? '<br/><small style="color:#71717a">Tokens saved! Redeploy whoop.n01.app or wait for next request to use them.</small>' : ''}
          </p>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Token exchange failed', details: (err as Error).message },
      { status: 500 }
    );
  }
}
