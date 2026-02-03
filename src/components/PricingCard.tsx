"use client";

import { PricingPackage, calculatePaymentSplit } from "@/lib/pricing";

interface PricingCardProps {
  package: PricingPackage;
  onSelect: (pkg: PricingPackage) => void;
}

export default function PricingCard({ package: pkg, onSelect }: PricingCardProps) {
  const payment = calculatePaymentSplit(pkg.price);

  return (
    <div
      className={`relative flex flex-col p-8 rounded-2xl border transition-all hover:scale-[1.02] ${
        pkg.popular
          ? "border-accent bg-accent/5 shadow-lg shadow-accent/10"
          : "border-foreground/10 hover:border-foreground/20"
      }`}
    >
      {pkg.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent text-white text-xs font-bold rounded-full">
          MOST POPULAR
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-bold tracking-wide text-muted">{pkg.name}</h3>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-5xl font-bold">${pkg.price}</span>
          <span className="text-muted">one-time</span>
        </div>
        <p className="mt-2 text-sm text-muted">{pkg.description}</p>
      </div>

      <div className="mb-6 p-4 rounded-xl bg-foreground/5">
        <div className="flex justify-between text-sm">
          <span className="text-muted">Upfront (20%)</span>
          <span className="font-semibold">${payment.upfront}</span>
        </div>
        <div className="flex justify-between text-sm mt-1">
          <span className="text-muted">On delivery (80%)</span>
          <span className="font-semibold">${payment.onDelivery}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6 text-sm">
        <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Delivery: <strong>{pkg.delivery}</strong></span>
      </div>

      <ul className="flex-1 space-y-3 mb-8">
        {pkg.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3 text-sm">
            <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => onSelect(pkg)}
        className={`w-full py-4 rounded-full font-medium transition-all ${
          pkg.popular
            ? "bg-accent text-white hover:bg-accent/90"
            : "bg-foreground text-background hover:opacity-90"
        }`}
      >
        Get Started
      </button>

      <p className="mt-4 text-center text-xs text-muted">
        Extra revisions: ${pkg.revisionCost}/round
      </p>
    </div>
  );
}
