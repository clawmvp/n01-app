// Lead management with Vercel KV persistence
// Data persists across deployments

import { kv } from "@vercel/kv";

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

// In-memory cache for faster reads
const memoryCache: Map<string, Lead> = new Map();
let cacheLoaded = false;

// Check if KV is configured
function isKVConfigured(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

// Load all leads from KV into memory cache
async function loadCache(): Promise<void> {
  if (cacheLoaded || !isKVConfigured()) return;
  
  try {
    const leadIds = await kv.smembers("lead_ids") as string[];
    if (leadIds && leadIds.length > 0) {
      for (const id of leadIds) {
        const lead = await kv.get<Lead>(`lead:${id}`);
        if (lead) {
          memoryCache.set(id, lead);
        }
      }
    }
    cacheLoaded = true;
    console.log(`✅ Loaded ${memoryCache.size} leads from KV`);
  } catch (error) {
    console.error("Failed to load leads from KV:", error);
  }
}

// Save lead to both cache and KV
export async function saveLead(lead: Lead): Promise<void> {
  memoryCache.set(lead.id, lead);
  
  if (isKVConfigured()) {
    try {
      await kv.set(`lead:${lead.id}`, lead);
      await kv.sadd("lead_ids", lead.id);
    } catch (error) {
      console.error("Failed to save lead to KV:", error);
    }
  }
}

// Get single lead
export async function getLead(id: string): Promise<Lead | undefined> {
  // Check cache first
  if (memoryCache.has(id)) {
    return memoryCache.get(id);
  }
  
  // Try KV
  if (isKVConfigured()) {
    try {
      const lead = await kv.get<Lead>(`lead:${id}`);
      if (lead) {
        memoryCache.set(id, lead);
        return lead;
      }
    } catch (error) {
      console.error("Failed to get lead from KV:", error);
    }
  }
  
  return undefined;
}

// Get all leads
export async function getAllLeads(): Promise<Lead[]> {
  await loadCache();
  
  // If KV is configured but cache might be stale, refresh
  if (isKVConfigured() && memoryCache.size === 0) {
    try {
      const leadIds = await kv.smembers("lead_ids") as string[];
      if (leadIds && leadIds.length > 0) {
        for (const id of leadIds) {
          const lead = await kv.get<Lead>(`lead:${id}`);
          if (lead) {
            memoryCache.set(id, lead);
          }
        }
      }
    } catch (error) {
      console.error("Failed to refresh leads from KV:", error);
    }
  }
  
  return Array.from(memoryCache.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

// Update lead
export async function updateLead(id: string, updates: Partial<Lead>): Promise<Lead | null> {
  let lead = memoryCache.get(id);
  
  // Try to get from KV if not in cache
  if (!lead && isKVConfigured()) {
    lead = await kv.get<Lead>(`lead:${id}`) || undefined;
  }
  
  if (!lead) return null;
  
  const updatedLead = { ...lead, ...updates };
  memoryCache.set(id, updatedLead);
  
  if (isKVConfigured()) {
    try {
      await kv.set(`lead:${id}`, updatedLead);
    } catch (error) {
      console.error("Failed to update lead in KV:", error);
    }
  }
  
  return updatedLead;
}

// Delete lead
export async function deleteLead(id: string): Promise<boolean> {
  const deleted = memoryCache.delete(id);
  
  if (isKVConfigured()) {
    try {
      await kv.del(`lead:${id}`);
      await kv.srem("lead_ids", id);
    } catch (error) {
      console.error("Failed to delete lead from KV:", error);
    }
  }
  
  return deleted;
}

// Stats helper
export async function getLeadStats() {
  const leads = await getAllLeads();
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
