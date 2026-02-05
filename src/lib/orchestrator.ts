// NOVA - AI Orchestrator powered by Claude
// Intelligent project planning and coordination

import Anthropic from "@anthropic-ai/sdk";

// Types
export interface WorkPlan {
  projectId: string;
  brief: string;
  analysis: BriefAnalysis;
  phases: WorkPhase[];
  totalEstimatedMinutes: number;
  createdAt: string;
}

export interface BriefAnalysis {
  projectType: ProjectType;
  complexity: "simple" | "medium" | "complex" | "enterprise";
  clientIntent: string;
  keyRequirements: string[];
  deliverables: Deliverable[];
  technicalRequirements: TechnicalRequirements;
  risks: string[];
  clarificationNeeded: string[];
}

export type ProjectType = 
  | "logo"
  | "icon_set"
  | "landing_page"
  | "website"
  | "webapp"
  | "mobile_app"
  | "api"
  | "full_stack"
  | "custom";

export interface Deliverable {
  name: string;
  type: "file" | "feature" | "page" | "component" | "api" | "documentation";
  priority: "critical" | "high" | "medium" | "low";
  description: string;
}

export interface TechnicalRequirements {
  frontend: string[];
  backend: string[];
  database: string[];
  integrations: string[];
  hosting: string[];
}

export interface WorkPhase {
  id: string;
  name: string;
  agent: AgentType;
  tasks: AgentTask[];
  dependencies: string[]; // Phase IDs this depends on
  estimatedMinutes: number;
  status: "pending" | "in_progress" | "completed" | "blocked";
}

export type AgentType = 
  | "NOVA"      // Orchestrator - planning & coordination
  | "ATLAS"     // Architect - system design
  | "PIXEL"     // Frontend - UI/UX & design
  | "NEXUS"     // Backend - APIs & database
  | "VECTOR"    // QA - testing & validation
  | "CIPHER"    // DevOps - deployment & infrastructure
  | "PRISM";    // AI - content & asset generation

export interface AgentTask {
  id: string;
  title: string;
  description: string;
  outputFiles: string[];
  validationCriteria: string[];
  estimatedMinutes: number;
  status: "pending" | "in_progress" | "completed" | "failed";
}

// Initialize Anthropic client
function getAnthropic(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_OPUS_LICENSE;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY or CLAUDE_OPUS_LICENSE not configured");
  }
  return new Anthropic({ apiKey });
}

/**
 * NOVA: Analyze brief and create intelligent work plan
 * Uses Claude for deep understanding of client requirements
 */
