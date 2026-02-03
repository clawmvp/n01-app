"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { packages, PricingPackage, CRYPTO_DISCOUNT } from "@/lib/pricing";
import PricingCard from "@/components/PricingCard";
import QuoteCalculator from "@/components/QuoteCalculator";
import QuoteModal from "@/components/QuoteModal";

export default function PricingPage() {
  const [selectedPackage, setSelectedPackage] = useState<PricingPackage | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [customQuote, setCustomQuote] = useState<{ totalPrice: number; timeline: string } | null>(null);

  const handlePackageSelect = (pkg: PricingPackage) => {
    setSelectedPackage(pkg);
    setCustomQuote(null);
    setShowQuoteModal(true);
  };

  const handleCustomQuote = (quote: { totalPrice: number; timeline: string }) => {
    setSelectedPackage(null);
    setCustomQuote(quote);
    setShowQuoteModal(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-foreground/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="n01.app" width={36} height={36} className="rounded-lg" />
            <span className="text-xl font-semibold tracking-tight">
              n01<span className="text-accent">.app</span>
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/#services" className="hidden sm:block text-sm text-muted hover:text-foreground transition-colors">
              How it works
            </Link>
            <Link href="/#team" className="hidden sm:block text-sm text-muted hover:text-foreground transition-colors">
              Team
            </Link>
            <Link href="/pricing" className="hidden sm:block text-sm text-accent font-medium">
              Pricing
            </Link>
            <Link
              href="/#contact"
              className="text-sm px-4 py-2 bg-foreground text-background rounded-full hover:opacity-90 transition-opacity"
            >
              Contact
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-500 rounded-full text-sm mb-8">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            {CRYPTO_DISCOUNT * 100}% discount for crypto payments
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Simple, transparent
            <br />
            <span className="text-muted">pricing</span>
          </h1>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            No hidden fees. No hourly rates. Pay 20% upfront, 80% on delivery.
            <br />
            All packages include 5 revision rounds and full source code.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <PricingCard key={pkg.id} package={pkg} onSelect={handlePackageSelect} />
            ))}
          </div>
        </div>
      </section>

      {/* Custom Calculator */}
      <section className="py-20 px-6 bg-foreground/[0.02]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Need something custom?</h2>
            <p className="text-muted">
              Use our calculator to estimate your project or describe your requirements for a custom quote.
            </p>
          </div>
          <QuoteCalculator onQuoteGenerated={handleCustomQuote} />
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div className="p-6 rounded-xl border border-foreground/10">
              <h3 className="font-semibold mb-2">How does the payment work?</h3>
              <p className="text-muted text-sm">
                You pay 20% upfront when accepting the quote. The remaining 80% is due upon project delivery and your approval. We accept both fiat (card, bank transfer) and crypto (USDC on Solana with 5% discount).
              </p>
            </div>
            
            <div className="p-6 rounded-xl border border-foreground/10">
              <h3 className="font-semibold mb-2">What&apos;s included in the 5 revision rounds?</h3>
              <p className="text-muted text-sm">
                Each revision round allows you to request changes to design, functionality, or content. We&apos;ll implement your feedback and present the updated version. Additional rounds can be purchased if needed.
              </p>
            </div>
            
            <div className="p-6 rounded-xl border border-foreground/10">
              <h3 className="font-semibold mb-2">Do I get the source code?</h3>
              <p className="text-muted text-sm">
                Yes! All projects include full source code delivered via GitHub. You own 100% of the code and can modify, deploy, or transfer it as you wish.
              </p>
            </div>
            
            <div className="p-6 rounded-xl border border-foreground/10">
              <h3 className="font-semibold mb-2">How fast is the delivery?</h3>
              <p className="text-muted text-sm">
                Our AI agents work 24/7. STARTER packages are delivered in 48 hours, PRO in 5 days, and SCALE in 10 days. Custom timelines are estimated based on project complexity.
              </p>
            </div>
            
            <div className="p-6 rounded-xl border border-foreground/10">
              <h3 className="font-semibold mb-2">What if I&apos;m not satisfied?</h3>
              <p className="text-muted text-sm">
                We offer unlimited revisions within the 5 included rounds to ensure your satisfaction. If we can&apos;t deliver what was agreed upon, we&apos;ll refund your upfront payment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-accent/5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to start your project?</h2>
          <p className="text-muted mb-8">
            Leave your details and our AI team will contact you within 1-2 hours to discuss your requirements.
          </p>
          <button
            onClick={() => {
              setSelectedPackage(null);
              setCustomQuote(null);
              setShowQuoteModal(true);
            }}
            className="inline-flex items-center gap-3 px-8 py-4 bg-accent text-white rounded-full font-medium hover:bg-accent/90 transition-all text-lg"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Get Quote
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-foreground/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted">
            © {new Date().getFullYear()} n01.app. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <Link href="/" className="text-sm text-muted hover:text-foreground transition-colors">
              Home
            </Link>
            <Link href="/pricing" className="text-sm text-muted hover:text-foreground transition-colors">
              Pricing
            </Link>
            <button
              onClick={() => {
                setSelectedPackage(null);
                setCustomQuote(null);
                setShowQuoteModal(true);
              }}
              className="text-sm text-accent hover:text-accent/80 transition-colors font-medium"
            >
              Get Quote
            </button>
            <a href="https://github.com/clawmvp" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-foreground transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </footer>

      {/* Quote Modal */}
      {showQuoteModal && (
        <QuoteModal
          selectedPackage={selectedPackage}
          customQuote={customQuote}
          onClose={() => setShowQuoteModal(false)}
        />
      )}
    </div>
  );
}
