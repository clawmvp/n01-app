"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// Deliverables Modal Component
function DeliverablesModal({ 
  project, 
  onClose, 
  onSave 
}: { 
  project: Project; 
  onClose: () => void; 
  onSave: () => void;
}) {
  const [githubRepo, setGithubRepo] = useState(project.githubRepo || "");
  const [vercelUrl, setVercelUrl] = useState(project.vercelUrl || "");
  const [previewUrl, setPreviewUrl] = useState(project.previewUrl || "");
  const [zipUrl, setZipUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/admin/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          githubRepo: githubRepo || undefined,
          vercelUrl: vercelUrl || undefined,
          previewUrl: previewUrl || vercelUrl || undefined,
        }),
      });
      onSave();
      onClose();
    } catch (err) {
      console.error("Failed to save deliverables:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl max-w-lg w-full p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">📦 Manage Deliverables</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">🌐 Live URL (Vercel/Custom)</label>
            <input
              type="url"
              value={vercelUrl}
              onChange={(e) => setVercelUrl(e.target.value)}
              placeholder="https://project.vercel.app"
              className="w-full px-4 py-3 bg-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">📦 GitHub Repository</label>
            <input
              type="url"
              value={githubRepo}
              onChange={(e) => setGithubRepo(e.target.value)}
              placeholder="https://github.com/user/repo"
              className="w-full px-4 py-3 bg-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">👀 Preview URL (optional)</label>
            <input
              type="url"
              value={previewUrl}
              onChange={(e) => setPreviewUrl(e.target.value)}
              placeholder="https://preview.project.com"
              className="w-full px-4 py-3 bg-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700"
            />
            <p className="text-xs text-gray-500 mt-1">If empty, will use the live URL</p>
          </div>
          
          {githubRepo && (
            <div className="bg-gray-800/50 p-4 rounded-xl">
              <p className="text-sm text-gray-400 mb-2">📥 Auto-generated ZIP link:</p>
              <code className="text-xs text-blue-400 break-all">
                {githubRepo}/archive/refs/heads/main.zip
              </code>
            </div>
          )}
        </div>
        
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-800 rounded-xl hover:bg-gray-700 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-4 py-3 bg-blue-600 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Deliverables"}
          </button>
        </div>
      </div>
    </div>
  );
}

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  projectDescription: string;
  brief?: string;
  conversation?: string;
  preferredContact: "whatsapp" | "email";
  selectedPackage: string;
  status: string;
  paymentStatus?: string;
  createdAt: string;
  notes?: string;
}

interface ProjectTask {
  id: string;
  agent: string;
  title: string;
  complexity?: string;
  status: "pending" | "in_progress" | "completed";
  startedAt?: string;
  completedAt?: string;
  estimatedMinutes?: number;
}

interface Project {
  id: string;
  name: string;
  description: string;
  brief?: string;
  conversation?: string;
  status: string;
  packageType: string;
  price: number;
  githubRepo?: string;
  vercelUrl?: string;
  previewUrl?: string;
  zipUrl?: string;
  createdAt: string;
  estimatedDelivery?: string;
  currentAgent?: string;
  tasks: ProjectTask[];
  autoProgress?: boolean;
  priority?: "normal" | "rush" | "urgent";
  clientEmail: string;
  clientName: string;
  accessToken?: string; // Secure access token for client
}

// Calculate time remaining for a project
function getTimeRemaining(project: Project): string {
  let totalMinutes = 0;
  const now = Date.now();
  
  for (const task of project.tasks || []) {
    if (task.status === "completed") continue;
    
    const duration = task.estimatedMinutes || 15;
    
    if (task.status === "in_progress" && task.startedAt) {
      const elapsed = (now - new Date(task.startedAt).getTime()) / (1000 * 60);
      totalMinutes += Math.max(0, duration - elapsed);
    } else {
      totalMinutes += duration;
    }
  }
  
  if (totalMinutes <= 0) return "Done!";
  
  const hours = Math.floor(totalMinutes / 60);
  const mins = Math.round(totalMinutes % 60);
  
  return hours > 0 ? `~${hours}h ${mins}m` : `~${mins}m`;
}

type Tab = "leads" | "projects" | "scout" | "settings";

// Scout Types
interface ScoutLead {
  id: string;
  platform: "reddit" | "twitter";
  postId: string;
  postUrl: string;
  author: string;
  authorUrl?: string;
  content: string;
  title?: string;
  subreddit?: string;
  createdAt: string;
  discoveredAt: string;
  score?: number;
  qualifiedAt?: string;
  qualificationReason?: string;
  intent?: "high" | "medium" | "low";
  budget?: "unknown" | "low" | "medium" | "high";
  projectType?: string;
  status: "new" | "qualified" | "outreach_pending" | "outreach_sent" | "replied" | "converted" | "ignored";
  outreachMessage?: string;
  outreachSentAt?: string;
  keywords: string[];
  confidence: number;
}

