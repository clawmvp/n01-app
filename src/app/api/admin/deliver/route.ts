import { NextRequest, NextResponse } from "next/server";

// Delivery automation endpoint
// Creates GitHub repos and deploys to Vercel

// In-memory delivery storage
const deliveriesStore: Map<string, any> = new Map();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, deliveryType, details } = body;

    if (!projectId) {
      return NextResponse.json({ error: "Project ID required" }, { status: 400 });
    }

    // Log the delivery request
    console.log("\n========== DELIVERY REQUEST ==========");
    console.log(`Project: ${projectId}`);
    console.log(`Type: ${deliveryType}`);
    console.log(`Details:`, details);
    console.log("========================================\n");

    const deliveryId = `D-${Date.now().toString(36).toUpperCase()}`;

    const deliveryData = {
      id: deliveryId,
      projectId,
      type: deliveryType,
      title: `${deliveryType} delivery`,
      description: details?.description,
      url: details?.url,
      createdAt: new Date().toISOString(),
    };

    deliveriesStore.set(deliveryId, deliveryData);

    return NextResponse.json({ 
      success: true, 
      delivery: deliveryData,
      message: "Delivery recorded successfully.",
    });
  } catch (error) {
    console.error("Delivery error:", error);
    return NextResponse.json({ error: "Failed to process delivery" }, { status: 500 });
  }
}

// Generate delivery instructions
export async function GET() {
  const instructions = {
    github: {
      title: "GitHub Repository Setup",
      steps: [
        "Create a new repository on GitHub",
        "Clone the project template",
        "Push code to the repository",
        "Add client as collaborator",
      ],
      commands: [
        "gh repo create client-project --public",
        "git clone template-repo client-project",
        "cd client-project && git push origin main",
        "gh repo add-collaborator client-username",
      ],
    },
    vercel: {
      title: "Vercel Deployment",
      steps: [
        "Connect GitHub repository to Vercel",
        "Configure environment variables",
        "Deploy to production",
        "Set up custom domain (if applicable)",
      ],
      commands: [
        "vercel link",
        "vercel env add",
        "vercel --prod",
        "vercel domains add custom-domain.com",
      ],
    },
    handover: {
      title: "Client Handover Checklist",
      items: [
        "✓ Source code delivered (GitHub)",
        "✓ Live URL provided",
        "✓ Environment variables documented",
        "✓ Admin credentials shared",
        "✓ Documentation included",
        "✓ Revision process explained",
      ],
    },
    deliveries: Array.from(deliveriesStore.values()),
  };

  return NextResponse.json({ instructions });
}
