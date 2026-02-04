import { NextRequest, NextResponse } from "next/server";
import { getLead, updateLead, saveLead, Lead } from "@/lib/leads";
import { verifySolanaPayment, verifyEthPayment } from "@/lib/crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leadId, network, txHash, amount, email } = body;

    if (!network || !txHash) {
      return NextResponse.json(
        { error: "Missing required fields (network, txHash)" },
        { status: 400 }
      );
    }

    // Try to find existing lead or use email for direct payment
    let lead = leadId ? await getLead(leadId) : null;
    const customerEmail = lead?.email || email;

    if (!customerEmail) {
      return NextResponse.json({ error: "No email provided" }, { status: 400 });
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
      // If no lead exists, create one
      if (!lead && email) {
        const newLeadId = `L-${Date.now().toString(36).toUpperCase()}`;
        const newLead: Lead = {
          id: newLeadId,
          name: email.split("@")[0],
          email,
          phone: "",
          projectDescription: `Crypto payment: $${amount} USDC on ${network}`,
          preferredContact: "email",
          selectedPackage: "custom",
          source: "crypto-direct",
          createdAt: new Date().toISOString(),
          status: "paid",
          paymentStatus: "upfront_paid",
          cryptoTxHash: txHash,
          cryptoNetwork: network,
        };
        await saveLead(newLead);
        lead = newLead;
      } else if (lead) {
        // Update existing lead
        await updateLead(lead.id, {
          status: "paid",
          paymentStatus: "upfront_paid",
          cryptoTxHash: txHash,
          cryptoNetwork: network,
          notes: `Crypto payment verified: ${network} tx ${txHash}`,
        });
      }

      console.log("=".repeat(60));
      console.log("💰 CRYPTO PAYMENT VERIFIED!");
      console.log("=".repeat(60));
      console.log(`Customer: ${customerEmail}`);
      console.log(`Network: ${network}`);
      console.log(`TX Hash: ${txHash}`);
      console.log(`Amount: $${amount} USDC`);
      console.log("=".repeat(60));

      // Send confirmation emails
      if (process.env.RESEND_API_KEY) {
        try {
          const { Resend } = await import("resend");
          const resend = new Resend(process.env.RESEND_API_KEY);

          // Email to customer
          await resend.emails.send({
            from: "n01.app <ai@n01.app>",
            to: customerEmail,
            subject: "🎉 Crypto Payment Received - Your Project is Starting!",
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2>Payment Confirmed! 🎉</h2>
                <p>Great news! We've verified your crypto payment.</p>
                
                <div style="background: #f0fdf4; border: 1px solid #22c55e; padding: 24px; border-radius: 12px; margin: 20px 0;">
                  <h3 style="margin: 0 0 8px 0; color: #16a34a;">✅ Payment Received</h3>
                  <p style="margin: 0;">$${amount} USDC on ${network === "solana" ? "Solana" : "Ethereum"}</p>
                </div>
                
                <p>Our AI team is now starting work on your project! You'll receive updates soon.</p>
                
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
            subject: `💰 Crypto Payment Verified - ${customerEmail}`,
            html: `
              <h2>Crypto Payment Verified!</h2>
              <p><strong>Customer:</strong> ${customerEmail}</p>
              <p><strong>Amount:</strong> $${amount} USDC</p>
              <p><strong>Network:</strong> ${network}</p>
              <p><strong>TX:</strong> <a href="${network === 'solana' ? `https://solscan.io/tx/${txHash}` : `https://etherscan.io/tx/${txHash}`}">${txHash}</a></p>
              <p><a href="https://n01.app/admin">Open Admin Dashboard</a></p>
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

    // Payment not verified - return specific error
    return NextResponse.json({
      verified: false,
      error: result.error || "Transaction not found or amount doesn't match. Please check and try again.",
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify payment. Please try again." },
      { status: 500 }
    );
  }
}
