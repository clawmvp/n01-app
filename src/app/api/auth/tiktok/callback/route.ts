import { NextRequest, NextResponse } from 'next/server';

const CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY;
const CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET;
const REDIRECT_URI = 'https://n01.app/api/auth/tiktok/callback';

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
    // Debug: Check if env vars are loaded
    console.log('TikTok OAuth Debug:', {
      clientKeyExists: !!CLIENT_KEY,
      clientKeyLength: CLIENT_KEY?.length,
      clientKeyStart: CLIENT_KEY?.substring(0, 4),
      secretExists: !!CLIENT_SECRET,
    });

    // Fallback to hardcoded if env not available (for debugging)
    const clientKey = CLIENT_KEY || 'awmeovkn7kflgtoz';
    const clientSecret = CLIENT_SECRET || 'PYC6VaaQDL3ptPGACjUbfHttKrfzxbEi';

    // Exchange code for tokens
    const requestBody = new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: REDIRECT_URI,
    });

    console.log('Token request body params:', {
      client_key: clientKey,
      code: code.substring(0, 10) + '...',
      redirect_uri: REDIRECT_URI,
    });

    const tokenResponse = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: requestBody,
    });

    const tokens = await tokenResponse.json();
    console.log('Token response:', JSON.stringify(tokens));

    if (tokens.error || tokens.data?.error_code) {
      const errorMsg = JSON.stringify(tokens);
      return new NextResponse(
        generateHTML('❌ Token Error', errorMsg, null),
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    const tokenData = tokens.data || tokens;

    // Success!
    return new NextResponse(
      generateHTML(
        '✅ TikTok Authentication Successful!',
        'Copy the tokens below and add them to your .env file',
        tokenData
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

function generateHTML(title: string, message: string, tokenData: any): string {
  const isSuccess = title.includes('✅');
  
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
      background: linear-gradient(135deg, #010101 0%, #25F4EE 50%, #FE2C55 100%);
      color: white;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 2rem;
    }
    .container {
      background: rgba(0, 0, 0, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      padding: 3rem;
      max-width: 700px;
      text-align: center;
    }
    h1 {
      font-size: 2rem;
      margin-bottom: 1rem;
      ${isSuccess ? 'color: #25F4EE;' : 'color: #FE2C55;'}
    }
    p {
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 1.5rem;
    }
    .token-box {
      background: rgba(0, 0, 0, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      padding: 1rem;
      margin: 1rem 0;
      word-break: break-all;
      font-family: monospace;
      font-size: 0.75rem;
      text-align: left;
      max-height: 150px;
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
      background: #25F4EE;
      color: black;
      border: none;
      padding: 0.5rem 1.5rem;
      border-radius: 8px;
      font-size: 0.875rem;
      cursor: pointer;
      margin: 0.5rem;
    }
    .copy-btn:hover { background: #1ad4d0; }
    .env-block {
      background: rgba(37, 244, 238, 0.1);
      border: 1px solid rgba(37, 244, 238, 0.3);
      border-radius: 8px;
      padding: 1rem;
      margin-top: 1.5rem;
      text-align: left;
      font-family: monospace;
      font-size: 0.75rem;
    }
    .env-block code { color: #25F4EE; display: block; margin: 0.25rem 0; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${title}</h1>
    <p>${message}</p>
    ${tokenData ? `
      <div class="label">Access Token</div>
      <div class="token-box" id="access-token">${tokenData.access_token}</div>
      <button class="copy-btn" onclick="copy('access-token')">📋 Copy Access Token</button>
      
      <div class="label">Open ID</div>
      <div class="token-box" id="open-id">${tokenData.open_id}</div>
      <button class="copy-btn" onclick="copy('open-id')">📋 Copy Open ID</button>
      
      ${tokenData.refresh_token ? `
        <div class="label">Refresh Token</div>
        <div class="token-box" id="refresh-token">${tokenData.refresh_token}</div>
        <button class="copy-btn" onclick="copy('refresh-token')">📋 Copy Refresh Token</button>
      ` : ''}
      
      <div class="env-block">
        <div class="label">Add to .env</div>
        <code>TIKTOK_ACCESS_TOKEN=${tokenData.access_token}</code>
        <code>TIKTOK_OPEN_ID=${tokenData.open_id}</code>
        ${tokenData.refresh_token ? `<code>TIKTOK_REFRESH_TOKEN=${tokenData.refresh_token}</code>` : ''}
      </div>
    ` : ''}
  </div>
  <script>
    function copy(id) {
      const text = document.getElementById(id).innerText;
      navigator.clipboard.writeText(text);
      event.target.textContent = '✅ Copied!';
      setTimeout(() => event.target.textContent = '📋 Copy', 2000);
    }
  </script>
</body>
</html>
  `;
}
