// AI Project Builder
// Generates complete applications based on client brief using AI
// Now with NOVA Orchestrator (Claude) for intelligent planning

import OpenAI from "openai";
import { Project, getProject, updateProject } from "./automation";
import { analyzeBrief, getFileStructure, ProjectRequirements, validateDeliverables } from "./ai-analyzer";
import { createWorkPlan, executeWorkPlan, WorkPlan } from "./orchestrator";

// Initialize OpenAI
function getOpenAI(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY not configured");
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// Project structure for different package types
const PROJECT_STRUCTURES: Record<string, string[]> = {
  starter: [
    "package.json",
    "next.config.js",
    "tailwind.config.js",
    "tsconfig.json",
    "src/app/layout.tsx",
    "src/app/page.tsx",
    "src/app/globals.css",
    "src/components/Header.tsx",
    "src/components/Hero.tsx",
    "src/components/Features.tsx",
    "src/components/Footer.tsx",
    "public/logo.svg",
    "README.md",
  ],
  pro: [
    "package.json",
    "next.config.js",
    "tailwind.config.js",
    "tsconfig.json",
    "src/app/layout.tsx",
    "src/app/page.tsx",
    "src/app/globals.css",
    "src/app/login/page.tsx",
    "src/app/dashboard/page.tsx",
    "src/app/api/auth/route.ts",
    "src/components/Header.tsx",
    "src/components/Hero.tsx",
    "src/components/Features.tsx",
    "src/components/Pricing.tsx",
    "src/components/Footer.tsx",
    "src/lib/auth.ts",
    "public/logo.svg",
    "README.md",
  ],
  scale: [
    "package.json",
    "next.config.js",
    "tailwind.config.js",
    "tsconfig.json",
    "prisma/schema.prisma",
    "src/app/layout.tsx",
    "src/app/page.tsx",
    "src/app/globals.css",
    "src/app/login/page.tsx",
    "src/app/register/page.tsx",
    "src/app/dashboard/page.tsx",
    "src/app/dashboard/settings/page.tsx",
    "src/app/api/auth/[...nextauth]/route.ts",
    "src/app/api/users/route.ts",
    "src/components/Header.tsx",
    "src/components/Hero.tsx",
    "src/components/Features.tsx",
    "src/components/Pricing.tsx",
    "src/components/Testimonials.tsx",
    "src/components/Footer.tsx",
    "src/lib/auth.ts",
    "src/lib/db.ts",
    "public/logo.svg",
    "README.md",
  ],
  custom: [
    "package.json",
    "next.config.js",
    "tailwind.config.js",
    "tsconfig.json",
    "src/app/layout.tsx",
    "src/app/page.tsx",
    "src/app/globals.css",
    "src/components/Header.tsx",
    "src/components/Hero.tsx",
    "src/components/Footer.tsx",
    "public/logo.svg",
    "README.md",
  ],
};

// Base config files that don't need AI generation
const BASE_CONFIGS: Record<string, string> = {
  "next.config.js": `/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = nextConfig;
`,
  "tailwind.config.js": `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
`,
  "tsconfig.json": `{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
`,
};

/**
 * Generate a complete project based on the brief
 * Now with smart analysis to build ONLY what was requested
 */
export async function generateProject(projectId: string): Promise<{
  success: boolean;
  files: { path: string; content: string }[];
  requirements?: ProjectRequirements;
  error?: string;
}> {
  console.log("🤖 Starting AI project generation for:", projectId);

  const project = await getProject(projectId);
  if (!project) {
    return { success: false, files: [], error: "Project not found" };
  }

  const brief = project.brief || project.description || "A modern web application";
  const conversation = project.conversation || "";
  const clientName = project.clientName || "Client";
  const projectName = project.name.replace(/['"]s?\s+/g, "-").toLowerCase();

  console.log("📋 Brief:", brief.substring(0, 200) + "...");
  console.log("💬 Conversation:", conversation ? "Available" : "Not available");

  // STEP 1: Analyze the brief to understand what client actually wants
  console.log("\n🔍 STEP 1: Analyzing client requirements...");
  let requirements: ProjectRequirements;
  
  try {
    requirements = await analyzeBrief(brief, conversation);
  } catch (error) {
    console.log("⚠️ Analysis failed, using defaults");
    requirements = {
      projectType: "landing_page",
      deliverables: ["Website"],
      features: [],
      style: {},
      techStack: ["Next.js", "React", "Tailwind CSS"],
      complexity: "medium",
      estimatedFiles: 10,
      summary: brief,
      originalBrief: brief,
    };
  }

  console.log("\n📊 Analysis Results:");
  console.log(`   Type: ${requirements.projectType}`);
  console.log(`   Deliverables: ${requirements.deliverables.join(", ")}`);
  console.log(`   Summary: ${requirements.summary}`);

  const files: { path: string; content: string }[] = [];
  
  // STEP 2: Get file structure based on what client wants
  const structure = getFileStructure(requirements);
  console.log(`\n📁 Will generate ${structure.length} files for ${requirements.projectType}`);

  try {
    const openai = getOpenAI();

    // STEP 3: Generate each file based on requirements
    console.log("\n🔨 STEP 3: Generating files...");
    
    for (const filePath of structure) {
      console.log(`  📄 Generating: ${filePath}`);

      let content: string;

      // Use base configs for standard files
      if (BASE_CONFIGS[filePath]) {
        content = BASE_CONFIGS[filePath];
      } else if (filePath === "package.json") {
        content = generatePackageJson(projectName, requirements.projectType);
      } else if (filePath.endsWith(".svg")) {
        content = await generateSVGLogo(openai, requirements.summary, clientName);
      } else if (filePath.endsWith(".md")) {
        content = await generateDocumentation(openai, filePath, requirements, clientName);
      } else {
        // Pass requirements to file generator for context
        content = await generateFileContentSmart(openai, filePath, requirements, clientName);
      }

      files.push({ path: filePath, content });
    }

    // STEP 4: Validate deliverables
    console.log("\n✅ STEP 4: Validating deliverables...");
    const validation = validateDeliverables(requirements, files.map(f => f.path));
    console.log(`   Completion score: ${validation.score}%`);
    if (validation.missing.length > 0) {
      console.log(`   Missing: ${validation.missing.join(", ")}`);
    }

    console.log(`\n🎉 Generated ${files.length} files for ${requirements.projectType}`);

    return { success: true, files, requirements };
  } catch (error) {
    console.error("❌ AI generation error:", error);
    return {
      success: false,
      files,
      requirements,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Generate project using NOVA Orchestrator (Claude-powered)
 * This is the premium version with intelligent planning and coordination
 */
export async function generateProjectWithNova(projectId: string): Promise<{
  success: boolean;
  files: { path: string; content: string }[];
  workPlan?: WorkPlan;
  validation?: { passed: boolean; score: number; issues: string[] };
  error?: string;
}> {
  console.log("🧠 NOVA Orchestrator: Starting intelligent project generation...");
  console.log("═".repeat(60));

  const project = await getProject(projectId);
  if (!project) {
    return { success: false, files: [], error: "Project not found" };
  }

  const brief = project.brief || project.description || "A modern web application";
  const conversation = project.conversation || "";

  console.log("📋 Brief:", brief.substring(0, 200) + (brief.length > 200 ? "..." : ""));
  console.log("💬 Conversation:", conversation ? "Available" : "Not available");

  try {
    // PHASE 1: Create work plan with Claude
    console.log("\n🔍 PHASE 1: NOVA analyzing brief with Claude...");
    const workPlan = await createWorkPlan(projectId, brief, conversation);
    
    console.log("\n📊 Work Plan Summary:");
    console.log(`   Project Type: ${workPlan.analysis.projectType}`);
    console.log(`   Complexity: ${workPlan.analysis.complexity}`);
    console.log(`   Client Intent: ${workPlan.analysis.clientIntent}`);
    console.log(`   Phases: ${workPlan.phases.length}`);
    console.log(`   Estimated Time: ${workPlan.totalEstimatedMinutes} minutes`);
    
    workPlan.phases.forEach((phase, i) => {
      console.log(`\n   Phase ${i + 1}: ${phase.name} (${phase.agent})`);
      phase.tasks.forEach(task => {
        console.log(`      - ${task.title}`);
      });
    });

    // PHASE 2: Execute work plan
    console.log("\n🚀 PHASE 2: Executing work plan...");
    const result = await executeWorkPlan(workPlan, (phase, task, progress) => {
      console.log(`   [${Math.round(progress)}%] ${phase}: ${task}`);
    });

    // Convert files to array format
    const filesArray = Object.entries(result.files).map(([path, content]) => ({
      path,
      content,
    }));

    console.log("\n═".repeat(60));
    console.log("🎉 NOVA Orchestrator: Project generation complete!");
    console.log(`   Files generated: ${filesArray.length}`);
    console.log(`   Validation score: ${result.validation.score}/100`);
    console.log(`   Status: ${result.success ? "✅ PASSED" : "⚠️ NEEDS REVIEW"}`);
    
    if (result.validation.issues.length > 0) {
      console.log("   Issues:");
      result.validation.issues.forEach(issue => console.log(`      - ${issue}`));
    }

    return {
      success: result.success,
      files: filesArray,
      workPlan,
      validation: result.validation,
    };
  } catch (error) {
    console.error("❌ NOVA Orchestrator error:", error);
    return {
      success: false,
      files: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Generate file content using AI with full requirements context
 */
async function generateFileContentSmart(
  openai: OpenAI,
  filePath: string,
  requirements: ProjectRequirements,
  clientName: string
): Promise<string> {
  const fileType = getFileType(filePath);
  
  const systemPrompt = `You are an expert developer creating a ${requirements.projectType} project.

PROJECT REQUIREMENTS:
- Type: ${requirements.projectType}
- Summary: ${requirements.summary}
- Deliverables: ${requirements.deliverables.join(", ")}
- Features: ${requirements.features.join(", ") || "As needed"}
- Style: ${requirements.style.mood || "modern, professional"}
- Tech Stack: ${requirements.techStack.join(", ")}

CLIENT: ${clientName}
ORIGINAL BRIEF: ${requirements.originalBrief}

GUIDELINES:
- Build EXACTLY what the client asked for
- Use Next.js 14 with App Router and TypeScript
- Use Tailwind CSS for styling
- Create modern, professional, responsive designs
- Include proper imports and exports
- Make it production-ready

FILE TYPE: ${fileType}
FILE PATH: ${filePath}

Generate ONLY the file content, no explanations. The code should be complete and match the client's requirements.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Generate the complete content for: ${filePath}

Return ONLY the code, no markdown formatting, no \`\`\` blocks.`,
      },
    ],
    temperature: 0.7,
    max_tokens: 4000,
  });

  let content = response.choices[0]?.message?.content || "";
  content = content.replace(/^```[\w]*\n?/gm, "").replace(/```$/gm, "").trim();

  return content;
}

/**
 * Generate documentation based on requirements
 */
async function generateDocumentation(
  openai: OpenAI,
  filePath: string,
  requirements: ProjectRequirements,
  clientName: string
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are a technical writer. Create documentation for a ${requirements.projectType} project.`,
      },
      {
        role: "user",
        content: `Create ${filePath} for this project:

Client: ${clientName}
Type: ${requirements.projectType}
Summary: ${requirements.summary}
Deliverables: ${requirements.deliverables.join(", ")}
Features: ${requirements.features.join(", ") || "Standard features"}

Include:
- Project description
- What was delivered
- How to run/use
- Technologies used

Return ONLY markdown content.`,
      },
    ],
    temperature: 0.7,
    max_tokens: 1500,
  });

  return response.choices[0]?.message?.content || `# ${clientName}'s Project\n\n${requirements.summary}`;
}

/**
 * Generate package.json based on project type
 */
function generatePackageJson(name: string, projectType: string): string {
  // For logo-only projects, no package.json needed
  if (projectType === "logo") {
    return JSON.stringify({
      name: name.replace(/[^a-z0-9-]/g, "-") + "-assets",
      version: "1.0.0",
      description: "Brand assets and logo files",
    }, null, 2);
  }

  const deps: Record<string, string> = {
    next: "14.0.0",
    react: "^18",
    "react-dom": "^18",
    tailwindcss: "^3.3.0",
    autoprefixer: "^10.0.1",
    postcss: "^8",
  };

  if (projectType === "webapp") {
    deps["next-auth"] = "^4.24.0";
    deps["lucide-react"] = "^0.294.0";
    deps["@prisma/client"] = "^5.0.0";
    deps["prisma"] = "^5.0.0";
  }

  return JSON.stringify(
    {
      name: name.replace(/[^a-z0-9-]/g, "-"),
      version: "1.0.0",
      private: true,
      scripts: {
        dev: "next dev",
        build: "next build",
        start: "next start",
        lint: "next lint",
      },
      dependencies: deps,
      devDependencies: {
        typescript: "^5",
        "@types/node": "^20",
        "@types/react": "^18",
        "@types/react-dom": "^18",
      },
    },
    null,
    2
  );
}

/**
 * Generate file content using AI
 */
async function generateFileContent(
  openai: OpenAI,
  filePath: string,
  brief: string,
  packageType: string,
  clientName: string
): Promise<string> {
  const fileType = getFileType(filePath);
  
  const systemPrompt = `You are an expert web developer creating a ${packageType} web application.
  
PROJECT BRIEF: ${brief}

CLIENT: ${clientName}

GUIDELINES:
- Use Next.js 14 with App Router
- Use TypeScript
- Use Tailwind CSS for styling
- Create modern, professional, responsive designs
- Include proper imports and exports
- Make components reusable and well-structured
- Use semantic HTML
- Include helpful comments
- For pages, use "use client" when needed for interactivity

FILE TYPE: ${fileType}
FILE PATH: ${filePath}

Generate ONLY the file content, no explanations. The code should be complete and production-ready.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Generate the complete content for: ${filePath}
        
Based on this project description: ${brief}

Return ONLY the code, no markdown formatting, no \`\`\` blocks.`,
      },
    ],
    temperature: 0.7,
    max_tokens: 4000,
  });

  let content = response.choices[0]?.message?.content || "";

  // Clean up any markdown formatting
  content = content.replace(/^```[\w]*\n?/gm, "").replace(/```$/gm, "").trim();

  return content;
}

/**
 * Generate SVG logo using AI description then create SVG
 */
async function generateSVGLogo(
  openai: OpenAI,
  brief: string,
  clientName: string
): Promise<string> {
  // Generate a simple, professional SVG logo
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are a logo designer. Create a simple, modern SVG logo.
Output ONLY valid SVG code, no explanations.
The SVG should:
- Be 200x50 pixels (viewBox="0 0 200 50")
- Use a modern, minimal design
- Include the brand name as text
- Use professional colors
- Be a single SVG element with all content inside`,
      },
      {
        role: "user",
        content: `Create a simple SVG logo for: "${clientName}"
Project type: ${brief.substring(0, 100)}

Return ONLY the SVG code.`,
      },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  });

  let svg = response.choices[0]?.message?.content || "";
  svg = svg.replace(/^```[\w]*\n?/gm, "").replace(/```$/gm, "").trim();

  // Validate it's SVG
  if (!svg.includes("<svg")) {
    // Fallback simple logo
    svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 50">
  <rect width="200" height="50" fill="#3b82f6" rx="8"/>
  <text x="100" y="32" text-anchor="middle" fill="white" font-family="system-ui" font-size="20" font-weight="bold">${clientName}</text>
</svg>`;
  }

  return svg;
}