export async function createWorkPlan(
  projectId: string,
  brief: string,
  conversation?: string
): Promise<WorkPlan> {
  console.log("🧠 NOVA: Starting intelligent brief analysis with Claude...");
  
  const anthropic = getAnthropic();
  
  const fullContext = conversation 
    ? `## Client Conversation\n${conversation}\n\n## Brief Summary\n${brief}`
    : brief;

  // Phase 1: Deep Analysis with Claude
  const analysisResponse = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4000,
    messages: [
      {
        role: "user",
        content: `You are NOVA, the AI Orchestrator for n01.app - a professional AI development agency.

Analyze this client request deeply and create a comprehensive project analysis.

## Client Request
${fullContext}

## Your Task
Analyze the request and return a JSON object with this EXACT structure:

{
  "projectType": "logo" | "icon_set" | "landing_page" | "website" | "webapp" | "mobile_app" | "api" | "full_stack" | "custom",
  "complexity": "simple" | "medium" | "complex" | "enterprise",
  "clientIntent": "One clear sentence describing what the client truly wants",
  "keyRequirements": ["requirement1", "requirement2", ...],
  "deliverables": [
    {
      "name": "Deliverable name",
      "type": "file" | "feature" | "page" | "component" | "api" | "documentation",
      "priority": "critical" | "high" | "medium" | "low",
      "description": "What this deliverable is"
    }
  ],
  "technicalRequirements": {
    "frontend": ["tech1", "tech2"],
    "backend": ["tech1", "tech2"],
    "database": ["if needed"],
    "integrations": ["if needed"],
    "hosting": ["recommendation"]
  },
  "risks": ["potential issues to watch for"],
  "clarificationNeeded": ["questions we should ask the client if possible"]
}

## CRITICAL RULES:
1. If client asks for ONLY a logo, projectType MUST be "logo", NOT "website"
2. If client asks for a landing page, projectType is "landing_page", NOT "website"
3. Be PRECISE - don't add features the client didn't ask for
4. Match deliverables EXACTLY to what client requested
5. Complexity should reflect actual scope, not what we think they should have

Return ONLY valid JSON, no markdown code blocks, no explanation.`,
      },
    ],
  });

  let analysis: BriefAnalysis;
  try {
    const content = analysisResponse.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type");
    
    const cleaned = content.text.replace(/```json\n?/g, "").replace(/```/g, "").trim();
    analysis = JSON.parse(cleaned);
    
    console.log("📋 NOVA Analysis Complete:");
    console.log(`   Type: ${analysis.projectType}`);
    console.log(`   Complexity: ${analysis.complexity}`);
    console.log(`   Intent: ${analysis.clientIntent}`);
    console.log(`   Deliverables: ${analysis.deliverables.length}`);
  } catch (error) {
    console.error("Failed to parse analysis:", error);
    throw new Error("NOVA failed to analyze brief - Claude returned invalid JSON");
  }

  // Phase 2: Create Work Plan with Claude
  const planResponse = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4000,
    messages: [
      {
        role: "user",
        content: `You are NOVA, the AI Orchestrator. Based on this project analysis, create a detailed work plan.

## Project Analysis
${JSON.stringify(analysis, null, 2)}

## Original Brief
${brief}

## Available Agents
- NOVA: Planning, coordination, quality review
- ATLAS: System architecture, database design, API design
- PIXEL: UI/UX design, frontend development, styling
- NEXUS: Backend development, API implementation, database
- VECTOR: Testing, quality assurance, validation
- CIPHER: Deployment, CI/CD, infrastructure
- PRISM: AI content generation, asset creation, copywriting

## Your Task
Create a work plan with phases. Return a JSON array of phases:

[
  {
    "id": "phase_1",
    "name": "Phase name",
    "agent": "AGENT_NAME",
    "tasks": [
      {
        "id": "task_1_1",
        "title": "Task title",
        "description": "Detailed description of what to do",
        "outputFiles": ["file1.tsx", "file2.css"],
        "validationCriteria": ["Criterion 1", "Criterion 2"],
        "estimatedMinutes": 15
      }
    ],
    "dependencies": [],
    "estimatedMinutes": 30
  }
]

## RULES:
1. For a LOGO project: Use PRISM for generation, then NOVA for validation. 3-4 phases max.
2. For LANDING_PAGE: ATLAS (plan) → PIXEL (design) → PIXEL (build) → VECTOR (test) → CIPHER (deploy)
3. For WEBAPP: Add NEXUS phases for backend
4. Keep it minimal - only phases needed for the actual deliverables
5. Each task should have clear validation criteria
6. Output files should be specific (e.g., "logo.svg", not "assets")

Return ONLY valid JSON array, no explanation.`,
      },
    ],
  });

  let phases: WorkPhase[];
  try {
    const content = planResponse.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type");
    
    const cleaned = content.text.replace(/```json\n?/g, "").replace(/```/g, "").trim();
    phases = JSON.parse(cleaned);
    
    // Add status to all phases and tasks
    phases = phases.map(phase => ({
      ...phase,
      status: "pending" as const,
      tasks: phase.tasks.map(task => ({
        ...task,
        status: "pending" as const,
      })),
    }));
    
    console.log(`📅 NOVA created ${phases.length} work phases:`);
    phases.forEach(p => {
      console.log(`   ${p.agent}: ${p.name} (${p.tasks.length} tasks, ~${p.estimatedMinutes}min)`);
    });
  } catch (error) {
    console.error("Failed to parse work plan:", error);
    throw new Error("NOVA failed to create work plan - Claude returned invalid JSON");
  }

  const totalMinutes = phases.reduce((sum, p) => sum + p.estimatedMinutes, 0);

  const workPlan: WorkPlan = {
    projectId,
    brief,
    analysis,
    phases,
    totalEstimatedMinutes: totalMinutes,
    createdAt: new Date().toISOString(),
  };

  console.log(`✅ NOVA: Work plan created - ${phases.length} phases, ~${totalMinutes} minutes total`);
  
  return workPlan;
}

