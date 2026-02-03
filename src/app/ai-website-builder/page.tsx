import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Website Builder | Build Websites with AI in 48 Hours | n01.app",
  description: "Build professional websites with AI in just 48 hours. Our team of 7 AI agents creates stunning, responsive websites starting at $49. No coding required.",
  keywords: ["ai website builder", "ai web design", "automated website creation", "ai website generator", "build website with ai"],
  openGraph: {
    title: "AI Website Builder | Build Websites with AI in 48 Hours",
    description: "Build professional websites with AI in just 48 hours. Starting at $49.",
    url: "https://n01.app/ai-website-builder",
  },
};

export default function AIWebsiteBuilderPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Link href="/" className="text-2xl font-bold mb-8 inline-block">
            n01<span className="text-accent">.app</span>
          </Link>
          
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mt-8 mb-6">
            Build Your Website with AI
            <br />
            <span className="text-accent">In Just 48 Hours</span>
          </h1>
          
          <p className="text-xl text-muted max-w-2xl mx-auto mb-8">
            No designers. No developers. No meetings. Just describe what you want, and our AI team builds it for you.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Link
              href="/pricing"
              className="px-8 py-4 bg-accent text-white rounded-full font-medium hover:bg-accent/90 transition-all text-lg"
            >
              Start Building - $49
            </Link>
            <Link
              href="/#work"
              className="px-8 py-4 border border-foreground/20 rounded-full font-medium hover:border-foreground/40 transition-all text-lg"
            >
              See Examples
            </Link>
          </div>

          <div className="flex justify-center gap-8 text-sm text-muted">
            <span>✓ 48-hour delivery</span>
            <span>✓ Full source code</span>
            <span>✓ 5 revisions included</span>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-foreground/[0.02]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How Our AI Website Builder Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="font-semibold mb-2">1. Describe Your Website</h3>
              <p className="text-muted text-sm">Tell ARIA, our AI assistant, what you need. Landing page? Portfolio? Business site?</p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="font-semibold mb-2">2. AI Team Builds It</h3>
              <p className="text-muted text-sm">7 specialized AI agents collaborate to design, code, and test your website.</p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="font-semibold mb-2">3. Go Live</h3>
              <p className="text-muted text-sm">Your website is deployed on Vercel with full source code on GitHub.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">What You Get</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: "🎨", title: "Custom Design", desc: "Unique design tailored to your brand, not a template" },
              { icon: "📱", title: "Mobile Responsive", desc: "Looks perfect on desktop, tablet, and mobile" },
              { icon: "⚡", title: "Lightning Fast", desc: "Optimized for Core Web Vitals and SEO" },
              { icon: "🔒", title: "Secure & Reliable", desc: "Hosted on Vercel with SSL and global CDN" },
              { icon: "📊", title: "SEO Optimized", desc: "Built-in SEO best practices from day one" },
              { icon: "💻", title: "Full Source Code", desc: "You own everything, hosted on your GitHub" },
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

      {/* Pricing */}
      <section className="py-20 px-6 bg-foreground/[0.02]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-muted mb-12">No hidden fees. No hourly rates. Just one simple price.</p>
          
          <div className="inline-block p-8 rounded-2xl border border-accent bg-accent/5">
            <div className="text-sm text-accent font-medium mb-2">STARTER PACKAGE</div>
            <div className="text-5xl font-bold mb-2">$49</div>
            <div className="text-muted mb-6">one-time payment</div>
            
            <ul className="text-left space-y-3 mb-8">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> 1-3 page website
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Custom responsive design
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Contact form included
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> SEO optimization
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> 48-hour delivery
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> 5 revision rounds
              </li>
            </ul>
            
            <Link
              href="/pricing"
              className="block w-full py-4 bg-accent text-white rounded-full font-medium hover:bg-accent/90"
            >
              Get Started Now
            </Link>
          </div>
          
          <p className="text-sm text-muted mt-8">
            Need more pages or features? <Link href="/pricing" className="text-accent hover:underline">See all packages</Link>
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            {[
              {
                q: "How does AI build my website?",
                a: "Our team of 7 specialized AI agents collaborates to create your website. PIXEL handles design, NEXUS builds functionality, VECTOR tests everything, and CIPHER deploys it. No human developers involved.",
              },
              {
                q: "Will my website look like a template?",
                a: "No! Each website is custom-designed based on your requirements. Our AI creates unique designs tailored to your brand and content.",
              },
              {
                q: "Can I edit the website after delivery?",
                a: "Yes! You receive full source code on GitHub. You can edit it yourself or use our revision rounds for changes.",
              },
              {
                q: "What if I need more than 3 pages?",
                a: "Check out our PRO ($133) or SCALE ($333) packages for larger websites with more features.",
              },
            ].map((faq, i) => (
              <div key={i} className="p-6 rounded-xl border border-foreground/10">
                <h3 className="font-semibold mb-2">{faq.q}</h3>
                <p className="text-muted text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-accent/5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Build Your Website?</h2>
          <p className="text-muted mb-8">Talk to ARIA, our AI assistant, and get started in minutes.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-white rounded-full font-medium hover:bg-accent/90"
          >
            Chat with ARIA
            <span>→</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-foreground/10">
        <div className="max-w-4xl mx-auto text-center text-sm text-muted">
          <p>© {new Date().getFullYear()} n01.app - The First Autonomous AI Agency</p>
          <div className="flex justify-center gap-6 mt-4">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <Link href="/pricing" className="hover:text-foreground">Pricing</Link>
            <Link href="/ai-website-builder" className="hover:text-foreground">AI Website Builder</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
