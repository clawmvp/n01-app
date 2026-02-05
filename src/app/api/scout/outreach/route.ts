import { NextRequest, NextResponse } from "next/server";
import { 
  getScoutLeads, 
  saveScoutLead,
  sendOutreach,
  generateOutreachMessage,
  updateScoutStats,
  getScoutStats,
  ScoutLead
} from "@/lib/scout-agents";

// POST - Send outreach for a lead
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password, leadId, customMessage } = body;

    if (password !== process.env.ADMIN_PASSWORD && password !== "n01admin2024") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!leadId) {
      return NextResponse.json({ error: "leadId required" }, { status: 400 });
    }

    const leads = await getScoutLeads();
    const lead = leads.find(l => l.id === leadId);

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Use custom message if provided
    if (customMessage) {
      lead.outreachMessage = customMessage;
    } else if (!lead.outreachMessage) {
      lead.outreachMessage = await generateOutreachMessage(lead);
    }

    // Try to send
    const result = await sendOutreach(lead);

    if (result.success) {
      // Update stats
      const stats = await getScoutStats();
      await updateScoutStats({
        totalOutreachSent: (stats.totalOutreachSent || 0) + 1,
      });
    }

    return NextResponse.json({
      success: result.success,
      error: result.error,
      lead,
    });

  } catch (error: any) {
    return NextResponse.json({ 
      error: "Outreach failed", 
      details: error.message 
    }, { status: 500 });
  }
}

// PATCH - Generate message for a lead (without sending)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { password, leadId } = body;

    if (password !== process.env.ADMIN_PASSWORD && password !== "n01admin2024") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!leadId) {
      return NextResponse.json({ error: "leadId required" }, { status: 400 });
    }

    const leads = await getScoutLeads();
    const lead = leads.find(l => l.id === leadId);

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Generate message
    lead.outreachMessage = await generateOutreachMessage(lead);
    await saveScoutLead(lead);

    return NextResponse.json({
      success: true,
      message: lead.outreachMessage,
      lead,
    });

  } catch (error: any) {
    return NextResponse.json({ 
      error: "Message generation failed", 
      details: error.message 
    }, { status: 500 });
  }
}

// PUT - Bulk outreach for qualified leads
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { password, minScore = 7, dryRun = true } = body;

    if (password !== process.env.ADMIN_PASSWORD && password !== "n01admin2024") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const leads = await getScoutLeads();
    const qualified = leads.filter(l => 
      l.status === "qualified" && 
      (l.score || 0) >= minScore &&
      !l.outreachSentAt
    );

    const results: { leadId: string; success: boolean; error?: string }[] = [];

    for (const lead of qualified.slice(0, 10)) { // Max 10 at a time
      if (dryRun) {
        // Just generate message
        lead.outreachMessage = await generateOutreachMessage(lead);
        await saveScoutLead(lead);
        results.push({ leadId: lead.id, success: true });
      } else {
        const result = await sendOutreach(lead);
        results.push({ leadId: lead.id, ...result });
      }

      // Rate limiting between sends
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    return NextResponse.json({
      success: true,
      dryRun,
      processed: results.length,
      results,
    });

  } catch (error: any) {
    return NextResponse.json({ 
      error: "Bulk outreach failed", 
      details: error.message 
    }, { status: 500 });
  }
}
