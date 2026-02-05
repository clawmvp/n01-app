import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

const BASE_PATH = '/Volumes/500GB-BK/cursor-ai/ai-money-projects';
const AUTOMATION_PATH = path.join(BASE_PATH, 'automation');

interface ScheduledVideo {
  id: string;
  videoPath: string;
  title: string;
  scheduledTime: string;
  status: 'pending' | 'uploaded' | 'failed';
}

export async function GET() {
  try {
    // Read scheduler status
    const scheduleFile = path.join(AUTOMATION_PATH, 'schedule.json');
    const uploadLogFile = path.join(AUTOMATION_PATH, 'upload-log.json');
    
    let schedule: ScheduledVideo[] = [];
    let uploadLog = { uploadedVideos: [], totalUploads: 0 };
    
    if (fs.existsSync(scheduleFile)) {
      schedule = JSON.parse(fs.readFileSync(scheduleFile, 'utf-8'));
    }
    
    if (fs.existsSync(uploadLogFile)) {
      uploadLog = JSON.parse(fs.readFileSync(uploadLogFile, 'utf-8'));
    }
    
    // Count videos in output directories
    const outputDirs = [
      'examples/output/p1-reddit-v2',
      'examples/output/p2-trivia-v2',
      'examples/output/p3-v3',
      'examples/output/p4-podcast-v2',
      'examples/output/p5-trend-threads',
      'examples/output/p6-v3',
      'shorts-downloads',
      'p8-evergreen-recycler/viral-research/verified',
    ];
    
    let totalVideos = 0;
    for (const dir of outputDirs) {
      const fullPath = path.join(BASE_PATH, dir);
      if (fs.existsSync(fullPath)) {
        const files = fs.readdirSync(fullPath).filter(f => f.endsWith('.mp4'));
        totalVideos += files.length;
      }
    }
    
    // Calculate stats
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const scheduledToday = schedule.filter(v => v.scheduledTime.startsWith(today)).length;
    
    const pending = schedule.filter(v => v.status === 'pending').length;
    const uploaded = schedule.filter(v => v.status === 'uploaded').length;
    const failed = schedule.filter(v => v.status === 'failed').length;
    
    const pendingVideos = schedule.filter(v => v.status === 'pending' && new Date(v.scheduledTime) > now);
    const nextUpload = pendingVideos.length > 0 ? pendingVideos[0].scheduledTime : null;
    
    return NextResponse.json({
      stats: {
        totalVideos,
        totalUploads: uploadLog.totalUploads,
        scheduledToday,
        platforms: {
          youtube: uploaded,
          tiktok: 0, // TODO: Track TikTok uploads
          instagram: 0, // TODO: Track Instagram uploads
        },
      },
      scheduler: {
        pending,
        uploaded,
        failed,
        nextUpload,
      },
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
