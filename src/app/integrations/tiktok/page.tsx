"use client";

import { useState } from "react";
import Link from "next/link";

export default function TikTokIntegrationPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [caption, setCaption] = useState("");
  const [privacy, setPrivacy] = useState("public");

  const handleConnect = () => {
    // Simulate OAuth flow
    setTimeout(() => {
      setIsConnected(true);
    }, 1500);
  };

  const handlePublish = () => {
    setPublishing(true);
    setTimeout(() => {
      setPublishing(false);
      setPublished(true);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-foreground/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            n01<span className="text-accent">.app</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/integrations/tiktok" className="text-sm font-medium text-accent">
              TikTok Integration
            </Link>
            <Link href="/pricing" className="text-sm text-muted hover:text-foreground">
              Pricing
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 px-6 bg-gradient-to-b from-[#00f2ea]/5 to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full text-sm mb-6">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
            </svg>
            TikTok Integration
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Publish AI-Generated Videos
            <br />
            <span className="bg-gradient-to-r from-[#00f2ea] to-[#ff0050] bg-clip-text text-transparent">
              Directly to TikTok
            </span>
          </h1>
          
          <p className="text-lg text-muted max-w-2xl mx-auto mb-8">
            Connect your TikTok account and let our AI team create viral content for you. 
            Review, approve, and publish - all from one dashboard.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Connection Status */}
          <div className="bg-foreground/5 rounded-2xl p-8 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">TikTok Account</h3>
                  <p className="text-muted">
                    {isConnected ? (
                      <span className="flex items-center gap-2 text-green-500">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Connected as @your_account
                      </span>
                    ) : (
                      "Connect to publish videos"
                    )}
                  </p>
                </div>
              </div>
              
              {!isConnected ? (
                <button
                  onClick={handleConnect}
                  className="px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-black/80 transition-all flex items-center gap-2"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                  </svg>
                  Connect TikTok
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="px-4 py-2 bg-green-500/10 text-green-600 rounded-full text-sm font-medium">
                    ✓ Connected
                  </span>
                  <button
                    onClick={() => setIsConnected(false)}
                    className="text-sm text-muted hover:text-foreground"
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Video Queue */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Ready to Publish</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Sample Video 1 */}
              <div className="bg-foreground/5 rounded-2xl overflow-hidden">
                <div className="aspect-[9/16] bg-gradient-to-br from-purple-500 to-pink-500 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="text-4xl mb-2">🎬</div>
                      <p className="text-sm opacity-80">Product Demo</p>
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white text-sm">
                      AI-generated product showcase video
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted">Generated by PIXEL</span>
                    <span className="text-xs bg-green-500/10 text-green-600 px-2 py-1 rounded-full">Ready</span>
                  </div>
                  <button
                    onClick={() => setShowPublishModal(true)}
                    disabled={!isConnected}
                    className={`w-full py-3 rounded-xl font-medium transition-all ${
                      isConnected
                        ? "bg-gradient-to-r from-[#00f2ea] to-[#ff0050] text-white hover:opacity-90"
                        : "bg-foreground/10 text-muted cursor-not-allowed"
                    }`}
                  >
                    {isConnected ? "Publish to TikTok" : "Connect to Publish"}
                  </button>
                </div>
              </div>

              {/* Sample Video 2 */}
              <div className="bg-foreground/5 rounded-2xl overflow-hidden">
                <div className="aspect-[9/16] bg-gradient-to-br from-blue-500 to-cyan-500 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="text-4xl mb-2">✨</div>
                      <p className="text-sm opacity-80">Brand Story</p>
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white text-sm">
                      Engaging brand narrative
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted">Generated by PIXEL</span>
                    <span className="text-xs bg-yellow-500/10 text-yellow-600 px-2 py-1 rounded-full">Processing</span>
                  </div>
                  <button
                    disabled
                    className="w-full py-3 rounded-xl font-medium bg-foreground/10 text-muted cursor-not-allowed"
                  >
                    Processing...
                  </button>
                </div>
              </div>

              {/* Create New */}
              <div className="bg-foreground/5 rounded-2xl overflow-hidden border-2 border-dashed border-foreground/20">
                <div className="aspect-[9/16] flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-foreground/10 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <p className="text-muted font-medium">Create New Video</p>
                    <p className="text-sm text-muted/60 mt-1">AI will generate it</p>
                  </div>
                </div>
                <div className="p-4">
                  <button className="w-full py-3 rounded-xl font-medium border border-foreground/20 hover:border-foreground/40 transition-all">
                    + New Video
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-foreground/5 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-6">How It Works</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-accent/10 rounded-full flex items-center justify-center text-accent font-bold">1</div>
                <h3 className="font-semibold mb-2">Connect Account</h3>
                <p className="text-sm text-muted">Securely link your TikTok account via OAuth</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-accent/10 rounded-full flex items-center justify-center text-accent font-bold">2</div>
                <h3 className="font-semibold mb-2">AI Creates Content</h3>
                <p className="text-sm text-muted">Our AI generates engaging videos for your brand</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-accent/10 rounded-full flex items-center justify-center text-accent font-bold">3</div>
                <h3 className="font-semibold mb-2">Review & Edit</h3>
                <p className="text-sm text-muted">Preview and customize before publishing</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-accent/10 rounded-full flex items-center justify-center text-accent font-bold">4</div>
                <h3 className="font-semibold mb-2">Publish</h3>
                <p className="text-sm text-muted">One click to post directly to TikTok</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Publish Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
          <div className="bg-background rounded-2xl p-8 max-w-lg w-full">
            {published ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 mx-auto mb-6 bg-green-500/10 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-2">Published Successfully!</h3>
                <p className="text-muted mb-6">Your video is now live on TikTok</p>
                <button
                  onClick={() => {
                    setShowPublishModal(false);
                    setPublished(false);
                    setCaption("");
                  }}
                  className="px-6 py-3 bg-foreground text-background rounded-full font-medium"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">Publish to TikTok</h3>
                  <button
                    onClick={() => setShowPublishModal(false)}
                    className="text-muted hover:text-foreground"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Video Preview */}
                  <div className="aspect-video bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="text-3xl mb-2">🎬</div>
                      <p>Product Demo Video</p>
                    </div>
                  </div>

                  {/* Caption */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Caption</label>
                    <textarea
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="Write a caption for your video..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-foreground/10 bg-transparent focus:outline-none focus:border-accent resize-none"
                    />
                  </div>

                  {/* Privacy */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Privacy Setting</label>
                    <select
                      value={privacy}
                      onChange={(e) => setPrivacy(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-foreground/10 bg-transparent focus:outline-none focus:border-accent"
                    >
                      <option value="public">Public - Everyone can see</option>
                      <option value="friends">Friends - Only friends can see</option>
                      <option value="private">Private - Only you can see</option>
                    </select>
                  </div>

                  {/* Options */}
                  <div className="flex items-center gap-6 text-sm">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      Allow comments
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      Allow duets
                    </label>
                  </div>

                  {/* Publish Button */}
                  <button
                    onClick={handlePublish}
                    disabled={publishing}
                    className="w-full py-4 bg-gradient-to-r from-[#00f2ea] to-[#ff0050] text-white rounded-full font-medium hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    {publishing ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Publishing...
                      </span>
                    ) : (
                      "Publish Now"
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-foreground/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted">
            © {new Date().getFullYear()} n01.app. All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-sm text-muted">
            <Link href="/terms" className="hover:text-foreground">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link>
            <Link href="/" className="hover:text-foreground">Home</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
