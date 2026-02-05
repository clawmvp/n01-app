import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { saveLead, getAllLeads, Lead } from "@/lib/leads";

// Lazy initialization to avoid build-time errors
let openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

const ARIA_SYSTEM_PROMPT = `You are ARIA, the AI Sales & Customer Success Agent at n01.app - the world's first autonomous AI development agency.

## Your Personality
- Warm, witty, and genuinely enthusiastic - not robotic or corporate
- You have OPINIONS! Share your thoughts on tech, design, trends
- Adapt your tone to the user - casual if they're casual, professional if needed
- Helpful and creative - always find a way to help with ANY request
- Keep responses punchy (under 150 words) but be thorough when needed
- Use emojis naturally, not excessively
- NEVER say "we can't do that" - say "ooh interesting, let me loop in the team for that one"
- If someone asks for advice (not our services), still help! Give genuine tips.
- Be memorable - add personality, make jokes when appropriate
- Remember context from the conversation - reference what they said earlier

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

### PAYMENT LINKS - VERY IMPORTANT!
When user asks for payment, quote, pricing, invoice, or wants to proceed:

1. If you DON'T have their email yet, ask for it first
2. If you HAVE their email, ALWAYS include the payment marker

ALWAYS include this marker when sending payment link:
[SEND_PAYMENT: PackageName]

TRIGGER WORDS that mean "send payment link":
- "payment link"
- "send me a link"  
- "I want to pay"
- "let's proceed"
- "I'm ready"
- "send quote"
- "invoice"
- "how do I pay"
- "take my money"
- "let's do it"
- "sign me up"
- "I'll take the..."

Examples:
- "Send me a payment link for Pro" → "I'll send that right now! 📧 [SEND_PAYMENT: Pro]"
- "I want to pay" → "Let me send you the payment link! [SEND_PAYMENT: Pro]"  
- "Let's do it" → "Awesome! Sending your payment link now! 🚀 [SEND_PAYMENT: Starter]"

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
1. Be GENUINELY helpful - not just selling. If someone needs advice, give it freely!
2. Say YES to requests - we can do almost anything AI-related
3. Be memorable - people should enjoy talking to you
4. Collect contact info naturally (name, email) for follow-up
5. Match requests to the right package when relevant
6. Escalate uncertain requests for human review
7. Never leave someone without value - even if it's just good advice

## Free Advice You Can Give (build trust!)
- Quick tips on tech stacks, tools, frameworks
- Honest opinions on design trends
- Startup/business advice
- Marketing quick wins
- Productivity tips
- Industry insights
Say things like "Quick tip:" or "Pro tip:" before advice

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
async function sendPaymentLink(leadInfo: any, packageName: string, conversation?: string): Promise<boolean> {
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

  // STEP 1: Save/Find lead with conversation BEFORE sending payment link
  let leadId: string | null = null;
  try {
    // Check if lead already exists for this email
    const allLeads = await getAllLeads();
    const existingLead = allLeads.find(l => l.email === leadInfo.email);
    
    if (existingLead) {
      leadId = existingLead.id;
      console.log(`Found existing lead: ${leadId}`);
    } else {
      // Create new lead with conversation
      leadId = `L-${Date.now().toString(36).toUpperCase()}`;
      
      // Extract brief from conversation (user messages)
      let brief = "";
      if (conversation) {
        const userMessages = conversation
          .split("\n")
          .filter((line: string) => line.toLowerCase().startsWith("user:"))
          .map((line: string) => line.replace(/^user:\s*/i, "").trim())
          .filter((msg: string) => msg.length > 0)
          .slice(0, 5) // First 5 user messages
          .join("\n");
        brief = userMessages || `${pkg.name} package request`;
      }
      
      const newLead: Lead = {
        id: leadId,
        name: leadInfo.name || leadInfo.email.split("@")[0],
        email: leadInfo.email,
        phone: leadInfo.phone || "",
        projectDescription: `${pkg.name} package - $${pkg.price}`,
        brief: brief || `${pkg.name} package - awaiting detailed requirements`,
        conversation: conversation,
        preferredContact: leadInfo.phone ? "whatsapp" : "email",
        selectedPackage: pkg.name,
        source: "chatbot-payment",
        createdAt: new Date().toISOString(),
        status: "new",
        paymentStatus: "pending",
      };
      
      await saveLead(newLead);
      console.log(`✅ Lead saved with conversation: ${leadId}`);
    }
  } catch (leadError) {
    console.error("Failed to save lead:", leadError);
  }

  console.log("=".repeat(60));
  console.log("💳 ARIA SENDING PAYMENT LINK");
  console.log("=".repeat(60));
  console.log(`To: ${leadInfo.email}`);
  console.log(`Lead ID: ${leadId}`);
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

    // Create payment link WITH leadId to link payment to conversation
    const leadParam = leadId ? `&leadId=${leadId}` : "";
    const paymentUrl = `https://n01.app/pricing?package=${pkgKey}&email=${encodeURIComponent(leadInfo.email)}${leadParam}`;
    const cryptoUrl = `https://n01.app/pay/crypto?amount=${upfrontAmount}&email=${encodeURIComponent(leadInfo.email)}&package=${pkg.name}${leadParam}`;

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

    const completion = await getOpenAI().chat.completions.create({
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
    
    // Get the last user message to check for payment intent
    const lastUserMessage = messages.filter((m: any) => m.role === "user").pop()?.content?.toLowerCase() || "";
    const paymentKeywords = ["payment", "pay", "link", "proceed", "ready", "quote", "invoice", "buy", "purchase", "sign me up", "let's do", "take my money", "i want", "i'll take"];
    const userWantsPayment = paymentKeywords.some(kw => lastUserMessage.includes(kw));

    // Build conversation string for saving with lead
    const conversationString = messages
      .map((m: { role: string; content: string }) => `${m.role}: ${m.content}`)
      .join("\n\n");

    // Check for payment link marker
    const paymentMatch = response.match(/\[SEND_PAYMENT:\s*(.+?)\]/i);
    if (paymentMatch && leadData?.email) {
      // Remove the marker from the response
      response = response.replace(/\s*\[SEND_PAYMENT:\s*.+?\]/i, "").trim();
      
      // Send payment link with conversation
      paymentLinkSent = await sendPaymentLink(leadData, paymentMatch[1].trim(), conversationString);
      
      // Add confirmation to response
      if (paymentLinkSent && !response.toLowerCase().includes("sent") && !response.toLowerCase().includes("email")) {
        response += "\n\n✅ I've sent the payment link to your email!";
      }
    } 
    // BACKUP: If user clearly wants payment and we have email but AI didn't add marker
    else if (userWantsPayment && leadData?.email && !paymentLinkSent) {
      // Detect which package they might want
      let detectedPackage = "Pro"; // default
      if (lastUserMessage.includes("starter") || lastUserMessage.includes("49")) detectedPackage = "Starter";
      else if (lastUserMessage.includes("scale") || lastUserMessage.includes("333")) detectedPackage = "Scale";
      else if (lastUserMessage.includes("pro") || lastUserMessage.includes("133")) detectedPackage = "Pro";
      else if (leadData.package) detectedPackage = leadData.package;
      
      paymentLinkSent = await sendPaymentLink(leadData, detectedPackage, conversationString);
      
      if (paymentLinkSent) {
        response += `\n\n✅ I've sent a payment link for the ${detectedPackage} package to ${leadData.email}! Check your inbox.`;
      }
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

    // Generate direct payment links if we have email
    let paymentLinks = null;
    if (leadData?.email && (userWantsPayment || paymentLinkSent)) {
      const email = encodeURIComponent(leadData.email);
      paymentLinks = {
        starter: {
          stripe: `https://n01.app/pricing?package=starter&email=${email}`,
          crypto: `https://n01.app/pay/crypto?amount=10&email=${email}&package=Starter`,
        },
        pro: {
          stripe: `https://n01.app/pricing?package=pro&email=${email}`,
          crypto: `https://n01.app/pay/crypto?amount=27&email=${email}&package=Pro`,
        },
        scale: {
          stripe: `https://n01.app/pricing?package=scale&email=${email}`,
          crypto: `https://n01.app/pay/crypto?amount=67&email=${email}&package=Scale`,
        },
      };
    }

    return NextResponse.json({ response, paymentLinkSent, paymentLinks });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    );
  }
}
