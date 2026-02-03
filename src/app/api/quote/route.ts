import { NextRequest, NextResponse } from "next/server";
import { sendQuoteConfirmation, sendAdminNotification } from "@/lib/email";

interface QuoteRequest {
  name: string;
  email: string;
  projectDescription: string;
  packageId: string;
  packageName: string;
  price: number;
  upfront: number;
  onDelivery: number;
  timeline: string;
  payWithCrypto: boolean;
}

// In-memory storage for quotes (in production, use a database)
const quotes: Map<string, QuoteRequest & { id: string; createdAt: Date; status: string }> = new Map();

export async function POST(request: NextRequest) {
  try {
    const body: QuoteRequest = await request.json();

    // Validate required fields
    if (!body.name || !body.email || !body.projectDescription) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate quote ID
    const quoteId = `Q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Store quote
    const quote = {
      id: quoteId,
      ...body,
      createdAt: new Date(),
      status: "pending",
    };
    quotes.set(quoteId, quote);

    // Log the quote
    console.log("New quote request:", JSON.stringify(quote, null, 2));

    // Send emails (only if Resend API key is configured)
    if (process.env.RESEND_API_KEY) {
      const emailParams = {
        customerName: body.name,
        customerEmail: body.email,
        quoteId,
        packageName: body.packageName,
        price: body.price,
        upfront: body.upfront,
        onDelivery: body.onDelivery,
        timeline: body.timeline,
        projectDescription: body.projectDescription,
        payWithCrypto: body.payWithCrypto,
      };

      // Send confirmation to customer and notification to admin in parallel
      await Promise.all([
        sendQuoteConfirmation(emailParams),
        sendAdminNotification(emailParams),
      ]);
    }

    return NextResponse.json({
      success: true,
      quoteId,
      message: "Quote request received. We'll be in touch within 24 hours.",
    });
  } catch (error) {
    console.error("Quote API error:", error);
    return NextResponse.json(
      { error: "Failed to process quote request" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const quoteId = searchParams.get("id");

  if (quoteId) {
    const quote = quotes.get(quoteId);
    if (quote) {
      return NextResponse.json(quote);
    }
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }

  // Return all quotes (admin only - add auth in production)
  return NextResponse.json({
    quotes: Array.from(quotes.values()),
  });
}
