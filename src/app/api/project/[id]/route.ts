import { NextRequest, NextResponse } from "next/server";
import { getProject, getProjectByToken, updateProject, advanceProjectTask, processAutoProgress } from "@/lib/automation";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const isAdmin = searchParams.get("admin") === "true";
  
  // Process auto-progress for all projects (keeps things moving)
  await processAutoProgress().catch(err => {
    console.log("Auto-progress check:", err.message);
  });
  
  let project;
  
  if (isAdmin) {
    // Admin access - no token required
    project = await getProject(id);
  } else if (token) {
    // Client access with token - verify token matches
    project = await getProjectByToken(id, token);
    if (!project) {
      return NextResponse.json({ 
        error: "Invalid or expired project link",
        requiresToken: true 
      }, { status: 403 });
    }
  } else {
    // No token provided - check if project requires token
    project = await getProject(id);
    if (project?.accessToken) {
      // Project has a token - require it
      return NextResponse.json({ 
        error: "This project requires authentication",
        requiresToken: true,
        projectExists: true
      }, { status: 401 });
    }
  }
  
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }
  
  // For client view, hide sensitive data
  if (!isAdmin) {
    // Remove accessToken from response for security
    const { accessToken, ...safeProject } = project;
    return NextResponse.json({ project: safeProject });
  }
  
  return NextResponse.json({ project });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  
  const { action, ...updates } = body;
  
  // Handle special actions
  if (action === "advance_task") {
    const project = await advanceProjectTask(id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, project });
  }
  
  // Regular update
  const project = await updateProject(id, updates);
  
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }
  
  return NextResponse.json({ success: true, project });
}
