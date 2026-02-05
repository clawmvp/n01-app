import { NextRequest, NextResponse } from "next/server";
import { deliverProject, sendHandoverEmail, sendDeliveryEmail } from "@/lib/delivery";
import { getProject } from "@/lib/automation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, action, credentials } = body;

    if (!projectId) {
      return NextResponse.json({ error: "Project ID required" }, { status: 400 });
    }

    // Check project exists
    const project = await getProject(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Handle different actions
    if (action === "deliver") {
      // Full delivery: GitHub + Vercel + Email
      const result = await deliverProject(projectId);
      return NextResponse.json({
        success: result.success,
        result,
      });
    }

    if (action === "send-email") {
      // Send delivery email with current deliverables
      const success = await sendDeliveryEmail(projectId);
      return NextResponse.json({
        success,
        message: success ? "Delivery email sent" : "Failed to send delivery email",
      });
    }

    if (action === "handover") {
      // Send handover email with credentials
      const success = await sendHandoverEmail(projectId, credentials);
      return NextResponse.json({
        success,
        message: success ? "Handover email sent" : "Failed to send handover email",
      });
    }

    // Default: return project status
    return NextResponse.json({
      success: true,
      project,
      availableActions: ["deliver", "send-email", "handover"],
    });
  } catch (error) {
    console.error("Delivery error:", error);
    return NextResponse.json({ error: "Delivery failed" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json({ error: "Project ID required" }, { status: 400 });
  }

  const project = await getProject(projectId);
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json({
    project,
    deliveryStatus: {
      hasGitHub: !!project.githubRepo,
      hasVercel: !!project.vercelUrl,
      isDelivered: project.status === "delivered" || project.status === "completed",
    },
  });
}
