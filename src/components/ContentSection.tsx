"use client";

import { useState } from "react";

const contentTypes = [
  {
    id: "social",
    icon: "📱",
    title: "Social Media",
    description: "Viral posts, threads, carousels",
    examples: ["Twitter threads", "LinkedIn posts", "Instagram captions"],
  },
  {
    id: "video",
    icon: "🎬",
    title: "Video Scripts",
    description: "YouTube, TikTok, ads",
    examples: ["Explainer videos", "Product demos", "Ad scripts"],
  },
  {
    id: "copy",
    icon: "✍️",
    title: "Marketing Copy",
    description: "Headlines, CTAs, landing pages",
    examples: ["Sales pages", "Email sequences", "Ad copy"],
  },
  {
    id: "blog",
    icon: "📝",
    title: "Long-form Content",
    description: "Articles, guides, whitepapers",
    examples: ["SEO articles", "Case studies", "Tutorials"],
  },
];

export default function ContentSection() {
  const [activeType, setActiveType] = useState("social");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Content Interest",
          email,
          phone: "N/A",
          projectDescription: `Interested in AI content generation - ${activeType}`,
          preferredContact: "email",
          selectedPackage: "CONTENT",
          source: "content-section",
        }),
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <section className="py-32 px-6 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-accent/10"></div>
      
      {/* Animated blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>

      <div className="max-w-6xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-accent/10 rounded-full text-sm mb-6">
            <span className="animate-pulse">✨</span>
            <span className="font-medium bg-gradient-to-r from-purple-500 to-accent bg-clip-text text-transparent">
              AI-Powered Content
            </span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Create content that
            <br />
            <span className="bg-gradient-to-r from-purple-500 to-accent bg-clip-text text-transparent">
              actually converts
            </span>
          </h2>
          
          <p className="text-lg text-muted max-w-2xl mx-auto">
            Our AI generates high-converting marketing content in seconds. 
            From viral social posts to complete sales funnels.
          </p>
        </div>

        {/* Content Type Selector */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {contentTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setActiveType(type.id)}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                activeType === type.id
                  ? "bg-gradient-to-r from-purple-500 to-accent text-white shadow-lg shadow-accent/25"
                  : "bg-foreground/5 hover:bg-foreground/10"
              }`}
            >
              <span className="mr-2">{type.icon}</span>
              {type.title}
            </button>
          ))}
        </div>

        {/* Active Content Display */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          {/* Left: Description */}
          <div>
            {contentTypes.map((type) => (
              type.id === activeType && (
                <div key={type.id} className="animate-fadeIn">
                  <div className="text-6xl mb-6">{type.icon}</div>
                  <h3 className="text-3xl font-bold mb-4">{type.title}</h3>
                  <p className="text-lg text-muted mb-6">{type.description}</p>
                  
                  <div className="space-y-3">
                    <p className="font-medium">What we create:</p>
                    <ul className="space-y-2">
                      {type.examples.map((example, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <span className="w-6 h-6 bg-accent/10 rounded-full flex items-center justify-center text-accent text-sm">✓</span>
                          {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )
            ))}
          </div>

          {/* Right: Demo/Stats */}
          <div className="relative">
            <div className="bg-gradient-to-br from-foreground/5 to-foreground/10 rounded-3xl p-8 border border-foreground/10">
              {/* Fake content preview */}
              <div className="bg-background rounded-2xl p-6 shadow-xl mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-accent rounded-full"></div>
                  <div>
                    <div className="font-semibold">AI Generated Post</div>
                    <div className="text-xs text-muted">Just now • 🤖 by n01.app</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-foreground/10 rounded-full w-full"></div>
                  <div className="h-3 bg-foreground/10 rounded-full w-4/5"></div>
                  <div className="h-3 bg-foreground/10 rounded-full w-3/4"></div>
                </div>
                <div className="flex gap-4 mt-4 text-sm text-muted">
                  <span>❤️ 2.4k</span>
                  <span>💬 156</span>
                  <span>🔄 847</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-accent bg-clip-text text-transparent">10x</div>
                  <div className="text-xs text-muted">Faster</div>
                </div>
                <div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-accent bg-clip-text text-transparent">3x</div>
                  <div className="text-xs text-muted">More Engagement</div>
                </div>
                <div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-accent bg-clip-text text-transparent">$0.10</div>
                  <div className="text-xs text-muted">Per Post</div>
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
              ✓ SEO Optimized
            </div>
            <div className="absolute -bottom-4 -left-4 bg-purple-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
              🎯 High Converting
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          {submitted ? (
            <div className="inline-flex items-center gap-3 px-8 py-4 bg-green-500/10 text-green-600 rounded-2xl">
              <span className="text-2xl">✓</span>
              <span>Thanks! We'll send you samples soon.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="inline-flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 rounded-full bg-foreground/5 border border-foreground/10 focus:outline-none focus:border-accent"
                required
              />
              <button
                type="submit"
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-accent text-white rounded-full font-medium hover:shadow-lg hover:shadow-accent/25 transition-all"
              >
                Get Free Samples
              </button>
            </form>
          )}
          <p className="text-sm text-muted mt-4">
            No credit card required • See AI-generated samples in your inbox
          </p>
        </div>
      </div>
    </section>
  );
}
