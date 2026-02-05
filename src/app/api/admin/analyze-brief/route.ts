import { NextRequest, NextResponse } from "next/server";
import { getProject } from "@/lib/automation";
import { analyzeBrief } from "@/lib/ai-analyzer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, password, customBrief } = body;

    // Simple auth
    if (password !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD && password !== "n01admin2024") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let brief: string;
    let conversation: string | undefined;
    let projectName = "Custom Analysis";

    if (projectId) {
      const project = await getProject(projectId);
      if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }
      brief = project.brief || project.description || "";
      conversation = project.conversation || undefined;
      projectName = project.name;
    } else if (customBrief) {
      brief = customBrief;
    } else {
      return NextResponse.json({ error: "Project ID or custom brief required" }, { status: 400 });
    }

    if (!brief || brief.trim().length < 5) {
      return NextResponse.json({ 
        error: "Brief is too short or empty",
        brief: brief || "(empty)",
      }, { status: 400 });
    }

    console.log("🔍 Analyzing brief for:", projectName);
    
    const requirements = await analyzeBrief(brief, conversation);

    return NextResponse.json({
      success: true,
      projectName,
      originalBrief: brief,
      hasConversation: !!conversation,
      analysis: {
        projectType: requirements.projectType,
        deliverables: requirements.deliverables,
        features: requirements.features,
        style: requirements.style,
        techStack: requirements.techStack,
        complexity: requirements.complexity,
        estimatedFiles: requirements.estimatedFiles,
        summary: requirements.summary,
      },
      recommendation: getRecommendation(requirements),
    });

  } catch (error) {
    console.error("Analyze brief error:", error);
    return NextResponse.json({ 
      error: "Analysis failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

function getRecommendation(requirements: { projectType: string; complexity: string; estimatedFiles: number }) {
  const { projectType, complexity, estimatedFiles } = requirements;
  
  const timeEstimates: Record<string, string> = {
    logo: "~30 seconds",
    landing_page: "~1-2 minutes",
    website: "~2-3 minutes",
    webapp: "~3-5 minutes",
    custom: "~2-3 minutes",
  };

  return {
    estimatedBuildTime: timeEstimates[projectType] || "~2 minutes",
    filesWillGenerate: estimatedFiles,
    recommendation: projectType === "logo" 
      ? "Will generate logo files and brand assets only"
      : `Will generate a ${complexity} ${projectType} with ${estimatedFiles} files`,
  };
}
