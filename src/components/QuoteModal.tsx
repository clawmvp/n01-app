"use client";

import { useState } from "react";
import { PricingPackage, calculatePaymentSplit, CRYPTO_DISCOUNT } from "@/lib/pricing";

interface QuoteModalProps {
  selectedPackage: PricingPackage | null;
  customQuote: { totalPrice: number; timeline: string } | null;
  onClose: () => void;
}

export default function QuoteModal({ selectedPackage, customQuote, onClose }: QuoteModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [payWithCrypto, setPayWithCrypto] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const price = selectedPackage?.price || customQuote?.totalPrice || 0;
  const timeline = selectedPackage?.delivery || customQuote?.timeline || "TBD";
  const payment = calculatePaymentSplit(price, payWithCrypto);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          projectDescription,
          packageId: selectedPackage?.id || "custom",
          packageName: selectedPackage?.name || "CUSTOM",
          price: payment.total,
          upfront: payment.upfront,
          onDelivery: payment.onDelivery,
          timeline,
          payWithCrypto,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
      }
    } catch (error) {
      console.error("Error submitting quote:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
        <div className="bg-background rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-green-500/10 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold mb-2">Quote Submitted!</h3>
          <p className="text-muted mb-6">
            We&apos;ll review your project and send you a detailed quote with payment link within 24 hours.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-foreground text-background rounded-full font-medium hover:opacity-90 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
      <div className="bg-background rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold">
            {selectedPackage ? `${selectedPackage.name} Package` : "Custom Quote"}
          </h3>
          <button onClick={onClose} className="text-muted hover:text-foreground transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Price Summary */}
        <div className="p-4 rounded-xl bg-foreground/5 mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-muted">Total</span>
            <span className="text-2xl font-bold">${payment.total.toLocaleString()}</span>
          </div>
          {payWithCrypto && (
            <p className="text-sm text-green-500 mb-3">
              Saving ${payment.discount.toFixed(0)} with crypto payment!
            </p>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted">Upfront (20%)</span>
            <span className="font-semibold">${payment.upfront}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">On delivery (80%)</span>
            <span className="font-semibold">${payment.onDelivery}</span>
          </div>
          <div className="flex justify-between text-sm mt-2 pt-2 border-t border-foreground/10">
            <span className="text-muted">Estimated delivery</span>
            <span className="font-semibold">{timeline}</span>
          </div>
        </div>

        {/* Crypto toggle */}
        <label className="flex items-center gap-3 mb-6 cursor-pointer p-3 rounded-lg border border-foreground/10 hover:border-accent/50 transition-colors">
          <input
            type="checkbox"
            checked={payWithCrypto}
            onChange={(e) => setPayWithCrypto(e.target.checked)}
            className="w-5 h-5 rounded accent-accent"
          />
          <div>
            <span className="text-sm font-medium">Pay with crypto (USDC)</span>
            <p className="text-xs text-green-500">Save {CRYPTO_DISCOUNT * 100}% on total price</p>
          </div>
        </label>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-foreground/10 bg-transparent focus:outline-none focus:border-accent transition-colors"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-foreground/10 bg-transparent focus:outline-none focus:border-accent transition-colors"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Project Description</label>
            <textarea
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              required
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-foreground/10 bg-transparent focus:outline-none focus:border-accent transition-colors resize-none"
              placeholder="Describe your project, goals, and any specific requirements..."
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-accent text-white rounded-full font-medium hover:bg-accent/90 transition-all disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Request Quote"}
          </button>

          <p className="text-xs text-muted text-center">
            We&apos;ll send you a detailed proposal with payment link within 24 hours.
          </p>
        </form>
      </div>
    </div>
  );
}
