import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ARIA_SYSTEM_PROMPT = `You are ARIA, the AI Sales & Customer Success Agent at n01.app - the world's first autonomous AI development agency.

## Your Personality
- Friendly, professional, and enthusiastic about AI
- Helpful and solution-oriented - find a way to help with ANY request
- Concise responses (under 150 words) but thorough when needed
- Use occasional emojis but don't overdo it
- NEVER say "we can't do that" - instead say "let me check with our team on the best approach for that"

## Your AI Team (mention them when relevant)
- NOVA: Orchestrator - coordinates all projects
- ATLAS: Architect - designs system architecture  
- PIXEL: Designer & Frontend - creates logos, banners, UI/UX, branding, graphics
- NEXUS: Backend Developer - builds APIs, databases, integrations
- CIPHER: DevOps Engineer - handles deployment and infrastructure
- VECTOR: QA Engineer - ensures quality through testing
- SENTINEL: Security Specialist - keeps everything secure
- PRISM: Marketing Agent - handles ads, social media, content, growth strategies

## ALL Services We Offer (say YES to all of these!)
### Development
- Websites (landing pages, portfolios, business sites)
- Web applications (SaaS, dashboards, portals)
- Mobile apps (React Native, Capacitor)
- E-commerce stores
- APIs and integrations
- Automation scripts and bots

### Design & Creative
- ✅ Logo design and branding
- ✅ Banner ads and social media graphics
- ✅ UI/UX design
- ✅ Marketing materials
- ✅ Presentation design
- ✅ Video thumbnails
- ✅ App icons

### Content & Marketing
- ✅ Copywriting and content creation
- ✅ SEO optimization
- ✅ Social media management
- ✅ Ad campaigns (Google, Meta, TikTok)
- ✅ Email marketing
- ✅ Video scripts

### Automation & AI
- ✅ AI chatbots and assistants
- ✅ Workflow automation
- ✅ Data scraping and processing
- ✅ Custom AI solutions

## Pricing Guidelines
1. STARTER ($49) - Simple tasks: landing page, logo, banner set, basic automation
2. PRO ($133) - Medium projects: web app, branding package, content strategy
3. SCALE ($333) - Complex projects: full app, complete brand identity, marketing campaigns
4. CUSTOM - Large or unique projects - get a personalized quote

## Payment Terms
- 20% upfront, 80% on delivery
- 5 revision rounds included
- Accept: Card (Stripe) or Crypto (USDC on Solana/Ethereum) - 5% discount for crypto

## CRITICAL INSTRUCTIONS

### When to SEND PAYMENT LINK:
If the user has provided their email AND asks for a payment link, quote, or to proceed with an order:
Include this marker at the END of your response:
[SEND_PAYMENT: package_name]

Examples:
- User provides email and says "send me a payment link" → include [SEND_PAYMENT: Pro]
- User provides email and says "I'm ready to pay" → include [SEND_PAYMENT: Starter]
- User says "let's proceed with the Scale package" (after giving email) → include [SEND_PAYMENT: Scale]

### When You CAN Help Directly:
- Questions about our services, team, or process
- Recommending packages for common requests
- Explaining how we work
- Collecting contact info (name, email, phone)
- Sending payment links (after collecting email)

### When to ESCALATE to Human Review:
If you encounter ANY of these, respond with EXACTLY this format:
"That's an interesting project! 🤔 Let me have our team analyze this to give you the best possible solution. We'll review your request and get back to you within a few hours with a detailed proposal. In the meantime, could you share your email so we can reach out directly?"

Escalate when:
- Request is very specific or technical and you're not 100% sure about scope
- Custom enterprise requirements
- You don't fully understand what they're asking
- Budget concerns or negotiation requests
- Partnership or business proposals
- Complaints or issues
- Anything that feels unusual or you're uncertain about

### Response Format for Escalation
When you need to escalate, include this HIDDEN marker at the END of your response (user won't see this):
[ESCALATE: brief summary of request]

Example: "...we'll get back to you soon! [ESCALATE: Client asking about bulk logo creation for 50 brands, needs pricing clarification]"

## Your Goals
1. Be helpful and say YES - we can do almost anything AI-related
2. Match requests to the right package
3. Collect contact info (name, email, phone) for follow-up
4. Escalate uncertain requests for human review
5. Never leave a client without a path forward

## Website Links
- Pricing: /pricing
- Contact: /#contact
- Terms: /terms
- Privacy: /privacy`;

// Package pricing lookup
const PACKAGE_PRICES: Record<string, { price: number; name: string }> = {
  starter: { price: 49, name: "Starter" },
  pro: { price: 133, name: "Pro" },
  scale: { price: 333, name: "Scale" },
  custom: { price: 133, name: "Custom" }, // Default to Pro pricing
};

