import { NextRequest, NextResponse } from "next/server";
import { getLead, updateLead, saveLead, Lead, getAllLeads } from "@/lib/leads";
import { verifySolanaPayment, verifyEthPayment } from "@/lib/crypto";
import { createProjectFromLead, getProjectProgress } from "@/lib/automation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leadId, network, txHash, amount, email, packageName } = body;

    if (!network || !txHash) {
      return NextResponse.json(
        { error: "Missing required fields (network, txHash)" },
        { status: 400 }
      );
    }

    // STEP 1: Try to find existing lead by leadId or email
    let lead = leadId ? await getLead(leadId) : null;
    
    // If no lead by ID, try to find by email (lead might have been saved earlier)
    if (!lead && email) {
      const allLeads = await getAllLeads();
      lead = allLeads.find(l => l.email === email) || null;
      if (lead) {
        console.log(`✅ Found existing lead by email: ${lead.id}`);
      }
    }
    
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
      // If no lead exists, create one (but try to keep brief/conversation if available)
      if (!lead && email) {
        const newLeadId = leadId?.startsWith("N01-") ? leadId : `L-${Date.now().toString(36).toUpperCase()}`;
        const pkg = packageName || "Custom";
        const newLead: Lead = {
          id: newLeadId,
          name: email.split("@")[0],
          email,
          phone: "",
          projectDescription: `${pkg} package - Crypto payment: $${amount} USDC on ${network}`,
          // Note: When lead is created without conversation, brief is generic
          // This should be updated later or the client should provide requirements
          brief: `${pkg} package - Awaiting detailed requirements from client`,
          conversation: undefined,
          preferredContact: "email",
          selectedPackage: pkg,
          source: "crypto-direct",
          createdAt: new Date().toISOString(),
          status: "paid",
          paymentStatus: "upfront_paid",
          cryptoTxHash: txHash,
          cryptoNetwork: network,
        };
        await saveLead(newLead);
        lead = newLead;
        console.log(`✅ New lead created: ${newLeadId}`);
        console.log(`   ⚠️ Note: No conversation/brief - client should provide requirements`);
      } else if (lead) {
        // Update existing lead - keep the brief and conversation!
        await updateLead(lead.id, {
          status: "paid",
          paymentStatus: "upfront_paid",
          cryptoTxHash: txHash,
          cryptoNetwork: network,
          notes: `Crypto payment verified: ${network} tx ${txHash}`,
        });
        console.log(`✅ Lead updated with payment: ${lead.id}`);
        console.log(`   Brief preserved: ${lead.brief ? 'Yes' : 'No'}`);
        console.log(`   Conversation preserved: ${lead.conversation ? 'Yes' : 'No'}`);
      }

      console.log("=".repeat(60));
      console.log("💰 CRYPTO PAYMENT VERIFIED!");
      console.log("=".repeat(60));
      console.log(`Customer: ${customerEmail}`);
      console.log(`Network: ${network}`);
      console.log(`TX Hash: ${txHash}`);
      console.log(`Amount: $${amount} USDC`);
      console.log("=".repeat(60));

      // AUTO-CREATE PROJECT
      let project = null;
      if (lead) {
        try {
          project = await createProjectFromLead(lead);
          console.log(`✅ Project auto-created: ${project.id}`);
        } catch (projectError) {
          console.error("Failed to auto-create project:", projectError);
        }
      }

      // Send welcome email with project details
      if (process.env.RESEND_API_KEY) {
        try {
          const { Resend } = await import("resend");
          const resend = new Resend(process.env.RESEND_API_KEY);

          const estimatedDelivery = project?.estimatedDelivery 
            ? new Date(project.estimatedDelivery).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
            : "within 5-7 business days";

          const trackingUrl = project 
            ? `https://n01.app/project/${project.id}?token=${project.accessToken}` 
            : "https://n01.app";

          // Welcome email to customer
          await resend.emails.send({
            from: "n01.app <ai@n01.app>",
            to: customerEmail,
            subject: "🚀 Your Project Has Started! - n01.app",
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2>Welcome aboard! 🚀</h2>
                <p>Great news - your payment is confirmed and our AI team has already started working on your project!</p>
                
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px; border-radius: 16px; margin: 24px 0; color: white;">
                  <h3 style="margin: 0 0 16px 0;">Project Status: In Progress</h3>
                  <div style="background: rgba(255,255,255,0.2); padding: 16px; border-radius: 12px;">
                    <p style="margin: 0 0 8px 0;">📋 <strong>Planning phase</strong> - NOVA is analyzing your requirements</p>
                    ${project ? `<p style="margin: 0;">📅 Estimated delivery: <strong>${estimatedDelivery}</strong></p>` : ""}
                  </div>
                </div>
                
                <h3>What's happening now?</h3>
                <ol style="line-height: 1.8;">
                  <li><strong>NOVA</strong> (our orchestrator) is analyzing your requirements</li>
                  <li><strong>ATLAS</strong> will design the architecture</li>
                  <li><strong>PIXEL</strong> will create beautiful UI designs</li>
                  <li><strong>NEXUS</strong> will build the backend</li>
                  <li><strong>VECTOR</strong> will ensure quality</li>
                  <li><strong>CIPHER</strong> will deploy everything</li>
                </ol>
                
                <div style="background: #f5f5f5; padding: 16px; border-radius: 12px; margin: 24px 0;">
                  <h4 style="margin: 0 0 8px 0;">💬 Need to communicate?</h4>
                  <p style="margin: 0;">Just reply to this email or chat with ARIA on our website anytime!</p>
                </div>
                
                ${project ? `
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${trackingUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 16px 32px; border-radius: 50px; text-decoration: none; font-weight: 600;">
                    Track Your Project
                  </a>
                </div>
                ` : ""}
                
                <p style="color: #666; font-size: 14px; margin-top: 40px;">
                  Payment: $${amount} USDC on ${network === "solana" ? "Solana" : "Ethereum"}<br>
                  Transaction: <code>${txHash.slice(0, 16)}...</code><br>
                  © ${new Date().getFullYear()} n01.app - AI Development Agency
                </p>
              </div>
            `,
          });

          // Notify admin with project details
          await resend.emails.send({
            from: "n01.app <ai@n01.app>",
            to: "ai@n01.app",
            subject: `🚀 NEW PROJECT STARTED - ${lead?.name || customerEmail}`,
            html: `
              <h2>🚀 New Project Auto-Created!</h2>
              
              <h3>Customer</h3>
              <ul>
                <li><strong>Name:</strong> ${lead?.name || "N/A"}</li>
                <li><strong>Email:</strong> ${customerEmail}</li>
                <li><strong>Package:</strong> ${lead?.selectedPackage || "Custom"}</li>
              </ul>
              
              <h3>Payment</h3>
              <ul>
                <li><strong>Amount:</strong> $${amount} USDC</li>
                <li><strong>Network:</strong> ${network}</li>
                <li><strong>TX:</strong> <a href="${network === 'solana' ? `https://solscan.io/tx/${txHash}` : `https://etherscan.io/tx/${txHash}`}">${txHash.slice(0, 20)}...</a></li>
              </ul>
              
              ${project ? `
              <h3>Project</h3>
              <ul>
                <li><strong>ID:</strong> ${project.id}</li>
                <li><strong>Status:</strong> ${project.status}</li>
                <li><strong>Current Agent:</strong> ${project.currentAgent}</li>
                <li><strong>Tasks:</strong> ${project.tasks.length}</li>
                <li><strong>Est. Delivery:</strong> ${estimatedDelivery}</li>
              </ul>
              ` : ""}
              
              <p><a href="https://n01.app/admin" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none;">Open Admin Dashboard</a></p>
            `,
          });
        } catch (emailError) {
          console.error("Failed to send welcome email:", emailError);
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
