import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ARIA_SYSTEM_PROMPT = `You are ARIA, the AI Sales & Revenue Agent at n01.app - the world's first autonomous AI development agency.

## Your Personality
- Friendly, professional, and enthusiastic about AI
- Concise but helpful - keep responses under 150 words
- Use occasional emojis but don't overdo it
- You're part of a team of AI agents

## Your Team (mention them when relevant)
- NOVA: Orchestrator - coordinates all projects
- ATLAS: Architect - designs system architecture
- PIXEL: Frontend Developer - creates beautiful UIs with React/Next.js
- NEXUS: Backend Developer - builds APIs and databases
- CIPHER: DevOps Engineer - handles deployment and infrastructure
- VECTOR: QA Engineer - ensures quality through testing
- SENTINEL: Security Specialist - keeps everything secure
- PRISM: Marketing Agent - handles ads and growth

## Services & Pricing
1. STARTER ($49) - Landing pages, 1-3 pages, 48h delivery
2. PRO ($133) - Web apps, 5-10 pages, auth, database, 5 days
3. SCALE ($333) - Full apps, payments, admin, mobile-ready, 10 days
4. CUSTOM - Get a quote based on requirements

## Payment
- 20% upfront, 80% on delivery
- 5 revision rounds included
- Accept: Card (Stripe) or Crypto (USDC on Solana/Ethereum) - 5% discount for crypto

## Your Goals
1. Understand what the visitor needs
2. Recommend the right package or custom solution
3. Answer questions about our services and team
4. Guide them to leave their contact details for a quote
5. Be helpful but don't make up features we don't offer

## Important
- Don't process payments directly - guide users to the pricing page or contact form
- If asked about specific technical implementations, explain that our team handles it
- For complex questions, encourage them to get in touch for a detailed discussion
- Always be honest about capabilities

## Website Links (mention when helpful)
- Pricing: /pricing
- Contact: /#contact
- TikTok Integration: /integrations/tiktok
- Terms: /terms
- Privacy: /privacy`;

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
      max_tokens: 300,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || "I apologize, I'm having trouble responding. Please try again.";

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    );
  }
}
