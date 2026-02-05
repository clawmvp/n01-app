import { NextResponse } from 'next/server';

// Generate random 8-character state string
function generateState(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function GET() {
  const clientId = process.env.WHOOP_CLIENT_ID;
  const redirectUri = process.env.WHOOP_REDIRECT_URI || 'https://n01.app/whoop/callback';
  
  const scopes = [
    'read:recovery',
    'read:cycles', 
    'read:sleep',
    'read:workout',
    'read:profile',
    'read:body_measurement',
    'offline'  // Required for refresh token
  ].join(' ');

  const state = generateState(); // Must be exactly 8 characters

  const authUrl = `https://api.prod.whoop.com/oauth/oauth2/auth?` + 
    `client_id=${clientId}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent(scopes)}&` +
    `state=${state}`;

  return NextResponse.redirect(authUrl);
}
