// Project Automation System
// Handles the full lifecycle from payment to delivery
// With intelligent auto-progress based on complexity, task type, and team load

import { kv } from "@vercel/kv";
import { Lead, updateLead } from "./leads";

// Project status flow
export type ProjectStatus = 
  | "pending"      // Waiting for payment
  | "paid"         // Payment received
  | "planning"     // NOVA analyzing requirements
  | "designing"    // PIXEL working on UI/UX
  | "developing"   // NEXUS building
  | "testing"      // VECTOR QA
  | "review"       // Client reviewing
  | "revisions"    // Making changes
  | "deploying"    // CIPHER deploying
  | "delivered"    // Sent to client
  | "completed";   // Client approved

// Project with full tracking
export interface Project {
  id: string;
  leadId: string;
  name: string;
  description: string;
  brief?: string; // Detailed requirements from client
  conversation?: string; // Chat history
  packageType: string;
  price: number;
  status: ProjectStatus;
  
  // Timeline
  createdAt: string;
  paidAt?: string;
  startedAt?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  completedAt?: string;
  
  // Deliverables
  githubRepo?: string;
  vercelUrl?: string;
  previewUrl?: string;
  zipUrl?: string;
  
  // Tracking
  currentAgent?: string;
  tasks: ProjectTask[];
  revisionCount: number;
  maxRevisions: number;
  
  // Auto-progress settings
  autoProgress?: boolean; // Enable automatic task advancement
  taskDurationMinutes?: number; // Calculated dynamically based on complexity
  lastProgressCheck?: string; // Last time we checked this project for progress
  
  // Client info
  clientEmail: string;
  clientName: string;
  
  // Priority & Speed
  priority?: "normal" | "rush" | "urgent"; // Rush = 2x faster, Urgent = 3x faster
  
  // Security - unique access token for client
  accessToken?: string; // Secret token to access project details
}

export interface ProjectTask {
  id: string;
  agent: string;
  title: string;
  description?: string;
  complexity?: "trivial" | "simple" | "medium" | "complex" | "critical";
  status: "pending" | "in_progress" | "completed";
  createdAt: string;
  startedAt?: string; // When task actually started
  completedAt?: string;
  estimatedMinutes?: number; // Calculated based on task type and complexity
}

// =============================================================================
// INTELLIGENT TASK DURATION SYSTEM
// =============================================================================

// Base duration in MINUTES for each task type (optimized for speed)
const TASK_BASE_DURATION: Record<string, number> = {
  // Setup & Analysis - Fast
  "Analyze": 5,           // Quick analysis
  "requirements": 5,
  "plan": 8,
  
  // Design - Medium
  "Design": 15,
  "UI": 12,
  "UX": 12,
  "mockup": 10,
  "system": 15,
  
  // Development - Longer but parallelized
  "Build": 20,
  "Implement": 25,
  "Setup": 10,
  "Create": 15,
  "frontend": 20,
  "backend": 25,
  "API": 20,
  "database": 15,
  "infrastructure": 20,
  
  // Testing & QA - Medium
  "test": 12,
  "Quality": 10,
  "Testing": 12,
  "coverage": 15,
  
  // Security - Important but streamlined
  "Security": 15,
  "audit": 18,
  "review": 10,
  
  // Deployment - Fast
  "Deploy": 8,
  "CI/CD": 12,
  "production": 10,
  "Launch": 5,
  
  // Default for unknown
  "default": 15,
};

// Package complexity multipliers (affects all task durations)
const PACKAGE_COMPLEXITY: Record<string, number> = {
  starter: 0.6,   // 60% of base time - simple projects
  pro: 1.0,       // 100% - standard complexity
  scale: 1.5,     // 150% - enterprise complexity
  enterprise: 2.0, // 200% - maximum complexity
  custom: 1.0,    // Default to standard
};

// Priority speed multipliers (divides duration)
const PRIORITY_SPEED: Record<string, number> = {
  normal: 1.0,    // Standard speed
  rush: 2.0,      // 2x faster
  urgent: 3.0,    // 3x faster (highest priority)
};

/**
 * Calculate task duration based on multiple factors
 */
