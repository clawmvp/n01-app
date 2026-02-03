import Image from "next/image";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-foreground/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold tracking-tight">
            n01<span className="text-accent">.app</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="#services" className="hidden sm:block text-sm text-muted hover:text-foreground transition-colors">
              Services
            </Link>
            <Link href="#work" className="hidden sm:block text-sm text-muted hover:text-foreground transition-colors">
              Work
            </Link>
            <ThemeToggle />
            <Link 
              href="#contact" 
              className="text-sm px-4 py-2 bg-foreground text-background rounded-full hover:opacity-90 transition-opacity"
            >
              Contact
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-full text-sm mb-8">
            <span className="w-2 h-2 bg-accent rounded-full animate-pulse"></span>
            AI-Powered Development
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight mb-6">
            We build
            <br />
            <span className="text-muted">intelligent</span> solutions
          </h1>
          <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto mb-12 leading-relaxed">
            From AI-powered applications to blockchain integrations, we create modern digital experiences that matter.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="#contact"
              className="px-8 py-4 bg-foreground text-background rounded-full font-medium hover:opacity-90 transition-opacity"
            >
              Start a project
            </Link>
            <Link 
              href="#work"
              className="px-8 py-4 border border-foreground/20 rounded-full font-medium hover:border-foreground/40 transition-colors"
            >
              View our work
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-accent text-sm font-medium mb-4 tracking-wide uppercase">What we do</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Full-stack AI expertise
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Service 1 */}
            <div className="group p-8 rounded-2xl border border-foreground/10 hover:border-foreground/20 transition-colors">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">AI Applications</h3>
              <p className="text-muted leading-relaxed">
                Custom AI solutions powered by GPT-4, Claude, and other cutting-edge models. From chatbots to content generation.
              </p>
            </div>

            {/* Service 2 */}
            <div className="group p-8 rounded-2xl border border-foreground/10 hover:border-foreground/20 transition-colors">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Blockchain & Web3</h3>
              <p className="text-muted leading-relaxed">
                Smart contracts, DeFi applications, and blockchain integrations. Solana, Ethereum, and beyond.
              </p>
            </div>

            {/* Service 3 */}
            <div className="group p-8 rounded-2xl border border-foreground/10 hover:border-foreground/20 transition-colors">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Modern Web Apps</h3>
              <p className="text-muted leading-relaxed">
                Next.js, React, TypeScript. Beautiful, performant applications with exceptional user experiences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Work Section */}
      <section id="work" className="py-32 px-6 bg-foreground/[0.02]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-accent text-sm font-medium mb-4 tracking-wide uppercase">Selected Work</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Recent projects
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Project 1 */}
            <div className="group relative overflow-hidden rounded-2xl bg-foreground/5">
              <div className="aspect-[16/10] relative overflow-hidden">
                <Image
                  src="https://images.pexels.com/photos/7567443/pexels-photo-7567443.jpeg?auto=compress&cs=tinysrgb&w=1200"
                  alt="Validator Dashboard"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs">
                    Blockchain
                  </span>
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs">
                    Dashboard
                  </span>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-2">01node Validator Dashboard</h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  Real-time monitoring dashboard for blockchain validators across multiple networks including Cosmos, Polkadot, and Ethereum.
                </p>
              </div>
            </div>

            {/* Project 2 */}
            <div className="group relative overflow-hidden rounded-2xl bg-foreground/5">
              <div className="aspect-[16/10] relative overflow-hidden">
                <Image
                  src="https://images.pexels.com/photos/4691567/pexels-photo-4691567.jpeg?auto=compress&cs=tinysrgb&w=1200"
                  alt="Backgammon Solana"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs">
                    Web3 Gaming
                  </span>
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs">
                    Solana
                  </span>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-2">Backgammon on Solana</h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  Decentralized backgammon game with on-chain matchmaking, betting mechanics, and mobile-first experience.
                </p>
              </div>
            </div>

            {/* Project 3 */}
            <div className="group relative overflow-hidden rounded-2xl bg-foreground/5">
              <div className="aspect-[16/10] relative overflow-hidden">
                <Image
                  src="https://images.pexels.com/photos/8438918/pexels-photo-8438918.jpeg?auto=compress&cs=tinysrgb&w=1200"
                  alt="AI Content Generator"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs">
                    AI
                  </span>
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs">
                    Content
                  </span>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-2">AI Content Studio</h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  Automated content generation platform using GPT-4 and ElevenLabs for video scripts, voiceovers, and social media content.
                </p>
              </div>
            </div>

            {/* Project 4 */}
            <div className="group relative overflow-hidden rounded-2xl bg-foreground/5">
              <div className="aspect-[16/10] relative overflow-hidden">
                <Image
                  src="https://images.pexels.com/photos/3913025/pexels-photo-3913025.jpeg?auto=compress&cs=tinysrgb&w=1200"
                  alt="Parenting App"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs">
                    Mobile
                  </span>
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs">
                    AI Assistant
                  </span>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-2">Parenting AI Companion</h3>
                <p className="text-white/80 text-sm leading-relaxed">
                  AI-powered parenting assistant with personalized advice, milestone tracking, and expert-backed guidance for new parents.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-32 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-accent text-sm font-medium mb-4 tracking-wide uppercase">Get in touch</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Let&apos;s build something
            <br />
            <span className="text-muted">together</span>
          </h2>
          <p className="text-lg text-muted mb-12 leading-relaxed">
            Have a project in mind? We&apos;d love to hear about it. Drop us a message and let&apos;s explore how we can help bring your ideas to life.
          </p>
          
          <a 
            href="mailto:ai@n01.app"
            className="inline-flex items-center gap-3 px-8 py-4 bg-foreground text-background rounded-full font-medium hover:opacity-90 transition-opacity text-lg"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            ai@n01.app
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-foreground/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted">
            © {new Date().getFullYear()} n01.app. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <a href="https://github.com/clawmvp" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-foreground transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
