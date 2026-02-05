import { NextRequest, NextResponse } from "next/server";
import { saveLead, Lead } from "@/lib/leads";

// Save a lead from chatbot conversation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, service, package: pkg, source, conversation } = body;

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // Generate lead ID
    const leadId = `L-${Date.now().toString(36).toUpperCase()}`;

    // Extract brief from conversation (first few user messages)
    let brief = "";
    if (conversation) {
      const userMessages = conversation
        .split("\n")
        .filter((line: string) => line.startsWith("user:"))
        .map((line: string) => line.replace("user:", "").trim())
        .slice(0, 5) // First 5 user messages
        .join("\n");
      brief = userMessages || `Service interest: ${service || "Not specified"}`;
    }

    // Create lead object
    const lead: Lead = {
      id: leadId,
      name: name || "Chatbot Lead",
      email: email,
      phone: phone || "",
      projectDescription: service || "Chat inquiry",
      brief: brief || `Interested in: ${service || "general inquiry"}`,
      conversation: conversation,
      preferredContact: phone ? "whatsapp" : "email",
      selectedPackage: pkg || "custom",
      source: source || "chatbot",
      createdAt: new Date().toISOString(),
      status: "new",
      paymentStatus: "pending",
    };

    // Save lead
    await saveLead(lead);

    // Log lead
    console.log("\n========== CHATBOT LEAD ==========");
    console.log(`ID: ${leadId}`);
    console.log(`Name: ${lead.name}`);
    console.log(`Email: ${email}`);
    console.log(`Phone: ${phone || "Not provided"}`);
    console.log(`Service: ${service || "Not specified"}`);
    console.log(`Package: ${pkg || "Not specified"}`);
    console.log("===================================\n");

    // Send notification email
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);

        await resend.emails.send({
          from: "ARIA <ai@n01.app>",
          to: "ai@n01.app",
          subject: `🤖 New Chatbot Lead: ${name || email}`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: #f0fdf4; border: 1px solid #22c55e; padding: 16px; border-radius: 12px; margin-bottom: 20px;">
                <h2 style="margin: 0 0 8px 0; color: #16a34a;">🤖 ARIA captured a new lead!</h2>
              </div>
              
              <h3>Contact Info:</h3>
              <ul>
                <li><strong>Name:</strong> ${name || "Not provided"}</li>
                <li><strong>Email:</strong> ${email}</li>
                <li><strong>Phone:</strong> ${phone || "Not provided"}</li>
              </ul>
              
              <h3>Interest:</h3>
              <ul>
                <li><strong>Service:</strong> ${service || "Not specified"}</li>
                <li><strong>Package:</strong> ${pkg || "Not specified"}</li>
              </ul>
              
              ${conversation ? `
                <h3>Conversation Summary:</h3>
                <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; font-size: 14px; white-space: pre-wrap; max-height: 300px; overflow-y: auto;">
${conversation}
                </div>
              ` : ""}
              
              <div style="margin-top: 24px;">
                ${phone ? `
                  <a href="https://wa.me/${phone.replace(/[^\d+]/g, "")}?text=${encodeURIComponent(`Hi ${name || "there"}! This is the n01.app team following up on your chat with ARIA.`)}" 
                     style="display: inline-block; background: #25d366; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-right: 12px;">
                    📱 WhatsApp
                  </a>
                ` : ""}
                <a href="https://n01.app/admin" 
                   style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none;">
                  Open Admin
                </a>
              </div>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Failed to send notification:", emailError);
      }
    }

    return NextResponse.json({ 
      success: true, 
      leadId,
      message: "Lead saved successfully" 
    });
  } catch (error) {
    console.error("Save chatbot lead error:", error);
    return NextResponse.json({ error: "Failed to save lead" }, { status: 500 });
  }
}
