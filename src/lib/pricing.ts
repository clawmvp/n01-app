// Pricing configuration for n01.app

export interface PricingPackage {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  delivery: string;
  popular?: boolean;
  revisionCost: number;
}

export interface QuoteEstimate {
  basePrice: number;
  pages: number;
  features: number;
  integrations: number;
  totalPrice: number;
  timeline: string;
}

// Pricing packages
export const packages: PricingPackage[] = [
  {
    id: "starter",
    name: "STARTER",
    price: 149,
    description: "Perfect for landing pages and simple websites",
    features: [
      "Landing page (1-3 pages)",
      "Responsive design",
      "Basic SEO setup",
      "Contact form",
      "5 revision rounds",
      "Source code on GitHub",
      "Vercel deployment",
    ],
    delivery: "48 hours",
    revisionCost: 29,
  },
  {
    id: "pro",
    name: "PRO",
    price: 399,
    description: "Ideal for MVPs and web applications",
    features: [
      "Web app (5-10 pages)",
      "Custom UI/UX design",
      "User authentication",
      "Database integration",
      "API development",
      "5 revision rounds",
      "Source code on GitHub",
      "Vercel deployment",
    ],
    delivery: "5 days",
    popular: true,
    revisionCost: 49,
  },
  {
    id: "scale",
    name: "SCALE",
    price: 999,
    description: "Full-featured applications ready to scale",
    features: [
      "Full application",
      "Mobile-responsive PWA",
      "Advanced database schema",
      "Third-party API integrations",
      "Payment processing",
      "Admin dashboard",
      "5 revision rounds",
      "Source code on GitHub",
      "Vercel deployment",
      "Documentation",
    ],
    delivery: "10 days",
    revisionCost: 99,
  },
];

// Custom project estimation formula
export function estimateCustomProject(params: {
  pages: number;
  features: number;
  integrations: number;
  hasAuth: boolean;
  hasPayments: boolean;
  hasMobile: boolean;
}): QuoteEstimate {
  const BASE_PRICE = 99;
  const PAGE_COST = 50;
  const FEATURE_COST = 100;
  const INTEGRATION_COST = 150;
  const AUTH_COST = 100;
  const PAYMENTS_COST = 150;
  const MOBILE_COST = 200;

  let totalPrice = BASE_PRICE;
  totalPrice += params.pages * PAGE_COST;
  totalPrice += params.features * FEATURE_COST;
  totalPrice += params.integrations * INTEGRATION_COST;
  if (params.hasAuth) totalPrice += AUTH_COST;
  if (params.hasPayments) totalPrice += PAYMENTS_COST;
  if (params.hasMobile) totalPrice += MOBILE_COST;

  // Estimate timeline based on complexity
  let days = 2;
  days += Math.ceil(params.pages / 3);
  days += Math.ceil(params.features / 2);
  days += params.integrations * 2;
  if (params.hasAuth) days += 1;
  if (params.hasPayments) days += 2;
  if (params.hasMobile) days += 3;

  const timeline = days <= 2 ? "48 hours" : `${days} days`;

  return {
    basePrice: BASE_PRICE,
    pages: params.pages,
    features: params.features,
    integrations: params.integrations,
    totalPrice,
    timeline,
  };
}

// Payment split configuration
export const PAYMENT_SPLIT = {
  upfront: 0.2, // 20%
  onDelivery: 0.8, // 80%
};

// Crypto discount
export const CRYPTO_DISCOUNT = 0.05; // 5% discount for crypto payments

// Calculate payment amounts
export function calculatePaymentSplit(totalPrice: number, isCrypto: boolean = false) {
  const discountedPrice = isCrypto ? totalPrice * (1 - CRYPTO_DISCOUNT) : totalPrice;
  
  return {
    total: discountedPrice,
    upfront: Math.round(discountedPrice * PAYMENT_SPLIT.upfront * 100) / 100,
    onDelivery: Math.round(discountedPrice * PAYMENT_SPLIT.onDelivery * 100) / 100,
    discount: isCrypto ? totalPrice * CRYPTO_DISCOUNT : 0,
  };
}
