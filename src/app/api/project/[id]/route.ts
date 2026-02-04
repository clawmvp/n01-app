import { NextRequest, NextResponse } from "next/server";
import { getProject, updateProject, advanceProjectTask } from "@/lib/automation";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  const project = await getProject(id);
  
  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
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
