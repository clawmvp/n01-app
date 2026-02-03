import { Resend } from "resend";

const FROM_EMAIL = "n01.app <ai@n01.app>";
const ADMIN_EMAIL = "ai@n01.app";

// Lazy initialize Resend
let resendInstance: Resend | null = null;

function getResend(): Resend {
  if (!resendInstance) {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
      throw new Error("RESEND_API_KEY is not configured");
    }
    resendInstance = new Resend(key);
  }
  return resendInstance;
}

interface QuoteEmailParams {
  customerName: string;
  customerEmail: string;
  quoteId: string;
  packageName: string;
  price: number;
  upfront: number;
  onDelivery: number;
  timeline: string;
  projectDescription: string;
  payWithCrypto: boolean;
}

// Send quote confirmation to customer
export async function sendQuoteConfirmation(params: QuoteEmailParams) {
  const {
    customerName,
    customerEmail,
    quoteId,
    packageName,
    price,
    upfront,
    timeline,
    payWithCrypto,
  } = params;

  const paymentMethod = payWithCrypto ? "USDC (Solana)" : "Credit Card";

  try {
    const resend = getResend();
    await resend.emails.send({
      from: FROM_EMAIL,
      to: customerEmail,
      subject: `Your n01.app Quote #${quoteId}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; padding: 20px 0; }
            .logo { font-size: 24px; font-weight: bold; }
            .logo span { color: #2563eb; }
            .card { background: #f9fafb; border-radius: 12px; padding: 24px; margin: 20px 0; }
            .price { font-size: 36px; font-weight: bold; text-align: center; }
            .details { margin: 20px 0; }
            .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .cta { display: inline-block; background: #2563eb; color: white; padding: 16px 32px; border-radius: 50px; text-decoration: none; font-weight: 500; }
            .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 40px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">n01<span>.app</span></div>
              <p>The First Autonomous AI Agency</p>
            </div>
            
            <h2>Hi ${customerName},</h2>
            <p>Thank you for your interest in n01.app! Here's your quote:</p>
            
            <div class="card">
              <div class="price">$${price.toLocaleString()}</div>
              <p style="text-align: center; color: #6b7280;">${packageName} Package</p>
              
              <div class="details">
                <div class="row">
                  <span>Upfront payment (20%)</span>
                  <strong>$${upfront}</strong>
                </div>
                <div class="row">
                  <span>On delivery (80%)</span>
                  <strong>$${params.onDelivery}</strong>
                </div>
                <div class="row">
                  <span>Estimated delivery</span>
                  <strong>${timeline}</strong>
                </div>
                <div class="row">
                  <span>Payment method</span>
                  <strong>${paymentMethod}</strong>
                </div>
                <div class="row">
                  <span>Revisions included</span>
                  <strong>5 rounds</strong>
                </div>
              </div>
            </div>
            
            <p>To proceed with your project, please reply to this email with your confirmation or any questions you may have.</p>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="mailto:ai@n01.app?subject=Accept Quote ${quoteId}" class="cta">
                Accept Quote
              </a>
            </p>
            
            <div class="footer">
              <p>Quote ID: ${quoteId}</p>
              <p>This quote is valid for 7 days.</p>
              <p>© ${new Date().getFullYear()} n01.app. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send quote confirmation:", error);
    return { success: false, error };
  }
}

// Send notification to admin about new quote
export async function sendAdminNotification(params: QuoteEmailParams) {
  const { customerName, customerEmail, quoteId, packageName, price, projectDescription } = params;

  try {
    const resend = getResend();
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `🆕 New Quote Request #${quoteId} - $${price}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .card { background: #f0fdf4; border: 1px solid #22c55e; border-radius: 12px; padding: 24px; margin: 20px 0; }
            .label { font-size: 12px; color: #6b7280; text-transform: uppercase; }
            .value { font-size: 16px; font-weight: 500; margin-bottom: 16px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>🎉 New Quote Request!</h2>
            
            <div class="card">
              <div class="label">Quote ID</div>
              <div class="value">${quoteId}</div>
              
              <div class="label">Customer</div>
              <div class="value">${customerName} (${customerEmail})</div>
              
              <div class="label">Package</div>
              <div class="value">${packageName} - $${price}</div>
              
              <div class="label">Project Description</div>
              <div class="value">${projectDescription}</div>
            </div>
            
            <p>
              <a href="mailto:${customerEmail}?subject=Re: Your n01.app Quote ${quoteId}">
                Reply to Customer
              </a>
            </p>
          </div>
        </body>
        </html>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to send admin notification:", error);
    return { success: false, error };
  }
}
