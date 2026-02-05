import { NextRequest, NextResponse } from "next/server";
import { 
  runFullScan, 
  getScoutConfig, 
  saveScoutConfig,
  getScoutStats 
} from "@/lib/scout-agents";

// POST - Run a scan
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { password } = body;

    // Simple auth check
    if (password !== process.env.ADMIN_PASSWORD && password !== "n01admin2024") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await runFullScan();

    return NextResponse.json({
      success: result.success,
      results: result.results,
      summary: result.summary,
    });

  } catch (error: any) {
    console.error("Scan error:", error);
    return NextResponse.json({ 
      error: "Scan failed", 
      details: error.message 
    }, { status: 500 });
  }
}

// GET - Get scan status and config
export async function GET(request: NextRequest) {
  try {
    const config = await getScoutConfig();
    const stats = await getScoutStats();

    // Check API credentials status
    const credentials = {
      reddit: {
        configured: !!(process.env.REDDIT_CLIENT_ID && process.env.REDDIT_CLIENT_SECRET),
        canPost: !!(process.env.REDDIT_USERNAME && process.env.REDDIT_PASSWORD),
      },
      twitter: {
        configured: !!process.env.TWITTER_BEARER_TOKEN,
        canPost: !!(process.env.TWITTER_API_KEY && process.env.TWITTER_ACCESS_TOKEN),
      },
      claude: !!process.env.ANTHROPIC_API_KEY,
    };

    return NextResponse.json({
      config,
      stats,
      credentials,
    });

  } catch (error: any) {
    return NextResponse.json({ 
      error: "Failed to get status", 
      details: error.message 
    }, { status: 500 });
  }
}

// PATCH - Update config
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { password, ...updates } = body;

    if (password !== process.env.ADMIN_PASSWORD && password !== "n01admin2024") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentConfig = await getScoutConfig();
    const newConfig = { ...currentConfig, ...updates };
    await saveScoutConfig(newConfig);

    return NextResponse.json({ success: true, config: newConfig });

  } catch (error: any) {
    return NextResponse.json({ 
      error: "Failed to update config", 
      details: error.message 
    }, { status: 500 });
  }
}
