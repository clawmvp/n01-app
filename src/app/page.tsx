import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import VideoHero from "@/components/VideoHero";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Smart Navigation */}
      <Navbar />

      {/* Hero Section with Video Background */}
      <VideoHero />

      {/* How It Works Section */}
      <section id="services" className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-accent text-sm font-medium mb-4 tracking-wide uppercase">How it works</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Autonomous project delivery
            </h2>
            <p className="text-muted mt-6 max-w-2xl mx-auto">
              Send us your requirements. Our AI agents collaborate, code, test, and deploy - all without human intervention.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="group p-8 rounded-2xl border border-foreground/10 hover:border-foreground/20 transition-colors relative">
              <div className="absolute -top-4 left-8 px-3 py-1 bg-accent text-white text-xs font-bold rounded-full">01</div>
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-6 mt-2">
                <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Describe Your Project</h3>
              <p className="text-muted leading-relaxed">
                Send us your requirements via email or chat. Our Orchestrator AI analyzes and creates the project plan.
              </p>
            </div>

            {/* Step 2 */}
            <div className="group p-8 rounded-2xl border border-foreground/10 hover:border-foreground/20 transition-colors relative">
              <div className="absolute -top-4 left-8 px-3 py-1 bg-accent text-white text-xs font-bold rounded-full">02</div>
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-6 mt-2">
                <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Agents Collaborate</h3>
              <p className="text-muted leading-relaxed">
                Specialized agents work in parallel: architecture, frontend, backend, testing, security, and deployment.
              </p>
            </div>

            {/* Step 3 */}
            <div className="group p-8 rounded-2xl border border-foreground/10 hover:border-foreground/20 transition-colors relative">
              <div className="absolute -top-4 left-8 px-3 py-1 bg-accent text-white text-xs font-bold rounded-full">03</div>
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-6 mt-2">
                <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Deployed & Live</h3>
              <p className="text-muted leading-relaxed">
                Your project goes live on Vercel with CI/CD, documentation, and full source code on GitHub.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-32 px-6 bg-foreground/[0.02]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-accent text-sm font-medium mb-4 tracking-wide uppercase">Meet the team</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              7 specialized AI agents
            </h2>
            <p className="text-muted mt-6 max-w-2xl mx-auto">
              Each agent is an expert in their domain, working together under the Orchestrator&apos;s coordination.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
            {/* NOVA - Orchestrator */}
            <div className="group text-center">
              <div className="relative mb-4 mx-auto w-24 h-24 rounded-2xl overflow-hidden ring-2 ring-transparent group-hover:ring-accent transition-all">
                <Image
                  src="/team/avatar-nova.png"
                  alt="NOVA"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h3 className="font-semibold text-sm">NOVA</h3>
              <p className="text-xs text-muted">Orchestrator</p>
            </div>

            {/* ATLAS - Architect */}
            <div className="group text-center">
              <div className="relative mb-4 mx-auto w-24 h-24 rounded-2xl overflow-hidden ring-2 ring-transparent group-hover:ring-purple-500 transition-all">
                <Image
                  src="/team/avatar-atlas.png"
                  alt="ATLAS"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="font-semibold text-sm">ATLAS</h3>
              <p className="text-xs text-muted">Architect</p>
            </div>

            {/* PIXEL - Frontend */}
            <div className="group text-center">
              <div className="relative mb-4 mx-auto w-24 h-24 rounded-2xl overflow-hidden ring-2 ring-transparent group-hover:ring-pink-500 transition-all">
                <Image
                  src="/team/avatar-pixel.png"
                  alt="PIXEL"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="font-semibold text-sm">PIXEL</h3>
              <p className="text-xs text-muted">Frontend Dev</p>
            </div>

            {/* NEXUS - Backend */}
            <div className="group text-center">
              <div className="relative mb-4 mx-auto w-24 h-24 rounded-2xl overflow-hidden ring-2 ring-transparent group-hover:ring-green-500 transition-all">
                <Image
                  src="/team/avatar-nexus.png"
                  alt="NEXUS"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="font-semibold text-sm">NEXUS</h3>
              <p className="text-xs text-muted">Backend Dev</p>
            </div>

            {/* CIPHER - DevOps */}
            <div className="group text-center">
              <div className="relative mb-4 mx-auto w-24 h-24 rounded-2xl overflow-hidden ring-2 ring-transparent group-hover:ring-orange-500 transition-all">
                <Image
                  src="/team/avatar-cipher.png"
                  alt="CIPHER"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="font-semibold text-sm">CIPHER</h3>
              <p className="text-xs text-muted">DevOps</p>
            </div>

            {/* VECTOR - QA */}
            <div className="group text-center">
              <div className="relative mb-4 mx-auto w-24 h-24 rounded-2xl overflow-hidden ring-2 ring-transparent group-hover:ring-cyan-500 transition-all">
                <Image
                  src="/team/avatar-vector.png"
                  alt="VECTOR"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="font-semibold text-sm">VECTOR</h3>
              <p className="text-xs text-muted">QA Engineer</p>
            </div>

            {/* SENTINEL - Security */}
            <div className="group text-center">
              <div className="relative mb-4 mx-auto w-24 h-24 rounded-2xl overflow-hidden ring-2 ring-transparent group-hover:ring-red-500 transition-all">
                <Image
                  src="/team/avatar-sentinel.png"
                  alt="SENTINEL"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="font-semibold text-sm">SENTINEL</h3>
              <p className="text-xs text-muted">Security</p>
            </div>
          </div>

          {/* Team Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-accent">24/7</div>
              <div className="text-sm text-muted mt-2">Always Online</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-accent">7</div>
              <div className="text-sm text-muted mt-2">Specialized Agents</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-accent">0</div>
              <div className="text-sm text-muted mt-2">Human Bottlenecks</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-accent">∞</div>
              <div className="text-sm text-muted mt-2">Parallel Tasks</div>
            </div>
          </div>
        </div>
      </section>

      {/* Work Section */}
      <section id="work" className="py-32 px-6">
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
