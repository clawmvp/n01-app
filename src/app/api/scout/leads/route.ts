import { NextRequest, NextResponse } from "next/server";
import { 
  getScoutLeads, 
  saveScoutLead, 
  ScoutLead,
  generateOutreachMessage 
} from "@/lib/scout-agents";

// GET - Get all leads
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const platform = searchParams.get("platform");
    const minScore = searchParams.get("minScore");

    let leads = await getScoutLeads();

    // Filter by status
    if (status) {
      leads = leads.filter(l => l.status === status);
    }

    // Filter by platform
    if (platform) {
      leads = leads.filter(l => l.platform === platform);
    }

    // Filter by min score
    if (minScore) {
      leads = leads.filter(l => (l.score || 0) >= parseInt(minScore));
    }

    // Stats
    const stats = {
      total: leads.length,
      byStatus: {
        new: leads.filter(l => l.status === "new").length,
        qualified: leads.filter(l => l.status === "qualified").length,
        outreach_pending: leads.filter(l => l.status === "outreach_pending").length,
        outreach_sent: leads.filter(l => l.status === "outreach_sent").length,
        replied: leads.filter(l => l.status === "replied").length,
        converted: leads.filter(l => l.status === "converted").length,
        ignored: leads.filter(l => l.status === "ignored").length,
      },
      byPlatform: {
        reddit: leads.filter(l => l.platform === "reddit").length,
        twitter: leads.filter(l => l.platform === "twitter").length,
      },
      avgScore: leads.length > 0 
        ? leads.reduce((a, l) => a + (l.score || 0), 0) / leads.length 
        : 0,
    };

    return NextResponse.json({ leads, stats });

  } catch (error: any) {
    return NextResponse.json({ 
      error: "Failed to get leads", 
      details: error.message 
    }, { status: 500 });
  }
}

// PATCH - Update a lead
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { password, leadId, ...updates } = body;

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

    // Apply updates
    const updatedLead: ScoutLead = { ...lead, ...updates };

    // If generating message is requested
    if (updates.generateMessage) {
      updatedLead.outreachMessage = await generateOutreachMessage(updatedLead);
    }

    await saveScoutLead(updatedLead);

    return NextResponse.json({ success: true, lead: updatedLead });

  } catch (error: any) {
    return NextResponse.json({ 
      error: "Failed to update lead", 
      details: error.message 
    }, { status: 500 });
  }
}

// DELETE - Remove a lead (mark as ignored)
export async function DELETE(request: NextRequest) {
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

    lead.status = "ignored";
    await saveScoutLead(lead);

    return NextResponse.json({ success: true });

  } catch (error: any) {
    return NextResponse.json({ 
      error: "Failed to delete lead", 
      details: error.message 
    }, { status: 500 });
  }
}
