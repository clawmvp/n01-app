"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

interface ProjectTask {
  id: string;
  agent: string;
  title: string;
  status: "pending" | "in_progress" | "completed";
  completedAt?: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  packageType: string;
  status: string;
  createdAt: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  currentAgent?: string;
  tasks: ProjectTask[];
  revisionCount: number;
  maxRevisions: number;
  clientName: string;
  githubRepo?: string;
  vercelUrl?: string;
  previewUrl?: string;
  zipUrl?: string;
}

const AGENT_INFO: Record<string, { name: string; role: string; avatar: string; color: string }> = {
  NOVA: { name: "NOVA", role: "Orchestrator", avatar: "/team/avatar-nova.png", color: "blue" },
  ATLAS: { name: "ATLAS", role: "Architect", avatar: "/team/avatar-atlas.png", color: "purple" },
  PIXEL: { name: "PIXEL", role: "Designer", avatar: "/team/avatar-pixel.png", color: "pink" },
  NEXUS: { name: "NEXUS", role: "Backend Dev", avatar: "/team/avatar-nexus.png", color: "green" },
  VECTOR: { name: "VECTOR", role: "QA Engineer", avatar: "/team/avatar-vector.png", color: "yellow" },
  CIPHER: { name: "CIPHER", role: "DevOps", avatar: "/team/avatar-cipher.png", color: "orange" },
  SENTINEL: { name: "SENTINEL", role: "Security", avatar: "/team/avatar-sentinel.png", color: "red" },
  PRISM: { name: "PRISM", role: "Marketing", avatar: "/team/avatar-prism.png", color: "cyan" },
};