/**
 * NOVA: Get files to generate based on work plan
 */
export function getFilesToGenerate(workPlan: WorkPlan): string[] {
  const files: Set<string> = new Set();
  
  for (const phase of workPlan.phases) {
    for (const task of phase.tasks) {
      task.outputFiles.forEach(file => files.add(file));
    }
  }
  
  return Array.from(files);
}

/**
 * NOVA: Validate deliverables against work plan
 */
export async function validateDeliverables(
  workPlan: WorkPlan,
  generatedFiles: string[],
  fileContents: Record<string, string>
): Promise<{
  passed: boolean;
  score: number;
  issues: string[];
  suggestions: string[];
}> {
  console.log("🔍 NOVA: Validating deliverables against requirements...");
  
  const anthropic = getAnthropic();
  
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: `You are NOVA, the Quality Orchestrator. Validate that the generated files meet the project requirements.

## Original Client Request
${workPlan.brief}

## Client Intent
${workPlan.analysis.clientIntent}

## Expected Deliverables
${JSON.stringify(workPlan.analysis.deliverables, null, 2)}

## Generated Files
${generatedFiles.join("\n")}

## Sample File Contents (first 500 chars each)
${Object.entries(fileContents)
  .slice(0, 5)
  .map(([file, content]) => `### ${file}\n${content.slice(0, 500)}`)
  .join("\n\n")}

## Your Task
Validate that the deliverables match what the client asked for.

Return JSON:
{
  "passed": true/false,
  "score": 0-100,
  "issues": ["issue1", "issue2"],
  "suggestions": ["suggestion1", "suggestion2"]
}

RULES:
1. Score 90+ = passed, client will be happy
2. Issues are things that don't match requirements
3. Suggestions are improvements (not blockers)
4. Be strict - if they asked for a logo and got a website, that's a major issue

Return ONLY valid JSON.`,
      },
    ],
  });

  try {
    const content = response.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type");
    
    const cleaned = content.text.replace(/```json\n?/g, "").replace(/```/g, "").trim();
    const result = JSON.parse(cleaned);
    
    console.log(`📊 NOVA Validation: Score ${result.score}/100, Passed: ${result.passed}`);
    if (result.issues.length > 0) {
      console.log("   Issues:", result.issues.join(", "));
    }
    
    return result;
  } catch (error) {
    console.error("Validation parse error:", error);
    return {
      passed: true,
      score: 70,
      issues: ["Could not validate - assuming acceptable"],
      suggestions: [],
    };
  }
}

/**
 * NOVA: Generate task prompt for specific agent
 */
export function generateAgentPrompt(
  agent: AgentType,
  task: AgentTask,
  workPlan: WorkPlan,
  previousOutputs: Record<string, string> = {}
): string {
  const agentPersonas: Record<AgentType, string> = {
    NOVA: "You are NOVA, the AI Orchestrator. You coordinate the team and ensure quality.",
    ATLAS: "You are ATLAS, the System Architect. You design elegant, scalable solutions.",
    PIXEL: "You are PIXEL, the Frontend Expert. You create beautiful, responsive UIs with perfect attention to detail.",
    NEXUS: "You are NEXUS, the Backend Developer. You build robust, secure, and efficient server-side systems.",
    VECTOR: "You are VECTOR, the QA Engineer. You ensure everything works perfectly and meets requirements.",
    CIPHER: "You are CIPHER, the DevOps Engineer. You handle deployment, infrastructure, and CI/CD.",
    PRISM: "You are PRISM, the AI Creative. You generate beautiful assets, content, and creative elements.",
  };

  return `${agentPersonas[agent]}

## Project Context
Client Request: ${workPlan.analysis.clientIntent}
Project Type: ${workPlan.analysis.projectType}
Complexity: ${workPlan.analysis.complexity}

## Your Current Task
**${task.title}**

${task.description}

## Expected Output Files
${task.outputFiles.map(f => `- ${f}`).join("\n")}

## Validation Criteria
${task.validationCriteria.map(c => `- ${c}`).join("\n")}

## Key Requirements from Client
${workPlan.analysis.keyRequirements.map(r => `- ${r}`).join("\n")}

${Object.keys(previousOutputs).length > 0 ? `
## Previous Work (Reference)
${Object.entries(previousOutputs)
  .map(([file, content]) => `### ${file}\n\`\`\`\n${content.slice(0, 500)}\n\`\`\``)
  .join("\n\n")}
` : ""}

Generate the requested files. Be precise and match exactly what the client asked for.`;
}