export function calculateTaskDuration(
  task: ProjectTask,
  packageType: string,
  activeProjectsCount: number,
  priority: "normal" | "rush" | "urgent" = "normal"
): number {
  // 1. Find base duration from task title keywords
  let baseDuration = TASK_BASE_DURATION.default;
  const titleLower = task.title.toLowerCase();
  
  for (const [keyword, duration] of Object.entries(TASK_BASE_DURATION)) {
    if (titleLower.includes(keyword.toLowerCase())) {
      baseDuration = duration;
      break;
    }
  }
  
  // 2. Apply package complexity multiplier
  const complexityMultiplier = PACKAGE_COMPLEXITY[packageType] || 1.0;
  let duration = baseDuration * complexityMultiplier;
  
  // 3. Apply task-specific complexity if set
  const taskComplexityMultiplier: Record<string, number> = {
    trivial: 0.5,
    simple: 0.75,
    medium: 1.0,
    complex: 1.5,
    critical: 2.0,
  };
  if (task.complexity) {
    duration *= taskComplexityMultiplier[task.complexity];
  }
  
  // 4. Apply team load factor (more projects = slightly longer, but capped)
  // Each additional project adds 5% to duration, max 50% increase
  const loadFactor = Math.min(1.5, 1 + (activeProjectsCount - 1) * 0.05);
  duration *= loadFactor;
  
  // 5. Apply priority speed boost
  const priorityMultiplier = PRIORITY_SPEED[priority] || 1.0;
  duration /= priorityMultiplier;
  
  // 6. Minimum duration: 2 minutes, Maximum: 60 minutes
  return Math.max(2, Math.min(60, Math.round(duration)));
}

// In-memory cache + KV persistence
const projectsCache = new Map<string, Project>();
let projectsCacheLoaded = false;

