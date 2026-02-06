'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'ready' | 'running' | 'error';
  lastRun?: string;
  outputCount?: number;
  icon: string;
}

interface SchedulerStatus {
  pending: number;
  uploaded: number;
  failed: number;
  nextUpload?: string;
}

interface Stats {
  totalVideos: number;
  totalUploads: number;
  scheduledToday: number;
  platforms: { youtube: number; tiktok: number; instagram: number };
}

const PROJECTS: Project[] = [
  { id: 'p1', name: 'Reddit Stories', description: 'Reddit posts → Narrated videos with AI voice', status: 'ready', icon: '📖' },
  { id: 'p2', name: 'Trivia Facts', description: 'AI-generated "Did You Know" fact videos', status: 'ready', icon: '🧠' },
  { id: 'p3', name: 'Long-to-Short', description: 'Convert long videos into 10+ viral shorts', status: 'ready', icon: '✂️' },
  { id: 'p4', name: 'Podcast Clips', description: 'Extract viral moments from podcasts', status: 'ready', icon: '🎙️' },
  { id: 'p5', name: 'Trend Threads', description: 'Google Trends → Twitter/X threads', status: 'ready', icon: '📈' },
  { id: 'p6', name: 'Satisfying Content', description: 'Curate satisfying videos from Reddit', status: 'ready', icon: '😌' },
  { id: 'p7', name: 'Movie Clips', description: 'Memorable movie scenes → shorts', status: 'ready', icon: '🎬' },
  { id: 'p8', name: 'Evergreen Recycler', description: 'Research & download viral videos', status: 'ready', icon: '♻️' },
  { id: 'p9', name: 'Language Arbitrage', description: 'Translate videos to other languages', status: 'ready', icon: '🌍' },
  { id: 'p9-batch', name: 'Batch Translate', description: '1 video → 10 languages automatically', status: 'ready', icon: '🌐' },
  { id: 'thumbnails', name: 'Auto Thumbnails', description: 'Generate viral thumbnails with DALL-E', status: 'ready', icon: '🖼️' },
  { id: 'rss-monitor', name: 'RSS Monitor', description: 'Auto-watch podcasts for new episodes', status: 'ready', icon: '📡' },
];

