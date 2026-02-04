import { NextRequest, NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import { getLead, updateLead } from "@/lib/leads";
import { packages } from "@/lib/pricing";

// In-memory fallback for projects
const projectsStore: Map<string, any> = new Map();

export async function GET() {
  try {
    if (isDatabaseConfigured()) {
      const projects = await prisma.project.findMany({
        orderBy: { createdAt: "desc" },
        include: { lead: true },
      });
      return NextResponse.json({ projects });
    }
    
    // Fallback to memory
    return NextResponse.json({ 
      projects: Array.from(projectsStore.values()) 
    });
  } catch (error) {
    console.error("Get projects error:", error);
    return NextResponse.json({ projects: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leadId, name, packageType, customPrice } = body;

    if (!leadId || !name) {
      return NextResponse.json({ error: "Lead ID and name required" }, { status: 400 });
    }

    // Get lead info
    const lead = await getLead(leadId);
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Determine price
    const pkg = packages.find(p => p.id === packageType || p.name.toLowerCase() === packageType);
    const price = customPrice || pkg?.price || 133;

    const projectId = `P-${Date.now().toString(36).toUpperCase()}`;
    
    const projectData = {
      id: projectId,
      name,
      packageType: packageType || "custom",
      price,
      status: "PLANNING",
      leadId,
      createdAt: new Date(),
      estimatedDelivery: new Date(Date.now() + (pkg?.delivery?.includes("48") ? 2 : pkg?.delivery?.includes("5") ? 5 : 10) * 24 * 60 * 60 * 1000),
    };

    if (isDatabaseConfigured()) {
      try {
        const project = await prisma.project.create({
          data: projectData as any,
        });
        
        // Update lead status
        await updateLead(leadId, { status: "in_progress" });
        
        return NextResponse.json({ success: true, project });
      } catch (dbError) {
        console.error("Database error:", dbError);
      }
    }

    // Fallback to memory
    projectsStore.set(projectId, projectData);
    await updateLead(leadId, { status: "in_progress" });

    return NextResponse.json({ success: true, project: projectData });
  } catch (error) {
    console.error("Create project error:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, ...updates } = body;

    if (!projectId) {
      return NextResponse.json({ error: "Project ID required" }, { status: 400 });
    }

    if (isDatabaseConfigured()) {
      try {
        const project = await prisma.project.update({
          where: { id: projectId },
          data: updates,
        });
        return NextResponse.json({ success: true, project });
      } catch (dbError) {
        console.error("Database error:", dbError);
      }
    }

    // Fallback to memory
    const project = projectsStore.get(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    
    const updated = { ...project, ...updates };
    projectsStore.set(projectId, updated);
    
    return NextResponse.json({ success: true, project: updated });
  } catch (error) {
    console.error("Update project error:", error);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}
