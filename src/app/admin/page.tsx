"use client";

import { useState, useEffect } from "react";
import { Lead } from "@/lib/leads";

export default function AdminPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [sendingPayment, setSendingPayment] = useState<string | null>(null);

  const authenticate = () => {
    // Simple password check - in production use proper auth
    if (password === "n01admin2024") {
      setAuthenticated(true);
      localStorage.setItem("admin_auth", "true");
      fetchLeads();
    } else {
      setError("Invalid password");
    }
  };

  const fetchLeads = async () => {
    try {
      const res = await fetch("/api/admin/leads");
      const data = await res.json();
      setLeads(data.leads || []);
    } catch (err) {
      console.error("Failed to fetch leads:", err);
    } finally {
      setLoading(false);
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
        fetchLeads();
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

  const updateStatus = async (leadId: string, status: Lead["status"]) => {
    try {
      await fetch("/api/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, status }),
      });
      fetchLeads();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("admin_auth") === "true") {
      setAuthenticated(true);
      fetchLeads();
    } else {
      setLoading(false);
    }
  }, []);

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-2xl max-w-md w-full">
          <h1 className="text-2xl font-bold mb-6">Admin Login</h1>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && authenticate()}
            placeholder="Enter admin password"
            className="w-full px-4 py-3 bg-gray-700 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">n01.app Admin</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-400">{leads.length} leads</span>
            <button
              onClick={() => {
                localStorage.removeItem("admin_auth");
                setAuthenticated(false);
              }}
              className="text-sm text-gray-400 hover:text-white"
            >
              Logout
            </button>
          </div>
        </div>

        {leads.length === 0 ? (
          <div className="bg-gray-800 rounded-2xl p-12 text-center">
            <p className="text-gray-400">No leads yet. They will appear here when someone submits a form.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {leads.map((lead) => (
              <div key={lead.id} className="bg-gray-800 rounded-2xl p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-xl font-semibold">{lead.name}</h2>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          lead.status === "new"
                            ? "bg-green-500/20 text-green-400"
                            : lead.status === "contacted"
                            ? "bg-blue-500/20 text-blue-400"
                            : lead.status === "paid"
                            ? "bg-purple-500/20 text-purple-400"
                            : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {lead.status}
                      </span>
                      <span className="px-2 py-1 text-xs bg-gray-700 rounded-full">
                        {lead.selectedPackage}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <span className="text-gray-400">Email:</span>{" "}
                        <a href={`mailto:${lead.email}`} className="text-blue-400 hover:underline">
                          {lead.email}
                        </a>
                      </div>
                      <div>
                        <span className="text-gray-400">Phone:</span>{" "}
                        <span>{lead.phone}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Contact via:</span>{" "}
                        <span className={lead.preferredContact === "whatsapp" ? "text-green-400" : ""}>
                          {lead.preferredContact}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Date:</span>{" "}
                        <span>{new Date(lead.createdAt).toLocaleString()}</span>
                      </div>
                    </div>

                    {lead.projectDescription && (
                      <div className="bg-gray-700/50 p-4 rounded-xl mb-4">
                        <p className="text-sm text-gray-300">{lead.projectDescription}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    {/* WhatsApp button */}
                    <a
                      href={`https://wa.me/${lead.phone.replace(/[\s\-\(\)\+]/g, "")}?text=${encodeURIComponent(
                        `Hi ${lead.name}! This is the n01.app team. Thanks for your interest in our ${lead.selectedPackage} package. I'd love to discuss your project!`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 rounded-xl text-sm font-medium hover:bg-green-700 transition"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      WhatsApp
                    </a>

                    {/* Send payment link */}
                    <button
                      onClick={() => sendPaymentLink(lead)}
                      disabled={sendingPayment === lead.id}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 rounded-xl text-sm font-medium hover:bg-purple-700 transition disabled:opacity-50"
                    >
                      {sendingPayment === lead.id ? "Sending..." : "💳 Stripe Link"}
                    </button>

                    {/* Crypto payment link */}
                    <button
                      onClick={() => {
                        const url = `${window.location.origin}/pay/${lead.id}`;
                        navigator.clipboard.writeText(url);
                        alert(`Crypto payment link copied!\n\n${url}`);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-600 rounded-xl text-sm font-medium hover:bg-orange-700 transition"
                    >
                      🪙 Copy Crypto Link
                    </button>

                    {/* Status dropdown */}
                    <select
                      value={lead.status}
                      onChange={(e) => updateStatus(lead.id, e.target.value as Lead["status"])}
                      className="px-4 py-2 bg-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