export default function ContentStudioPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'scheduler'>('dashboard');
  const [schedulerStatus, setSchedulerStatus] = useState<SchedulerStatus>({ pending: 0, uploaded: 0, failed: 0 });
  const [stats, setStats] = useState<Stats>({
    totalVideos: 0,
    totalUploads: 0,
    scheduledToday: 0,
    platforms: { youtube: 0, tiktok: 0, instagram: 0 },
  });
  const [loading, setLoading] = useState(false);
  const [runningProject, setRunningProject] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const res = await fetch('/api/content-studio/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setSchedulerStatus(data.scheduler);
      }
    } catch (e) {
      console.error('Failed to fetch stats:', e);
    }
  }

  async function runProject(projectId: string) {
    setRunningProject(projectId);
    setLoading(true);
    try {
      const res = await fetch('/api/content-studio/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`✅ ${data.message}`);
        fetchStats();
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (e) {
      alert('❌ Failed to run project');
    } finally {
      setLoading(false);
      setRunningProject(null);
    }
  }

  async function runScheduler() {
    setLoading(true);
    try {
      const res = await fetch('/api/content-studio/scheduler', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert(`✅ Scheduler executed! Uploaded: ${data.uploaded}`);
        fetchStats();
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (e) {
      alert('❌ Failed to run scheduler');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎬</span>
            <div>
              <h1 className="text-2xl font-bold">Content Studio</h1>
              <p className="text-sm text-gray-400">AI-Powered Video Generation Hub</p>
            </div>
          </div>
          <Link href="/admin" className="text-sm text-gray-400 hover:text-white">
            ← Back to Admin
          </Link>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="border-b border-white/10 bg-black/10">
        <div className="max-w-7xl mx-auto px-4 flex gap-1">
          {['dashboard', 'projects', 'scheduler'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as typeof activeTab)}
              className={`px-4 py-3 font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
          <Link
            href="/content-studio/analytics"
            className="px-4 py-3 font-medium capitalize text-gray-400 hover:text-white transition-colors"
          >
            📊 Analytics
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard
                label="Total Videos"
                value={stats.totalVideos}
                icon="🎥"
                color="blue"
              />
              <StatCard
                label="Uploaded"
                value={stats.totalUploads}
                icon="✅"
                color="green"
              />
              <StatCard
                label="Scheduled Today"
                value={stats.scheduledToday}
                icon="📅"
                color="purple"
              />
              <StatCard
                label="Pending"
                value={schedulerStatus.pending}
                icon="⏳"
                color="yellow"
              />
            </div>

            {/* Quick Actions */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ActionButton
                  label="Run Scheduler"
                  icon="🚀"
                  onClick={runScheduler}
                  loading={loading}
                />
                <ActionButton
                  label="Generate Shorts"
                  icon="✂️"
                  onClick={() => runProject('p3')}
                  loading={runningProject === 'p3'}
                />
                <ActionButton
                  label="Download Viral"
                  icon="⬇️"
                  onClick={() => runProject('p8')}
                  loading={runningProject === 'p8'}
                />
                <ActionButton
                  label="RSS Monitor"
                  icon="📡"
                  onClick={() => runProject('rss-monitor')}
                  loading={runningProject === 'rss-monitor'}
                />
                <ActionButton
                  label="Batch Translate"
                  icon="🌐"
                  onClick={() => runProject('p9-batch')}
                  loading={runningProject === 'p9-batch'}
                />
                <ActionButton
                  label="Auto Thumbnails"
                  icon="🖼️"
                  onClick={() => runProject('thumbnails')}
                  loading={runningProject === 'thumbnails'}
                />
                <ActionButton
                  label="Refresh Stats"
                  icon="🔄"
                  onClick={fetchStats}
                />
              </div>
            </div>

            {/* Platform Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <PlatformCard
                name="YouTube"
                icon="📺"
                uploads={stats.platforms.youtube}
                status="connected"
              />
              <PlatformCard
                name="TikTok"
                icon="🎵"
                uploads={stats.platforms.tiktok}
                status="connected"
              />
              <PlatformCard
                name="Instagram"
                icon="📷"
                uploads={stats.platforms.instagram}
                status="pending"
              />
            </div>
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">AI Content Generators</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {PROJECTS.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onRun={() => runProject(project.id)}
                  loading={runningProject === project.id}
                />
              ))}
            </div>
          </div>
        )}

        {/* Scheduler Tab */}
        {activeTab === 'scheduler' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">YouTube Scheduler</h2>
              <button
                onClick={runScheduler}
                disabled={loading}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium disabled:opacity-50"
              >
                {loading ? 'Running...' : '🚀 Run Now'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-6 text-center">
                <div className="text-4xl font-bold text-green-400">{schedulerStatus.uploaded}</div>
                <div className="text-sm text-gray-400">Uploaded</div>
              </div>
              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-6 text-center">
                <div className="text-4xl font-bold text-yellow-400">{schedulerStatus.pending}</div>
                <div className="text-sm text-gray-400">Pending</div>
              </div>
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-6 text-center">
                <div className="text-4xl font-bold text-red-400">{schedulerStatus.failed}</div>
                <div className="text-sm text-gray-400">Failed</div>
              </div>
            </div>

            {schedulerStatus.nextUpload && (
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold mb-2">Next Upload</h3>
                <p className="text-gray-400">{schedulerStatus.nextUpload}</p>
              </div>
            )}

            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold mb-4">Cron Setup</h3>
              <pre className="bg-black/40 rounded-lg p-4 text-sm text-green-400 overflow-x-auto">
                {`# Run every 30 minutes
*/30 * * * * cd /Volumes/500GB-BK/cursor-ai/ai-money-projects/automation && npx tsx youtube-scheduler.ts run`}
              </pre>
              <p className="text-sm text-gray-400 mt-2">
                Or run: <code className="bg-black/40 px-2 py-1 rounded">bash setup-cron.sh</code>
              </p>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
  const colorClasses: Record<string, string> = {
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
    green: 'from-green-500/20 to-green-600/20 border-green-500/30',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
    yellow: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">{label}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}

function ActionButton({ label, icon, onClick, loading }: { label: string; icon: string; onClick: () => void; loading?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
    >
      <span>{loading ? '⏳' : icon}</span>
      <span>{label}</span>
    </button>
  );
}

function PlatformCard({ name, icon, uploads, status }: { name: string; icon: string; uploads: number; status: 'connected' | 'pending' }) {
  return (
    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{icon}</span>
        <div>
          <h3 className="font-semibold">{name}</h3>
          <span className={`text-xs px-2 py-0.5 rounded-full ${status === 'connected' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
            {status}
          </span>
        </div>
      </div>
      <div className="text-2xl font-bold">{uploads} uploads</div>
    </div>
  );
}

function ProjectCard({ project, onRun, loading }: { project: Project; onRun: () => void; loading: boolean }) {
  return (
    <div className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-purple-500/50 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{project.icon}</span>
          <div>
            <h3 className="font-semibold">{project.name}</h3>
            <span className="text-xs text-gray-500 uppercase">{project.id}</span>
          </div>
        </div>
      </div>
      <p className="text-sm text-gray-400 mb-4">{project.description}</p>
      <button
        onClick={onRun}
        disabled={loading}
        className="w-full py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium disabled:opacity-50 transition-colors"
      >
        {loading ? '⏳ Running...' : '▶️ Run'}
      </button>
    </div>
  );
}
