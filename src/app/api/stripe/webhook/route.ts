import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getLead, updateLead } from "@/lib/leads";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const { leadId, packageName, paymentType, totalPrice } = session.metadata || {};

      console.log("=".repeat(60));
      console.log("💰 PAYMENT COMPLETED!");
      console.log("=".repeat(60));
      console.log(`Lead ID: ${leadId}`);
      console.log(`Package: ${packageName}`);
      console.log(`Payment Type: ${paymentType}`);
      console.log(`Amount: $${(session.amount_total || 0) / 100}`);
      console.log(`Customer: ${session.customer_email}`);
      console.log("=".repeat(60));

      // Update lead status
      if (leadId) {
        const lead = await getLead(leadId);
        if (lead) {
          await updateLead(leadId, {
            status: "paid",
            paymentStatus: paymentType === "upfront" ? "upfront_paid" : "fully_paid",
          });

          // Send confirmation email
          if (process.env.RESEND_API_KEY) {
            try {
              const { Resend } = await import("resend");
              const resend = new Resend(process.env.RESEND_API_KEY);

              await resend.emails.send({
                from: "n01.app <ai@n01.app>",
                to: lead.email,
                subject: "🎉 Payment Received - Your Project is Starting!",
                html: `
                  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2>Hi ${lead.name}!</h2>
                    <p>Great news! We've received your payment of <strong>$${(session.amount_total || 0) / 100}</strong>.</p>
                    
                    <div style="background: #f0fdf4; border: 1px solid #22c55e; padding: 24px; border-radius: 12px; margin: 20px 0;">
                      <h3 style="margin: 0 0 8px 0; color: #16a34a;">✅ Payment Confirmed</h3>
                      <p style="margin: 0; color: #166534;">Your ${packageName} project is now in progress!</p>
                    </div>
                    
                    <h3>What happens next?</h3>
                    <ol>
                      <li>Our AI team is analyzing your requirements</li>
                      <li>You'll receive progress updates via ${lead.preferredContact === "whatsapp" ? "WhatsApp" : "email"}</li>
                      <li>We'll deliver a preview for your review</li>
                      <li>5 revision rounds are included if needed</li>
                    </ol>
                    
                    <p>Questions? Just reply to this email or reach out on WhatsApp.</p>
                    
                    <p style="color: #666; font-size: 14px; margin-top: 40px;">
                      Thank you for choosing n01.app!<br>
                      © ${new Date().getFullYear()} n01.app
                    </p>
                  </div>
                `,
              });

              // Also notify admin
              await resend.emails.send({
                from: "n01.app <ai@n01.app>",
                to: "ai@n01.app",
                subject: `💰 Payment Received - ${lead.name} - ${packageName}`,
                html: `
                  <h2>Payment Received!</h2>
                  <p><strong>Customer:</strong> ${lead.name} (${lead.email})</p>
                  <p><strong>Package:</strong> ${packageName}</p>
                  <p><strong>Amount:</strong> $${(session.amount_total || 0) / 100}</p>
                  <p><strong>Total Project:</strong> $${totalPrice}</p>
                  <p><strong>Status:</strong> Upfront paid, project starting</p>
                  <hr>
                  <p><strong>Project Description:</strong></p>
                  <p>${lead.projectDescription || "Not specified"}</p>
                `,
              });
            } catch (emailError) {
              console.error("Failed to send confirmation email:", emailError);
            }
          }
        }
      }

      break;
    }

    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log("Payment intent succeeded:", paymentIntent.id);
      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log("Payment failed:", paymentIntent.id);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
