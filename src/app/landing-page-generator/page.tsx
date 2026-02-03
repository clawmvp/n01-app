import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Landing Page Generator | Create Converting Pages in 48h | n01.app",
  description: "Generate high-converting landing pages with AI. Our AI team creates stunning, optimized landing pages that convert visitors into customers. Starting at $49.",
  keywords: ["ai landing page generator", "ai landing page builder", "automated landing page", "landing page ai", "create landing page with ai"],
  openGraph: {
    title: "AI Landing Page Generator | Create Converting Pages in 48h",
    description: "Generate high-converting landing pages with AI. Starting at $49.",
    url: "https://n01.app/landing-page-generator",
  },
};

export default function LandingPageGeneratorPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="py-20 px-6 bg-gradient-to-b from-accent/5 to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <Link href="/" className="text-2xl font-bold mb-8 inline-block">
            n01<span className="text-accent">.app</span>
          </Link>
          
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-600 rounded-full text-sm mb-6 mt-8">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Average conversion rate: 12.4%
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            AI Landing Page Generator
            <br />
            <span className="text-accent">That Actually Converts</span>
          </h1>
          
          <p className="text-xl text-muted max-w-2xl mx-auto mb-8">
            Stop tweaking templates. Let AI create a landing page optimized for conversions from day one.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Link
              href="/pricing"
              className="px-8 py-4 bg-accent text-white rounded-full font-medium hover:bg-accent/90 transition-all text-lg"
            >
              Generate My Page - $49
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto text-center">
            <div>
              <div className="text-3xl font-bold text-accent">48h</div>
              <div className="text-sm text-muted">Delivery</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent">12%</div>
              <div className="text-sm text-muted">Avg. CVR</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent">$49</div>
              <div className="text-sm text-muted">One-time</div>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes a Great Landing Page */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">What Our AI Builds Into Every Page</h2>
          <p className="text-muted text-center mb-12">Conversion optimization is built-in, not bolted on.</p>
          
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: "🎯", title: "Clear Value Proposition", desc: "Above-the-fold messaging that instantly communicates your offer" },
              { icon: "🧠", title: "Psychological Triggers", desc: "Social proof, urgency, and scarcity elements that drive action" },
              { icon: "📱", title: "Mobile-First Design", desc: "60% of traffic is mobile. We optimize for that first." },
              { icon: "⚡", title: "Lightning Fast", desc: "Sub-second load times for better conversions and SEO" },
              { icon: "🎨", title: "Visual Hierarchy", desc: "Eye-tracking optimized layouts that guide visitors to CTAs" },
              { icon: "📝", title: "Compelling Copy", desc: "AI-written headlines and body copy that resonates" },
              { icon: "🔘", title: "Strategic CTAs", desc: "Button placement and copy optimized for clicks" },
              { icon: "📊", title: "Analytics Ready", desc: "Tracking built-in from day one" },
            ].map((feature, i) => (
              <div key={i} className="flex gap-4 p-6 rounded-xl border border-foreground/10">
                <span className="text-2xl">{feature.icon}</span>
                <div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 px-6 bg-foreground/[0.02]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Perfect For</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { emoji: "🚀", title: "SaaS Launches", desc: "Pre-launch pages, waitlists, beta signups" },
              { emoji: "📦", title: "Product Pages", desc: "eCommerce products, digital downloads" },
              { emoji: "📚", title: "Lead Magnets", desc: "Ebook downloads, webinar signups" },
              { emoji: "🎯", title: "PPC Campaigns", desc: "Google Ads, Facebook Ads landing pages" },
              { emoji: "💼", title: "Services", desc: "Consulting, agencies, freelancers" },
              { emoji: "🎉", title: "Events", desc: "Conferences, workshops, meetups" },
            ].map((item, i) => (
              <div key={i} className="text-center p-6 rounded-xl border border-foreground/10">
                <div className="text-4xl mb-4">{item.emoji}</div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">From Brief to Live in 48 Hours</h2>
          
          <div className="space-y-8">
            {[
              { step: "1", title: "Share Your Offer", desc: "Tell us about your product, service, or offer. What's the goal? Who's the audience?" },
              { step: "2", title: "AI Creates Your Page", desc: "Our AI team writes copy, designs layout, builds the page, and optimizes for conversions." },
              { step: "3", title: "Review & Refine", desc: "Get your preview. Request changes. We iterate until it's perfect (5 rounds included)." },
              { step: "4", title: "Go Live", desc: "Your page deploys to Vercel. You get the code on GitHub. Start converting." },
            ].map((item, i) => (
              <div key={i} className="flex gap-6 items-start">
                <div className="w-12 h-12 bg-accent text-white rounded-full flex items-center justify-center font-bold shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                  <p className="text-muted">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-accent text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Your Landing Page is 48 Hours Away</h2>
          <p className="text-white/80 mb-8">Stop losing conversions to bad design. Let AI build you a page that works.</p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-accent rounded-full font-medium hover:bg-white/90"
          >
            Start for $49
          </Link>
          <p className="text-sm text-white/60 mt-4">5% off with crypto payment</p>
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
