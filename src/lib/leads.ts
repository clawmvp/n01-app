// Simple in-memory lead storage with persistence via Vercel Edge Config or env
// In production, use a proper database like Supabase, PlanetScale, or Upstash Redis

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  projectDescription: string;
  preferredContact: "whatsapp" | "email";
  selectedPackage: string;
  createdAt: string;
  status: "new" | "contacted" | "quoted" | "paid" | "in_progress" | "completed" | "cancelled";
  paymentStatus?: "pending" | "upfront_paid" | "fully_paid";
  stripeSessionId?: string;
  notes?: string;
}

// In-memory storage (will reset on cold start, but emails are sent immediately)
const leadsStore: Map<string, Lead> = new Map();

export function saveLead(lead: Lead): void {
  leadsStore.set(lead.id, lead);
}

export function getLead(id: string): Lead | undefined {
  return leadsStore.get(id);
}

export function getAllLeads(): Lead[] {
  return Array.from(leadsStore.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function updateLead(id: string, updates: Partial<Lead>): Lead | null {
  const lead = leadsStore.get(id);
  if (!lead) return null;
  
  const updated = { ...lead, ...updates };
  leadsStore.set(id, updated);
  return updated;
}

export function deleteLead(id: string): boolean {
  return leadsStore.delete(id);
}

// Generate WhatsApp link
export function getWhatsAppLink(phone: string, message?: string): string {
  const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, "");
  const encodedMessage = message ? encodeURIComponent(message) : "";
  return `https://wa.me/${cleanPhone}${encodedMessage ? `?text=${encodedMessage}` : ""}`;
}

// Format phone for display
export function formatPhone(phone: string): string {
  return phone.replace(/(\d{1,3})(\d{3})(\d{3})(\d{4})/, "+$1 $2 $3 $4");
}
