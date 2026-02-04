// Project Delivery Automation
// Handles GitHub repo creation, Vercel deployment, and ZIP packaging

import { Project, updateProject, getProject } from "./automation";

// Delivery result interface
export interface DeliveryResult {
  success: boolean;
  githubRepo?: string;
  vercelUrl?: string;
  zipUrl?: string;
  error?: string;
}

// GitHub API helper
async function createGitHubRepo(projectName: string, isPrivate: boolean = true): Promise<string | null> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.log("GitHub token not configured - skipping repo creation");
    return null;
  }

  try {
    const repoName = projectName
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .substring(0, 50);

    const response = await fetch("https://api.github.com/user/repos", {
      method: "POST",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
        Accept: "application/vnd.github.v3+json",
      },
      body: JSON.stringify({
        name: repoName,
        private: isPrivate,
        auto_init: true,
        description: `Project created by n01.app AI Agency`,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("GitHub API error:", error);
      return null;
    }

    const repo = await response.json();
    return repo.html_url;
  } catch (error) {
    console.error("Failed to create GitHub repo:", error);
    return null;
  }
}

// Add collaborator to GitHub repo
async function addGitHubCollaborator(repoUrl: string, username: string): Promise<boolean> {
  const token = process.env.GITHUB_TOKEN;
  if (!token || !repoUrl) return false;

  try {
    // Extract owner/repo from URL
    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) return false;

    const [, owner, repo] = match;

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/collaborators/${username}`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
        body: JSON.stringify({ permission: "push" }),
      }
    );

    return response.ok;
  } catch (error) {
    console.error("Failed to add collaborator:", error);
    return false;
  }
}

// Create Vercel deployment
async function createVercelProject(
  projectName: string,
  githubRepo?: string
): Promise<string | null> {
  const token = process.env.VERCEL_TOKEN;
  if (!token) {
    console.log("Vercel token not configured - skipping deployment");
    return null;
  }

  try {
    const name = projectName
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .substring(0, 50);

    // Create project
    const createResponse = await fetch("https://api.vercel.com/v9/projects", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        framework: "nextjs",
        ...(githubRepo && {
          gitRepository: {
            type: "github",
            repo: githubRepo.replace("https://github.com/", ""),
          },
        }),
      }),
    });

    if (!createResponse.ok) {
      const error = await createResponse.json();
      console.error("Vercel API error:", error);
      return null;
    }

    const project = await createResponse.json();
    return `https://${name}.vercel.app`;
  } catch (error) {
    console.error("Failed to create Vercel project:", error);
    return null;
  }
}

// Generate ZIP download URL (using GitHub's ZIP feature)
function getZipDownloadUrl(githubRepo: string): string | null {
  if (!githubRepo) return null;
  // GitHub provides ZIP downloads at /archive/refs/heads/main.zip
  return `${githubRepo}/archive/refs/heads/main.zip`;
}

