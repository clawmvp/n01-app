import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.WHOOP_CLIENT_ID;
  const redirectUri = process.env.WHOOP_REDIRECT_URI;
  
  // Build the auth URL exactly as we do in /auth
  const scopes = [
    'read:recovery',
    'read:cycles', 
    'read:sleep',
    'read:workout',
    'read:profile',
    'read:body_measurement',
    'offline'
  ].join(' ');

  const state = 'abcd1234'; // Fixed 8 char state for testing

  const authUrl = `https://api.prod.whoop.com/oauth/oauth2/auth?` + 
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri || '')}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent(scopes)}&` +
    `state=${state}`;

  return NextResponse.json({
    env_check: {
      WHOOP_CLIENT_ID: clientId ? `${clientId.substring(0, 8)}...` : 'NOT SET',
      WHOOP_CLIENT_SECRET: process.env.WHOOP_CLIENT_SECRET ? 'SET (hidden)' : 'NOT SET',
      WHOOP_REDIRECT_URI: redirectUri || 'NOT SET',
    },
    generated_auth_url: authUrl,
    note: 'Copy the auth URL and open it in browser to test'
  }, { status: 200 });
}
