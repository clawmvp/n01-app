import { NextRequest, NextResponse } from "next/server";
import { getProject, getAllProjects } from "@/lib/automation";
import { buildAndDeployProject, generateProject } from "@/lib/ai-builder";

export const maxDuration = 300; // 5 minutes for AI generation

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, password, previewOnly } = body;

    // Simple auth
    if (password !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD && password !== "n01admin2024") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!projectId) {
      return NextResponse.json({ error: "Project ID required" }, { status: 400 });
    }

    const project = await getProject(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    console.log("🤖 AI Build requested for:", project.name);
    console.log("📋 Brief:", project.brief?.substring(0, 200) || "No brief");

    if (previewOnly) {
      // Just generate and return files without pushing
      const result = await generateProject(projectId);
      
      return NextResponse.json({
        success: result.success,
        preview: true,
        filesCount: result.files.length,
        files: result.files.map(f => ({
          path: f.path,
          size: f.content.length,
          preview: f.content.substring(0, 500) + (f.content.length > 500 ? "..." : ""),
        })),
        error: result.error,
      });
    }

    // Full build and deploy
    const result = await buildAndDeployProject(projectId);

    return NextResponse.json({
      success: result.success,
      projectId,
      projectName: project.name,
      filesGenerated: result.filesGenerated,
      githubRepo: project.githubRepo,
      vercelUrl: project.vercelUrl,
      message: result.success 
        ? `🎉 Successfully generated ${result.filesGenerated} files and deployed!`
        : result.error,
    });

  } catch (error) {
    console.error("AI Build error:", error);
    return NextResponse.json({ 
      error: "AI Build failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

// GET - Check AI build status and capabilities
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const password = searchParams.get("password");

  if (password !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD && password !== "n01admin2024") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const hasGitHub = !!process.env.GITHUB_TOKEN;
  const hasVercel = !!process.env.VERCEL_TOKEN;

  const projects = await getAllProjects();
  const readyForBuild = projects.filter(p => 
    p.brief && 
    p.githubRepo && 
    (p.status === "delivered" || p.status === "completed")
  );

  return NextResponse.json({
    capabilities: {
      codeGeneration: hasOpenAI ? "✅ Ready (OpenAI)" : "❌ Missing OPENAI_API_KEY",
      githubPush: hasGitHub ? "✅ Ready" : "❌ Missing GITHUB_TOKEN",
      vercelDeploy: hasVercel ? "✅ Ready" : "❌ Missing VERCEL_TOKEN",
      fullyOperational: hasOpenAI && hasGitHub && hasVercel,
    },
    projectsReadyForBuild: readyForBuild.length,
    projects: readyForBuild.map(p => ({
      id: p.id,
      name: p.name,
      brief: p.brief?.substring(0, 100) + "...",
      githubRepo: p.githubRepo,
    })),
  });
}
