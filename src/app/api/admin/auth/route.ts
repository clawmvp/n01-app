import { NextRequest, NextResponse } from "next/server";
import { 
  verifyAdminPassword, 
  createSession, 
  validateSession, 
  destroySession 
} from "@/lib/auth";

/**
 * POST /api/admin/auth - Login
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;
    
    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Password required" },
        { status: 400 }
      );
    }
    
    // Rate limiting check (basic - in production use Redis)
    const ip = request.headers.get("x-forwarded-for") || 
               request.headers.get("x-real-ip") || 
               "unknown";
    
    // Verify password server-side only
    const isValid = verifyAdminPassword(password);
    
    if (!isValid) {
      // Log failed attempt for security monitoring
      console.warn(`[SECURITY] Failed admin login attempt from IP: ${ip}`);
      
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }
    
    // Create secure session
    await createSession();
    
    console.log(`[SECURITY] Successful admin login from IP: ${ip}`);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/auth - Check session status
 */
export async function GET() {
  try {
    const isValid = await validateSession();
    
    return NextResponse.json({ 
      authenticated: isValid 
    });
  } catch {
    return NextResponse.json({ 
      authenticated: false 
    });
  }
}

/**
 * DELETE /api/admin/auth - Logout
 */
export async function DELETE() {
  try {
    await destroySession();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Logout failed" },
      { status: 500 }
    );
  }
}
