// Database client with graceful fallback

let prismaClient: any = null;

// Try to import Prisma client
async function initPrisma() {
  if (prismaClient) return prismaClient;
  
  if (!process.env.DATABASE_URL) {
    console.log("DATABASE_URL not configured, using in-memory storage");
    return null;
  }

  try {
    const { PrismaClient } = await import("@prisma/client");
    prismaClient = new PrismaClient();
    return prismaClient;
  } catch (error) {
    console.error("Failed to initialize Prisma:", error);
    return null;
  }
}

// Lazy getter for prisma client
export async function getPrisma() {
  return await initPrisma();
}

// Sync check for database configuration
export function isDatabaseConfigured(): boolean {
  return !!process.env.DATABASE_URL;
}

// Export a proxy that works like the old prisma export
export const prisma = new Proxy({} as any, {
  get(target, prop) {
    return async (...args: any[]) => {
      const client = await getPrisma();
      if (!client) {
        throw new Error("Database not configured");
      }
      const model = (client as any)[prop];
      if (typeof model === "function") {
        return model.call(client, ...args);
      }
      return model;
    };
  },
});
