import { NextRequest, NextResponse } from "next/server";
import { getLead } from "@/lib/leads";

// Project handover - sends delivery email to client
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      leadId, 
      projectName,
      liveUrl,
      githubUrl,
      credentials = {},
      documentation,
      notes 
    } = body;

    if (!leadId) {
      return NextResponse.json({ error: "Lead ID required" }, { status: 400 });
    }

    const lead = await getLead(leadId);
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    console.log("=".repeat(60));
    console.log("📬 PROJECT HANDOVER");
    console.log("=".repeat(60));
    console.log(`Client: ${lead.name} (${lead.email})`);
    console.log(`Project: ${projectName || lead.selectedPackage}`);
    console.log(`Live URL: ${liveUrl || "Not provided"}`);
    console.log(`GitHub: ${githubUrl || "Not provided"}`);
    console.log("=".repeat(60));

    // Send handover email if Resend is configured
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);

        const credentialsHtml = Object.keys(credentials).length > 0 
          ? `
            <div style="background: #fef3c7; border: 1px solid #fbbf24; padding: 16px; border-radius: 12px; margin: 16px 0;">
              <h4 style="margin: 0 0 12px 0; color: #92400e;">🔐 Access Credentials</h4>
              ${Object.entries(credentials).map(([key, value]) => 
                `<p style="margin: 4px 0;"><strong>${key}:</strong> <code>${value}</code></p>`
              ).join("")}
              <p style="margin-top: 12px; font-size: 12px; color: #92400e;">Please change these passwords after first login.</p>
            </div>
          `
          : "";

        await resend.emails.send({
          from: "n01.app <ai@n01.app>",
          to: lead.email,
          subject: `🎉 Your Project is Ready - ${projectName || lead.selectedPackage}`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2>Hi ${lead.name}!</h2>
              <p>Great news! Your project is complete and ready for you.</p>
              
              <div style="background: #f0fdf4; border: 1px solid #22c55e; padding: 24px; border-radius: 12px; margin: 20px 0;">
                <h3 style="margin: 0 0 16px 0; color: #16a34a;">✅ Project Delivered</h3>
                
                ${liveUrl ? `
                  <p style="margin: 8px 0;">
                    <strong>🌐 Live Website:</strong><br>
                    <a href="${liveUrl}" style="color: #2563eb;">${liveUrl}</a>
                  </p>
                ` : ""}
                
                ${githubUrl ? `
                  <p style="margin: 8px 0;">
                    <strong>📦 Source Code:</strong><br>
                    <a href="${githubUrl}" style="color: #2563eb;">${githubUrl}</a>
                  </p>
                ` : ""}
              </div>
              
              ${credentialsHtml}
              
              ${documentation ? `
                <div style="background: #f5f5f5; padding: 16px; border-radius: 12px; margin: 16px 0;">
                  <h4 style="margin: 0 0 8px 0;">📚 Documentation</h4>
                  <p style="margin: 0; white-space: pre-line;">${documentation}</p>
                </div>
              ` : ""}
              
              ${notes ? `
                <div style="background: #eff6ff; border: 1px solid #3b82f6; padding: 16px; border-radius: 12px; margin: 16px 0;">
                  <h4 style="margin: 0 0 8px 0; color: #1e40af;">📝 Notes</h4>
                  <p style="margin: 0;">${notes}</p>
                </div>
              ` : ""}
              
              <h3>What's Next?</h3>
              <ol>
                <li>Review your live website</li>
                <li>Test all functionality</li>
                <li>Request any revisions (5 rounds included)</li>
                <li>Once approved, we'll process the final payment ($${Math.round((packages.find(p => p.name === lead.selectedPackage)?.price || 133) * 0.8)})</li>
              </ol>
              
              <div style="text-align: center; margin: 30px 0;">
                ${liveUrl ? `
                  <a href="${liveUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 16px 32px; border-radius: 50px; text-decoration: none; font-weight: 500;">
                    View Your Website
                  </a>
                ` : ""}
              </div>
              
              <p>Questions or revisions needed? Just reply to this email!</p>
              
              <p style="color: #666; font-size: 14px; margin-top: 40px;">
                Thank you for choosing n01.app!<br>
                © ${new Date().getFullYear()} n01.app
              </p>
            </div>
          `,
        });

        return NextResponse.json({
          success: true,
          message: "Handover email sent successfully",
          emailSent: true,
        });
      } catch (emailError) {
        console.error("Failed to send handover email:", emailError);
        return NextResponse.json({
          success: true,
          message: "Handover logged but email failed to send",
          emailSent: false,
          error: String(emailError),
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Handover logged. Configure RESEND_API_KEY for automatic emails.",
      emailSent: false,
    });
  } catch (error) {
    console.error("Handover error:", error);
    return NextResponse.json({ error: "Failed to process handover" }, { status: 500 });
  }
}

// Need to import packages for price calculation
import { packages } from "@/lib/pricing";
