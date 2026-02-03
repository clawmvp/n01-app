import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Build SaaS with AI | AI-Powered SaaS Development | n01.app",
  description: "Build your SaaS product with AI in days, not months. Our AI team handles frontend, backend, auth, payments, and deployment. Starting at $133.",
  keywords: ["build saas with ai", "ai saas development", "saas builder ai", "create saas application", "ai app development"],
  openGraph: {
    title: "Build SaaS with AI | AI-Powered SaaS Development",
    description: "Build your SaaS product with AI in days, not months. Starting at $133.",
    url: "https://n01.app/saas-development",
  },
};

export default function SaaSDevelopmentPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Link href="/" className="text-2xl font-bold mb-8 inline-block">
            n01<span className="text-accent">.app</span>
          </Link>
          
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mt-8 mb-6">
            Build Your SaaS
            <br />
            <span className="text-accent">With AI Power</span>
          </h1>
          
          <p className="text-xl text-muted max-w-2xl mx-auto mb-8">
            From idea to deployed SaaS in 5-10 days. Auth, payments, database, admin panel - all handled by our AI team.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Link
              href="/pricing"
              className="px-8 py-4 bg-accent text-white rounded-full font-medium hover:bg-accent/90 transition-all text-lg"
            >
              Start Building - From $133
            </Link>
          </div>
        </div>
      </section>

      {/* What We Build */}
      <section className="py-20 px-6 bg-foreground/[0.02]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Full-Stack SaaS. AI-Built.</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: "🔐", title: "User Authentication", desc: "Sign up, login, password reset, social auth - all secure and ready" },
              { icon: "💳", title: "Payment Processing", desc: "Stripe integration for subscriptions, one-time payments, usage billing" },
              { icon: "🗄️", title: "Database Design", desc: "PostgreSQL + Prisma for a scalable, type-safe data layer" },
              { icon: "👤", title: "User Dashboard", desc: "Clean, functional dashboard for your users" },
              { icon: "⚙️", title: "Admin Panel", desc: "Manage users, view analytics, control settings" },
              { icon: "📧", title: "Email System", desc: "Transactional emails, notifications, sequences" },
              { icon: "🔌", title: "API Layer", desc: "RESTful or GraphQL APIs for integrations" },
              { icon: "📊", title: "Analytics", desc: "Built-in tracking and reporting" },
            ].map((feature, i) => (
              <div key={i} className="flex gap-4 p-6 rounded-xl border border-foreground/10 bg-background">
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

      {/* Tech Stack */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Modern Tech Stack</h2>
          <p className="text-muted text-center mb-12">Built with the tools top startups use</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "Next.js 15", desc: "React framework" },
              { name: "TypeScript", desc: "Type safety" },
              { name: "Tailwind CSS", desc: "Styling" },
              { name: "PostgreSQL", desc: "Database" },
              { name: "Prisma", desc: "ORM" },
              { name: "NextAuth", desc: "Authentication" },
              { name: "Stripe", desc: "Payments" },
              { name: "Vercel", desc: "Deployment" },
            ].map((tech, i) => (
              <div key={i} className="text-center p-6 rounded-xl border border-foreground/10">
                <div className="font-semibold">{tech.name}</div>
                <div className="text-sm text-muted">{tech.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="py-20 px-6 bg-foreground/[0.02]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Choose Your Package</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* PRO */}
            <div className="p-8 rounded-2xl border border-foreground/10 bg-background">
              <div className="text-sm text-muted mb-2">PRO</div>
              <div className="text-4xl font-bold mb-4">$133</div>
              <p className="text-muted mb-6">Perfect for MVPs and early-stage products</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm">
                  <span className="text-green-500">✓</span> 5-10 pages/screens
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="text-green-500">✓</span> User authentication
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="text-green-500">✓</span> Database integration
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="text-green-500">✓</span> API development
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="text-green-500">✓</span> 5-day delivery
                </li>
              </ul>
              <Link
                href="/pricing"
                className="block w-full py-3 text-center border border-foreground/20 rounded-full hover:border-foreground/40"
              >
                Get Started
              </Link>
            </div>

            {/* SCALE */}
            <div className="p-8 rounded-2xl border-2 border-accent bg-accent/5">
              <div className="text-sm text-accent mb-2">SCALE - Recommended</div>
              <div className="text-4xl font-bold mb-4">$333</div>
              <p className="text-muted mb-6">Full-featured SaaS ready to scale</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm">
                  <span className="text-green-500">✓</span> Everything in PRO
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="text-green-500">✓</span> Payment processing
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="text-green-500">✓</span> Admin dashboard
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="text-green-500">✓</span> Mobile-ready PWA
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="text-green-500">✓</span> Documentation
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="text-green-500">✓</span> 10-day delivery
                </li>
              </ul>
              <Link
                href="/pricing"
                className="block w-full py-3 text-center bg-accent text-white rounded-full hover:bg-accent/90"
              >
                Build My SaaS
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Your SaaS Idea Deserves to Ship</h2>
          <p className="text-muted mb-8">Stop planning. Start building. Our AI team is ready.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-white rounded-full font-medium hover:bg-accent/90"
          >
            Talk to ARIA
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
