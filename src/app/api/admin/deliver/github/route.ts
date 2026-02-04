import { NextRequest, NextResponse } from "next/server";

// GitHub repository creation and management
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, repoName, clientUsername, isPrivate = true } = body;

    if (!projectId || !repoName) {
      return NextResponse.json({ error: "Project ID and repo name required" }, { status: 400 });
    }

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    
    if (!GITHUB_TOKEN) {
      // Return instructions if token not configured
      return NextResponse.json({
        success: false,
        message: "GitHub token not configured. Manual setup required.",
        instructions: {
          steps: [
            `1. Create repo: gh repo create ${repoName} --${isPrivate ? "private" : "public"}`,
            `2. Clone template and push code`,
            clientUsername ? `3. Add collaborator: gh repo add-collaborator ${repoName} ${clientUsername}` : null,
          ].filter(Boolean),
          envRequired: "GITHUB_TOKEN with repo and admin:org scopes",
        },
      });
    }

    // Create repository using GitHub API
    const createRepoResponse = await fetch("https://api.github.com/user/repos", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GITHUB_TOKEN}`,
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: repoName,
        description: `Client project - ${projectId}`,
        private: isPrivate,
        auto_init: true,
        has_issues: true,
        has_projects: false,
        has_wiki: false,
      }),
    });

    if (!createRepoResponse.ok) {
      const error = await createRepoResponse.json();
      return NextResponse.json({ 
        success: false, 
        error: error.message || "Failed to create repository" 
      }, { status: 400 });
    }

    const repo = await createRepoResponse.json();

    // Add collaborator if specified
    if (clientUsername) {
      await fetch(`https://api.github.com/repos/${repo.full_name}/collaborators/${clientUsername}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${GITHUB_TOKEN}`,
          "Accept": "application/vnd.github.v3+json",
        },
        body: JSON.stringify({ permission: "push" }),
      });
    }

    console.log("=".repeat(60));
    console.log("📦 GITHUB REPO CREATED");
    console.log("=".repeat(60));
    console.log(`Project: ${projectId}`);
    console.log(`Repo: ${repo.html_url}`);
    console.log(`Clone: ${repo.clone_url}`);
    if (clientUsername) console.log(`Collaborator: ${clientUsername}`);
    console.log("=".repeat(60));

    return NextResponse.json({
      success: true,
      repo: {
        name: repo.name,
        fullName: repo.full_name,
        url: repo.html_url,
        cloneUrl: repo.clone_url,
        sshUrl: repo.ssh_url,
      },
    });
  } catch (error) {
    console.error("GitHub API error:", error);
    return NextResponse.json({ error: "Failed to create GitHub repository" }, { status: 500 });
  }
}

// Get repository info
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const repoName = searchParams.get("repo");

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  
  if (!GITHUB_TOKEN) {
    return NextResponse.json({ error: "GitHub token not configured" }, { status: 400 });
  }

  if (!repoName) {
    // List all repos
    const response = await fetch("https://api.github.com/user/repos?per_page=10&sort=created", {
      headers: {
        "Authorization": `Bearer ${GITHUB_TOKEN}`,
        "Accept": "application/vnd.github.v3+json",
      },
    });

    const repos = await response.json();
    return NextResponse.json({
      repos: repos.map((r: any) => ({
        name: r.name,
        url: r.html_url,
        createdAt: r.created_at,
        private: r.private,
      })),
    });
  }

  // Get specific repo
  const response = await fetch(`https://api.github.com/repos/${repoName}`, {
    headers: {
      "Authorization": `Bearer ${GITHUB_TOKEN}`,
      "Accept": "application/vnd.github.v3+json",
    },
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Repository not found" }, { status: 404 });
  }

  const repo = await response.json();
  return NextResponse.json({ repo });
}
