"use client";

import { useState } from "react";

interface ContactFormProps {
  selectedPackage?: string;
  onSuccess?: () => void;
}

export default function ContactForm({ selectedPackage, onSuccess }: ContactFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [preferredContact, setPreferredContact] = useState<"whatsapp" | "email">("whatsapp");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

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
          selectedPackage: selectedPackage || "custom",
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        onSuccess?.();
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-6 bg-green-500/10 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold mb-2">Thank you!</h3>
        <p className="text-muted mb-4">
          We&apos;ve received your request and will contact you shortly via {preferredContact === "whatsapp" ? "WhatsApp" : "email"}.
        </p>
        <p className="text-sm text-muted">
          Expect a response within 1-2 hours during business hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
          {error}
        </div>
      )}

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
          placeholder="Briefly describe what you want to build..."
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
        We&apos;ll respond within 1-2 hours. No spam, ever.
      </p>
    </form>
  );
}
