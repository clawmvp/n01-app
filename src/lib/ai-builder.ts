// AI Project Builder
// Generates complete applications based on client brief using AI

import OpenAI from "openai";
import { Project, getProject, updateProject } from "./automation";

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
 */
export async function generateProject(projectId: string): Promise<{
  success: boolean;
  files: { path: string; content: string }[];
  error?: string;
}> {
  console.log("🤖 Starting AI project generation for:", projectId);

  const project = await getProject(projectId);
  if (!project) {
    return { success: false, files: [], error: "Project not found" };
  }

  const brief = project.brief || project.description || "A modern web application";
  const packageType = project.packageType || "custom";
  const clientName = project.clientName || "Client";
  const projectName = project.name.replace(/['"]s?\s+/g, "-").toLowerCase();

  console.log("📋 Brief:", brief.substring(0, 200) + "...");
  console.log("📦 Package:", packageType);

  const files: { path: string; content: string }[] = [];
  const structure = PROJECT_STRUCTURES[packageType] || PROJECT_STRUCTURES.custom;

  try {
    const openai = getOpenAI();

    // Generate each file
    for (const filePath of structure) {
      console.log(`  📄 Generating: ${filePath}`);

      let content: string;

      // Use base configs for standard files
      if (BASE_CONFIGS[filePath]) {
        content = BASE_CONFIGS[filePath];
      } else if (filePath === "package.json") {
        content = generatePackageJson(projectName, packageType);
      } else if (filePath.endsWith(".svg")) {
        content = await generateSVGLogo(openai, brief, clientName);
      } else {
        content = await generateFileContent(openai, filePath, brief, packageType, clientName);
      }

      files.push({ path: filePath, content });
    }

    console.log(`✅ Generated ${files.length} files`);

    return { success: true, files };
  } catch (error) {
    console.error("❌ AI generation error:", error);
    return {
      success: false,
      files,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Generate package.json
 */
function generatePackageJson(name: string, packageType: string): string {
  const deps: Record<string, string> = {
    next: "14.0.0",
    react: "^18",
    "react-dom": "^18",
    tailwindcss: "^3.3.0",
    autoprefixer: "^10.0.1",
    postcss: "^8",
  };

  if (packageType === "pro" || packageType === "scale") {
    deps["next-auth"] = "^4.24.0";
    deps["lucide-react"] = "^0.294.0";
  }

  if (packageType === "scale") {
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
