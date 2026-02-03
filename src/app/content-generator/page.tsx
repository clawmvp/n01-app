import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Content Generator | Marketing Content That Converts | n01.app",
  description: "Generate high-converting marketing content with AI. Social media posts, video scripts, blog articles, ad copy - all created by our AI content team.",
  keywords: ["ai content generator", "ai content creation", "ai marketing content", "ai copywriting", "automated content creation"],
  openGraph: {
    title: "AI Content Generator | Marketing Content That Converts",
    description: "Generate high-converting marketing content with AI.",
    url: "https://n01.app/content-generator",
  },
};

export default function ContentGeneratorPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-accent/10"></div>
        
        <div className="max-w-4xl mx-auto text-center relative">
          <Link href="/" className="text-2xl font-bold mb-8 inline-block">
            n01<span className="text-accent">.app</span>
          </Link>
          
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 text-purple-600 rounded-full text-sm mb-6 mt-8">
            ✨ AI-Powered Content Creation
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Content That
            <br />
            <span className="bg-gradient-to-r from-purple-500 to-accent bg-clip-text text-transparent">
              Actually Converts
            </span>
          </h1>
          
          <p className="text-xl text-muted max-w-2xl mx-auto mb-8">
            Stop staring at blank screens. Our AI creates scroll-stopping content for every platform.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/"
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-accent text-white rounded-full font-medium hover:opacity-90 transition-all text-lg"
            >
              Generate Content Now
            </Link>
          </div>
        </div>
      </section>

      {/* Content Types */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">What We Create</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: "📱",
                title: "Social Media Content",
                items: ["Twitter threads", "LinkedIn posts", "Instagram captions", "TikTok scripts"],
              },
              {
                icon: "🎬",
                title: "Video Content",
                items: ["YouTube scripts", "Explainer videos", "Ad scripts", "Product demos"],
              },
              {
                icon: "✍️",
                title: "Marketing Copy",
                items: ["Landing pages", "Email sequences", "Ad copy", "Sales pages"],
              },
              {
                icon: "📝",
                title: "Long-Form Content",
                items: ["Blog articles", "Case studies", "Whitepapers", "SEO content"],
              },
            ].map((type, i) => (
              <div key={i} className="p-6 rounded-2xl border border-foreground/10">
                <div className="text-3xl mb-4">{type.icon}</div>
                <h3 className="text-xl font-semibold mb-4">{type.title}</h3>
                <ul className="space-y-2">
                  {type.items.map((item, j) => (
                    <li key={j} className="flex items-center gap-2 text-muted">
                      <span className="w-1.5 h-1.5 bg-accent rounded-full"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-6 bg-foreground/[0.02]">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-accent bg-clip-text text-transparent">10x</div>
              <div className="text-muted mt-2">Faster Creation</div>
            </div>
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-accent bg-clip-text text-transparent">3x</div>
              <div className="text-muted mt-2">More Engagement</div>
            </div>
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-accent bg-clip-text text-transparent">$0.10</div>
              <div className="text-muted mt-2">Per Piece</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-500 font-bold">1</div>
              <h3 className="font-semibold mb-2">Tell Us What You Need</h3>
              <p className="text-sm text-muted">Brand voice, topic, platform, target audience</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-500 font-bold">2</div>
              <h3 className="font-semibold mb-2">AI Creates Content</h3>
              <p className="text-sm text-muted">Optimized for your platform and goals</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-500 font-bold">3</div>
              <h3 className="font-semibold mb-2">Review & Publish</h3>
              <p className="text-sm text-muted">Edit if needed, then watch it perform</p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 px-6 bg-foreground/[0.02]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Who It's For</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { emoji: "🚀", title: "Startups", desc: "Build your brand presence without a content team" },
              { emoji: "📈", title: "Marketers", desc: "Scale content production 10x without hiring" },
              { emoji: "🛒", title: "E-commerce", desc: "Product descriptions, ads, social at scale" },
              { emoji: "💼", title: "Agencies", desc: "Deliver more content to clients, faster" },
              { emoji: "👤", title: "Creators", desc: "Never run out of content ideas again" },
              { emoji: "🏢", title: "SMBs", desc: "Enterprise-quality content at SMB prices" },
            ].map((item, i) => (
              <div key={i} className="text-center p-6">
                <div className="text-3xl mb-3">{item.emoji}</div>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-r from-purple-500 to-accent text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Start Creating Better Content Today</h2>
          <p className="text-white/80 mb-8">Chat with ARIA to get started. First samples are free.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-accent rounded-full font-medium hover:bg-white/90"
          >
            Get Free Samples
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-foreground/10">
        <div className="max-w-4xl mx-auto text-center text-sm text-muted">
          <p>© {new Date().getFullYear()} n01.app - The First Autonomous AI Agency</p>
        </div>
      </footer>
    </div>
  );
}
