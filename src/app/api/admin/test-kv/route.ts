import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export async function GET() {
  const results: Record<string, any> = {
    kvConfigured: !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN),
    kvUrl: process.env.KV_REST_API_URL ? "SET" : "NOT SET",
    kvToken: process.env.KV_REST_API_TOKEN ? "SET" : "NOT SET",
  };

  if (results.kvConfigured) {
    try {
      // Test write
      await kv.set("test_key", { timestamp: Date.now(), message: "KV is working!" });
      results.writeTest = "SUCCESS";

      // Test read
      const readResult = await kv.get("test_key");
      results.readTest = readResult ? "SUCCESS" : "FAILED";
      results.readData = readResult;

      // Check lead_ids
      const leadIds = await kv.smembers("lead_ids");
      results.leadIds = leadIds;
      results.leadCount = Array.isArray(leadIds) ? leadIds.length : 0;

      // Check project_ids
      const projectIds = await kv.smembers("project_ids");
      results.projectIds = projectIds;
      results.projectCount = Array.isArray(projectIds) ? projectIds.length : 0;

    } catch (error) {
      results.error = String(error);
    }
  }

  return NextResponse.json(results);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, key, value } = body;

    if (action === "set" && key && value) {
      await kv.set(key, value);
      return NextResponse.json({ success: true, action: "set", key });
    }

    if (action === "get" && key) {
      const result = await kv.get(key);
      return NextResponse.json({ success: true, action: "get", key, value: result });
    }

    if (action === "list_leads") {
      const leadIds = await kv.smembers("lead_ids") as string[];
      const leads = [];
      for (const id of leadIds || []) {
        const lead = await kv.get(`lead:${id}`);
        if (lead) leads.push(lead);
      }
      return NextResponse.json({ success: true, leads });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
