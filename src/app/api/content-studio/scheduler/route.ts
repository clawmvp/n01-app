import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

const AUTOMATION_PATH = '/Volumes/500GB-BK/cursor-ai/ai-money-projects/automation';

export async function POST() {
  try {
    // Run the scheduler
    const { stdout, stderr } = await execAsync(
      `cd "${AUTOMATION_PATH}" && npx tsx youtube-scheduler.ts run`,
      { timeout: 120000 } // 2 minute timeout
    );
    
    // Read updated stats
    const scheduleFile = path.join(AUTOMATION_PATH, 'schedule.json');
    let uploaded = 0;
    
    if (fs.existsSync(scheduleFile)) {
      const schedule = JSON.parse(fs.readFileSync(scheduleFile, 'utf-8'));
      uploaded = schedule.filter((v: { status: string }) => v.status === 'uploaded').length;
    }
    
    return NextResponse.json({
      success: true,
      message: 'Scheduler executed successfully',
      uploaded,
      output: stdout.slice(-1000), // Last 1000 chars
    });
  } catch (error) {
    console.error('Scheduler error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to run scheduler' 
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const scheduleFile = path.join(AUTOMATION_PATH, 'schedule.json');
    const logFile = path.join(AUTOMATION_PATH, 'scheduler.log');
    
    let schedule = [];
    let recentLogs = '';
    
    if (fs.existsSync(scheduleFile)) {
      schedule = JSON.parse(fs.readFileSync(scheduleFile, 'utf-8'));
    }
    
    if (fs.existsSync(logFile)) {
      const logs = fs.readFileSync(logFile, 'utf-8');
      recentLogs = logs.split('\n').slice(-50).join('\n');
    }
    
    return NextResponse.json({
      schedule,
      recentLogs,
      stats: {
        pending: schedule.filter((v: { status: string }) => v.status === 'pending').length,
        uploaded: schedule.filter((v: { status: string }) => v.status === 'uploaded').length,
        failed: schedule.filter((v: { status: string }) => v.status === 'failed').length,
      },
    });
  } catch (error) {
    console.error('Get scheduler error:', error);
    return NextResponse.json({ error: 'Failed to get scheduler status' }, { status: 500 });
  }
}