export default function ProjectTrackingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const projectId = params.id as string;
  const accessToken = searchParams.get("token");
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        // Include token in request if available
        const tokenParam = accessToken ? `?token=${accessToken}` : "";
        const res = await fetch(`/api/project/${projectId}${tokenParam}`);
        const data = await res.json();
        
        if (res.status === 401 || res.status === 403) {
          setAuthError(data.error || "This project requires authentication");
          setLoading(false);
          return;
        }
        
        if (data.project) {
          setProject(data.project);
          setAuthError(null);
        }
      } catch (error) {
        console.error("Failed to fetch project:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchProject, 30000);
    return () => clearInterval(interval);
  }, [projectId, accessToken]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted">Loading your project...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">🔐</span>
          </div>
          <h1 className="text-2xl font-bold mb-4">Access Restricted</h1>
          <p className="text-muted mb-6">{authError}</p>
          <p className="text-sm text-muted mb-6">
            If you&apos;re the project owner, please use the secure link sent to your email.
          </p>
          <Link href="/" className="text-accent hover:underline">
            Go to homepage
          </Link>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
          <p className="text-muted mb-6">This project link may be invalid or expired.</p>
          <Link href="/" className="text-accent hover:underline">
            Go to homepage
          </Link>
        </div>
      </div>
    );
  }

  const completedTasks = project.tasks.filter(t => t.status === "completed").length;
  const progress = Math.round((completedTasks / project.tasks.length) * 100);
  const currentAgent = project.currentAgent ? AGENT_INFO[project.currentAgent] : null;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      planning: "bg-blue-500",
      designing: "bg-purple-500",
      developing: "bg-orange-500",
      testing: "bg-yellow-500",
      review: "bg-cyan-500",
      revisions: "bg-pink-500",
      deploying: "bg-indigo-500",
      delivered: "bg-teal-500",
      completed: "bg-green-500",
    };
    return colors[status] || "bg-gray-500";
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-foreground/10 bg-background/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            n01<span className="text-accent">.app</span>
          </Link>
          <span className="text-sm text-muted">Project Tracking</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Project Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className={`px-3 py-1 text-xs font-medium text-white rounded-full ${getStatusColor(project.status)}`}>
              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            </span>
            <span className="text-sm text-muted">ID: {project.id}</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
          <p className="text-muted">Hi {project.clientName}! Here&apos;s your project progress.</p>
        </div>

        {/* Progress Bar */}
        <div className="bg-foreground/5 rounded-2xl p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">Overall Progress</h2>
            <span className="text-2xl font-bold text-accent">{progress}%</span>
          </div>
          <div className="h-4 bg-foreground/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-accent to-purple-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-muted mt-2">
            <span>{completedTasks} of {project.tasks.length} tasks completed</span>
            {project.estimatedDelivery && (
              <span>Est. delivery: {new Date(project.estimatedDelivery).toLocaleDateString()}</span>
            )}
          </div>
        </div>

        {/* Current Agent */}
        {currentAgent && project.status !== "completed" && project.status !== "delivered" && (
          <div className="bg-gradient-to-r from-accent/10 to-purple-500/10 rounded-2xl p-6 mb-8 border border-accent/20">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-foreground/10">
                <Image 
                  src={currentAgent.avatar} 
                  alt={currentAgent.name}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-sm text-muted">Currently working</p>
                <h3 className="text-xl font-semibold">{currentAgent.name}</h3>
                <p className="text-sm text-accent">{currentAgent.role}</p>
              </div>
              <div className="ml-auto">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-sm text-green-500">Active</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Deliverables Section - Always show for delivered/completed */}
        {(project.status === "delivered" || project.status === "completed" || project.previewUrl || project.vercelUrl || project.githubRepo) && (
          <div className="bg-gradient-to-br from-green-500/10 to-teal-500/10 border border-green-500/20 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🎉</span>
              <h2 className="font-semibold text-lg">Your Deliverables</h2>
            </div>
            
            {(project.previewUrl || project.vercelUrl || project.githubRepo) ? (
              <div className="grid gap-3">
                {project.vercelUrl && (
                  <a href={project.vercelUrl} target="_blank" rel="noopener noreferrer" 
                     className="flex items-center gap-4 p-4 bg-background/80 rounded-xl hover:bg-background transition-colors border border-green-500/10">
                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">🌐</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Live Website</p>
                      <p className="text-sm text-green-400 truncate">{project.vercelUrl}</p>
                    </div>
                    <span className="text-muted">→</span>
                  </a>
                )}
                {project.previewUrl && project.previewUrl !== project.vercelUrl && (
                  <a href={project.previewUrl} target="_blank" rel="noopener noreferrer" 
                     className="flex items-center gap-4 p-4 bg-background/80 rounded-xl hover:bg-background transition-colors border border-cyan-500/10">
                    <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">👀</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Preview</p>
                      <p className="text-sm text-muted">See your project in action</p>
                    </div>
                    <span className="text-muted">→</span>
                  </a>
                )}
                {project.githubRepo && (
                  <>
                    <a href={project.githubRepo} target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-4 p-4 bg-background/80 rounded-xl hover:bg-background transition-colors border border-blue-500/10">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                        <span className="text-2xl">📦</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Source Code</p>
                        <p className="text-sm text-blue-400 truncate">{project.githubRepo.replace("https://github.com/", "")}</p>
                      </div>
                      <span className="text-muted">→</span>
                    </a>
                    <a href={`${project.githubRepo}/archive/refs/heads/main.zip`} target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-4 p-4 bg-background/80 rounded-xl hover:bg-background transition-colors border border-purple-500/10">
                      <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                        <span className="text-2xl">📥</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Download ZIP</p>
                        <p className="text-sm text-muted">Get the complete source code</p>
                      </div>
                      <span className="text-muted">↓</span>
                    </a>
                  </>
                )}
              </div>
            ) : (
              <div className="text-center py-6 bg-background/50 rounded-xl">
                <p className="text-muted">Your deliverables are being prepared...</p>
                <p className="text-sm text-muted mt-2">Check back soon or contact us at ai@n01.app</p>
              </div>
            )}
          </div>
        )}

        {/* Task Timeline */}
        <div className="bg-foreground/5 rounded-2xl p-6 mb-8">
          <h2 className="font-semibold mb-6">📋 Task Progress</h2>
          <div className="space-y-4">
            {project.tasks.map((task, index) => {
              const agent = AGENT_INFO[task.agent];
              return (
                <div key={task.id} className="flex items-start gap-4">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                      task.status === "completed" ? "bg-green-500" :
                      task.status === "in_progress" ? "bg-accent animate-pulse" :
                      "bg-foreground/20"
                    }`}>
                      {task.status === "completed" ? "✓" : index + 1}
                    </div>
                    {index < project.tasks.length - 1 && (
                      <div className={`w-0.5 h-12 ${
                        task.status === "completed" ? "bg-green-500" : "bg-foreground/10"
                      }`} />
                    )}
                  </div>
                  
                  {/* Task content */}
                  <div className="flex-1 pb-8">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        task.status === "completed" ? "bg-green-500/10 text-green-500" :
                        task.status === "in_progress" ? "bg-accent/10 text-accent" :
                        "bg-foreground/10 text-muted"
                      }`}>
                        {task.agent}
                      </span>
                      {task.status === "in_progress" && (
                        <span className="text-xs text-accent">In progress...</span>
                      )}
                    </div>
                    <p className={task.status === "pending" ? "text-muted" : ""}>
                      {task.title.split(":")[1]?.trim() || task.title}
                    </p>
                    {task.completedAt && (
                      <p className="text-xs text-muted mt-1">
                        Completed {new Date(task.completedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revision Info */}
        <div className="bg-foreground/5 rounded-2xl p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-semibold">✏️ Revisions</h2>
              <p className="text-sm text-muted">Request changes after delivery</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{project.maxRevisions - project.revisionCount}</p>
              <p className="text-sm text-muted">rounds remaining</p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="text-center text-sm text-muted">
          <p>
            Questions? Chat with{" "}
            <Link href="/" className="text-accent hover:underline">ARIA</Link>
            {" "}or email{" "}
            <a href="mailto:ai@n01.app" className="text-accent hover:underline">ai@n01.app</a>
          </p>
        </div>
      </main>
    </div>
  );
}
