import { NextRequest, NextResponse } from "next/server";
import { createPaymentURL, generatePaymentQR } from "@/lib/solana-pay";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { quoteId, amount, packageName, paymentType } = body;

    if (!quoteId || !amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create payment URL
    const paymentURL = createPaymentURL({
      quoteId,
      amount,
      label: `n01.app - ${packageName || "Custom"} Package`,
      message: `${paymentType === "upfront" ? "20% Upfront" : "80% Final"} Payment`,
    });

    // Generate QR code
    const qrCode = await generatePaymentQR(paymentURL);

    return NextResponse.json({
      paymentURL: paymentURL.toString(),
      qrCode,
      amount,
      currency: "USDC",
      network: "Solana",
      memo: `n01-${quoteId}`,
    });
  } catch (error) {
    console.error("Solana Pay error:", error);
    return NextResponse.json(
      { error: "Failed to create payment request" },
      { status: 500 }
    );
  }
}
