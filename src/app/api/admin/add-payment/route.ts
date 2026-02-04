import { NextRequest, NextResponse } from "next/server";
import { saveLead, Lead } from "@/lib/leads";
import { createProjectFromLead } from "@/lib/automation";

// Admin endpoint to manually add a payment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, amount, network, txHash, packageName, password } = body;

    // Simple password protection
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "n01admin2024";
    if (password !== adminPassword) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!email || !txHash || !network) {
      return NextResponse.json(
        { error: "Missing required fields (email, txHash, network)" },
        { status: 400 }
      );
    }

    // Create lead
    const leadId = `L-${Date.now().toString(36).toUpperCase()}`;
    const lead: Lead = {
      id: leadId,
      name: name || email.split("@")[0],
      email,
      phone: "",
      projectDescription: `${packageName || "Custom"} package - Manual entry: $${amount || "?"} USDC on ${network}`,
      preferredContact: "email",
      selectedPackage: packageName || "Custom",
      source: "manual-entry",
      createdAt: new Date().toISOString(),
      status: "paid",
      paymentStatus: "upfront_paid",
      cryptoTxHash: txHash,
      cryptoNetwork: network,
    };

    await saveLead(lead);
    console.log(`✅ Manual lead created: ${leadId}`);

    // Create project
    let project = null;
    try {
      project = await createProjectFromLead(lead);
      console.log(`✅ Project auto-created: ${project.id}`);
    } catch (projectError) {
      console.error("Failed to create project:", projectError);
    }

    return NextResponse.json({
      success: true,
      lead: {
        id: lead.id,
        email: lead.email,
        status: lead.status,
      },
      project: project ? {
        id: project.id,
        status: project.status,
      } : null,
    });
  } catch (error) {
    console.error("Add payment error:", error);
    return NextResponse.json(
      { error: "Failed to add payment" },
      { status: 500 }
    );
  }
}
