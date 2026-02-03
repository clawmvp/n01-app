import { NextRequest, NextResponse } from "next/server";
import { getLead, updateLead } from "@/lib/leads";
import { verifySolanaPayment, verifyEthPayment } from "@/lib/crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leadId, network, txHash, amount } = body;

    if (!leadId || !network || !txHash) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const lead = getLead(leadId);
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Verify based on network
    let result;
    if (network === "solana") {
      result = await verifySolanaPayment(txHash, amount);
    } else if (network === "ethereum") {
      result = await verifyEthPayment(txHash, amount);
    } else {
      return NextResponse.json({ error: "Invalid network" }, { status: 400 });
    }

    if (result.verified) {
      // Update lead status
      updateLead(leadId, {
        status: "paid",
        paymentStatus: "upfront_paid",
        notes: `Crypto payment verified: ${network} tx ${txHash}`,
      });

      console.log("=".repeat(60));
      console.log("💰 CRYPTO PAYMENT VERIFIED!");
      console.log("=".repeat(60));
      console.log(`Lead: ${lead.name} (${lead.email})`);
      console.log(`Network: ${network}`);
      console.log(`TX Hash: ${txHash}`);
      console.log(`Amount: $${amount} USDC`);
      console.log("=".repeat(60));

      // Send confirmation email if Resend is configured
      if (process.env.RESEND_API_KEY) {
        try {
          const { Resend } = await import("resend");
          const resend = new Resend(process.env.RESEND_API_KEY);

          await resend.emails.send({
            from: "n01.app <ai@n01.app>",
            to: lead.email,
            subject: "🎉 Crypto Payment Received - Your Project is Starting!",
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2>Hi ${lead.name}!</h2>
                <p>Great news! We've verified your crypto payment.</p>
                
                <div style="background: #f0fdf4; border: 1px solid #22c55e; padding: 24px; border-radius: 12px; margin: 20px 0;">
                  <h3 style="margin: 0 0 8px 0; color: #16a34a;">✅ Payment Confirmed</h3>
                  <p style="margin: 0;">$${amount} USDC on ${network === "solana" ? "Solana" : "Ethereum"}</p>
                </div>
                
                <p>Your ${lead.selectedPackage} project is now in progress!</p>
                
                <p style="color: #666; font-size: 14px; margin-top: 40px;">
                  Transaction: <code>${txHash.slice(0, 20)}...</code><br>
                  © ${new Date().getFullYear()} n01.app
                </p>
              </div>
            `,
          });

          // Notify admin
          await resend.emails.send({
            from: "n01.app <ai@n01.app>",
            to: "ai@n01.app",
            subject: `💰 Crypto Payment - ${lead.name} - ${network}`,
            html: `
              <h2>Crypto Payment Received!</h2>
              <p><strong>Customer:</strong> ${lead.name} (${lead.email})</p>
              <p><strong>Package:</strong> ${lead.selectedPackage}</p>
              <p><strong>Amount:</strong> $${amount} USDC</p>
              <p><strong>Network:</strong> ${network}</p>
              <p><strong>TX:</strong> ${txHash}</p>
            `,
          });
        } catch (emailError) {
          console.error("Failed to send confirmation email:", emailError);
        }
      }

      return NextResponse.json({
        verified: true,
        message: "Payment verified successfully!",
      });
    }

    return NextResponse.json({
      verified: false,
      error: result.error || "Payment could not be verified. Please try again or contact support.",
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
