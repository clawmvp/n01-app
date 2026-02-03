"use client";

import { useState } from "react";
import { PricingPackage, calculatePaymentSplit } from "@/lib/pricing";

interface QuoteModalProps {
  selectedPackage: PricingPackage | null;
  customQuote: { totalPrice: number; timeline: string } | null;
  onClose: () => void;
}

export default function QuoteModal({ selectedPackage, customQuote, onClose }: QuoteModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [preferredContact, setPreferredContact] = useState<"whatsapp" | "email">("whatsapp");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const price = selectedPackage?.price || customQuote?.totalPrice || 0;
  const timeline = selectedPackage?.delivery || customQuote?.timeline || "TBD";
  const payment = calculatePaymentSplit(price, false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          projectDescription,
          preferredContact,
          selectedPackage: selectedPackage?.name || "CUSTOM",
        }),
      });

      if (response.ok) {
        setSubmitted(true);
      }
    } catch (error) {
      console.error("Error submitting:", error);
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
          <h3 className="text-2xl font-bold mb-2">Thank you!</h3>
          <p className="text-muted mb-6">
            We&apos;ll contact you via {preferredContact === "whatsapp" ? "WhatsApp" : "email"} within 1-2 hours to discuss your project in detail.
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
            {selectedPackage ? `${selectedPackage.name} Package` : "Custom Project"}
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
            <span className="text-muted">Starting from</span>
            <span className="text-2xl font-bold">${payment.total}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">Estimated delivery</span>
            <span className="font-semibold">{timeline}</span>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span className="text-muted">Payment</span>
            <span className="font-semibold">20% upfront, 80% on delivery</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Your Name *</label>
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
            <label className="block text-sm font-medium mb-2">Email *</label>
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
            <label className="block text-sm font-medium mb-2">Phone / WhatsApp *</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-foreground/10 bg-transparent focus:outline-none focus:border-accent transition-colors"
              placeholder="+1 234 567 8900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tell us about your project</label>
            <textarea
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-foreground/10 bg-transparent focus:outline-none focus:border-accent transition-colors resize-none"
              placeholder="Briefly describe what you need..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">How should we contact you?</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPreferredContact("whatsapp")}
                className={`flex-1 py-3 px-4 rounded-xl border transition-all flex items-center justify-center gap-2 ${
                  preferredContact === "whatsapp"
                    ? "border-green-500 bg-green-500/10 text-green-600"
                    : "border-foreground/10 hover:border-foreground/20"
                }`}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp
              </button>
              <button
                type="button"
                onClick={() => setPreferredContact("email")}
                className={`flex-1 py-3 px-4 rounded-xl border transition-all flex items-center justify-center gap-2 ${
                  preferredContact === "email"
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-foreground/10 hover:border-foreground/20"
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-accent text-white rounded-full font-medium hover:bg-accent/90 transition-all disabled:opacity-50"
          >
            {isSubmitting ? "Sending..." : "Get in Touch"}
          </button>

          <p className="text-xs text-muted text-center">
            We&apos;ll respond within 1-2 hours to discuss your project.
          </p>
        </form>
      </div>
    </div>
  );
}
