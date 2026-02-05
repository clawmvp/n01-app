// Cron job endpoint for automatic project progress
// Runs every minute to check and advance eligible projects

import { NextResponse } from "next/server";
import { processAutoProgress, getAllProjects, getProjectTimeRemaining } from "@/lib/automation";

// Vercel Cron configuration
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60; // 60 seconds max

/**
 * GET - Process auto-progress (called by Vercel Cron)
 * Also supports manual trigger with ?force=true
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const force = searchParams.get("force") === "true";
  
  // Verify cron secret for security (except for force triggers with password)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  
  // Allow if: valid cron secret, or force with admin password
  const isValidCron = cronSecret && authHeader === `Bearer ${cronSecret}`;
  const isForceWithPassword = force && searchParams.get("password") === process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
  
  if (!isValidCron && !isForceWithPassword) {
    // In development, allow without auth
    if (process.env.NODE_ENV !== "development") {
      console.log("⚠️ Unauthorized cron attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }
  
  const startTime = Date.now();
  
  try {
    console.log("🕐 Starting auto-progress cron job...");
    
    // Process all eligible projects
    const results = await processAutoProgress();
    
    // Get summary of all projects
    const allProjects = await getAllProjects();
    const activeProjects = allProjects.filter(
      p => p.status !== "delivered" && p.status !== "completed" && p.status !== "pending"
    );
    
    // Calculate total time remaining across all projects
    let totalTimeRemaining = 0;
    const projectSummaries = activeProjects.map(p => {
      const timeRemaining = getProjectTimeRemaining(p);
      totalTimeRemaining += timeRemaining.minutes;
      
      const currentTask = p.tasks.find(t => t.status === "in_progress");
      const completedTasks = p.tasks.filter(t => t.status === "completed").length;
      
      return {
        id: p.id,
        name: p.name,
        package: p.packageType,
        priority: p.priority || "normal",
        progress: Math.round((completedTasks / p.tasks.length) * 100),
        currentTask: currentTask?.title || "None",
        currentAgent: p.currentAgent,
        timeRemaining: timeRemaining.formatted,
        autoProgress: p.autoProgress,
      };
    });
    
    const elapsed = Date.now() - startTime;
    
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      executionTime: `${elapsed}ms`,
      summary: {
        totalProjects: allProjects.length,
        activeProjects: activeProjects.length,
        processed: results.processed,
        tasksAdvanced: results.advanced.length,
        projectsCompleted: results.completed.length,
        totalTimeRemaining: `${Math.floor(totalTimeRemaining / 60)}h ${Math.round(totalTimeRemaining % 60)}m`,
      },
      advanced: results.advanced,
      completed: results.completed,
      projects: projectSummaries,
    };
    
    console.log(`✅ Cron job completed in ${elapsed}ms`);
    console.log(`   - Processed: ${results.processed} projects`);
    console.log(`   - Advanced: ${results.advanced.length} tasks`);
    console.log(`   - Completed: ${results.completed.length} projects`);
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error("❌ Cron job error:", error);
    return NextResponse.json(
      { 
        error: "Failed to process auto-progress",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

/**
 * POST - Manually trigger progress for a specific project
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { projectId, password } = body;
    
    // Verify admin password
    if (password !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    if (!projectId) {
      return NextResponse.json({ error: "Project ID required" }, { status: 400 });
    }
    
    // Import advanceProjectTask
    const { advanceProjectTask, getProject } = await import("@/lib/automation");
    
    const project = await getProject(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    
    // Force advance the current task
    const updated = await advanceProjectTask(projectId);
    
    if (updated) {
      const currentTask = updated.tasks.find(t => t.status === "in_progress");
      return NextResponse.json({
        success: true,
        projectId,
        status: updated.status,
        currentTask: currentTask?.title || "All completed",
        currentAgent: updated.currentAgent || "None",
        message: updated.status === "delivered" 
          ? "Project completed!" 
          : `Advanced to: ${currentTask?.title}`,
      });
    }
    
    return NextResponse.json({ error: "Could not advance project" }, { status: 400 });
    
  } catch (error) {
    console.error("Manual progress error:", error);
    return NextResponse.json(
      { error: "Failed to advance project" },
      { status: 500 }
    );
  }
}
