'use client';

const CLIENT_KEY = 'awmeovkn7kflgtoz';
const REDIRECT_URI = 'https://n01.app/api/auth/tiktok/callback';
const SCOPES = 'user.info.basic,video.upload,video.publish';

export default function TikTokAuthPage() {
  const authUrl = `https://www.tiktok.com/v2/auth/authorize?` +
    `client_key=${CLIENT_KEY}&` +
    `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent(SCOPES)}`;

  const handleAuth = () => {
    window.location.href = authUrl;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-8">
      <div className="bg-white/5 border border-white/10 rounded-3xl p-12 max-w-lg text-center">
        <div className="text-6xl mb-6">🎵</div>
        <h1 className="text-3xl font-bold text-white mb-4">
          TikTok Authorization
        </h1>
        <p className="text-white/60 mb-8">
          Connect your TikTok account to enable automatic video uploads for AI Money Projects.
        </p>
        
        <div className="bg-black/20 rounded-xl p-4 mb-8 text-left">
          <p className="text-sm text-white/50 mb-2">Permissions requested:</p>
          <ul className="text-sm text-white/70 space-y-1">
            <li>✅ Access your basic info</li>
            <li>✅ Upload videos to your account</li>
            <li>✅ Publish videos on your behalf</li>
          </ul>
        </div>

        <button
          onClick={handleAuth}
          className="text-white font-semibold py-4 px-8 rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-3 mx-auto"
          style={{ background: 'linear-gradient(90deg, #25F4EE, #FE2C55)' }}
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
          </svg>
          Connect TikTok Account
        </button>

        <p className="text-xs text-white/40 mt-6">
          You will be redirected to TikTok to authorize access.
        </p>
      </div>
    </div>
  );
}
