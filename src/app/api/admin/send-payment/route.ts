import { NextRequest, NextResponse } from "next/server";
import { getLead, updateLead } from "@/lib/leads";
import { packages, calculatePaymentSplit } from "@/lib/pricing";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leadId, customAmount } = body;

    if (!leadId) {
      return NextResponse.json({ error: "Lead ID required" }, { status: 400 });
    }

    const lead = await getLead(leadId);
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Determine price based on package or custom amount
    let price = customAmount;
    if (!price) {
      const pkg = packages.find((p) => p.name === lead.selectedPackage);
      price = pkg?.price || 133; // Default to PRO price
    }

    const payment = calculatePaymentSplit(price);

    // Generate Stripe Checkout URL
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      // If no Stripe key, return manual payment instructions
      console.log("=".repeat(60));
      console.log("💳 PAYMENT LINK REQUESTED");
      console.log("=".repeat(60));
      console.log(`Lead: ${lead.name} (${lead.email})`);
      console.log(`Package: ${lead.selectedPackage}`);
      console.log(`Total: $${price}`);
      console.log(`Upfront (20%): $${payment.upfront}`);
      console.log("=".repeat(60));

      // Send email with payment details (if Resend configured)
      if (process.env.RESEND_API_KEY) {
        try {
          const { Resend } = await import("resend");
          const resend = new Resend(process.env.RESEND_API_KEY);

          await resend.emails.send({
            from: "n01.app <ai@n01.app>",
            to: lead.email,
            subject: `Your n01.app Quote - ${lead.selectedPackage} Package`,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2>Hi ${lead.name}!</h2>
                <p>Thank you for your interest in n01.app! Here's your quote:</p>
                
                <div style="background: #f5f5f5; padding: 24px; border-radius: 12px; margin: 20px 0;">
                  <h3 style="margin: 0 0 16px 0;">${lead.selectedPackage} Package</h3>
                  <p style="font-size: 32px; font-weight: bold; margin: 0;">$${price}</p>
                  
                  <hr style="border: none; border-top: 1px solid #ddd; margin: 16px 0;">
                  
                  <p style="margin: 8px 0;"><strong>Upfront (20%):</strong> $${payment.upfront}</p>
                  <p style="margin: 8px 0;"><strong>On delivery (80%):</strong> $${payment.onDelivery}</p>
                  <p style="margin: 8px 0;"><strong>Revisions:</strong> 5 rounds included</p>
                </div>
                
                <p>To proceed, please reply to this email with your confirmation. We'll send you a secure payment link.</p>
                
                <p>Or reach out to us directly:</p>
                <ul>
                  <li>Email: ai@n01.app</li>
                  <li>WhatsApp: Click the link we sent you</li>
                </ul>
                
                <p style="color: #666; font-size: 14px; margin-top: 40px;">
                  This quote is valid for 7 days.<br>
                  © ${new Date().getFullYear()} n01.app
                </p>
              </div>
            `,
          });

          // Update lead status
          await updateLead(leadId, { status: "quoted" });

          return NextResponse.json({
            success: true,
            message: "Quote email sent successfully",
            emailSent: true,
          });
        } catch (emailError) {
          console.error("Failed to send email:", emailError);
        }
      }

      return NextResponse.json({
        success: true,
        message: "Payment details logged. Configure STRIPE_SECRET_KEY for automatic checkout links.",
        price,
        upfront: payment.upfront,
      });
    }

    // Create Stripe Checkout Session
    const { getStripe } = await import("@/lib/stripe");
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: lead.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `n01.app - ${lead.selectedPackage} Package (20% Upfront)`,
              description: `Upfront payment for ${lead.selectedPackage} package. Remaining 80% due on delivery.`,
            },
            unit_amount: Math.round(payment.upfront * 100), // cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        leadId,
        packageName: lead.selectedPackage,
        totalPrice: price.toString(),
        paymentType: "upfront",
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://n01.app"}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://n01.app"}/payment/cancel`,
    });

    // Send email with payment link
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);

        await resend.emails.send({
          from: "n01.app <ai@n01.app>",
          to: lead.email,
          subject: `Your n01.app Payment Link - ${lead.selectedPackage} Package`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2>Hi ${lead.name}!</h2>
              <p>Your quote is ready! Click below to make the upfront payment and start your project:</p>
              
              <div style="background: #f5f5f5; padding: 24px; border-radius: 12px; margin: 20px 0;">
                <h3 style="margin: 0 0 16px 0;">${lead.selectedPackage} Package</h3>
                <p style="font-size: 24px; font-weight: bold; margin: 0;">Upfront: $${payment.upfront}</p>
                <p style="color: #666; margin: 8px 0 0 0;">Total: $${price} (remaining $${payment.onDelivery} on delivery)</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${session.url}" style="display: inline-block; background: #2563eb; color: white; padding: 16px 32px; border-radius: 50px; text-decoration: none; font-weight: 500;">
                  Pay $${payment.upfront} Now
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px;">
                After payment, our AI team will start working on your project immediately.<br>
                You'll receive updates via ${lead.preferredContact === "whatsapp" ? "WhatsApp" : "email"}.
              </p>
              
              <p style="color: #666; font-size: 14px; margin-top: 40px;">
                This payment link expires in 24 hours.<br>
                © ${new Date().getFullYear()} n01.app
              </p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Failed to send payment email:", emailError);
      }
    }

    // Update lead
    await updateLead(leadId, {
      status: "quoted",
      stripeSessionId: session.id,
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Send payment error:", error);
    return NextResponse.json({ error: "Failed to create payment link" }, { status: 500 });
  }
}
