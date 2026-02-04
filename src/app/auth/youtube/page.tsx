'use client';

import { useEffect } from 'react';

const CLIENT_ID = '1049066553423-j8ovvcobc0usfu916jg31r9itodvforr.apps.googleusercontent.com';
const REDIRECT_URI = 'https://n01.app/api/auth/youtube/callback';
const SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube',
  'https://www.googleapis.com/auth/youtube.readonly',
].join(' ');

export default function YouTubeAuthPage() {
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent(SCOPES)}&` +
    `access_type=offline&` +
    `prompt=consent`;

  const handleAuth = () => {
    window.location.href = authUrl;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-8">
      <div className="bg-white/5 border border-white/10 rounded-3xl p-12 max-w-lg text-center">
        <div className="text-6xl mb-6">📺</div>
        <h1 className="text-3xl font-bold text-white mb-4">
          YouTube Authorization
        </h1>
        <p className="text-white/60 mb-8">
          Connect your YouTube account to enable automatic video uploads for AI Money Projects.
        </p>
        
        <div className="bg-black/20 rounded-xl p-4 mb-8 text-left">
          <p className="text-sm text-white/50 mb-2">Permissions requested:</p>
          <ul className="text-sm text-white/70 space-y-1">
            <li>✅ Upload videos to your channel</li>
            <li>✅ Manage your YouTube account</li>
            <li>✅ View your YouTube activity</li>
          </ul>
        </div>

        <button
          onClick={handleAuth}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-8 rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-3 mx-auto"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          Connect YouTube Account
        </button>

        <p className="text-xs text-white/40 mt-6">
          You will be redirected to Google to authorize access.
        </p>
      </div>
    </div>
  );
}