// Check if KV is configured
function isKVConfigured(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

// Load projects from KV
async function loadProjectsCache(): Promise<void> {
  if (projectsCacheLoaded || !isKVConfigured()) return;
  
  try {
    const projectIds = await kv.smembers("project_ids") as string[];
    if (projectIds && projectIds.length > 0) {
      for (const id of projectIds) {
        const project = await kv.get<Project>(`project:${id}`);
        if (project) {
          projectsCache.set(id, project);
        }
      }
    }
    projectsCacheLoaded = true;
    console.log(`✅ Loaded ${projectsCache.size} projects from KV`);
  } catch (error) {
    console.error("Failed to load projects from KV:", error);
  }
}

// Save project to KV
async function saveProjectToKV(project: Project): Promise<void> {
  if (!isKVConfigured()) return;
  
  try {
    await kv.set(`project:${project.id}`, project);
    await kv.sadd("project_ids", project.id);
  } catch (error) {
    console.error("Failed to save project to KV:", error);
  }
}

// Package configurations
const PACKAGE_CONFIG: Record<string, { deliveryDays: number; tasks: string[] }> = {
  starter: {
    deliveryDays: 2,
    tasks: [
      "NOVA: Analyze requirements",
      "PIXEL: Design UI mockup",
      "PIXEL: Build landing page",
      "VECTOR: Quality check",
      "CIPHER: Deploy to production",
    ],
  },
  pro: {
    deliveryDays: 5,
    tasks: [
      "NOVA: Analyze requirements & plan architecture",
      "ATLAS: Design system architecture",
      "PIXEL: Create UI/UX design",
      "PIXEL: Build frontend components",
      "NEXUS: Setup backend & database",
      "NEXUS: Implement API endpoints",
      "VECTOR: Comprehensive testing",
      "SENTINEL: Security review",
      "CIPHER: Deploy to production",
    ],
  },
  scale: {
    deliveryDays: 10,
    tasks: [
      "NOVA: Full requirements analysis",
      "ATLAS: Enterprise architecture design",
      "PIXEL: Complete UI/UX design system",
      "PIXEL: Build responsive frontend",
      "NEXUS: Backend infrastructure",
      "NEXUS: API & integrations",
      "NEXUS: Database optimization",
      "VECTOR: Full test coverage",
      "SENTINEL: Security audit",
      "CIPHER: CI/CD setup",
      "CIPHER: Production deployment",
      "PRISM: Launch preparation",
    ],
  },
  custom: {
    deliveryDays: 7,
    tasks: [
      "NOVA: Requirements analysis",
      "ATLAS: Solution design",
      "PIXEL/NEXUS: Implementation",
      "VECTOR: Testing",
      "CIPHER: Deployment",
    ],
  },
};

/**
 * Create a new project from a paid lead
 */
// Generate a secure random token
function generateAccessToken(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export async function createProjectFromLead(lead: Lead): Promise<Project> {
  const pkgKey = lead.selectedPackage?.toLowerCase() || "custom";
  const config = PACKAGE_CONFIG[pkgKey] || PACKAGE_CONFIG.custom;
  
  const projectId = `P-${Date.now().toString(36).toUpperCase()}`;
  const accessToken = generateAccessToken(); // Unique secret token for client access
  const now = new Date();
  
  // Calculate more accurate delivery time based on task durations
  const totalMinutes = config.tasks.length * 15; // Rough estimate
  const deliveryHours = Math.ceil(totalMinutes / 60);
  const estimatedDelivery = new Date(now.getTime() + Math.max(deliveryHours, 2) * 60 * 60 * 1000);
  
  // Determine price from package
  const prices: Record<string, number> = { starter: 49, pro: 133, scale: 333, custom: 133 };
  const price = prices[pkgKey] || 133;
  
  // Create tasks with complexity estimation
  const tasks: ProjectTask[] = config.tasks.map((taskTitle, index) => {
    const complexity = estimateTaskComplexity(taskTitle, pkgKey);
    const task: ProjectTask = {
      id: `T-${projectId}-${index}`,
      agent: taskTitle.split(":")[0].trim(),
      title: taskTitle,
      complexity,
      status: index === 0 ? "in_progress" : "pending",
      createdAt: now.toISOString(),
      startedAt: index === 0 ? now.toISOString() : undefined,
    };
    // Pre-calculate estimated duration
    task.estimatedMinutes = calculateTaskDuration(task, pkgKey, 1, "normal");
    return task;
  });
  
  const project: Project = {
    id: projectId,
    leadId: lead.id,
    name: `${lead.name}'s ${lead.selectedPackage || "Custom"} Project`,
    description: lead.projectDescription || "",
    brief: lead.brief || lead.projectDescription || "No brief provided",
    conversation: lead.conversation,
    packageType: pkgKey,
    price,
    status: "planning",
    createdAt: now.toISOString(),
    paidAt: now.toISOString(),
    startedAt: now.toISOString(),
    estimatedDelivery: estimatedDelivery.toISOString(),
    currentAgent: "NOVA",
    tasks,
    revisionCount: 0,
    maxRevisions: 5,
    autoProgress: true, // Auto-progress enabled by default!
    lastProgressCheck: now.toISOString(),
    priority: "normal",
    clientEmail: lead.email,
    clientName: lead.name,
    accessToken, // Secret token for secure client access
  };
  
  // Save project
  projectsCache.set(projectId, project);
  await saveProjectToKV(project);
  
  // Update lead with project reference
  await updateLead(lead.id, { status: "in_progress" });
  
  const totalEstimatedMinutes = tasks.reduce((sum, t) => sum + (t.estimatedMinutes || 15), 0);
  
  console.log("=".repeat(60));
  console.log("🚀 PROJECT CREATED - AUTO-PROGRESS ENABLED");
  console.log("=".repeat(60));
  console.log(`Project ID: ${projectId}`);
  console.log(`Client: ${lead.name} (${lead.email})`);
  console.log(`Package: ${lead.selectedPackage} (complexity: ${PACKAGE_COMPLEXITY[pkgKey] || 1.0}x)`);
  console.log(`Tasks: ${tasks.length}`);
  console.log(`Estimated total time: ${totalEstimatedMinutes} minutes (~${Math.ceil(totalEstimatedMinutes / 60)} hours)`);
  console.log(`Estimated Delivery: ${estimatedDelivery.toLocaleString()}`);
  console.log(`🔐 Secure Client URL: /project/${projectId}?token=${accessToken}`);
  console.log("=".repeat(60));
  
  return project;
}

/**
 * Get project by access token (for secure client access)
 */
export async function getProjectByToken(projectId: string, token: string): Promise<Project | null> {
  const project = await getProject(projectId);
  if (!project) return null;
  
  // Verify token matches
  if (project.accessToken !== token) {
    console.log(`❌ Invalid token for project ${projectId}`);
    return null;
  }
  
  return project;
}

/**
 * Estimate task complexity based on keywords and package type
 */
function estimateTaskComplexity(taskTitle: string, packageType: string): "trivial" | "simple" | "medium" | "complex" | "critical" {
  const titleLower = taskTitle.toLowerCase();
  
  // Critical tasks
  if (titleLower.includes("security") || titleLower.includes("audit")) {
    return packageType === "scale" || packageType === "enterprise" ? "critical" : "complex";
  }
  
  // Complex tasks
  if (titleLower.includes("architecture") || titleLower.includes("infrastructure") || 
      titleLower.includes("enterprise") || titleLower.includes("comprehensive")) {
    return "complex";
  }
  
  // Medium tasks
  if (titleLower.includes("implement") || titleLower.includes("build") || 
      titleLower.includes("api") || titleLower.includes("database")) {
    return "medium";
  }
  
  // Simple tasks
  if (titleLower.includes("deploy") || titleLower.includes("setup") || 
      titleLower.includes("launch") || titleLower.includes("quality")) {
    return "simple";
  }
  
  // Trivial tasks
  if (titleLower.includes("analyze") || titleLower.includes("plan")) {
    return "trivial";
  }
  
  return "medium"; // Default
}

/**
 * Get project by ID
 */
export async function getProject(id: string): Promise<Project | undefined> {
  // Check cache first
  if (projectsCache.has(id)) {
    return projectsCache.get(id);
  }
  
  // Try KV
  if (isKVConfigured()) {
    try {
      const project = await kv.get<Project>(`project:${id}`);
      if (project) {
        projectsCache.set(id, project);
        return project;
      }
    } catch (error) {
      console.error("Failed to get project from KV:", error);
    }
  }
  
  return undefined;
}

/**
 * Get project by lead ID
 */
export async function getProjectByLeadId(leadId: string): Promise<Project | undefined> {
  await loadProjectsCache();
  
  for (const project of projectsCache.values()) {
    if (project.leadId === leadId) return project;
  }
  return undefined;
}

/**
 * Get all projects
 */
export async function getAllProjects(): Promise<Project[]> {
  await loadProjectsCache();
  
  // Refresh from KV if cache is empty
  if (isKVConfigured() && projectsCache.size === 0) {
    try {
      const projectIds = await kv.smembers("project_ids") as string[];
      if (projectIds && projectIds.length > 0) {
        for (const id of projectIds) {
          const project = await kv.get<Project>(`project:${id}`);
          if (project) {
            projectsCache.set(id, project);
          }
        }
      }
    } catch (error) {
      console.error("Failed to refresh projects from KV:", error);
    }
  }
  
  return Array.from(projectsCache.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Update project status
 */
export async function updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
  let project = projectsCache.get(id);
  
  // Try KV if not in cache
  if (!project && isKVConfigured()) {
    project = await kv.get<Project>(`project:${id}`) || undefined;
  }
  
  if (!project) return null;
  
  const updated = { ...project, ...updates };
  projectsCache.set(id, updated);
  await saveProjectToKV(updated);
  
  return updated;
}

/**
 * Advance to next task
 */
export async function advanceProjectTask(projectId: string): Promise<Project | null> {
  let project = projectsCache.get(projectId);
  
  // Try KV if not in cache
  if (!project && isKVConfigured()) {
    project = await kv.get<Project>(`project:${projectId}`) || undefined;
  }
  
  if (!project) return null;
  
  const now = new Date();
  
  // Find current in_progress task and complete it
  const currentTaskIndex = project.tasks.findIndex(t => t.status === "in_progress");
  if (currentTaskIndex >= 0) {
    project.tasks[currentTaskIndex].status = "completed";
    project.tasks[currentTaskIndex].completedAt = now.toISOString();
    
    // Start next task if available
    if (currentTaskIndex + 1 < project.tasks.length) {
      const nextTask = project.tasks[currentTaskIndex + 1];
      nextTask.status = "in_progress";
      nextTask.startedAt = now.toISOString();
      project.currentAgent = nextTask.agent;
      
      // Update project status based on agent
      project.status = getStatusFromAgent(nextTask.agent);
    } else {
      // All tasks completed - trigger auto-delivery!
      project.status = "delivered";
      project.deliveredAt = now.toISOString();
      project.currentAgent = undefined;
      
      console.log(`🎉 Project ${projectId} completed! Triggering auto-delivery...`);
      
      // Auto-generate deliverables asynchronously
      triggerAutoDelivery(projectId).catch(err => {
        console.error("Auto-delivery failed:", err);
      });
    }
  }
  
  project.lastProgressCheck = now.toISOString();
  projectsCache.set(projectId, project);
  await saveProjectToKV(project);
  
  return project;
}

/**
 * Trigger automatic delivery generation for a completed project
 */
async function triggerAutoDelivery(projectId: string): Promise<void> {
  try {
    // Dynamically import to avoid circular dependencies
    const { autoGenerateDeliverables } = await import("./delivery");
    await autoGenerateDeliverables(projectId);
  } catch (error) {
    console.error("Failed to trigger auto-delivery:", error);
  }
}

/**
 * Get project status from current agent
 */
function getStatusFromAgent(agent: string): ProjectStatus {
  const agentStatusMap: Record<string, ProjectStatus> = {
    "NOVA": "planning",
    "ATLAS": "planning",
    "PIXEL": "designing",
    "NEXUS": "developing",
    "VECTOR": "testing",
    "SENTINEL": "testing",
    "CIPHER": "deploying",
    "PRISM": "deploying",
  };
  return agentStatusMap[agent] || "developing";
}

/**
 * Process auto-progress for all eligible projects
 * Called by cron job every minute
 */
export async function processAutoProgress(): Promise<{
  processed: number;
  advanced: string[];
  completed: string[];
}> {
  await loadProjectsCache();
  
  const now = new Date();
  const results = {
    processed: 0,
    advanced: [] as string[],
    completed: [] as string[],
  };
  
  // Get all active projects with auto-progress enabled
  const activeProjects = Array.from(projectsCache.values()).filter(
    p => p.autoProgress && 
         p.status !== "delivered" && 
         p.status !== "completed" &&
         p.status !== "pending"
  );
  
  const activeCount = activeProjects.length;
  console.log(`🔄 Processing auto-progress for ${activeCount} active projects`);
  
  for (const project of activeProjects) {
    results.processed++;
    
    // Find current in_progress task
    const currentTask = project.tasks.find(t => t.status === "in_progress");
    if (!currentTask || !currentTask.startedAt) continue;
    
    // Calculate dynamic duration for this task
    const taskDuration = calculateTaskDuration(
      currentTask,
      project.packageType,
      activeCount,
      project.priority || "normal"
    );
    
    // Check if enough time has passed
    const taskStarted = new Date(currentTask.startedAt);
    const minutesElapsed = (now.getTime() - taskStarted.getTime()) / (1000 * 60);
    
    if (minutesElapsed >= taskDuration) {
      // Advance to next task
      const updated = await advanceProjectTask(project.id);
      
      if (updated) {
        if (updated.status === "delivered") {
          results.completed.push(project.id);
          console.log(`✅ Project ${project.id} COMPLETED - all tasks done!`);
        } else {
          results.advanced.push(project.id);
          const nextTask = updated.tasks.find(t => t.status === "in_progress");
          console.log(`⏩ Project ${project.id}: Advanced to "${nextTask?.title}" (${updated.currentAgent})`);
        }
      }
    } else {
      const remaining = Math.ceil(taskDuration - minutesElapsed);
      console.log(`⏳ Project ${project.id}: Task "${currentTask.title}" - ${remaining}min remaining`);
    }
  }
  
  return results;
}

/**
 * Get estimated time remaining for a project
 */
export function getProjectTimeRemaining(project: Project): {
  minutes: number;
  formatted: string;
} {
  const activeProjects = projectsCache.size;
  let totalMinutes = 0;
  
  for (const task of project.tasks) {
    if (task.status === "completed") continue;
    
    const duration = calculateTaskDuration(
      task,
      project.packageType,
      activeProjects,
      project.priority || "normal"
    );
    
    if (task.status === "in_progress" && task.startedAt) {
      // Subtract elapsed time for current task
      const elapsed = (Date.now() - new Date(task.startedAt).getTime()) / (1000 * 60);
      totalMinutes += Math.max(0, duration - elapsed);
    } else {
      totalMinutes += duration;
    }
  }
  
  const hours = Math.floor(totalMinutes / 60);
  const mins = Math.round(totalMinutes % 60);
  
  return {
    minutes: Math.round(totalMinutes),
    formatted: hours > 0 ? `${hours}h ${mins}m` : `${mins}m`,
  };
}

/**
 * Calculate project progress percentage
 */
export function getProjectProgress(project: Project): number {
  const completed = project.tasks.filter(t => t.status === "completed").length;
  return Math.round((completed / project.tasks.length) * 100);
}

/**
 * Get status display info
 */
export function getStatusInfo(status: ProjectStatus): { label: string; color: string; emoji: string } {
  const statusMap: Record<ProjectStatus, { label: string; color: string; emoji: string }> = {
    pending: { label: "Awaiting Payment", color: "gray", emoji: "⏳" },
    paid: { label: "Payment Received", color: "green", emoji: "💰" },
    planning: { label: "Planning", color: "blue", emoji: "📋" },
    designing: { label: "Designing", color: "purple", emoji: "🎨" },
    developing: { label: "Building", color: "orange", emoji: "⚡" },
    testing: { label: "Testing", color: "yellow", emoji: "🧪" },
    review: { label: "Ready for Review", color: "cyan", emoji: "👀" },
    revisions: { label: "Making Revisions", color: "pink", emoji: "✏️" },
    deploying: { label: "Deploying", color: "indigo", emoji: "🚀" },
    delivered: { label: "Delivered", color: "teal", emoji: "📦" },
    completed: { label: "Completed", color: "green", emoji: "✅" },
  };
  return statusMap[status] || statusMap.pending;
}