/**
 * Get file type for context
 */
function getFileType(filePath: string): string {
  if (filePath.includes("/api/")) return "API Route";
  if (filePath.includes("/app/") && filePath.endsWith("page.tsx")) return "Page Component";
  if (filePath.includes("/app/") && filePath.endsWith("layout.tsx")) return "Layout Component";
  if (filePath.includes("/components/")) return "React Component";
  if (filePath.includes("/lib/")) return "Utility/Library";
  if (filePath.endsWith(".css")) return "CSS Styles";
  if (filePath.endsWith(".prisma")) return "Prisma Schema";
  if (filePath === "README.md") return "Documentation";
  return "Source File";
}

/**
 * Push generated files to GitHub repository
 */
export async function pushToGitHub(
  repoUrl: string,
  files: { path: string; content: string }[]
): Promise<boolean> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.log("❌ GitHub token not configured");
    return false;
  }

  // Extract owner/repo from URL
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) {
    console.log("❌ Invalid GitHub URL");
    return false;
  }

  const [, owner, repo] = match;
  console.log(`📤 Pushing ${files.length} files to ${owner}/${repo}`);

  try {
    for (const file of files) {
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${file.path}`;

      // Check if file exists
      let sha: string | undefined;
      try {
        const existingRes = await fetch(apiUrl, {
          headers: {
            Authorization: `token ${token}`,
            Accept: "application/vnd.github.v3+json",
          },
        });
        if (existingRes.ok) {
          const existing = await existingRes.json();
          sha = existing.sha;
        }
      } catch {
        // File doesn't exist, that's fine
      }

      // Create/update file
      const res = await fetch(apiUrl, {
        method: "PUT",
        headers: {
          Authorization: `token ${token}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Add ${file.path}`,
          content: Buffer.from(file.content).toString("base64"),
          ...(sha && { sha }),
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        console.log(`  ⚠️ Failed to push ${file.path}:`, error.message);
      } else {
        console.log(`  ✅ Pushed: ${file.path}`);
      }
    }

    return true;
  } catch (error) {
    console.error("❌ GitHub push error:", error);
    return false;
  }
}

/**
 * Complete AI build pipeline: generate code + push to GitHub
 */
export async function buildAndDeployProject(projectId: string): Promise<{
  success: boolean;
  filesGenerated: number;
  error?: string;
}> {
  console.log("🚀 Starting full AI build for:", projectId);

  const project = await getProject(projectId);
  if (!project) {
    return { success: false, filesGenerated: 0, error: "Project not found" };
  }

  if (!project.githubRepo) {
    return { success: false, filesGenerated: 0, error: "No GitHub repo configured" };
  }

  // Generate all files
  const result = await generateProject(projectId);
  if (!result.success) {
    return { success: false, filesGenerated: 0, error: result.error };
  }

  // Push to GitHub
  const pushed = await pushToGitHub(project.githubRepo, result.files);
  if (!pushed) {
    return { success: false, filesGenerated: result.files.length, error: "Failed to push to GitHub" };
  }

  // Update project status
  await updateProject(projectId, {
    status: "delivered",
    deliveredAt: new Date().toISOString(),
  });

  console.log("🎉 Project built and deployed successfully!");

  return { success: true, filesGenerated: result.files.length };
}
