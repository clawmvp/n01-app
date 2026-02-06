'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface AnalyticsData {
  overview: {
    totalVideos: number;
    totalSizeMB: number;
    videosToday: number;
    videosThisWeek: number;
  };
  byProject: Record<string, { count: number; sizeMB: number }>;
  recentVideos: {
    name: string;
    project: string;
    size: number;
    created: string;
  }[];
  uploadHistory: {
    date: string;
    count: number;
  }[];
  scheduler: {
    pending: number;
    uploaded: number;
    failed: number;
    schedule: any[];
  };
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    setLoading(true);
    try {
      const res = await fetch('/api/content-studio/analytics');
      if (!res.ok) throw new Error('Failed to fetch');
      const analytics = await res.json();
      setData(analytics);
    } catch (e) {
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">📊</div>
          <p className="text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl">{error || 'No data'}</p>
          <button onClick={fetchAnalytics} className="mt-4 px-4 py-2 bg-purple-600 rounded-lg">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const maxCount = Math.max(...data.uploadHistory.map(h => h.count), 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📊</span>
            <div>
              <h1 className="text-2xl font-bold">Analytics</h1>
              <p className="text-sm text-gray-400">Content Performance Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={fetchAnalytics} className="text-gray-400 hover:text-white">
              🔄 Refresh
            </button>
            <Link href="/content-studio" className="text-sm text-gray-400 hover:text-white">
              ← Back to Studio
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total Videos"
            value={data.overview.totalVideos}
            icon="🎬"
            subtext={`${data.overview.totalSizeMB} MB total`}
          />
          <StatCard
            label="Videos Today"
            value={data.overview.videosToday}
            icon="📅"
            subtext="New today"
          />
          <StatCard
            label="This Week"
            value={data.overview.videosThisWeek}
            icon="📈"
            subtext="Last 7 days"
          />
          <StatCard
            label="Scheduled"
            value={data.scheduler.pending}
            icon="⏳"
            subtext={`${data.scheduler.uploaded} uploaded`}
          />
        </div>

        {/* Upload History Chart */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h2 className="text-xl font-semibold mb-4">Upload History (7 Days)</h2>
          <div className="flex items-end gap-2 h-40">
            {data.uploadHistory.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-purple-500 rounded-t transition-all hover:bg-purple-400"
                  style={{ height: `${(day.count / maxCount) * 100}%`, minHeight: day.count > 0 ? '8px' : '2px' }}
                />
                <div className="mt-2 text-xs text-gray-400">
                  {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                </div>
                <div className="text-sm font-medium">{day.count}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* By Project */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold mb-4">Videos by Project</h2>
            <div className="space-y-3">
              {Object.entries(data.byProject)
                .sort((a, b) => b[1].count - a[1].count)
                .map(([project, stats]) => (
                  <div key={project} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getProjectIcon(project)}</span>
                      <span>{project}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{stats.count} videos</div>
                      <div className="text-xs text-gray-400">{stats.sizeMB} MB</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Recent Videos */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold mb-4">Recent Videos</h2>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {data.recentVideos.map((video, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-white/5">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate">{video.name}</div>
                    <div className="text-xs text-gray-400">{video.project}</div>
                  </div>
                  <div className="text-right text-xs text-gray-400 ml-4">
                    <div>{video.size} MB</div>
                    <div>{formatDate(video.created)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scheduler Status */}
        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
          <h2 className="text-xl font-semibold mb-4">Scheduler Queue</h2>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-yellow-400">{data.scheduler.pending}</div>
              <div className="text-sm text-gray-400">Pending</div>
            </div>
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-400">{data.scheduler.uploaded}</div>
              <div className="text-sm text-gray-400">Uploaded</div>
            </div>
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-red-400">{data.scheduler.failed}</div>
              <div className="text-sm text-gray-400">Failed</div>
            </div>
          </div>
          
          {data.scheduler.schedule.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Upcoming Schedule</h3>
              <div className="space-y-1 text-sm">
                {data.scheduler.schedule.slice(0, 5).map((item: any, i: number) => (
                  <div key={i} className="flex justify-between py-1 border-b border-white/5">
                    <span className="truncate flex-1">{item.title}</span>
                    <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
                      item.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      item.status === 'uploaded' ? 'bg-green-500/20 text-green-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* YouTube Monetization Progress */}
        <div className="bg-gradient-to-r from-red-500/20 to-purple-500/20 rounded-xl p-6 border border-white/10">
          <h2 className="text-xl font-semibold mb-4">🎯 YouTube Monetization Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between mb-2">
                <span>Subscribers</span>
                <span className="text-gray-400">? / 1,000</span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-red-500 to-pink-500" style={{ width: '0%' }} />
              </div>
              <p className="text-xs text-gray-400 mt-1">Connect YouTube Analytics for live data</p>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span>Watch Hours</span>
                <span className="text-gray-400">? / 4,000</span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500" style={{ width: '0%' }} />
              </div>
              <p className="text-xs text-gray-400 mt-1">Requires YouTube API integration</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, icon, subtext }: { label: string; value: number; icon: string; subtext: string }) {
  return (
    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400">{label}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{subtext}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}

function getProjectIcon(project: string): string {
  const icons: Record<string, string> = {
    'P1 Reddit': '📖',
    'P2 Trivia': '🧠',
    'P3 Long-to-Short': '✂️',
    'P4 Podcast': '🎙️',
    'P5 Trends': '📈',
    'P6 Satisfying': '😌',
    'P7 Movies': '🎬',
    'P8 Recycler': '♻️',
    'P9 Translation': '🌍',
    'P9 Batch': '🌐',
    'Downloads': '⬇️',
    'Thumbnails': '🖼️',
  };
  return icons[project] || '📁';
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString();
}
