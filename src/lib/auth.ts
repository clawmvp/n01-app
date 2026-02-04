import { cookies } from "next/headers";
import crypto from "crypto";

// Security constants
const COOKIE_NAME = "__n01_admin_session";
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Generate a secure session token
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Hash a token for storage/comparison
 */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Verify admin password against environment variable
 * IMPORTANT: Password is NEVER exposed to client
 */
export function verifyAdminPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  if (!adminPassword) {
    console.error("SECURITY WARNING: ADMIN_PASSWORD environment variable not set!");
    return false;
  }
  
  // Use timing-safe comparison to prevent timing attacks
  const inputBuffer = Buffer.from(password);
  const storedBuffer = Buffer.from(adminPassword);
  
  if (inputBuffer.length !== storedBuffer.length) {
    return false;
  }
  
  return crypto.timingSafeEqual(inputBuffer, storedBuffer);
}

/**
 * Create a secure session cookie
 */
export async function createSession(): Promise<string> {
  const token = generateSessionToken();
  const hashedToken = hashToken(token);
  const expiresAt = Date.now() + SESSION_DURATION;
  
  // Store session data in cookie (in production, use Redis/database)
  const sessionData = JSON.stringify({
    hashedToken,
    expiresAt,
    createdAt: Date.now(),
  });
  
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, `${token}:${Buffer.from(sessionData).toString("base64")}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION / 1000, // Convert to seconds
  });
  
  return token;
}

/**
 * Validate current session from cookie
 */
export async function validateSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(COOKIE_NAME);
    
    if (!sessionCookie?.value) {
      return false;
    }
    
    const [token, encodedData] = sessionCookie.value.split(":");
    
    if (!token || !encodedData) {
      return false;
    }
    
    const sessionData = JSON.parse(Buffer.from(encodedData, "base64").toString());
    
    // Check expiration
    if (Date.now() > sessionData.expiresAt) {
      await destroySession();
      return false;
    }
    
    // Verify token hash
    const inputHash = hashToken(token);
    const storedHash = sessionData.hashedToken;
    
    if (inputHash.length !== storedHash.length) {
      return false;
    }
    
    return crypto.timingSafeEqual(
      Buffer.from(inputHash),
      Buffer.from(storedHash)
    );
  } catch {
    return false;
  }
}

/**
 * Destroy session (logout)
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Validate session from request headers (for middleware)
 */
export function validateSessionFromRequest(cookieHeader: string | null): boolean {
  if (!cookieHeader) {
    return false;
  }
  
  try {
    // Parse cookies from header
    const cookies = Object.fromEntries(
      cookieHeader.split(";").map((c) => {
        const [key, ...val] = c.trim().split("=");
        return [key, val.join("=")];
      })
    );
    
    const sessionCookie = cookies[COOKIE_NAME];
    
    if (!sessionCookie) {
      return false;
    }
    
    const [token, encodedData] = sessionCookie.split(":");
    
    if (!token || !encodedData) {
      return false;
    }
    
    const sessionData = JSON.parse(Buffer.from(encodedData, "base64").toString());
    
    // Check expiration
    if (Date.now() > sessionData.expiresAt) {
      return false;
    }
    
    // Verify token hash
    const inputHash = hashToken(token);
    const storedHash = sessionData.hashedToken;
    
    if (inputHash.length !== storedHash.length) {
      return false;
    }
    
    return crypto.timingSafeEqual(
      Buffer.from(inputHash),
      Buffer.from(storedHash)
    );
  } catch {
    return false;
  }
}
