"use client";

import Link from "next/link";

const integrations = [
  {
    name: "TikTok",
    description: "Publish AI-generated videos directly to TikTok",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
      </svg>
    ),
    color: "from-[#00f2ea] to-[#ff0050]",
    bgColor: "bg-black",
    href: "/integrations/tiktok",
    status: "available",
  },
  {
    name: "Instagram",
    description: "Share reels and posts to Instagram",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
    color: "from-[#833AB4] via-[#FD1D1D] to-[#F77737]",
    bgColor: "bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737]",
    href: "#",
    status: "coming_soon",
  },
  {
    name: "YouTube",
    description: "Upload videos and shorts to YouTube",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
    color: "from-[#FF0000] to-[#CC0000]",
    bgColor: "bg-[#FF0000]",
    href: "#",
    status: "coming_soon",
  },
  {
    name: "Twitter/X",
    description: "Post tweets, threads, and videos",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
    color: "from-black to-gray-800",
    bgColor: "bg-black",
    href: "#",
    status: "coming_soon",
  },
];

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-foreground/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            n01<span className="text-accent">.app</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/integrations" className="text-sm font-medium text-accent">
              Integrations
            </Link>
            <Link href="/pricing" className="text-sm text-muted hover:text-foreground">
              Pricing
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Publish Everywhere
            <br />
            <span className="text-accent">From One Dashboard</span>
          </h1>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            Connect your social media accounts and let our AI publish content directly. 
            No more downloading, uploading, or switching between apps.
          </p>
        </div>
      </section>

      {/* Integrations Grid */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {integrations.map((integration) => (
              <Link
                key={integration.name}
                href={integration.href}
                className={`p-6 rounded-2xl border border-foreground/10 hover:border-foreground/20 transition-all ${
                  integration.status === "coming_soon" ? "opacity-60 cursor-not-allowed" : ""
                }`}
                onClick={(e) => integration.status === "coming_soon" && e.preventDefault()}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-16 h-16 ${integration.bgColor} rounded-2xl flex items-center justify-center text-white shrink-0`}>
                    {integration.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-semibold">{integration.name}</h3>
                      {integration.status === "coming_soon" && (
                        <span className="text-xs bg-foreground/10 px-2 py-1 rounded-full">Coming Soon</span>
                      )}
                      {integration.status === "available" && (
                        <span className="text-xs bg-green-500/10 text-green-600 px-2 py-1 rounded-full">Available</span>
                      )}
                    </div>
                    <p className="text-muted">{integration.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Need a Different Integration?</h2>
          <p className="text-muted mb-6">Let us know which platform you want to connect.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-full font-medium hover:bg-accent/90"
          >
            Contact Us
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-foreground/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted">
            © {new Date().getFullYear()} n01.app. All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-sm text-muted">
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/" className="hover:text-foreground">Home</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