// Main delivery function
export async function deliverProject(projectId: string): Promise<DeliveryResult> {
  const project = await getProject(projectId);
  if (!project) {
    return { success: false, error: "Project not found" };
  }

  console.log("=".repeat(60));
  console.log("📦 STARTING PROJECT DELIVERY");
  console.log("=".repeat(60));
  console.log(`Project: ${project.name}`);
  console.log(`Client: ${project.clientName} (${project.clientEmail})`);

  const result: DeliveryResult = { success: true };

  // Step 1: Create GitHub Repository
  console.log("\n1️⃣ Creating GitHub repository...");
  const githubRepo = await createGitHubRepo(project.name);
  if (githubRepo) {
    result.githubRepo = githubRepo;
    console.log(`   ✅ GitHub repo created: ${githubRepo}`);
    
    // Generate ZIP URL
    result.zipUrl = getZipDownloadUrl(githubRepo) || undefined;
    console.log(`   ✅ ZIP available: ${result.zipUrl}`);
  } else {
    console.log("   ⚠️ GitHub repo not created (token not configured)");
  }

  // Step 2: Create Vercel Deployment
  console.log("\n2️⃣ Creating Vercel deployment...");
  const vercelUrl = await createVercelProject(project.name, githubRepo || undefined);
  if (vercelUrl) {
    result.vercelUrl = vercelUrl;
    console.log(`   ✅ Vercel deployment: ${vercelUrl}`);
  } else {
    console.log("   ⚠️ Vercel deployment not created (token not configured)");
  }

  // Step 3: Update project with delivery info
  await updateProject(projectId, {
    githubRepo: result.githubRepo,
    vercelUrl: result.vercelUrl,
    previewUrl: result.vercelUrl,
    status: "delivered",
    deliveredAt: new Date().toISOString(),
  });

  // Step 4: Send delivery notification email
  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);

      await resend.emails.send({
        from: "n01.app <ai@n01.app>",
        to: project.clientEmail,
        subject: "🎉 Your Project is Ready! - n01.app",
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Your Project is Ready! 🎉</h2>
            <p>Hi ${project.clientName},</p>
            <p>Great news - your project has been completed and is ready for you!</p>
            
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 24px; border-radius: 16px; margin: 24px 0; color: white;">
              <h3 style="margin: 0 0 16px 0;">📦 Deliverables</h3>
              
              ${result.vercelUrl ? `
              <div style="background: rgba(255,255,255,0.2); padding: 12px 16px; border-radius: 8px; margin-bottom: 12px;">
                <strong>🌐 Live Website</strong><br>
                <a href="${result.vercelUrl}" style="color: white;">${result.vercelUrl}</a>
              </div>
              ` : ""}
              
              ${result.githubRepo ? `
              <div style="background: rgba(255,255,255,0.2); padding: 12px 16px; border-radius: 8px; margin-bottom: 12px;">
                <strong>📦 Source Code</strong><br>
                <a href="${result.githubRepo}" style="color: white;">${result.githubRepo}</a>
              </div>
              ` : ""}
              
              ${result.zipUrl ? `
              <div style="background: rgba(255,255,255,0.2); padding: 12px 16px; border-radius: 8px;">
                <strong>📥 Download ZIP</strong><br>
                <a href="${result.zipUrl}" style="color: white;">Download source code</a>
              </div>
              ` : ""}
            </div>
            
            <h3>What's Next?</h3>
            <ol style="line-height: 1.8;">
              <li>Review your project at the live URL</li>
              <li>Let us know if you need any changes (${project.maxRevisions - project.revisionCount} revisions remaining)</li>
              <li>Once approved, we'll finalize everything</li>
            </ol>
            
            <div style="background: #f5f5f5; padding: 16px; border-radius: 12px; margin: 24px 0;">
              <h4 style="margin: 0 0 8px 0;">💬 Need Changes?</h4>
              <p style="margin: 0;">Just reply to this email with your feedback, or chat with ARIA on our website!</p>
            </div>
            
            <p>Thank you for choosing n01.app! 🙏</p>
            
            <p style="color: #666; font-size: 14px; margin-top: 40px;">
              Project ID: ${project.id}<br>
              © ${new Date().getFullYear()} n01.app - AI Development Agency
            </p>
          </div>
        `,
      });

      console.log("\n✉️ Delivery notification sent to client");
    } catch (emailError) {
      console.error("Failed to send delivery email:", emailError);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("✅ DELIVERY COMPLETE");
  console.log("=".repeat(60));

  return result;
}

// Send handover email with credentials
export async function sendHandoverEmail(
  projectId: string,
  credentials?: { username?: string; password?: string; apiKeys?: Record<string, string> }
): Promise<boolean> {
  const project = await getProject(projectId);
  if (!project) return false;

  if (!process.env.RESEND_API_KEY) {
    console.log("Resend not configured - skipping handover email");
    return false;
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: "n01.app <ai@n01.app>",
      to: project.clientEmail,
      subject: "🔐 Project Credentials & Documentation - n01.app",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Project Handover 🔐</h2>
          <p>Hi ${project.clientName},</p>
          <p>Here are your project credentials and important information:</p>
          
          ${credentials?.username || credentials?.password ? `
          <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 16px; border-radius: 12px; margin: 20px 0;">
            <h4 style="margin: 0 0 12px 0; color: #92400e;">🔑 Admin Credentials</h4>
            ${credentials.username ? `<p style="margin: 4px 0;"><strong>Username:</strong> ${credentials.username}</p>` : ""}
            ${credentials.password ? `<p style="margin: 4px 0;"><strong>Password:</strong> ${credentials.password}</p>` : ""}
            <p style="margin: 12px 0 0 0; font-size: 12px; color: #92400e;">⚠️ Please change these credentials after first login!</p>
          </div>
          ` : ""}
          
          ${credentials?.apiKeys && Object.keys(credentials.apiKeys).length > 0 ? `
          <div style="background: #f3f4f6; padding: 16px; border-radius: 12px; margin: 20px 0;">
            <h4 style="margin: 0 0 12px 0;">🔧 API Keys</h4>
            ${Object.entries(credentials.apiKeys).map(([key, value]) => `
              <p style="margin: 4px 0;"><strong>${key}:</strong> <code>${value}</code></p>
            `).join("")}
          </div>
          ` : ""}
          
          <h3>📚 Resources</h3>
          <ul style="line-height: 1.8;">
            ${project.vercelUrl ? `<li><a href="${project.vercelUrl}">Live Website</a></li>` : ""}
            ${project.githubRepo ? `<li><a href="${project.githubRepo}">GitHub Repository</a></li>` : ""}
            ${project.githubRepo ? `<li><a href="${project.githubRepo}/blob/main/README.md">Documentation</a></li>` : ""}
          </ul>
          
          <p>If you have any questions, don't hesitate to reach out!</p>
          
          <p style="color: #666; font-size: 14px; margin-top: 40px;">
            © ${new Date().getFullYear()} n01.app - AI Development Agency
          </p>
        </div>
      `,
    });

    // Mark project as completed
    await updateProject(projectId, {
      status: "completed",
      completedAt: new Date().toISOString(),
    });

    return true;
  } catch (error) {
    console.error("Failed to send handover email:", error);
    return false;
  }
}
