// Project Automation System
// Handles the full lifecycle from payment to delivery

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
  
  // Tracking
  currentAgent?: string;
  tasks: ProjectTask[];
  revisionCount: number;
  maxRevisions: number;
  
  // Client info
  clientEmail: string;
  clientName: string;
}

export interface ProjectTask {
  id: string;
  agent: string;
  title: string;
  status: "pending" | "in_progress" | "completed";
  createdAt: string;
  completedAt?: string;
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
export async function createProjectFromLead(lead: Lead): Promise<Project> {
  const pkgKey = lead.selectedPackage?.toLowerCase() || "custom";
  const config = PACKAGE_CONFIG[pkgKey] || PACKAGE_CONFIG.custom;
  
  const projectId = `P-${Date.now().toString(36).toUpperCase()}`;
  const now = new Date();
  const estimatedDelivery = new Date(now.getTime() + config.deliveryDays * 24 * 60 * 60 * 1000);
  
  // Determine price from package
  const prices: Record<string, number> = { starter: 49, pro: 133, scale: 333, custom: 133 };
  const price = prices[pkgKey] || 133;
  
  // Create tasks
  const tasks: ProjectTask[] = config.tasks.map((taskTitle, index) => ({
    id: `T-${projectId}-${index}`,
    agent: taskTitle.split(":")[0].trim(),
    title: taskTitle,
    status: index === 0 ? "in_progress" : "pending",
    createdAt: now.toISOString(),
  }));
  
  const project: Project = {
    id: projectId,
    leadId: lead.id,
    name: `${lead.name}'s ${lead.selectedPackage || "Custom"} Project`,
    description: lead.projectDescription || "",
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
    clientEmail: lead.email,
    clientName: lead.name,
  };
  
  // Save project
  projectsCache.set(projectId, project);
  await saveProjectToKV(project);
  
  // Update lead with project reference
  await updateLead(lead.id, { status: "in_progress" });
  
  console.log("=".repeat(60));
  console.log("🚀 PROJECT CREATED AUTOMATICALLY");
  console.log("=".repeat(60));
  console.log(`Project ID: ${projectId}`);
  console.log(`Client: ${lead.name} (${lead.email})`);
  console.log(`Package: ${lead.selectedPackage}`);
  console.log(`Estimated Delivery: ${estimatedDelivery.toLocaleDateString()}`);
  console.log(`Tasks: ${tasks.length}`);
  console.log("=".repeat(60));
  
  return project;
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
  
  // Find current in_progress task and complete it
  const currentTaskIndex = project.tasks.findIndex(t => t.status === "in_progress");
  if (currentTaskIndex >= 0) {
    project.tasks[currentTaskIndex].status = "completed";
    project.tasks[currentTaskIndex].completedAt = new Date().toISOString();
    
    // Start next task if available
    if (currentTaskIndex + 1 < project.tasks.length) {
      project.tasks[currentTaskIndex + 1].status = "in_progress";
      project.currentAgent = project.tasks[currentTaskIndex + 1].agent;
    } else {
      // All tasks completed
      project.status = "delivered";
      project.deliveredAt = new Date().toISOString();
    }
  }
  
  projectsCache.set(projectId, project);
  await saveProjectToKV(project);
  
  return project;
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
