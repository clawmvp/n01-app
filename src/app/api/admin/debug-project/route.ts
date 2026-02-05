import { NextRequest, NextResponse } from "next/server";
import { getProject, getAllProjects } from "@/lib/automation";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  const password = searchParams.get("password");

  // Simple auth
  if (password !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD && password !== "n01admin2024") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (projectId) {
    // Get specific project
    const project = await getProject(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    return NextResponse.json({
      project: {
        id: project.id,
        name: project.name,
        status: project.status,
        clientEmail: project.clientEmail,
        clientName: project.clientName,
        vercelUrl: project.vercelUrl || null,
        githubRepo: project.githubRepo || null,
        previewUrl: project.previewUrl || null,
        autoProgress: project.autoProgress,
        priority: project.priority,
        tasksCount: project.tasks?.length || 0,
        completedTasks: project.tasks?.filter(t => t.status === "completed").length || 0,
      }
    });
  }

  // Get all projects summary
  const projects = await getAllProjects();
  return NextResponse.json({
    count: projects.length,
    projects: projects.map(p => ({
      id: p.id,
      name: p.name,
      status: p.status,
      hasVercelUrl: !!p.vercelUrl,
      hasGithubRepo: !!p.githubRepo,
      autoProgress: p.autoProgress,
    }))
  });
}
