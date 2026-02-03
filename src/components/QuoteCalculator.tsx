"use client";

import { useState } from "react";
import { estimateCustomProject, calculatePaymentSplit, CRYPTO_DISCOUNT } from "@/lib/pricing";

interface QuoteCalculatorProps {
  onQuoteGenerated?: (quote: ReturnType<typeof estimateCustomProject>) => void;
}

export default function QuoteCalculator({ onQuoteGenerated }: QuoteCalculatorProps) {
  const [pages, setPages] = useState(5);
  const [features, setFeatures] = useState(3);
  const [integrations, setIntegrations] = useState(1);
  const [hasAuth, setHasAuth] = useState(false);
  const [hasPayments, setHasPayments] = useState(false);
  const [hasMobile, setHasMobile] = useState(false);
  const [payWithCrypto, setPayWithCrypto] = useState(false);

  const quote = estimateCustomProject({
    pages,
    features,
    integrations,
    hasAuth,
    hasPayments,
    hasMobile,
  });

  const payment = calculatePaymentSplit(quote.totalPrice, payWithCrypto);

  return (
    <div className="p-8 rounded-2xl border border-foreground/10 bg-foreground/[0.02]">
      <h3 className="text-2xl font-bold mb-2">Custom Project Calculator</h3>
      <p className="text-muted mb-8">Estimate your project cost instantly</p>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Sliders */}
        <div className="space-y-6">
          {/* Pages */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium">Pages / Screens</label>
              <span className="text-sm text-accent font-bold">{pages}</span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              value={pages}
              onChange={(e) => setPages(Number(e.target.value))}
              className="w-full h-2 bg-foreground/10 rounded-lg appearance-none cursor-pointer accent-accent"
            />
          </div>

          {/* Features */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium">Core Features</label>
              <span className="text-sm text-accent font-bold">{features}</span>
            </div>
            <input
              type="range"
              min="1"
              max="15"
              value={features}
              onChange={(e) => setFeatures(Number(e.target.value))}
              className="w-full h-2 bg-foreground/10 rounded-lg appearance-none cursor-pointer accent-accent"
            />
          </div>

          {/* Integrations */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium">API Integrations</label>
              <span className="text-sm text-accent font-bold">{integrations}</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={integrations}
              onChange={(e) => setIntegrations(Number(e.target.value))}
              className="w-full h-2 bg-foreground/10 rounded-lg appearance-none cursor-pointer accent-accent"
            />
          </div>

          {/* Toggles */}
          <div className="space-y-3 pt-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={hasAuth}
                onChange={(e) => setHasAuth(e.target.checked)}
                className="w-5 h-5 rounded accent-accent"
              />
              <span className="text-sm">User Authentication (+$100)</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={hasPayments}
                onChange={(e) => setHasPayments(e.target.checked)}
                className="w-5 h-5 rounded accent-accent"
              />
              <span className="text-sm">Payment Processing (+$150)</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={hasMobile}
                onChange={(e) => setHasMobile(e.target.checked)}
                className="w-5 h-5 rounded accent-accent"
              />
              <span className="text-sm">Mobile App (PWA) (+$200)</span>
            </label>
          </div>
        </div>

        {/* Quote Result */}
        <div className="bg-background p-6 rounded-xl border border-foreground/10">
          <div className="text-center mb-6">
            <p className="text-sm text-muted mb-2">Estimated Total</p>
            <div className="text-5xl font-bold">
              ${payment.total.toLocaleString()}
            </div>
            {payWithCrypto && (
              <p className="text-sm text-green-500 mt-2">
                You save ${payment.discount.toFixed(0)} with crypto!
              </p>
            )}
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Upfront (20%)</span>
              <span className="font-semibold">${payment.upfront.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">On delivery (80%)</span>
              <span className="font-semibold">${payment.onDelivery.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm pt-3 border-t border-foreground/10">
              <span className="text-muted">Estimated delivery</span>
              <span className="font-semibold">{quote.timeline}</span>
            </div>
          </div>

          {/* Crypto toggle */}
          <label className="flex items-center justify-center gap-3 mb-6 cursor-pointer p-3 rounded-lg bg-foreground/5">
            <input
              type="checkbox"
              checked={payWithCrypto}
              onChange={(e) => setPayWithCrypto(e.target.checked)}
              className="w-5 h-5 rounded accent-accent"
            />
            <span className="text-sm">
              Pay with crypto <span className="text-green-500">(-{CRYPTO_DISCOUNT * 100}%)</span>
            </span>
          </label>

          <button
            onClick={() => onQuoteGenerated?.(quote)}
            className="w-full py-4 bg-accent text-white rounded-full font-medium hover:bg-accent/90 transition-all"
          >
            Get Custom Quote
          </button>

          <p className="text-xs text-muted text-center mt-4">
            5 revision rounds included
          </p>
        </div>
      </div>
    </div>
  );
}