interface ScoutStats {
  total: number;
  byStatus: Record<string, number>;
  byPlatform: Record<string, number>;
  avgScore: number;
}

export default function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("leads");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingPayment, setSendingPayment] = useState<string | null>(null);
  const [editingDeliverables, setEditingDeliverables] = useState<Project | null>(null);
  const [analyzingProject, setAnalyzingProject] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<Record<string, any>>({});
  
  // Scout state
  const [scoutLeads, setScoutLeads] = useState<ScoutLead[]>([]);
  const [scoutStats, setScoutStats] = useState<ScoutStats | null>(null);
  const [scoutConfig, setScoutConfig] = useState<any>(null);
  const [scoutCredentials, setScoutCredentials] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [generatingMessage, setGeneratingMessage] = useState<string | null>(null);
  const [sendingOutreach, setSendingOutreach] = useState<string | null>(null);
  const [expandedLead, setExpandedLead] = useState<string | null>(null);
  
  // Auto-refresh state
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(10); // seconds
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(10);

  const authenticate = () => {
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || password === "n01admin2024") {
      setAuthenticated(true);
      localStorage.setItem("admin_auth", "true");
      fetchData();
    } else {
      setError("Invalid password");
    }
  };

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [leadsRes, projectsRes, scoutLeadsRes, scoutConfigRes] = await Promise.all([
        fetch("/api/admin/leads"),
        fetch("/api/admin/projects").catch(() => ({ json: () => ({ projects: [] }) })),
        fetch("/api/scout/leads").catch(() => ({ json: () => ({ leads: [], stats: null }) })),
        fetch("/api/scout/scan").catch(() => ({ json: () => ({}) })),
      ]);
      
      const leadsData = await leadsRes.json();
      const projectsData = await projectsRes.json();
      const scoutLeadsData = await scoutLeadsRes.json();
      const scoutConfigData = await scoutConfigRes.json();
      
      setLeads(leadsData.leads || []);
      setProjects(projectsData.projects || []);
      setScoutLeads(scoutLeadsData.leads || []);
      setScoutStats(scoutLeadsData.stats || null);
      setScoutConfig(scoutConfigData.config || null);
      setScoutCredentials(scoutConfigData.credentials || null);
      setLastRefresh(new Date());
      setCountdown(refreshInterval);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Auto-refresh effect
  useEffect(() => {
    if (!authenticated || !autoRefresh) return;
    
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          fetchData(true); // Silent refresh
          return refreshInterval;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [authenticated, autoRefresh, refreshInterval]);

  const updateLeadStatus = async (leadId: string, status: string) => {
    try {
      await fetch("/api/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, status }),
      });
      fetchData();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const createProject = async (lead: Lead) => {
    try {
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: lead.id,
          name: `${lead.name} - ${lead.selectedPackage}`,
          packageType: lead.selectedPackage.toLowerCase(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Project created!");
        fetchData();
      }
    } catch (err) {
      console.error("Failed to create project:", err);
    }
  };

  const sendPaymentLink = async (lead: Lead) => {
    setSendingPayment(lead.id);
    try {
      const res = await fetch("/api/admin/send-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: lead.id }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Payment link sent to ${lead.email}!`);
        fetchData();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error("Failed to send payment:", err);
      alert("Failed to send payment link");
    } finally {
      setSendingPayment(null);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("admin_auth") === "true") {
      setAuthenticated(true);
      fetchData();
    } else {
      setLoading(false);
    }
  }, []);

  // Login screen
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-6">
        <div className="bg-gray-900 p-8 rounded-2xl max-w-md w-full border border-gray-800">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">n01.app Admin</h1>
            <p className="text-gray-400 text-sm mt-2">Project Management Dashboard</p>
          </div>
          {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && authenticate()}
            placeholder="Enter admin password"
            className="w-full px-4 py-3 bg-gray-800 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700"
          />
          <button
            onClick={authenticate}
            className="w-full py-3 bg-blue-600 rounded-xl font-medium hover:bg-blue-700 transition"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const stats = {
    totalLeads: leads.length,
    newLeads: leads.filter(l => l.status === "new").length,
    paidLeads: leads.filter(l => l.status === "paid" || l.paymentStatus === "upfront_paid").length,
    totalProjects: projects.length,
    activeProjects: projects.filter(p => 
      p.status === "planning" || 
      p.status === "designing" || 
      p.status === "developing" || 
      p.status === "testing" || 
      p.status === "review"
    ).length,
    deliveredProjects: projects.filter(p => p.status === "delivered" || p.status === "completed").length,
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold">
              n01<span className="text-blue-500">.app</span>
            </Link>
            <span className="text-gray-500">/ Admin</span>
          </div>
          <div className="flex items-center gap-4">
            {/* Auto-refresh controls */}
            <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-1.5">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`w-8 h-5 rounded-full transition-colors relative ${
                  autoRefresh ? "bg-green-500" : "bg-gray-600"
                }`}
              >
                <span
                  className={`absolute w-3.5 h-3.5 bg-white rounded-full top-0.5 transition-transform ${
                    autoRefresh ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </button>
              <span className="text-xs text-gray-400">
                {autoRefresh ? (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Live ({countdown}s)
                  </span>
                ) : (
                  "Paused"
                )}
              </span>
              {autoRefresh && (
                <select
                  value={refreshInterval}
                  onChange={(e) => {
                    setRefreshInterval(Number(e.target.value));
                    setCountdown(Number(e.target.value));
                  }}
                  className="bg-gray-700 text-xs rounded px-1 py-0.5 border-none outline-none"
                >
                  <option value={5}>5s</option>
                  <option value={10}>10s</option>
                  <option value={30}>30s</option>
                  <option value={60}>60s</option>
                </select>
              )}
            </div>
            
            <button 
              onClick={() => fetchData(false)} 
              className="text-gray-400 hover:text-white transition flex items-center gap-1"
            >
              <span className={loading ? "animate-spin" : ""}>↻</span>
              {lastRefresh && (
                <span className="text-xs text-gray-500">
                  {lastRefresh.toLocaleTimeString()}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                localStorage.removeItem("admin_auth");
                setAuthenticated(false);
              }}
              className="text-gray-400 hover:text-white transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="text-3xl font-bold text-blue-500">{stats.totalLeads}</div>
            <div className="text-gray-400 text-sm mt-1">Total Leads</div>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="text-3xl font-bold text-green-500">{stats.newLeads}</div>
            <div className="text-gray-400 text-sm mt-1">New Leads</div>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="text-3xl font-bold text-purple-500">{stats.paidLeads}</div>
            <div className="text-gray-400 text-sm mt-1">Paid Leads</div>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="text-3xl font-bold text-cyan-500">{stats.totalProjects}</div>
            <div className="text-gray-400 text-sm mt-1">Total Projects</div>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="text-3xl font-bold text-orange-500">{stats.activeProjects}</div>
            <div className="text-gray-400 text-sm mt-1">Active Projects</div>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="text-3xl font-bold text-emerald-500">{stats.deliveredProjects}</div>
            <div className="text-gray-400 text-sm mt-1">Delivered</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-900 p-1 rounded-xl w-fit">
          {(["leads", "projects", "scout", "settings"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg font-medium transition ${
                activeTab === tab
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Leads Tab */}
        {activeTab === "leads" && (
          <div className="space-y-4">
            {leads.length === 0 ? (
              <div className="bg-gray-900 rounded-2xl p-12 text-center border border-gray-800">
                <p className="text-gray-400">No leads yet. They will appear here when someone submits a form.</p>
              </div>
            ) : (
              leads.map((lead) => (
                <div key={lead.id} className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <h2 className="text-xl font-semibold">{lead.name}</h2>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          lead.status === "new" ? "bg-green-500/20 text-green-400" :
                          lead.status === "contacted" ? "bg-blue-500/20 text-blue-400" :
                          lead.status === "paid" ? "bg-purple-500/20 text-purple-400" :
                          lead.status === "in_progress" ? "bg-orange-500/20 text-orange-400" :
                          "bg-gray-500/20 text-gray-400"
                        }`}>
                          {lead.status}
                        </span>
                        <span className="px-2 py-1 text-xs bg-gray-800 rounded-full">
                          {lead.selectedPackage}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-4">
                        <div>
                          <span className="text-gray-500">Email: </span>
                          <a href={`mailto:${lead.email}`} className="text-blue-400 hover:underline">
                            {lead.email}
                          </a>
                        </div>
                        <div>
                          <span className="text-gray-500">Phone: </span>
                          <span>{lead.phone}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Contact via: </span>
                          <span className={lead.preferredContact === "whatsapp" ? "text-green-400" : ""}>
                            {lead.preferredContact}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Date: </span>
                          <span>{new Date(lead.createdAt).toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Brief / Requirements */}
                      {(lead.brief || lead.projectDescription) && (
                        <div className="bg-gray-800/50 p-4 rounded-xl text-sm mb-3">
                          <h4 className="text-xs text-gray-500 uppercase mb-2">📋 Brief / Requirements</h4>
                          <p className="text-gray-300 whitespace-pre-wrap">
                            {lead.brief || lead.projectDescription}
                          </p>
                        </div>
                      )}
                      
                      {/* Conversation */}
                      {lead.conversation && (
                        <details className="bg-gray-800/50 rounded-xl text-sm">
                          <summary className="p-4 cursor-pointer text-gray-400 hover:text-white">
                            💬 View conversation with ARIA
                          </summary>
                          <div className="px-4 pb-4 max-h-60 overflow-y-auto">
                            <pre className="text-xs text-gray-400 whitespace-pre-wrap font-sans">
                              {lead.conversation}
                            </pre>
                          </div>
                        </details>
                      )}
                    </div>

                    <div className="flex flex-wrap lg:flex-col gap-2">
                      <a
                        href={`https://wa.me/${lead.phone.replace(/[\s\-\(\)\+]/g, "")}?text=${encodeURIComponent(
                          `Hi ${lead.name}! This is the n01.app team. Thanks for your interest!`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 rounded-xl text-sm font-medium hover:bg-green-700 transition"
                      >
                        📱 WhatsApp
                      </a>
                      
                      <button
                        onClick={() => sendPaymentLink(lead)}
                        disabled={sendingPayment === lead.id}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 rounded-xl text-sm font-medium hover:bg-purple-700 transition disabled:opacity-50"
                      >
                        {sendingPayment === lead.id ? "Sending..." : "💳 Payment Link"}
                      </button>

                      {lead.status === "paid" && (
                        <button
                          onClick={() => createProject(lead)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-xl text-sm font-medium hover:bg-blue-700 transition"
                        >
                          🚀 Create Project
                        </button>
                      )}

                      <select
                        value={lead.status}
                        onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                        className="px-4 py-2 bg-gray-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-700"
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="quoted">Quoted</option>
                        <option value="paid">Paid</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === "projects" && (
          <div className="space-y-4">
            {projects.length === 0 ? (
              <div className="bg-gray-900 rounded-2xl p-12 text-center border border-gray-800">
                <p className="text-gray-400">No projects yet.</p>
                <p className="text-gray-500 text-sm mt-2">Projects are auto-created when payments are confirmed.</p>
              </div>
            ) : (
              projects.map((project) => {
                const completedTasks = project.tasks?.filter((t: ProjectTask) => t.status === "completed").length || 0;
                const totalTasks = project.tasks?.length || 1;
                const progress = Math.round((completedTasks / totalTasks) * 100);
                
                return (
                  <div key={project.id} className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                    {/* Header */}
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{project.name}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            project.status === "planning" ? "bg-blue-500/20 text-blue-400" :
                            project.status === "designing" ? "bg-purple-500/20 text-purple-400" :
                            project.status === "developing" ? "bg-orange-500/20 text-orange-400" :
                            project.status === "delivered" ? "bg-teal-500/20 text-teal-400" :
                            project.status === "completed" ? "bg-green-500/20 text-green-400" :
                            "bg-gray-700 text-gray-400"
                          }`}>
                            {project.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 text-sm text-gray-400">
                          <span>📧 {project.clientEmail}</span>
                          <span>•</span>
                          <span>💰 ${project.price}</span>
                          <span>•</span>
                          <span>📦 {project.packageType}</span>
                          {project.estimatedDelivery && (
                            <>
                              <span>•</span>
                              <span>📅 Due: {new Date(project.estimatedDelivery).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <a
                          href={`/project/${project.id}${project.accessToken ? `?token=${project.accessToken}` : ""}`}
                          target="_blank"
                          className="px-3 py-2 bg-gray-800 rounded-lg text-sm hover:bg-gray-700 transition"
                          title={project.accessToken ? "Secure client link" : "Public link"}
                        >
                          {project.accessToken ? "🔐" : "👀"} Client View
                        </a>
                        {project.accessToken && (
                          <button
                            onClick={() => {
                              const url = `${window.location.origin}/project/${project.id}?token=${project.accessToken}`;
                              navigator.clipboard.writeText(url);
                              alert("Secure link copied to clipboard!");
                            }}
                            className="px-3 py-2 bg-gray-800 rounded-lg text-sm hover:bg-gray-700 transition"
                            title="Copy secure link"
                          >
                            📋 Copy Link
                          </button>
                        )}
                        <button
                          onClick={async () => {
                            await fetch("/api/admin/projects", {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ projectId: project.id, action: "advance" }),
                            });
                            fetchData();
                          }}
                          className="px-3 py-2 bg-blue-600 rounded-lg text-sm hover:bg-blue-700 transition"
                        >
                          ⏭ Advance
                        </button>
                        {progress === 100 && !project.vercelUrl && (
                          <button
                            onClick={async () => {
                              if (!confirm("Deploy project to GitHub + Vercel?")) return;
                              const res = await fetch("/api/admin/deliver", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ projectId: project.id, action: "deliver" }),
                              });
                              const data = await res.json();
                              if (data.success) {
                                alert(`Delivered!\nGitHub: ${data.result.githubRepo || "N/A"}\nVercel: ${data.result.vercelUrl || "N/A"}`);
                                fetchData();
                              } else {
                                alert("Delivery failed: " + (data.error || "Unknown error"));
                              }
                            }}
                            className="px-3 py-2 bg-green-600 rounded-lg text-sm hover:bg-green-700 transition"
                          >
                            🚀 Deploy
                          </button>
                        )}
                        {project.vercelUrl && project.status !== "completed" && (
                          <button
                            onClick={async () => {
                              if (!confirm("Send handover email to client?")) return;
                              await fetch("/api/admin/deliver", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ projectId: project.id, action: "handover" }),
                              });
                              alert("Handover email sent!");
                              fetchData();
                            }}
                            className="px-3 py-2 bg-purple-600 rounded-lg text-sm hover:bg-purple-700 transition"
                          >
                            📧 Handover
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Progress</span>
                        <span className="font-medium">{progress}%</span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Brief */}
                    {project.brief && (
                      <div className="bg-gray-800/50 p-4 rounded-lg mb-4">
                        <h4 className="text-xs text-gray-500 uppercase mb-2">📋 Project Brief</h4>
                        <p className="text-sm text-gray-300 whitespace-pre-wrap">{project.brief}</p>
                      </div>
                    )}

                    {/* Conversation */}
                    {project.conversation && (
                      <details className="bg-gray-800/50 rounded-lg mb-4">
                        <summary className="p-3 cursor-pointer text-sm text-gray-400 hover:text-white">
                          💬 View client conversation
                        </summary>
                        <div className="px-4 pb-4 max-h-40 overflow-y-auto">
                          <pre className="text-xs text-gray-500 whitespace-pre-wrap font-sans">
                            {project.conversation}
                          </pre>
                        </div>
                      </details>
                    )}

                    {/* Current Agent & Controls */}
                    {project.currentAgent && project.status !== "completed" && project.status !== "delivered" && (
                      <div className="mb-4 p-4 bg-gray-800/50 rounded-lg space-y-3">
                        {/* Agent Status Row */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-sm">
                              <strong>{project.currentAgent}</strong> is working
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-500">ETA:</span>
                            <span className={`font-mono ${
                              getTimeRemaining(project) === "Done!" ? "text-green-400" : "text-blue-400"
                            }`}>
                              {getTimeRemaining(project)}
                            </span>
                          </div>
                        </div>
                        
                        {/* Controls Row */}
                        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-gray-700">
                          {/* Auto-progress */}
                          <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={project.autoProgress || false}
                              onChange={async (e) => {
                                await fetch("/api/admin/projects", {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ 
                                    projectId: project.id, 
                                    autoProgress: e.target.checked 
                                  }),
                                });
                                fetchData();
                              }}
                              className="rounded accent-blue-500"
                            />
                            Auto-progress
                          </label>
                          
                          {/* Priority Selector */}
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-gray-500">Priority:</span>
                            <select
                              value={project.priority || "normal"}
                              onChange={async (e) => {
                                await fetch("/api/admin/projects", {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ 
                                    projectId: project.id, 
                                    priority: e.target.value 
                                  }),
                                });
                                fetchData();
                              }}
                              className={`px-2 py-1 rounded text-xs font-medium border-0 cursor-pointer ${
                                project.priority === "urgent" ? "bg-red-500/20 text-red-400" :
                                project.priority === "rush" ? "bg-orange-500/20 text-orange-400" :
                                "bg-gray-700 text-gray-300"
                              }`}
                            >
                              <option value="normal">Normal</option>
                              <option value="rush">Rush (2x)</option>
                              <option value="urgent">Urgent (3x)</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tasks */}
                    {project.tasks && (
                      <div className="space-y-2">
                        {project.tasks.map((task: ProjectTask, idx: number) => {
                          // Calculate time info for task
                          const estMinutes = task.estimatedMinutes || 15;
                          let timeDisplay = `~${estMinutes}m`;
                          
                          if (task.status === "in_progress" && task.startedAt) {
                            const elapsed = Math.round((Date.now() - new Date(task.startedAt).getTime()) / (1000 * 60));
                            const remaining = Math.max(0, estMinutes - elapsed);
                            timeDisplay = remaining > 0 ? `${remaining}m left` : "Finishing...";
                          } else if (task.status === "completed" && task.completedAt && task.startedAt) {
                            const duration = Math.round((new Date(task.completedAt).getTime() - new Date(task.startedAt).getTime()) / (1000 * 60));
                            timeDisplay = `${duration}m`;
                          }
                          
                          return (
                            <div 
                              key={task.id}
                              className={`flex items-center gap-3 p-2 rounded-lg ${
                                task.status === "completed" ? "bg-green-500/10" :
                                task.status === "in_progress" ? "bg-blue-500/10" :
                                "bg-gray-800/30"
                              }`}
                            >
                              <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs ${
                                task.status === "completed" ? "bg-green-500 text-white" :
                                task.status === "in_progress" ? "bg-blue-500 text-white animate-pulse" :
                                "bg-gray-700 text-gray-400"
                              }`}>
                                {task.status === "completed" ? "✓" : task.status === "in_progress" ? "⚡" : idx + 1}
                              </span>
                              <span className={`flex-1 text-sm ${task.status === "pending" ? "text-gray-500" : ""}`}>
                                {task.title}
                                {task.complexity && task.complexity !== "medium" && (
                                  <span className={`ml-2 text-xs ${
                                    task.complexity === "critical" ? "text-red-400" :
                                    task.complexity === "complex" ? "text-orange-400" :
                                    task.complexity === "simple" ? "text-green-400" :
                                    "text-gray-500"
                                  }`}>
                                    [{task.complexity}]
                                  </span>
                                )}
                              </span>
                              <span className={`text-xs font-mono ${
                                task.status === "completed" ? "text-green-400" :
                                task.status === "in_progress" ? "text-blue-400" :
                                "text-gray-600"
                              }`}>
                                {timeDisplay}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Deliverables Section */}
                    <div className="mt-4 pt-4 border-t border-gray-800">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-400">📦 Deliverables</h4>
                        <div className="flex gap-2">
                          {(project.githubRepo || project.vercelUrl) && (
                            <button
                              onClick={async () => {
                                if (!confirm(`Send delivery email to ${project.clientEmail}?`)) return;
                                const res = await fetch("/api/admin/deliver", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ projectId: project.id, action: "send-email" }),
                                });
                                const data = await res.json();
                                if (data.success) {
                                  alert("✅ Delivery email sent!");
                                } else {
                                  alert("❌ Failed: " + (data.error || "Unknown error"));
                                }
                              }}
                              className="text-xs px-3 py-1 bg-green-600 rounded-lg hover:bg-green-700 transition"
                            >
                              📧 Send Email
                            </button>
                          )}
                          <button
                            onClick={() => setEditingDeliverables(project)}
                            className="text-xs px-3 py-1 bg-gray-800 rounded-lg hover:bg-gray-700 transition"
                          >
                            ✏️ Edit
                          </button>
                        </div>
                      </div>
                      
                      {(project.githubRepo || project.vercelUrl || project.previewUrl) ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {project.vercelUrl && (
                            <a 
                              href={project.vercelUrl} 
                              target="_blank" 
                              className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg hover:bg-green-500/20 transition"
                            >
                              <span className="text-lg">🌐</span>
                              <div className="overflow-hidden">
                                <div className="text-xs text-gray-400">Live Site</div>
                                <div className="text-sm text-green-400 truncate">{project.vercelUrl.replace("https://", "")}</div>
                              </div>
                            </a>
                          )}
                          {project.githubRepo && (
                            <a 
                              href={project.githubRepo} 
                              target="_blank" 
                              className="flex items-center gap-2 p-3 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 transition"
                            >
                              <span className="text-lg">📦</span>
                              <div className="overflow-hidden">
                                <div className="text-xs text-gray-400">GitHub</div>
                                <div className="text-sm text-blue-400 truncate">{project.githubRepo.replace("https://github.com/", "")}</div>
                              </div>
                            </a>
                          )}
                          {project.githubRepo && (
                            <a 
                              href={`${project.githubRepo}/archive/refs/heads/main.zip`} 
                              target="_blank" 
                              className="flex items-center gap-2 p-3 bg-purple-500/10 rounded-lg hover:bg-purple-500/20 transition"
                            >
                              <span className="text-lg">📥</span>
                              <div>
                                <div className="text-xs text-gray-400">Download</div>
                                <div className="text-sm text-purple-400">ZIP Archive</div>
                              </div>
                            </a>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-6 bg-gray-800/30 rounded-lg">
                          <p className="text-gray-500 text-sm mb-3">No deliverables yet</p>
                          <div className="flex flex-col gap-3">
                            <div className="flex justify-center gap-3">
                              <button
                                onClick={async () => {
                                  if (!confirm("Generate GitHub repo and Vercel deployment for this project?")) return;
                                  const res = await fetch("/api/admin/generate-deliverables", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ 
                                      projectId: project.id, 
                                      password: "n01admin2024" 
                                    }),
                                  });
                                  const data = await res.json();
                                  if (data.success) {
                                    alert("✅ Deliverables generated! GitHub repo and Vercel deployment created.");
                                    fetchData();
                                  } else {
                                    alert("❌ Failed: " + (data.error || data.message));
                                  }
                                }}
                                className="px-4 py-2 bg-green-600 rounded-lg text-sm hover:bg-green-700 transition"
                              >
                                🚀 Create Repo
                              </button>
                              <button
                                onClick={() => setEditingDeliverables(project)}
                                className="px-4 py-2 bg-gray-700 rounded-lg text-sm hover:bg-gray-600 transition"
                              >
                                ✏️ Add Manually
                              </button>
                            </div>
                            {/* Analyze Brief Button */}
                            <button
                              onClick={async () => {
                                setAnalyzingProject(project.id);
                                try {
                                  const res = await fetch("/api/admin/analyze-brief", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ 
                                      projectId: project.id, 
                                      password: "n01admin2024" 
                                    }),
                                  });
                                  const data = await res.json();
                                  if (data.analysis) {
                                    setAnalysisResults(prev => ({ ...prev, [project.id]: data.analysis }));
                                  } else {
                                    alert("❌ Analysis failed: " + (data.error || "Unknown error"));
                                  }
                                } catch (err) {
                                  alert("❌ Failed to analyze brief");
                                } finally {
                                  setAnalyzingProject(null);
                                }
                              }}
                              disabled={analyzingProject === project.id}
                              className="px-4 py-2 bg-blue-600 rounded-lg text-sm hover:bg-blue-700 transition disabled:opacity-50 w-full"
                            >
                              {analyzingProject === project.id ? "🔍 Analyzing..." : "🔍 Analyze Brief"}
                            </button>

                            {/* Analysis Results Display */}
                            {analysisResults[project.id] && (
                              <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 mt-2">
                                <div className="flex items-center justify-between mb-2">
                                  <h5 className="font-semibold text-blue-300">📊 AI Analysis</h5>
                                  <button 
                                    onClick={() => setAnalysisResults(prev => {
                                      const next = { ...prev };
                                      delete next[project.id];
                                      return next;
                                    })}
                                    className="text-gray-400 hover:text-white text-sm"
                                  >
                                    ✕
                                  </button>
                                </div>
                                <div className="space-y-2 text-sm">
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-400">Type:</span>
                                    <span className="px-2 py-0.5 bg-purple-600 rounded text-white font-medium">
                                      {analysisResults[project.id].projectType}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400">Summary:</span>
                                    <p className="text-white mt-1">{analysisResults[project.id].summary}</p>
                                  </div>
                                  <div>
                                    <span className="text-gray-400">Deliverables:</span>
                                    <ul className="mt-1 space-y-1">
                                      {analysisResults[project.id].deliverables?.map((d: string, i: number) => (
                                        <li key={i} className="text-green-400">✓ {d}</li>
                                      ))}
                                    </ul>
                                  </div>
                                  {analysisResults[project.id].features?.length > 0 && (
                                    <div>
                                      <span className="text-gray-400">Features:</span>
                                      <ul className="mt-1 space-y-1">
                                        {analysisResults[project.id].features?.slice(0, 5).map((f: string, i: number) => (
                                          <li key={i} className="text-gray-300">• {f}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-4 pt-2 text-xs text-gray-400">
                                    <span>Complexity: {analysisResults[project.id].complexity}</span>
                                    <span>~{analysisResults[project.id].estimatedFiles} files</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* AI Build Button */}
                            {project.githubRepo && (
                              <button
                                onClick={async () => {
                                  const analysis = analysisResults[project.id];
                                  const confirmMsg = analysis 
                                    ? `🤖 AI Build: Generate ${analysis.projectType.toUpperCase()}\n\nDeliverables:\n${analysis.deliverables?.map((d: string) => `• ${d}`).join('\n')}\n\nThis will:\n• Generate ~${analysis.estimatedFiles} files using AI\n• Push to GitHub\n• Auto-deploy on Vercel\n\nProceed?`
                                    : `🤖 AI Build: Generate complete application based on the project brief?\n\nThis will:\n• Generate all code files using AI\n• Push to GitHub\n• Auto-deploy on Vercel\n\nTip: Click "Analyze Brief" first to see what will be generated.`;
                                  if (!confirm(confirmMsg)) return;
                                  alert("🤖 AI Build started! This may take 1-2 minutes...");
                                  const res = await fetch("/api/admin/ai-build", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ 
                                      projectId: project.id, 
                                      password: "n01admin2024" 
                                    }),
                                  });
                                  const data = await res.json();
                                  if (data.success) {
                                    alert(`🎉 AI Build Complete!\n\n${data.filesGenerated} files generated and pushed to GitHub!\n\nThe site will auto-deploy on Vercel in ~1 minute.`);
                                    fetchData();
                                  } else {
                                    alert("❌ AI Build Failed: " + (data.error || data.details || "Unknown error"));
                                  }
                                }}
                                className="px-4 py-2 bg-purple-600 rounded-lg text-sm hover:bg-purple-700 transition w-full"
                              >
                                🤖 AI Build (Generate Full App)
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            {/* Automation Control */}
            <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
              <h2 className="text-xl font-semibold mb-6">🤖 Automation System</h2>
              
              <div className="space-y-6">
                <div className="bg-gray-800/50 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-medium">Auto-Progress Engine</h3>
                      <p className="text-gray-400 text-sm">Cron job runs every minute to advance project tasks</p>
                    </div>
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full">
                      Active
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={async () => {
                        const res = await fetch(`/api/cron/progress?force=true&password=${process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "n01admin2024"}`);
                        const data = await res.json();
                        alert(`Processed ${data.summary?.processed || 0} projects\nAdvanced: ${data.summary?.tasksAdvanced || 0} tasks\nCompleted: ${data.summary?.projectsCompleted || 0} projects`);
                        fetchData();
                      }}
                      className="px-4 py-2 bg-blue-600 rounded-lg text-sm hover:bg-blue-700 transition"
                    >
                      ⚡ Run Now
                    </button>
                    <button
                      onClick={async () => {
                        const res = await fetch(`/api/cron/progress?force=true&password=${process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "n01admin2024"}`);
                        const data = await res.json();
                        console.log("Cron status:", data);
                        alert(JSON.stringify(data.summary, null, 2));
                      }}
                      className="px-4 py-2 bg-gray-700 rounded-lg text-sm hover:bg-gray-600 transition"
                    >
                      📊 Check Status
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-800/30 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-400">{projects.filter(p => p.autoProgress).length}</div>
                    <div className="text-sm text-gray-500">Auto-progress enabled</div>
                  </div>
                  <div className="bg-gray-800/30 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-orange-400">{projects.filter(p => p.priority === "rush").length}</div>
                    <div className="text-sm text-gray-500">Rush priority</div>
                  </div>
                  <div className="bg-gray-800/30 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-red-400">{projects.filter(p => p.priority === "urgent").length}</div>
                    <div className="text-sm text-gray-500">Urgent priority</div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-500">
                  <strong>How it works:</strong>
                  <ul className="mt-2 space-y-1 list-disc list-inside">
                    <li><strong>Starter</strong> packages: ~60% faster (simpler projects)</li>
                    <li><strong>Scale/Enterprise</strong>: ~50-100% longer (complex requirements)</li>
                    <li><strong>Rush</strong>: 2x speed multiplier</li>
                    <li><strong>Urgent</strong>: 3x speed multiplier</li>
                    <li>Team load affects speed (more projects = slightly slower each)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Storage Status */}
            <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
              <h2 className="text-xl font-semibold mb-6">💾 Storage Status</h2>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-xl">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  <div>
                    <div className="font-medium">Vercel KV (Redis)</div>
                    <div className="text-sm text-gray-400">Persistent storage active</div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-500">
                  Data persists across deployments and serverless function cold starts.
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
              <h2 className="text-xl font-semibold mb-6">🔗 Quick Links</h2>
              
              <div className="flex flex-wrap gap-4">
                <a 
                  href="https://github.com/clawmvp/n01-app" 
                  target="_blank" 
                  className="px-4 py-2 bg-gray-800 rounded-lg text-sm hover:bg-gray-700 transition"
                >
                  📦 GitHub Repo
                </a>
                <a 
                  href="https://vercel.com/clawmvps-projects/n01-app" 
                  target="_blank" 
                  className="px-4 py-2 bg-gray-800 rounded-lg text-sm hover:bg-gray-700 transition"
                >
                  ▲ Vercel Dashboard
                </a>
                <a 
                  href="https://vercel.com/clawmvps-projects/n01-app/stores" 
                  target="_blank" 
                  className="px-4 py-2 bg-gray-800 rounded-lg text-sm hover:bg-gray-700 transition"
                >
                  🗄️ KV Storage
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Deliverables Edit Modal */}
      {editingDeliverables && (
        <DeliverablesModal
          project={editingDeliverables}
          onClose={() => setEditingDeliverables(null)}
          onSave={() => fetchData()}
        />
      )}
    </div>
  );
}