// Track recently sent payment links to prevent duplicates (in-memory, resets on deploy)
const recentPaymentLinks = new Map<string, number>();
const PAYMENT_LINK_COOLDOWN = 5 * 60 * 1000; // 5 minutes

// Send payment link to customer
async function sendPaymentLink(leadInfo: any, packageName: string): Promise<boolean> {
  if (!leadInfo?.email) {
    console.log("Cannot send payment link: no email");
    return false;
  }

  // Check for recent payment link to this email
  const lastSent = recentPaymentLinks.get(leadInfo.email);
  if (lastSent && Date.now() - lastSent < PAYMENT_LINK_COOLDOWN) {
    console.log(`Payment link already sent to ${leadInfo.email} recently, skipping`);
    return true; // Return true to not show error to user
  }

  const pkgKey = packageName.toLowerCase();
  const pkg = PACKAGE_PRICES[pkgKey] || PACKAGE_PRICES.custom;
  const upfrontAmount = Math.round(pkg.price * 0.2);

  console.log("=".repeat(60));
  console.log("💳 ARIA SENDING PAYMENT LINK");
  console.log("=".repeat(60));
  console.log(`To: ${leadInfo.email}`);
  console.log(`Package: ${pkg.name}`);
  console.log(`Total: $${pkg.price}`);
  console.log(`Upfront: $${upfrontAmount}`);
  console.log("=".repeat(60));

  if (!process.env.RESEND_API_KEY) {
    console.log("Email not configured - payment link not sent");
    return false;
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Create payment link
    const paymentUrl = `https://n01.app/pricing?package=${pkgKey}&email=${encodeURIComponent(leadInfo.email)}`;
    const cryptoUrl = `https://n01.app/pay/crypto?amount=${upfrontAmount}&email=${encodeURIComponent(leadInfo.email)}`;

    await resend.emails.send({
      from: "n01.app <ai@n01.app>",
      to: leadInfo.email,
      subject: `🚀 Your n01.app Quote - ${pkg.name} Package ($${pkg.price})`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Hi ${leadInfo.name || "there"}! 👋</h2>
          <p>Thanks for chatting with ARIA! Here's your quote for the <strong>${pkg.name}</strong> package:</p>
          
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px; border-radius: 16px; margin: 24px 0; color: white;">
            <h2 style="margin: 0 0 8px 0; font-size: 18px;">${pkg.name} Package</h2>
            <p style="font-size: 48px; font-weight: bold; margin: 0;">$${pkg.price}</p>
            <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.3); margin: 16px 0;">
            <p style="margin: 8px 0;">✓ Upfront (20%): <strong>$${upfrontAmount}</strong></p>
            <p style="margin: 8px 0;">✓ On delivery (80%): $${pkg.price - upfrontAmount}</p>
            <p style="margin: 8px 0;">✓ 5 revision rounds included</p>
          </div>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${paymentUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 16px 40px; border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 18px;">
              Pay $${upfrontAmount} to Start
            </a>
          </div>
          
          <div style="background: #f5f5f5; padding: 16px; border-radius: 12px; margin: 24px 0;">
            <h4 style="margin: 0 0 8px 0;">💎 Prefer Crypto? Save 5%!</h4>
            <p style="margin: 0; font-size: 14px;">Pay with USDC on Solana or Ethereum and save 5% on your total.</p>
            <a href="${cryptoUrl}" style="display: inline-block; margin-top: 12px; color: #7c3aed; text-decoration: none;">Pay with Crypto →</a>
          </div>
          
          <h3>What happens next?</h3>
          <ol style="line-height: 1.8;">
            <li>Make the upfront payment ($${upfrontAmount})</li>
            <li>Our AI team starts working immediately</li>
            <li>Receive your project preview within ${pkgKey === 'starter' ? '48 hours' : pkgKey === 'pro' ? '5 days' : '10 days'}</li>
            <li>Request revisions if needed (5 rounds included)</li>
            <li>Pay the remaining $${pkg.price - upfrontAmount} on approval</li>
          </ol>
          
          <p>Questions? Just reply to this email or chat with ARIA anytime on our website.</p>
          
          <p style="color: #666; font-size: 14px; margin-top: 40px;">
            This quote is valid for 7 days.<br>
            © ${new Date().getFullYear()} n01.app - AI Development Agency
          </p>
        </div>
      `,
    });

    // Also notify admin
    await resend.emails.send({
      from: "ARIA <ai@n01.app>",
      to: "ai@n01.app",
      subject: `💳 Payment Link Sent: ${leadInfo.name || leadInfo.email} - ${pkg.name}`,
      html: `
        <h2>ARIA sent a payment link!</h2>
        <ul>
          <li><strong>To:</strong> ${leadInfo.name || "N/A"} (${leadInfo.email})</li>
          <li><strong>Package:</strong> ${pkg.name}</li>
          <li><strong>Total:</strong> $${pkg.price}</li>
          <li><strong>Upfront:</strong> $${upfrontAmount}</li>
        </ul>
        <p><a href="https://n01.app/admin">View in Admin →</a></p>
      `,
    });

    // Mark as sent to prevent duplicates
    recentPaymentLinks.set(leadInfo.email, Date.now());
    
    console.log("✅ Payment link sent successfully!");
    return true;
  } catch (error) {
    console.error("Failed to send payment link:", error);
    return false;
  }
}

// Send escalation email
async function sendEscalationEmail(userMessage: string, conversationSummary: string, leadInfo: any) {
  if (!process.env.RESEND_API_KEY) {
    console.log("=".repeat(60));
    console.log("📧 ESCALATION NEEDED (Email not configured)");
    console.log("=".repeat(60));
    console.log("User Message:", userMessage);
    console.log("Summary:", conversationSummary);
    console.log("Lead:", leadInfo);
    console.log("=".repeat(60));
    return;
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: "ARIA <ai@n01.app>",
      to: "ai@n01.app",
      subject: `🔔 ARIA Escalation: Review Needed`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 16px; border-radius: 12px; margin-bottom: 20px;">
            <h2 style="margin: 0 0 8px 0; color: #92400e;">⚠️ ARIA Escalation</h2>
            <p style="margin: 0; color: #92400e;">A conversation needs human review</p>
          </div>
          
          <h3>Customer Request:</h3>
          <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 12px 0;">
            <p style="margin: 0; white-space: pre-wrap;">${userMessage}</p>
          </div>
          
          <h3>ARIA's Analysis:</h3>
          <div style="background: #eff6ff; padding: 16px; border-radius: 8px; margin: 12px 0;">
            <p style="margin: 0;">${conversationSummary}</p>
          </div>
          
          ${leadInfo?.name || leadInfo?.email ? `
            <h3>Customer Info:</h3>
            <ul>
              ${leadInfo.name ? `<li><strong>Name:</strong> ${leadInfo.name}</li>` : ""}
              ${leadInfo.email ? `<li><strong>Email:</strong> ${leadInfo.email}</li>` : ""}
              ${leadInfo.phone ? `<li><strong>Phone:</strong> ${leadInfo.phone}</li>` : ""}
              ${leadInfo.service ? `<li><strong>Interested in:</strong> ${leadInfo.service}</li>` : ""}
            </ul>
          ` : "<p><em>No customer info collected yet</em></p>"}
          
          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e5e5;">
            <p style="color: #666; font-size: 14px;">
              Respond to this customer through the admin dashboard or directly via email/WhatsApp.
            </p>
            <a href="https://n01.app/admin" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 8px;">
              Open Admin Dashboard
            </a>
          </div>
        </div>
      `,
    });

    console.log("📧 Escalation email sent for:", conversationSummary);
  } catch (error) {
    console.error("Failed to send escalation email:", error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { messages, leadData } = await request.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    // Build context from lead data if available
    let contextMessage = "";
    if (leadData) {
      const parts = [];
      if (leadData.name) parts.push(`User's name: ${leadData.name}`);
      if (leadData.email) parts.push(`Email: ${leadData.email}`);
      if (leadData.service) parts.push(`Interested in: ${leadData.service}`);
      if (leadData.package) parts.push(`Package interest: ${leadData.package}`);
      if (parts.length > 0) {
        contextMessage = `\n\nContext about this user: ${parts.join(", ")}`;
      }
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: ARIA_SYSTEM_PROMPT + contextMessage,
        },
        ...messages.map((msg: { role: string; content: string }) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        })),
      ],
      max_tokens: 400,
      temperature: 0.7,
    });

    let response = completion.choices[0]?.message?.content || "I apologize, I'm having trouble responding. Please try again.";

    let paymentLinkSent = false;

    // Check for payment link marker
    const paymentMatch = response.match(/\[SEND_PAYMENT:\s*(.+?)\]/);
    if (paymentMatch && leadData?.email) {
      // Remove the marker from the response
      response = response.replace(/\s*\[SEND_PAYMENT:\s*.+?\]/, "").trim();
      
      // Send payment link
      paymentLinkSent = await sendPaymentLink(leadData, paymentMatch[1].trim());
    }

    // Check for escalation marker
    const escalationMatch = response.match(/\[ESCALATE:\s*(.+?)\]/);
    if (escalationMatch) {
      // Remove the marker from the response shown to user
      response = response.replace(/\s*\[ESCALATE:\s*.+?\]/, "").trim();
      
      // Get the last user message
      const lastUserMessage = messages.filter((m: any) => m.role === "user").pop()?.content || "";
      
      // Send escalation email
      await sendEscalationEmail(lastUserMessage, escalationMatch[1], leadData);
    }

    return NextResponse.json({ response, paymentLinkSent });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    );
  }
}
