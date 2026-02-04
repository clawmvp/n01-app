import { NextRequest, NextResponse } from 'next/server';

const CLIENT_ID = process.env.YOUTUBE_CLIENT_ID;
const CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET;
const REDIRECT_URI = 'https://n01.app/api/auth/youtube/callback';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return new NextResponse(
      generateHTML('❌ Authorization Error', error, null),
      { headers: { 'Content-Type': 'text/html' } }
    );
  }

  if (!code) {
    return new NextResponse(
      generateHTML('❌ Error', 'No authorization code received', null),
      { headers: { 'Content-Type': 'text/html' } }
    );
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID || '',
        client_secret: CLIENT_SECRET || '',
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenResponse.json();

    if (tokens.error) {
      return new NextResponse(
        generateHTML('❌ Token Error', tokens.error_description || tokens.error, null),
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Success! Show the refresh token
    return new NextResponse(
      generateHTML(
        '✅ YouTube Authentication Successful!',
        'Copy the refresh token below and add it to your .env file',
        tokens.refresh_token
      ),
      { headers: { 'Content-Type': 'text/html' } }
    );

  } catch (error: any) {
    return new NextResponse(
      generateHTML('❌ Server Error', error.message, null),
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}

function generateHTML(title: string, message: string, refreshToken: string | null): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: white;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 2rem;
    }
    .container {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      padding: 3rem;
      max-width: 600px;
      text-align: center;
    }
    h1 {
      font-size: 2rem;
      margin-bottom: 1rem;
      ${title.includes('✅') ? 'color: #22c55e;' : 'color: #ef4444;'}
    }
    p {
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 1.5rem;
    }
    .token-box {
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      padding: 1rem;
      margin: 1.5rem 0;
      word-break: break-all;
      font-family: monospace;
      font-size: 0.875rem;
      text-align: left;
      max-height: 200px;
      overflow-y: auto;
    }
    .label {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.5);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.5rem;
      text-align: left;
    }
    .copy-btn {
      background: #22c55e;
      color: white;
      border: none;
      padding: 0.75rem 2rem;
      border-radius: 8px;
      font-size: 1rem;
      cursor: pointer;
      transition: transform 0.2s, background 0.2s;
    }
    .copy-btn:hover {
      background: #16a34a;
      transform: scale(1.02);
    }
    .copy-btn:active {
      transform: scale(0.98);
    }
    .env-example {
      background: rgba(34, 197, 94, 0.1);
      border: 1px solid rgba(34, 197, 94, 0.3);
      border-radius: 8px;
      padding: 1rem;
      margin-top: 1.5rem;
      text-align: left;
      font-family: monospace;
      font-size: 0.875rem;
    }
    .env-example code {
      color: #22c55e;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${title}</h1>
    <p>${message}</p>
    ${refreshToken ? `
      <div class="label">Refresh Token</div>
      <div class="token-box" id="token">${refreshToken}</div>
      <button class="copy-btn" onclick="copyToken()">📋 Copy Token</button>
      <div class="env-example">
        <div class="label">Add to .env</div>
        <code>YOUTUBE_REFRESH_TOKEN=${refreshToken}</code>
      </div>
    ` : ''}
  </div>
  <script>
    function copyToken() {
      const token = document.getElementById('token').innerText;
      navigator.clipboard.writeText(token);
      const btn = document.querySelector('.copy-btn');
      btn.textContent = '✅ Copied!';
      setTimeout(() => btn.textContent = '📋 Copy Token', 2000);
    }
  </script>
</body>
</html>
  `;
}
