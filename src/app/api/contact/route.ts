import { NextRequest, NextResponse } from "next/server";
import { saveLead, getAllLeads, Lead } from "@/lib/leads";

interface ContactRequest {
  name: string;
  email: string;
  phone: string;
  projectDescription: string;
  preferredContact: "whatsapp" | "email";
  selectedPackage: string;
  source?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactRequest = await request.json();

    // Validate required fields
    if (!body.name || !body.email || !body.phone) {
      return NextResponse.json(
        { error: "Name, email, and phone are required" },
        { status: 400 }
      );
    }

    // Generate lead ID
    const leadId = `L-${Date.now().toString(36).toUpperCase()}`;

    // Create lead object
    const lead: Lead = {
      id: leadId,
      name: body.name,
      email: body.email,
      phone: body.phone,
      projectDescription: body.projectDescription || "",
      preferredContact: body.preferredContact || "whatsapp",
      selectedPackage: body.selectedPackage || "custom",
      source: body.source,
      createdAt: new Date().toISOString(),
      status: "new",
      paymentStatus: "pending",
    };

    // Save lead
    await saveLead(lead);

    // Log lead info
    const whatsappLink = `https://wa.me/${body.phone.replace(/[\s\-\(\)\+]/g, "")}?text=${encodeURIComponent(
      `Hi ${body.name}! This is the n01.app AI team. Thanks for your interest in our ${body.selectedPackage} services. I'd love to discuss your project!`
    )}`;

    console.log("\n========== NEW LEAD ==========");
    console.log(`ID: ${leadId}`);
    console.log(`Name: ${body.name}`);
    console.log(`Email: ${body.email}`);
    console.log(`Phone: ${body.phone}`);
    console.log(`Package: ${body.selectedPackage}`);
    console.log(`Contact via: ${body.preferredContact}`);
    console.log(`Description: ${body.projectDescription || "Not provided"}`);
    console.log(`WhatsApp: ${whatsappLink}`);
    console.log("================================\n");

    // Send email notification if Resend is configured
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
            <p><strong>ID:</strong> ${leadId}</p>
            <p><strong>Name:</strong> ${body.name}</p>
            <p><strong>Email:</strong> ${body.email}</p>
            <p><strong>Phone:</strong> ${body.phone}</p>
            <p><strong>Package Interest:</strong> ${body.selectedPackage}</p>
            <p><strong>Preferred Contact:</strong> ${body.preferredContact}</p>
            <p><strong>Project Description:</strong> ${body.projectDescription || "Not specified"}</p>
            <hr>
            <p><a href="${whatsappLink}">📱 Open in WhatsApp</a></p>
            <p><a href="mailto:${body.email}">📧 Send Email</a></p>
            <p><a href="https://n01.app/admin">🔧 View in Admin</a></p>
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
  try {
    const leads = await getAllLeads();
    return NextResponse.json({ leads });
  } catch (error) {
    console.error("Get leads error:", error);
    return NextResponse.json({ leads: [] });
  }
}
