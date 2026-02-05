// AI Brief Analyzer
// Analyzes client brief to determine what exactly needs to be built

import OpenAI from "openai";

export interface ProjectRequirements {
  projectType: "logo" | "landing_page" | "website" | "webapp" | "mobile_app" | "custom";
  deliverables: string[];
  features: string[];
  style: {
    colors?: string[];
    mood?: string;
    references?: string[];
  };
  techStack: string[];
  complexity: "simple" | "medium" | "complex";
  estimatedFiles: number;
  summary: string;
  originalBrief: string;
}

// Initialize OpenAI
function getOpenAI(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY not configured");
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

/**
 * Analyze a client brief to understand what they want
 */
export async function analyzeBrief(brief: string, conversation?: string): Promise<ProjectRequirements> {
  console.log("🔍 Analyzing brief...");
  
  const fullContext = conversation 
    ? `CONVERSATION:\n${conversation}\n\nBRIEF SUMMARY:\n${brief}`
    : brief;

  const openai = getOpenAI();

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are a project analyst for a web development agency. Analyze the client's request and determine exactly what they need.

Return a JSON object with this structure:
{
  "projectType": "logo" | "landing_page" | "website" | "webapp" | "mobile_app" | "custom",
  "deliverables": ["list of specific things to deliver"],
  "features": ["list of features requested"],
  "style": {
    "colors": ["any mentioned colors"],
    "mood": "modern/professional/playful/etc",
    "references": ["any mentioned reference sites or styles"]
  },
  "techStack": ["technologies to use"],
  "complexity": "simple" | "medium" | "complex",
  "estimatedFiles": number,
  "summary": "One sentence summary of what to build"
}

IMPORTANT:
- If they only ask for a logo/icon, projectType should be "logo"
- If they ask for a landing page or simple website, use "landing_page"
- If they ask for a full website with multiple pages, use "website"
- If they ask for an app with user accounts, database, etc., use "webapp"
- Be precise - don't assume they want a full website if they only asked for a logo

Return ONLY valid JSON, no markdown.`,
      },
      {
        role: "user",
        content: `Analyze this client request:\n\n${fullContext}`,
      },
    ],
    temperature: 0.3,
    max_tokens: 1000,
  });

  const content = response.choices[0]?.message?.content || "{}";
  
  try {
    // Clean up and parse JSON
    const cleaned = content.replace(/```json\n?/g, "").replace(/```/g, "").trim();
    const requirements = JSON.parse(cleaned) as ProjectRequirements;
    requirements.originalBrief = brief;
    
    console.log("📋 Analysis result:", requirements.summary);
    console.log("📦 Project type:", requirements.projectType);
    console.log("📄 Deliverables:", requirements.deliverables.join(", "));
    
    return requirements;
  } catch (error) {
    console.error("Failed to parse analysis:", error);
    // Return default requirements
    return {
      projectType: "custom",
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
}

/**
 * Determine file structure based on project requirements
 */
export function getFileStructure(requirements: ProjectRequirements): string[] {
  switch (requirements.projectType) {
    case "logo":
      return [
        "logo.svg",
        "logo-dark.svg",
        "logo-icon.svg",
        "favicon.ico",
        "README.md",
        "brand-guidelines.md",
      ];
    
    case "landing_page":
      return [
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
        "src/components/CTA.tsx",
        "src/components/Footer.tsx",
        "public/logo.svg",
        "README.md",
      ];
    
    case "website":
      return [
        "package.json",
        "next.config.js",
        "tailwind.config.js",
        "tsconfig.json",
        "src/app/layout.tsx",
        "src/app/page.tsx",
        "src/app/globals.css",
        "src/app/about/page.tsx",
        "src/app/services/page.tsx",
        "src/app/contact/page.tsx",
        "src/components/Header.tsx",
        "src/components/Hero.tsx",
        "src/components/Features.tsx",
        "src/components/Footer.tsx",
        "src/components/ContactForm.tsx",
        "public/logo.svg",
        "README.md",
      ];
    
    case "webapp":
      return [
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
        "src/app/api/auth/[...nextauth]/route.ts",
        "src/app/api/users/route.ts",
        "src/components/Header.tsx",
        "src/components/Hero.tsx",
        "src/components/Footer.tsx",
        "src/components/AuthForm.tsx",
        "src/components/Dashboard.tsx",
        "src/lib/auth.ts",
        "src/lib/db.ts",
        "public/logo.svg",
        "README.md",
      ];
    
    default:
      return [
        "package.json",
        "README.md",
        "src/index.ts",
      ];
  }
}

/**
 * Compare deliverables with brief to check if requirements are met
 */
export function validateDeliverables(
  requirements: ProjectRequirements, 
  generatedFiles: string[]
): {
  complete: boolean;
  missing: string[];
  extra: string[];
  score: number;
} {
  const expectedDeliverables = requirements.deliverables.map(d => d.toLowerCase());
  const generated = generatedFiles.map(f => f.toLowerCase());
  
  const missing: string[] = [];
  const extra: string[] = [];
  
  // Check for missing deliverables
  for (const expected of expectedDeliverables) {
    const found = generated.some(g => 
      g.includes(expected.replace(/\s+/g, "")) || 
      expected.includes(g.split("/").pop()?.split(".")[0] || "")
    );
    if (!found) {
      missing.push(expected);
    }
  }
  
  const complete = missing.length === 0;
  const score = Math.round(((expectedDeliverables.length - missing.length) / expectedDeliverables.length) * 100);
  
  return { complete, missing, extra, score };
}
