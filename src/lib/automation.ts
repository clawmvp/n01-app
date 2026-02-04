// Project Automation System
// Handles the full lifecycle from payment to delivery

import { Lead, saveLead, updateLead, getLead } from "./leads";

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

// In-memory project store (will sync to DB when configured)
const projectsStore = new Map<string, Project>();

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
  projectsStore.set(projectId, project);
  
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
export function getProject(id: string): Project | undefined {
  return projectsStore.get(id);
}

/**
 * Get project by lead ID
 */
export function getProjectByLeadId(leadId: string): Project | undefined {
  for (const project of projectsStore.values()) {
    if (project.leadId === leadId) return project;
  }
  return undefined;
}

/**
 * Get all projects
 */
export function getAllProjects(): Project[] {
  return Array.from(projectsStore.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Update project status
 */
export function updateProject(id: string, updates: Partial<Project>): Project | null {
  const project = projectsStore.get(id);
  if (!project) return null;
  
  const updated = { ...project, ...updates };
  projectsStore.set(id, updated);
  return updated;
}

/**
 * Advance to next task
 */
export function advanceProjectTask(projectId: string): Project | null {
  const project = projectsStore.get(projectId);
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
  
  projectsStore.set(projectId, project);
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
