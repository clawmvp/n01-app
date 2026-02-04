"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  projectDescription: string;
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
  status: "pending" | "in_progress" | "completed";
}

interface Project {
  id: string;
  name: string;
  status: string;
  packageType: string;
  price: number;
  githubRepo?: string;
  vercelUrl?: string;
  previewUrl?: string;
  createdAt: string;
  estimatedDelivery?: string;
  currentAgent?: string;
  tasks: ProjectTask[];
  clientEmail: string;
  clientName: string;
}

type Tab = "leads" | "projects" | "settings";

export default function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("leads");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingPayment, setSendingPayment] = useState<string | null>(null);

  const authenticate = () => {
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || password === "n01admin2024") {
      setAuthenticated(true);
      localStorage.setItem("admin_auth", "true");
      fetchData();
    } else {
      setError("Invalid password");
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [leadsRes, projectsRes] = await Promise.all([
        fetch("/api/admin/leads"),
        fetch("/api/admin/projects").catch(() => ({ json: () => ({ projects: [] }) })),
      ]);
      
      const leadsData = await leadsRes.json();
      const projectsData = await projectsRes.json();
      
      setLeads(leadsData.leads || []);
      setProjects(projectsData.projects || []);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

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
    activeProjects: projects.filter(p => p.status === "IN_PROGRESS").length,
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
            <button onClick={fetchData} className="text-gray-400 hover:text-white transition">
              ↻ Refresh
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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
            <div className="text-gray-400 text-sm mt-1">Paid</div>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="text-3xl font-bold text-orange-500">{stats.activeProjects}</div>
            <div className="text-gray-400 text-sm mt-1">Active Projects</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-900 p-1 rounded-xl w-fit">
          {(["leads", "projects", "settings"] as Tab[]).map((tab) => (
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

                      {lead.projectDescription && (
                        <div className="bg-gray-800/50 p-4 rounded-xl text-sm text-gray-300">
                          {lead.projectDescription}
                        </div>
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
                      <div className="flex gap-2">
                        <a
                          href={`/project/${project.id}`}
                          target="_blank"
                          className="px-3 py-2 bg-gray-800 rounded-lg text-sm hover:bg-gray-700 transition"
                        >
                          👀 Client View
                        </a>
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
                          ⏭ Advance Task
                        </button>
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

                    {/* Current Agent */}
                    {project.currentAgent && (
                      <div className="flex items-center gap-2 mb-4 p-3 bg-gray-800/50 rounded-lg">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-sm">
                          <strong>{project.currentAgent}</strong> is currently working
                        </span>
                      </div>
                    )}

                    {/* Tasks */}
                    {project.tasks && (
                      <div className="space-y-2">
                        {project.tasks.map((task: ProjectTask, idx: number) => (
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
                              task.status === "in_progress" ? "bg-blue-500 text-white" :
                              "bg-gray-700 text-gray-400"
                            }`}>
                              {task.status === "completed" ? "✓" : idx + 1}
                            </span>
                            <span className={`flex-1 text-sm ${task.status === "pending" ? "text-gray-500" : ""}`}>
                              {task.title}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              task.status === "completed" ? "text-green-400" :
                              task.status === "in_progress" ? "text-blue-400" :
                              "text-gray-500"
                            }`}>
                              {task.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Links */}
                    {(project.githubRepo || project.vercelUrl || project.previewUrl) && (
                      <div className="mt-4 pt-4 border-t border-gray-800 flex gap-4 text-sm">
                        {project.previewUrl && (
                          <a href={project.previewUrl} target="_blank" className="text-cyan-400 hover:underline">
                            👀 Preview
                          </a>
                        )}
                        {project.vercelUrl && (
                          <a href={project.vercelUrl} target="_blank" className="text-green-400 hover:underline">
                            🌐 Live
                          </a>
                        )}
                        {project.githubRepo && (
                          <a href={project.githubRepo} target="_blank" className="text-blue-400 hover:underline">
                            📦 GitHub
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
            <h2 className="text-xl font-semibold mb-6">Settings</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Database Status</h3>
                <p className="text-gray-400 text-sm">
                  {process.env.DATABASE_URL ? (
                    <span className="text-green-400">✓ Database connected</span>
                  ) : (
                    <span className="text-yellow-400">⚠ Using in-memory storage (data resets on deploy)</span>
                  )}
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-2">Setup Database</h3>
                <p className="text-gray-400 text-sm mb-4">
                  For persistent storage, add a PostgreSQL database:
                </p>
                <ol className="text-sm text-gray-400 list-decimal list-inside space-y-2">
                  <li>Create a free database at <a href="https://supabase.com" target="_blank" className="text-blue-400">Supabase</a> or <a href="https://neon.tech" target="_blank" className="text-blue-400">Neon</a></li>
                  <li>Copy the connection string</li>
                  <li>Add to Vercel: <code className="bg-gray-800 px-2 py-1 rounded">DATABASE_URL=your_connection_string</code></li>
                  <li>Run migrations: <code className="bg-gray-800 px-2 py-1 rounded">npx prisma db push</code></li>
                </ol>
              </div>

              <div>
                <h3 className="font-medium mb-2">Quick Links</h3>
                <div className="flex gap-4">
                  <a href="https://github.com/clawmvp/n01-app" target="_blank" className="text-blue-400 hover:underline text-sm">
                    GitHub Repo
                  </a>
                  <a href="https://vercel.com/clawmvps-projects/n01-app" target="_blank" className="text-blue-400 hover:underline text-sm">
                    Vercel Dashboard
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
