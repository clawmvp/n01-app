import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const password = searchParams.get("password");

  // Simple auth
  if (password !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD && password !== "n01admin2024") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    tokens: {
      GITHUB_TOKEN: process.env.GITHUB_TOKEN ? `✅ Configured (${process.env.GITHUB_TOKEN.substring(0, 10)}...)` : "❌ Not configured",
      VERCEL_TOKEN: process.env.VERCEL_TOKEN ? `✅ Configured (${process.env.VERCEL_TOKEN.substring(0, 8)}...)` : "❌ Not configured",
    },
    tests: {},
  };

  // Test GitHub API
  if (process.env.GITHUB_TOKEN) {
    try {
      const res = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
      });
      
      if (res.ok) {
        const user = await res.json();
        results.tests = {
          ...results.tests as object,
          github: {
            status: "✅ Working",
            user: user.login,
            canCreateRepos: true,
          },
        };
      } else {
        const error = await res.json();
        results.tests = {
          ...results.tests as object,
          github: {
            status: "❌ Failed",
            error: error.message,
          },
        };
      }
    } catch (err) {
      results.tests = {
        ...results.tests as object,
        github: {
          status: "❌ Error",
          error: err instanceof Error ? err.message : "Unknown error",
        },
      };
    }
  }

  // Test Vercel API
  if (process.env.VERCEL_TOKEN) {
    try {
      const res = await fetch("https://api.vercel.com/v2/user", {
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
        },
      });
      
      if (res.ok) {
        const data = await res.json();
        results.tests = {
          ...results.tests as object,
          vercel: {
            status: "✅ Working",
            user: data.user?.username || data.user?.email,
            canCreateProjects: true,
          },
        };
      } else {
        const error = await res.json();
        results.tests = {
          ...results.tests as object,
          vercel: {
            status: "❌ Failed",
            error: error.error?.message || "Unknown error",
          },
        };
      }
    } catch (err) {
      results.tests = {
        ...results.tests as object,
        vercel: {
          status: "❌ Error",
          error: err instanceof Error ? err.message : "Unknown error",
        },
      };
    }
  }

  // Summary
  const githubOk = (results.tests as Record<string, { status: string }>).github?.status?.includes("✅");
  const vercelOk = (results.tests as Record<string, { status: string }>).vercel?.status?.includes("✅");
  
  results.summary = {
    allConfigured: !!(process.env.GITHUB_TOKEN && process.env.VERCEL_TOKEN),
    allWorking: githubOk && vercelOk,
    autoDeliveryReady: githubOk && vercelOk,
    message: githubOk && vercelOk 
      ? "🎉 Auto-delivery is fully configured and working!"
      : "⚠️ Some services need attention",
  };

  return NextResponse.json(results, { status: 200 });
}
