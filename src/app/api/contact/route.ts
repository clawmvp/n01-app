import { NextRequest, NextResponse } from "next/server";
import { saveLead, getAllLeads, Lead } from "@/lib/leads";

interface ContactRequest {
  name: string;
  email: string;
  phone: string;
  projectDescription: string;
  preferredContact: "whatsapp" | "email";
  selectedPackage: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactRequest = await request.json();

    // Validate required fields
    if (!body.name || !body.email || !body.phone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate lead ID
    const leadId = `L-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create lead object
    const lead: Lead = {
      id: leadId,
      name: body.name,
      email: body.email,
      phone: body.phone,
      projectDescription: body.projectDescription || "",
      preferredContact: body.preferredContact,
      selectedPackage: body.selectedPackage,
      createdAt: new Date().toISOString(),
      status: "new",
    };

    // Save lead
    saveLead(lead);

    // Log the lead
    console.log("=".repeat(60));
    console.log("🚀 NEW LEAD RECEIVED!");
    console.log("=".repeat(60));
    console.log(`Lead ID: ${leadId}`);
    console.log(`Name: ${body.name}`);
    console.log(`Email: ${body.email}`);
    console.log(`Phone: ${body.phone}`);
    console.log(`Package: ${body.selectedPackage}`);
    console.log(`Preferred Contact: ${body.preferredContact}`);
    console.log(`Project: ${body.projectDescription || "Not specified"}`);
    console.log("=".repeat(60));

    // Format phone for WhatsApp (remove spaces, dashes, etc.)
    const whatsappPhone = body.phone.replace(/[\s\-\(\)]/g, "").replace(/^\+/, "");
    const whatsappLink = `https://wa.me/${whatsappPhone}`;

    console.log(`📱 WhatsApp Link: ${whatsappLink}`);
    console.log("=".repeat(60));

    // TODO: Send notification to admin via:
    // 1. WhatsApp Business API (if configured)
    // 2. Email notification
    // 3. Slack/Discord webhook
    // 4. Push to CRM

    // Send email notification if configured
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        
        await resend.emails.send({
          from: "n01.app <ai@n01.app>",
          to: "ai@n01.app",
          subject: `🚀 New Lead: ${body.name} - ${body.selectedPackage}`,
          html: `
            <h2>New Lead Received!</h2>
            <p><strong>Name:</strong> ${body.name}</p>
            <p><strong>Email:</strong> ${body.email}</p>
            <p><strong>Phone:</strong> ${body.phone}</p>
            <p><strong>Package Interest:</strong> ${body.selectedPackage}</p>
            <p><strong>Preferred Contact:</strong> ${body.preferredContact}</p>
            <p><strong>Project Description:</strong> ${body.projectDescription || "Not specified"}</p>
            <hr>
            <p><a href="${whatsappLink}">📱 Open in WhatsApp</a></p>
            <p><a href="mailto:${body.email}">📧 Send Email</a></p>
          `,
        });
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError);
      }
    }

    return NextResponse.json({
      success: true,
      leadId,
      message: "Thank you! We'll contact you shortly.",
    });
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { error: "Failed to process contact request" },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return all leads (admin only - add auth in production)
  return NextResponse.json({
    leads: getAllLeads(),
  });
}
