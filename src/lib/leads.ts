// Lead management with optional database support
// Always uses in-memory storage, syncs to database when configured

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  projectDescription: string;
  preferredContact: "whatsapp" | "email";
  selectedPackage: string;
  source?: string;
  createdAt: string;
  status: "new" | "contacted" | "quoted" | "paid" | "in_progress" | "completed" | "cancelled";
  paymentStatus?: "pending" | "upfront_paid" | "fully_paid";
  stripeSessionId?: string;
  cryptoTxHash?: string;
  cryptoNetwork?: string;
  notes?: string;
}

// In-memory storage (primary)
const memoryStore: Map<string, Lead> = new Map();

// Check if database is configured
function isDatabaseConfigured(): boolean {
  return !!process.env.DATABASE_URL;
}

// Try to sync with database (non-blocking)
async function syncToDatabase(operation: string, data: any) {
  if (!isDatabaseConfigured()) return;
  
  try {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    
    // Map status to enum format
    const mapStatus = (status: string) => status.toUpperCase().replace(/-/g, "_");
    
    if (operation === "upsert") {
      await prisma.lead.upsert({
        where: { id: data.id },
        update: {
          ...data,
          status: mapStatus(data.status),
          paymentStatus: data.paymentStatus ? mapStatus(data.paymentStatus) : "PENDING",
        },
        create: {
          ...data,
          status: mapStatus(data.status),
          paymentStatus: data.paymentStatus ? mapStatus(data.paymentStatus) : "PENDING",
        },
      });
    } else if (operation === "delete") {
      await prisma.lead.delete({ where: { id: data.id } });
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.error(`Database sync error (${operation}):`, error);
  }
}

export async function saveLead(lead: Lead): Promise<void> {
  memoryStore.set(lead.id, lead);
  syncToDatabase("upsert", lead);
}

export async function getLead(id: string): Promise<Lead | undefined> {
  return memoryStore.get(id);
}

export async function getAllLeads(): Promise<Lead[]> {
  return Array.from(memoryStore.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function updateLead(id: string, updates: Partial<Lead>): Promise<Lead | null> {
  const lead = memoryStore.get(id);
  if (!lead) return null;
  
  const updatedLead = { ...lead, ...updates };
  memoryStore.set(id, updatedLead);
  syncToDatabase("upsert", updatedLead);
  
  return updatedLead;
}

export async function deleteLead(id: string): Promise<boolean> {
  const deleted = memoryStore.delete(id);
  if (deleted) {
    syncToDatabase("delete", { id });
  }
  return deleted;
}

// Stats helper
export async function getLeadStats() {
  const leads = Array.from(memoryStore.values());
  return {
    total: leads.length,
    new: leads.filter(l => l.status === "new").length,
    contacted: leads.filter(l => l.status === "contacted").length,
    paid: leads.filter(l => l.status === "paid").length,
    inProgress: leads.filter(l => l.status === "in_progress").length,
    completed: leads.filter(l => l.status === "completed").length,
  };
}

// Helper functions
export function getWhatsAppLink(phone: string, message?: string): string {
  const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, "");
  const encodedMessage = message ? encodeURIComponent(message) : "";
  return `https://wa.me/${cleanPhone}${encodedMessage ? `?text=${encodedMessage}` : ""}`;
}

export function formatPhone(phone: string): string {
  return phone.replace(/(\d{1,3})(\d{3})(\d{3})(\d{4})/, "+$1 $2 $3 $4");
}
