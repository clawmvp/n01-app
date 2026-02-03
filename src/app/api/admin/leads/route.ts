import { NextRequest, NextResponse } from "next/server";
import { getAllLeads, updateLead, Lead } from "@/lib/leads";

export async function GET() {
  const leads = getAllLeads();
  return NextResponse.json({ leads });
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { leadId, status, notes } = body;

    if (!leadId) {
      return NextResponse.json({ error: "Lead ID required" }, { status: 400 });
    }

    const updates: Partial<Lead> = {};
    if (status) updates.status = status;
    if (notes !== undefined) updates.notes = notes;

    const updated = updateLead(leadId, updates);
    
    if (!updated) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, lead: updated });
  } catch (error) {
    console.error("Admin leads API error:", error);
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
  }
}
