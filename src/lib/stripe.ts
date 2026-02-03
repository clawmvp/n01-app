import Stripe from "stripe";

// Lazy initialize Stripe with secret key
let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    stripeInstance = new Stripe(key, {
      apiVersion: "2026-01-28.clover",
    });
  }
  return stripeInstance;
}

// Create a checkout session for upfront payment (20%)
export async function createCheckoutSession(params: {
  quoteId: string;
  customerEmail: string;
  packageName: string;
  upfrontAmount: number; // in cents
  projectDescription: string;
}) {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: params.customerEmail,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `n01.app - ${params.packageName} Package (20% Upfront)`,
            description: params.projectDescription.slice(0, 500),
          },
          unit_amount: params.upfrontAmount,
        },
        quantity: 1,
      },
    ],
    metadata: {
      quoteId: params.quoteId,
      packageName: params.packageName,
      paymentType: "upfront",
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
  });

  return session;
}

// Create invoice for final payment (80%)
export async function createFinalPaymentLink(params: {
  quoteId: string;
  customerEmail: string;
  packageName: string;
  finalAmount: number; // in cents
  projectDescription: string;
}) {
  const stripe = getStripe();
  // Create or get customer
  let customer: Stripe.Customer;
  const existingCustomers = await stripe.customers.list({
    email: params.customerEmail,
    limit: 1,
  });

  if (existingCustomers.data.length > 0) {
    customer = existingCustomers.data[0];
  } else {
    customer = await stripe.customers.create({
      email: params.customerEmail,
    });
  }

  // Create a payment link for final payment
  const paymentLink = await stripe.paymentLinks.create({
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `n01.app - ${params.packageName} Package (80% Final Payment)`,
            description: `Final payment for: ${params.projectDescription.slice(0, 200)}`,
          },
          unit_amount: params.finalAmount,
        },
        quantity: 1,
      },
    ],
    metadata: {
      quoteId: params.quoteId,
      packageName: params.packageName,
      paymentType: "final",
    },
  });

  return paymentLink;
}
