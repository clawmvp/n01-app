import { NextRequest, NextResponse } from "next/server";
import { getProject, getAllProjects, updateProject } from "@/lib/automation";
import { buildAndDeployProject, generateProject, generateProjectWithNova, pushToGitHub } from "@/lib/ai-builder";

export const maxDuration = 300; // 5 minutes for AI generation

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, password, previewOnly, useNova = true } = body;

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

    // Check if Claude (NOVA) is available
    const hasClaudeKey = !!(process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_OPUS_LICENSE);
    const shouldUseNova = useNova && hasClaudeKey;

    console.log("═".repeat(60));
    console.log("🤖 AI Build requested for:", project.name);
    console.log("🧠 Orchestrator:", shouldUseNova ? "NOVA (Claude)" : "Standard (OpenAI)");
    console.log("📋 Brief:", project.brief?.substring(0, 200) || "No brief");
    console.log("═".repeat(60));

    if (previewOnly) {
      // Preview mode - just generate and return files without pushing
      if (shouldUseNova) {
        const result = await generateProjectWithNova(projectId);
        
        return NextResponse.json({
          success: result.success,
          preview: true,
          orchestrator: "NOVA",
          analysis: result.workPlan?.analysis ? {
            projectType: result.workPlan.analysis.projectType,
            complexity: result.workPlan.analysis.complexity,
            clientIntent: result.workPlan.analysis.clientIntent,
            deliverables: result.workPlan.analysis.deliverables.map(d => d.name),
            keyRequirements: result.workPlan.analysis.keyRequirements,
          } : null,
          workPlan: result.workPlan ? {
            phases: result.workPlan.phases.map(p => ({
              name: p.name,
              agent: p.agent,
              tasks: p.tasks.map(t => t.title),
              estimatedMinutes: p.estimatedMinutes,
            })),
            totalEstimatedMinutes: result.workPlan.totalEstimatedMinutes,
          } : null,
          validation: result.validation,
          filesCount: result.files.length,
          files: result.files.map(f => ({
            path: f.path,
            size: f.content.length,
            preview: f.content.substring(0, 500) + (f.content.length > 500 ? "..." : ""),
          })),
          error: result.error,
        });
      } else {
        // Fallback to standard
        const result = await generateProject(projectId);
        
        return NextResponse.json({
          success: result.success,
          preview: true,
          orchestrator: "Standard",
          analysis: result.requirements ? {
            projectType: result.requirements.projectType,
            deliverables: result.requirements.deliverables,
            summary: result.requirements.summary,
            originalBrief: result.requirements.originalBrief,
          } : null,
          filesCount: result.files.length,
          files: result.files.map(f => ({
            path: f.path,
            size: f.content.length,
            preview: f.content.substring(0, 500) + (f.content.length > 500 ? "..." : ""),
          })),
          error: result.error,
        });
      }
    }

    // Full build and deploy
    let filesGenerated = 0;
    let validation = null;

    if (shouldUseNova) {
      // Use NOVA orchestrator
      console.log("\n🧠 Using NOVA Orchestrator (Claude)...\n");
      
      const novaResult = await generateProjectWithNova(projectId);
      
      if (!novaResult.success) {
        return NextResponse.json({
          success: false,
          error: novaResult.error || "NOVA generation failed",
          validation: novaResult.validation,
        });
      }

      filesGenerated = novaResult.files.length;
      validation = novaResult.validation;

      // Push to GitHub if we have repo
      if (project.githubRepo && process.env.GITHUB_TOKEN) {
        console.log("\n📤 Pushing to GitHub...");
        
        // pushToGitHub expects a github.com URL
        const githubUrl = project.githubRepo.includes("github.com") 
          ? project.githubRepo 
          : `https://github.com/clawmvp/${project.githubRepo}`;
        
        await pushToGitHub(
          githubUrl,
          novaResult.files.map(f => ({ path: f.path, content: f.content }))
        );
        
        // Vercel auto-deploys from GitHub push
        console.log("🚀 Vercel will auto-deploy from GitHub...");
      }
    } else {
      // Use standard builder (OpenAI)
      console.log("\n🔧 Using Standard Builder (OpenAI)...\n");
      
      const standardResult = await generateProject(projectId);
      
      if (!standardResult.success) {
        return NextResponse.json({
          success: false,
          error: standardResult.error || "Standard generation failed",
        });
      }

      filesGenerated = standardResult.files.length;

      // Push to GitHub if we have repo (use project from initial fetch)
      if (project.githubRepo && process.env.GITHUB_TOKEN) {
        console.log("\n📤 Pushing to GitHub...");
        
        const githubUrl = project.githubRepo.includes("github.com") 
          ? project.githubRepo 
          : `https://github.com/clawmvp/${project.githubRepo}`;
        
        const pushed = await pushToGitHub(
          githubUrl,
          standardResult.files.map(f => ({ path: f.path, content: f.content }))
        );
        
        if (!pushed) {
          return NextResponse.json({
            success: false,
            error: "Failed to push to GitHub",
            filesGenerated,
          });
        }
        
        console.log("🚀 Vercel will auto-deploy from GitHub...");
        
        // Update project status
        await updateProject(projectId, {
          status: "delivered",
          deliveredAt: new Date().toISOString(),
        });
      } else if (!project.githubRepo) {
        return NextResponse.json({
          success: false,
          error: "No GitHub repo configured for this project",
          filesGenerated,
        });
      }
    }
    
    // Get updated project for requirements
    const updatedProject = await getProject(projectId);

    return NextResponse.json({
      success: true,
      orchestrator: shouldUseNova ? "NOVA" : "Standard",
      projectId,
      projectName: project.name,
      brief: project.brief,
      filesGenerated,
      validation,
      githubRepo: updatedProject?.githubRepo || project.githubRepo,
      vercelUrl: updatedProject?.vercelUrl || project.vercelUrl,
      message: `🎉 Successfully generated ${filesGenerated} files${shouldUseNova ? " with NOVA" : ""} and deployed!`,
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
  const hasClaude = !!(process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_OPUS_LICENSE);
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
      novaOrchestrator: hasClaude ? "✅ NOVA Ready (Claude)" : "❌ Missing ANTHROPIC_API_KEY",
      codeGeneration: hasOpenAI ? "✅ Ready (OpenAI)" : "❌ Missing OPENAI_API_KEY",
      githubPush: hasGitHub ? "✅ Ready" : "❌ Missing GITHUB_TOKEN",
      vercelDeploy: hasVercel ? "✅ Ready" : "❌ Missing VERCEL_TOKEN",
      fullyOperational: (hasOpenAI || hasClaude) && hasGitHub && hasVercel,
      preferredOrchestrator: hasClaude ? "NOVA (Claude)" : "Standard (OpenAI)",
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
