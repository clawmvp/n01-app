import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }
  
  if (!code) {
    return NextResponse.json({ error: 'No code' }, { status: 400 });
  }

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

    // Success page with tokens
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>WHOOP Connected!</title>
          <style>
            body { 
              font-family: system-ui, -apple-system, sans-serif; 
              max-width: 800px; 
              margin: 50px auto; 
              padding: 20px;
              background: #0a0a0a;
              color: #fff;
            }
            h1 { color: #00d084; }
            pre { 
              background: #1a1a1a; 
              padding: 20px; 
              border-radius: 8px; 
              overflow-x: auto;
              border: 1px solid #333;
            }
            .token-box {
              background: #1a1a1a;
              padding: 15px;
              border-radius: 8px;
              margin: 10px 0;
              border: 1px solid #333;
            }
            .label { color: #888; font-size: 12px; }
            .value { 
              font-family: monospace; 
              word-break: break-all;
              color: #00d084;
            }
            .warning {
              background: #332200;
              border: 1px solid #664400;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <h1>✅ WHOOP Connected!</h1>
          
          <div class="warning">
            ⚠️ Save these tokens! They won't be shown again.
          </div>
          
          <div class="token-box">
            <div class="label">Access Token:</div>
            <div class="value">${tokens.access_token}</div>
          </div>
          
          <div class="token-box">
            <div class="label">Refresh Token:</div>
            <div class="value">${tokens.refresh_token}</div>
          </div>
          
          <div class="token-box">
            <div class="label">Expires In:</div>
            <div class="value">${tokens.expires_in} seconds</div>
          </div>
          
          <h3>Full Response:</h3>
          <pre>${JSON.stringify(tokens, null, 2)}</pre>
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
