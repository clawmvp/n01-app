import { NextRequest, NextResponse } from "next/server";

// Vercel deployment management
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, name, gitRepo, envVars = {} } = body;

    if (!projectId || !name) {
      return NextResponse.json({ error: "Project ID and name required" }, { status: 400 });
    }

    const VERCEL_TOKEN = process.env.VERCEL_TOKEN || process.env.VERCEL_API_TOKEN;
    
    if (!VERCEL_TOKEN) {
      return NextResponse.json({
        success: false,
        message: "Vercel token not configured. Manual deployment required.",
        instructions: {
          steps: [
            "1. Go to vercel.com and log in",
            "2. Click 'Add New' -> 'Project'",
            gitRepo ? `3. Import GitHub repo: ${gitRepo}` : "3. Upload project files",
            "4. Configure environment variables",
            "5. Deploy",
          ],
          envRequired: "VERCEL_TOKEN from vercel.com/account/tokens",
        },
      });
    }

    // Create project on Vercel
    const createProjectResponse = await fetch("https://api.vercel.com/v9/projects", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${VERCEL_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
        framework: "nextjs",
        gitRepository: gitRepo ? {
          type: "github",
          repo: gitRepo,
        } : undefined,
      }),
    });

    if (!createProjectResponse.ok) {
      const error = await createProjectResponse.json();
      return NextResponse.json({ 
        success: false, 
        error: error.message || "Failed to create Vercel project" 
      }, { status: 400 });
    }

    const project = await createProjectResponse.json();

    // Add environment variables if provided
    if (Object.keys(envVars).length > 0) {
      for (const [key, value] of Object.entries(envVars)) {
        await fetch(`https://api.vercel.com/v10/projects/${project.id}/env`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${VERCEL_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            key,
            value,
            type: "encrypted",
            target: ["production", "preview", "development"],
          }),
        });
      }
    }

    // Trigger deployment if connected to git
    let deployment = null;
    if (gitRepo) {
      const deployResponse = await fetch("https://api.vercel.com/v13/deployments", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${VERCEL_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: project.name,
          project: project.id,
          target: "production",
        }),
      });

      if (deployResponse.ok) {
        deployment = await deployResponse.json();
      }
    }

    console.log("=".repeat(60));
    console.log("🚀 VERCEL PROJECT CREATED");
    console.log("=".repeat(60));
    console.log(`Project: ${projectId}`);
    console.log(`Vercel Project: ${project.name}`);
    console.log(`Dashboard: https://vercel.com/${project.accountId}/${project.name}`);
    if (deployment) console.log(`Deployment: https://${deployment.url}`);
    console.log("=".repeat(60));

    return NextResponse.json({
      success: true,
      project: {
        id: project.id,
        name: project.name,
        dashboardUrl: `https://vercel.com/project/${project.name}`,
      },
      deployment: deployment ? {
        id: deployment.id,
        url: `https://${deployment.url}`,
        status: deployment.status,
      } : null,
    });
  } catch (error) {
    console.error("Vercel API error:", error);
    return NextResponse.json({ error: "Failed to create Vercel project" }, { status: 500 });
  }
}

// Get project deployments
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectName = searchParams.get("project");

  const VERCEL_TOKEN = process.env.VERCEL_TOKEN || process.env.VERCEL_API_TOKEN;
  
  if (!VERCEL_TOKEN) {
    return NextResponse.json({ error: "Vercel token not configured" }, { status: 400 });
  }

  if (!projectName) {
    // List recent projects
    const response = await fetch("https://api.vercel.com/v9/projects?limit=10", {
      headers: { "Authorization": `Bearer ${VERCEL_TOKEN}` },
    });

    const data = await response.json();
    return NextResponse.json({
      projects: data.projects?.map((p: any) => ({
        id: p.id,
        name: p.name,
        framework: p.framework,
        updatedAt: p.updatedAt,
      })),
    });
  }

  // Get project deployments
  const response = await fetch(`https://api.vercel.com/v6/deployments?projectId=${projectName}&limit=5`, {
    headers: { "Authorization": `Bearer ${VERCEL_TOKEN}` },
  });

  const data = await response.json();
  return NextResponse.json({
    deployments: data.deployments?.map((d: any) => ({
      id: d.uid,
      url: `https://${d.url}`,
      state: d.state,
      createdAt: d.createdAt,
    })),
  });
}
