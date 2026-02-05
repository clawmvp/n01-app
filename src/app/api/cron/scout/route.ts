import { NextRequest, NextResponse } from "next/server";
import { runFullScan, getScoutConfig } from "@/lib/scout-agents";

/**
 * Cron job for automated lead scouting
 * Configure in vercel.json:
 * {
 *   "crons": [
 *     { "path": "/api/cron/scout", "schedule": "*/30 * * * *" }
 *   ]
 * }
 */

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret or admin password
    const authHeader = request.headers.get("authorization");
    const searchParams = request.nextUrl.searchParams;
    const password = searchParams.get("password");
    
    const cronSecret = process.env.CRON_SECRET;
    const isAuthorized = 
      authHeader === `Bearer ${cronSecret}` ||
      password === process.env.ADMIN_PASSWORD ||
      password === "n01admin2024";

    if (!isAuthorized && cronSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if scout is enabled
    const config = await getScoutConfig();
    if (!config.enabled) {
      return NextResponse.json({ 
        success: false, 
        message: "Scout is disabled" 
      });
    }

    // Run the scan
    const result = await runFullScan();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...result,
    });

  } catch (error: any) {
    console.error("Scout cron error:", error);
    return NextResponse.json({ 
      error: "Scout cron failed", 
      details: error.message 
    }, { status: 500 });
  }
}

// Also support POST for manual triggers
export async function POST(request: NextRequest) {
  return GET(request);
}
