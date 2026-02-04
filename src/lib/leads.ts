// Lead management with database support
// Falls back to in-memory storage if database is not configured

import { prisma, isDatabaseConfigured } from "./db";

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

// In-memory fallback storage
const memoryStore: Map<string, Lead> = new Map();

// Map database status to Lead interface
function mapDbLead(dbLead: any): Lead {
  return {
    id: dbLead.id,
    name: dbLead.name,
    email: dbLead.email,
    phone: dbLead.phone,
    projectDescription: dbLead.projectDescription || "",
    preferredContact: dbLead.preferredContact as "whatsapp" | "email",
    selectedPackage: dbLead.selectedPackage,
    source: dbLead.source || undefined,
    createdAt: dbLead.createdAt.toISOString(),
    status: dbLead.status.toLowerCase() as Lead["status"],
    paymentStatus: dbLead.paymentStatus?.toLowerCase().replace("_", "_") as Lead["paymentStatus"],
    stripeSessionId: dbLead.stripeSessionId || undefined,
    cryptoTxHash: dbLead.cryptoTxHash || undefined,
    cryptoNetwork: dbLead.cryptoNetwork || undefined,
    notes: dbLead.notes || undefined,
  };
}

// Map Lead to database format
function mapToDbFormat(lead: Lead) {
  return {
    id: lead.id,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    projectDescription: lead.projectDescription,
    preferredContact: lead.preferredContact,
    selectedPackage: lead.selectedPackage,
    source: lead.source,
    status: lead.status.toUpperCase().replace("-", "_") as any,
    paymentStatus: (lead.paymentStatus || "pending").toUpperCase().replace("-", "_") as any,
    stripeSessionId: lead.stripeSessionId,
    cryptoTxHash: lead.cryptoTxHash,
    cryptoNetwork: lead.cryptoNetwork,
    notes: lead.notes,
  };
}

export async function saveLead(lead: Lead): Promise<void> {
  if (isDatabaseConfigured()) {
    try {
      await prisma.lead.upsert({
        where: { id: lead.id },
        update: mapToDbFormat(lead),
        create: mapToDbFormat(lead),
      });
      return;
    } catch (error) {
      console.error("Database error, falling back to memory:", error);
    }
  }
  
  // Fallback to memory
  memoryStore.set(lead.id, lead);
}

export async function getLead(id: string): Promise<Lead | undefined> {
  if (isDatabaseConfigured()) {
    try {
      const dbLead = await prisma.lead.findUnique({ where: { id } });
      if (dbLead) return mapDbLead(dbLead);
    } catch (error) {
      console.error("Database error, falling back to memory:", error);
    }
  }
  
  return memoryStore.get(id);
}

export async function getAllLeads(): Promise<Lead[]> {
  if (isDatabaseConfigured()) {
    try {
      const dbLeads = await prisma.lead.findMany({
        orderBy: { createdAt: "desc" },
      });
      return dbLeads.map(mapDbLead);
    } catch (error) {
      console.error("Database error, falling back to memory:", error);
    }
  }
  
  return Array.from(memoryStore.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function updateLead(id: string, updates: Partial<Lead>): Promise<Lead | null> {
  if (isDatabaseConfigured()) {
    try {
      const updated = await prisma.lead.update({
        where: { id },
        data: {
          ...updates,
          status: updates.status?.toUpperCase().replace("-", "_") as any,
          paymentStatus: updates.paymentStatus?.toUpperCase().replace("-", "_") as any,
        },
      });
      return mapDbLead(updated);
    } catch (error) {
      console.error("Database error, falling back to memory:", error);
    }
  }
  
  const lead = memoryStore.get(id);
  if (!lead) return null;
  
  const updatedLead = { ...lead, ...updates };
  memoryStore.set(id, updatedLead);
  return updatedLead;
}

export async function deleteLead(id: string): Promise<boolean> {
  if (isDatabaseConfigured()) {
    try {
      await prisma.lead.delete({ where: { id } });
      return true;
    } catch (error) {
      console.error("Database error, falling back to memory:", error);
    }
  }
  
  return memoryStore.delete(id);
}

// Sync helpers
export function getWhatsAppLink(phone: string, message?: string): string {
  const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, "");
  const encodedMessage = message ? encodeURIComponent(message) : "";
  return `https://wa.me/${cleanPhone}${encodedMessage ? `?text=${encodedMessage}` : ""}`;
}

export function formatPhone(phone: string): string {
  return phone.replace(/(\d{1,3})(\d{3})(\d{3})(\d{4})/, "+$1 $2 $3 $4");
}

// Legacy sync exports for backwards compatibility
export function saveLeadSync(lead: Lead): void {
  memoryStore.set(lead.id, lead);
  // Also try async save
  saveLead(lead).catch(console.error);
}

export function getLeadSync(id: string): Lead | undefined {
  return memoryStore.get(id);
}

export function getAllLeadsSync(): Lead[] {
  return Array.from(memoryStore.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