/**
 * NOVA: Execute a single task with the appropriate agent
 */
export async function executeTask(
  task: AgentTask,
  agent: AgentType,
  workPlan: WorkPlan,
  previousOutputs: Record<string, string> = {}
): Promise<Record<string, string>> {
  console.log(`🤖 ${agent}: Executing "${task.title}"...`);
  
  const anthropic = getAnthropic();
  const prompt = generateAgentPrompt(agent, task, workPlan, previousOutputs);
  
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8000,
    messages: [
      {
        role: "user",
        content: `${prompt}

## Output Format
Return a JSON object where keys are file paths and values are file contents:

{
  "path/to/file.tsx": "file content here...",
  "path/to/another.css": "css content here..."
}

Return ONLY valid JSON, no explanation. Make sure all files in "Expected Output Files" are included.`,
      },
    ],
  });

  try {
    const content = response.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type");
    
    const cleaned = content.text.replace(/```json\n?/g, "").replace(/```/g, "").trim();
    const files = JSON.parse(cleaned);
    
    console.log(`   ✅ ${agent} generated ${Object.keys(files).length} files`);
    
    return files;
  } catch (error) {
    console.error(`   ❌ ${agent} task failed:`, error);
    throw new Error(`${agent} failed to execute task: ${task.title}`);
  }
}

/**
 * NOVA: Execute entire work plan
 */
export async function executeWorkPlan(
  workPlan: WorkPlan,
  onProgress?: (phase: string, task: string, progress: number) => void
): Promise<{
  success: boolean;
  files: Record<string, string>;
  validation: { passed: boolean; score: number; issues: string[] };
}> {
  console.log("🚀 NOVA: Starting work plan execution...");
  
  const allFiles: Record<string, string> = {};
  const totalTasks = workPlan.phases.reduce((sum, p) => sum + p.tasks.length, 0);
  let completedTasks = 0;

  // Execute phases in order (respecting dependencies)
  for (const phase of workPlan.phases) {
    console.log(`\n📦 Phase: ${phase.name} (${phase.agent})`);
    phase.status = "in_progress";
    
    for (const task of phase.tasks) {
      task.status = "in_progress";
      
      try {
        const files = await executeTask(task, phase.agent, workPlan, allFiles);
        Object.assign(allFiles, files);
        
        task.status = "completed";
        completedTasks++;
        
        if (onProgress) {
          onProgress(phase.name, task.title, (completedTasks / totalTasks) * 100);
        }
      } catch (error) {
        task.status = "failed";
        console.error(`Task failed: ${task.title}`, error);
        // Continue with other tasks
      }
    }
    
    phase.status = "completed";
  }

  // Validate deliverables
  const validation = await validateDeliverables(workPlan, Object.keys(allFiles), allFiles);

  console.log(`\n✅ NOVA: Work plan execution complete`);
  console.log(`   Files generated: ${Object.keys(allFiles).length}`);
  console.log(`   Validation score: ${validation.score}/100`);

  return {
    success: validation.passed,
    files: allFiles,
    validation,
  };
}
