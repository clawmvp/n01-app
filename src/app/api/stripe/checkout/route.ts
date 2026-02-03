import { NextRequest, NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { quoteId, customerEmail, packageName, upfrontAmount, projectDescription } = body;

    if (!quoteId || !customerEmail || !packageName || !upfrontAmount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Convert dollars to cents
    const amountInCents = Math.round(upfrontAmount * 100);

    const session = await createCheckoutSession({
      quoteId,
      customerEmail,
      packageName,
      upfrontAmount: amountInCents,
      projectDescription: projectDescription || "",
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
