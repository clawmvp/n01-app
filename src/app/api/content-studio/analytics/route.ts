import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

const BASE_PATH = '/Volumes/500GB-BK/cursor-ai/ai-money-projects';

interface VideoStats {
  name: string;
  path: string;
  size: number;
  created: Date;
  project: string;
}

interface AnalyticsData {
  overview: {
    totalVideos: number;
    totalSizeMB: number;
    videosToday: number;
    videosThisWeek: number;
  };
  byProject: Record<string, { count: number; sizeMB: number }>;
  recentVideos: VideoStats[];
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

function scanDirectory(dir: string, projectName: string): VideoStats[] {
  const videos: VideoStats[] = [];
  
  try {
    if (!fs.existsSync(dir)) return videos;
    
    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (file.endsWith('.mp4')) {
        const fullPath = path.join(dir, file);
        const stats = fs.statSync(fullPath);
        videos.push({
          name: file,
          path: fullPath,
          size: stats.size,
          created: stats.birthtime,
          project: projectName,
        });
      }
    }
  } catch (e) {
    console.error(`Error scanning ${dir}:`, e);
  }
  
  return videos;
}

export async function GET() {
  try {
    // Check if we're running locally (has access to local files)
    const isLocal = fs.existsSync(BASE_PATH);
    
    if (!isLocal) {
      // Return demo data for cloud deployment
      return NextResponse.json({
        overview: {
          totalVideos: 47,
          totalSizeMB: 892,
          videosToday: 0,
          videosThisWeek: 12,
        },
        byProject: {
          'P3 Long-to-Short': { count: 15, sizeMB: 245 },
          'P6 Satisfying': { count: 10, sizeMB: 198 },
          'P8 Recycler': { count: 8, sizeMB: 156 },
          'Downloads': { count: 6, sizeMB: 134 },
          'P4 Podcast': { count: 5, sizeMB: 98 },
          'P9 Translation': { count: 3, sizeMB: 61 },
        },
        recentVideos: [
          { name: 'clip_0.mp4', project: 'P3 Long-to-Short', size: 2.7, created: new Date().toISOString() },
          { name: 'satisfying_48AnACeIXwQ.mp4', project: 'P8 Recycler', size: 4.3, created: new Date().toISOString() },
        ],
        uploadHistory: [
          { date: new Date(Date.now() - 6*24*60*60*1000).toISOString().split('T')[0], count: 2 },
          { date: new Date(Date.now() - 5*24*60*60*1000).toISOString().split('T')[0], count: 4 },
          { date: new Date(Date.now() - 4*24*60*60*1000).toISOString().split('T')[0], count: 1 },
          { date: new Date(Date.now() - 3*24*60*60*1000).toISOString().split('T')[0], count: 3 },
          { date: new Date(Date.now() - 2*24*60*60*1000).toISOString().split('T')[0], count: 2 },
          { date: new Date(Date.now() - 1*24*60*60*1000).toISOString().split('T')[0], count: 0 },
          { date: new Date().toISOString().split('T')[0], count: 0 },
        ],
        scheduler: { pending: 26, uploaded: 2, failed: 0, schedule: [] },
        isDemo: true,
        message: 'Running on Vercel - showing demo data. Run locally for real stats.',
      });
    }
    
    // Scan all output directories
    const outputDirs: { dir: string; project: string }[] = [
      { dir: 'examples/output/reddit-v2', project: 'P1 Reddit' },
      { dir: 'examples/output/trivia-v2', project: 'P2 Trivia' },
      { dir: 'examples/output/p3-v3', project: 'P3 Long-to-Short' },
      { dir: 'examples/output/p4-podcast-v2', project: 'P4 Podcast' },
      { dir: 'examples/output/p5-trend-threads', project: 'P5 Trends' },
      { dir: 'examples/output/p6-v3', project: 'P6 Satisfying' },
      { dir: 'p7-movie-clips/output', project: 'P7 Movies' },
      { dir: 'p8-evergreen-recycler/viral-research/verified', project: 'P8 Recycler' },
      { dir: 'p9-language-arbitrage/output', project: 'P9 Translation' },
      { dir: 'p9-language-arbitrage/batch-output', project: 'P9 Batch' },
      { dir: 'shorts-downloads', project: 'Downloads' },
      { dir: 'automation/thumbnails', project: 'Thumbnails' },
    ];
    
    let allVideos: VideoStats[] = [];
    const byProject: Record<string, { count: number; sizeMB: number }> = {};
    
    for (const { dir, project } of outputDirs) {
      const fullDir = path.join(BASE_PATH, dir);
      const videos = scanDirectory(fullDir, project);
      allVideos = allVideos.concat(videos);
      
      if (videos.length > 0) {
        byProject[project] = {
          count: videos.length,
          sizeMB: Math.round(videos.reduce((sum, v) => sum + v.size, 0) / 1024 / 1024),
        };
      }
    }
    
    // Calculate overview
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const totalSizeMB = Math.round(allVideos.reduce((sum, v) => sum + v.size, 0) / 1024 / 1024);
    const videosToday = allVideos.filter(v => new Date(v.created) >= today).length;
    const videosThisWeek = allVideos.filter(v => new Date(v.created) >= weekAgo).length;
    
    // Recent videos (last 20)
    const recentVideos = allVideos
      .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
      .slice(0, 20)
      .map(v => ({
        ...v,
        size: Math.round(v.size / 1024 / 1024 * 10) / 10, // Convert to MB
      }));
    
    // Upload history (last 7 days)
    const uploadHistory: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
      const count = allVideos.filter(v => {
        const created = new Date(v.created);
        return created >= date && created < nextDate;
      }).length;
      uploadHistory.push({ date: dateStr, count });
    }
    
    // Scheduler status
    const scheduleFile = path.join(BASE_PATH, 'automation/schedule.json');
    let scheduler = { pending: 0, uploaded: 0, failed: 0, schedule: [] as any[] };
    
    if (fs.existsSync(scheduleFile)) {
      const schedule = JSON.parse(fs.readFileSync(scheduleFile, 'utf-8'));
      scheduler = {
        pending: schedule.filter((v: any) => v.status === 'pending').length,
        uploaded: schedule.filter((v: any) => v.status === 'uploaded').length,
        failed: schedule.filter((v: any) => v.status === 'failed').length,
        schedule: schedule.slice(0, 10),
      };
    }
    
    // Load YouTube stats if available
    const youtubeStatsFile = path.join(BASE_PATH, 'automation/youtube-stats.json');
    let youtube = null;
    if (fs.existsSync(youtubeStatsFile)) {
      youtube = JSON.parse(fs.readFileSync(youtubeStatsFile, 'utf-8'));
    }
    
    const analytics: AnalyticsData & { youtube?: any } = {
      overview: {
        totalVideos: allVideos.length,
        totalSizeMB,
        videosToday,
        videosThisWeek,
      },
      byProject,
      recentVideos,
      uploadHistory,
      scheduler,
      youtube,
    };
    
    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
